const { spawn } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const BROWSER = process.env.I18N_QA_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.I18N_QA_BASE || 'http://127.0.0.1:4173';
const PORT = 22000 + Math.floor(Math.random() * 8000);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dovela-i18n-profile-'));
  const edge = spawn(BROWSER, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let socket;
  try {
    let target;
    for (let attempt = 0; attempt < 40 && !target; attempt += 1) {
      try {
        target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
      } catch (_) { await sleep(250); }
    }
    if (!target) throw new Error('Edge DevTools did not become available');

    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let requestId = 0;
    const pending = new Map();
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      }
    };
    const send = (method, params = {}) => new Promise(resolve => {
      const id = ++requestId;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (response.result?.exceptionDetails) {
        throw new Error(response.result.exceptionDetails.exception?.description || JSON.stringify(response.result.exceptionDetails));
      }
      return response.result?.result?.value;
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: "localStorage.setItem('dovela.language.preference', 'es');"
    });
    await send('Page.navigate', { url: `${BASE}/index.html` });
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (await evaluate("document.readyState !== 'loading' && !!window.DovelaI18n")) break;
      await sleep(200);
    }
    await sleep(500);

    const result = await evaluate(`(async () => {
      try {
        pintarPerfiles();
        pintarTipos();
        wizard.perfil = 'hospital';
        wizard.tipo = 'SI';
        wizard.servicio = 'M';
        ajustarPorPerfil();
        for (let paso = 0; paso <= 5; paso += 1) {
          wizard.paso = paso;
          refrescarWizard();
        }
      } catch (_) {}

      const normalize = value => String(value || '').replace(/\\s+/g, ' ').trim();
      const candidates = [];
      const add = (value, context) => {
        const text = normalize(value);
        if (!text || text.length < 2 || !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ¿¡]/.test(text)) return;
        if (!window.DovelaI18n.has(text)) candidates.push({ text, context });
      };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(parent.tagName) || parent.closest('[data-i18n-ignore]')) continue;
        add(node.data, parent.id ? '#' + parent.id : parent.className || parent.tagName);
      }
      document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(element => {
        ['placeholder', 'aria-label', 'title'].forEach(attr => {
          if (element.hasAttribute(attr)) add(element.getAttribute(attr), element.id ? '#' + element.id + '@' + attr : element.tagName + '@' + attr);
        });
      });
      const missingSources = [...new Map(candidates.map(item => [item.text, item])).values()].sort((a, b) => a.text.localeCompare(b.text));
      const untranslated = {};
      for (const locale of ['en', 'fr', 'pt']) {
        window.DovelaI18n.setLanguage(locale, { persist: false, announce: false });
        await new Promise(resolve => setTimeout(resolve, 50));
        const found = [];
        const inspect = (value, context) => {
          const text = normalize(value);
          if (!text || !window.DovelaI18n.has(text)) return;
          if (window.DovelaI18n.t(text) !== text) found.push({ text, context });
        };
        const translatedWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let translatedNode;
        while ((translatedNode = translatedWalker.nextNode())) {
          const parent = translatedNode.parentElement;
          if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(parent.tagName) || parent.closest('[data-i18n-ignore]')) continue;
          inspect(translatedNode.data, parent.id ? '#' + parent.id : parent.className || parent.tagName);
        }
        document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(element => {
          ['placeholder', 'aria-label', 'title'].forEach(attr => {
            if (element.hasAttribute(attr)) inspect(element.getAttribute(attr), element.id ? '#' + element.id + '@' + attr : element.tagName + '@' + attr);
          });
        });
        untranslated[locale] = [...new Map(found.map(item => [item.text, item])).values()];
      }
      const untranslatedSpecialties = {};
      if (typeof RED_ESPECIALIDADES !== 'undefined' && typeof localizeSpecialty === 'function') {
        for (const locale of ['en', 'fr', 'pt']) {
          window.DovelaI18n.setLanguage(locale, { persist: false, announce: false });
          untranslatedSpecialties[locale] = RED_ESPECIALIDADES.filter(value => localizeSpecialty(value) === value);
        }
      }
      const downloads = {};
      const originalJspdf = window.jspdf;
      const originalXlsx = window.XLSX;
      const originalOpen = window.open;
      const pdfs = [];
      class PdfDouble {
        constructor() { this.texts=[]; this.table=null; this.saved=''; this.internal={pageSize:{height:595}}; pdfs.push(this); }
        setProperties(){return this} addImage(){return this} setFillColor(){return this} rect(){return this}
        setTextColor(){return this} setFont(){return this} setFontSize(){return this} roundedRect(){return this}
        setDrawColor(){return this} line(){return this} setPage(){return this} getNumberOfPages(){return 1}
        text(value){this.texts.push(Array.isArray(value)?value.join(' '):String(value));return this}
        autoTable(value){this.table=value;return this} save(value){this.saved=value;return this}
      }
      let spreadsheet = null;
      let certificate = '';
      window.jspdf = { jsPDF: PdfDouble };
      window.XLSX = {
        utils: {
          aoa_to_sheet(rows){spreadsheet={rows};return{}},
          book_new(){return{}},
          book_append_sheet(_book,_sheet,name){spreadsheet.sheet=name}
        },
        writeFile(_book,name){spreadsheet.file=name}
      };
      window.open = () => ({ document: { write(value){certificate=value}, close(){} } });
      try {
        for (const locale of ['en', 'fr', 'pt']) {
          pdfs.length=0; spreadsheet=null; certificate='';
          window.DovelaI18n.setLanguage(locale, { persist: false, announce: false });
          await descargarTicketPDF();
          descargarRedPDF(true);
          descargarRedXLSX(true);
          generarCertPreauth({num:'PA-TEST',paciente:'Test Patient',especialidad:'Cardiología'});
          downloads[locale]={
            receipt:{texts:pdfs[0].texts,filename:pdfs[0].saved},
            network:{texts:pdfs[1].texts,head:pdfs[1].table.head,firstSpecialty:pdfs[1].table.body[0]?.[0],filename:pdfs[1].saved},
            spreadsheet:{head:spreadsheet.rows[0],firstSpecialty:spreadsheet.rows[1]?.[0],sheet:spreadsheet.sheet,filename:spreadsheet.file},
            certificate:certificate.replace(/<style>[\\s\\S]*?<\\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim()
          };
        }
      } finally {
        window.jspdf = originalJspdf;
        window.XLSX = originalXlsx;
        window.open = originalOpen;
      }
      return { missingSources, untranslated, untranslatedSpecialties, downloads };
    })()`);

    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } finally {
    if (socket?.readyState === WebSocket.OPEN) socket.close();
    edge.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) { /* Edge may still hold profile files briefly. */ }
  }
})().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
