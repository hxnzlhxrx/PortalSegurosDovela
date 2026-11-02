// Browser regression for the claim receipt: one click -> one completed PDF download.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.RECEIPT_QA_BASE || 'http://127.0.0.1:4173';
const PORT = 22000 + Math.floor(Math.random() * 7000);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dovela-receipt-profile-'));
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), 'dovela-receipt-downloads-'));
  const edge = spawn(EDGE, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let socket;
  try {
    let target;
    for (let attempt = 0; attempt < 50 && !target; attempt += 1) {
      try {
        target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
      } catch (_) { await sleep(200); }
    }
    if (!target) throw new Error('Edge DevTools did not become available');

    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0;
    const pending = new Map();
    const exceptions = [];
    const downloadEvents = [];
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      } else if (message.method === 'Runtime.exceptionThrown') {
        exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      } else if (message.method === 'Page.downloadWillBegin' || message.method === 'Page.downloadProgress') {
        downloadEvents.push({ method: message.method, params: message.params });
      }
    };
    const send = (method, params = {}) => new Promise(resolve => {
      const requestId = ++id;
      pending.set(requestId, resolve);
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
    const evaluate = async expression => {
      const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description || response.result.exceptionDetails.text);
      return response.result?.result?.value;
    };
    const waitFor = async (predicate, label, attempts = 80) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (await predicate()) return;
        await sleep(150);
      }
      throw new Error(`Timed out waiting for ${label}`);
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads, eventsEnabled: true });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('dovela.language.preference','es');" });
    await send('Page.navigate', { url: `${BASE}/index.html` });
    await waitFor(async () => evaluate("document.readyState === 'complete' && typeof descargarTicketPDF === 'function'"), 'portal');
    await waitFor(async () => evaluate("!!window.jspdf?.jsPDF"), 'jsPDF dependency');

    const setup = await evaluate(`(() => {
      wizard.perfil = 'asegurado';
      wizard.tipo = 'SI';
      wizard.servicio = 'M';
      wizard.codigo = 'SGP-2026-TEST';
      consecutivoReservado = 999;
      document.getElementById('f-nombre').value = 'Persona de Prueba';
      document.getElementById('f-cedula').value = '8-888-8888';
      document.getElementById('f-email').value = 'prueba@example.com';
      document.getElementById('f-producto').innerHTML = '<option selected>Arco Esencial</option>';
      document.getElementById('f-fecha').value = '2026-10-20';
      document.getElementById('radicado-num').textContent = 'SGP-2026-TEST-M';
      comprobanteReclamoActual = capturarDatosComprobante();
      document.getElementById('f-nombre').value = '';
      document.querySelectorAll('.wstep').forEach(step => step.classList.toggle('hidden', step.dataset.paso !== '6'));
      return {
        button: !!document.getElementById('btn-pdf'),
        listenerDependency: typeof window.jspdf?.jsPDF,
        code: comprobanteReclamoActual.codigo,
        snapshotName: comprobanteReclamoActual.asegurado,
        liveNameAfterSnapshot: document.getElementById('f-nombre').value
      };
    })()`);

    await evaluate("document.getElementById('btn-pdf').click(); document.getElementById('btn-pdf').click()");
    await waitFor(async () => downloadEvents.some(event => event.method === 'Page.downloadProgress' && event.params.state === 'completed'), 'completed PDF download');
    await sleep(250);
    const filesAfterDoubleClick = fs.readdirSync(downloads).filter(file => file.toLowerCase().endsWith('.pdf'));
    const startsAfterDoubleClick = downloadEvents.filter(event => event.method === 'Page.downloadWillBegin').length;

    await sleep(950);
    await evaluate(`(() => {
      const original = window.jspdf;
      window.jspdf = undefined;
      document.getElementById('btn-pdf').click();
      window.jspdf = original;
    })()`);
    await waitFor(async () => downloadEvents.filter(event => event.method === 'Page.downloadProgress' && event.params.state === 'completed').length >= 2, 'fallback PDF download');
    await sleep(250);
    const filesAfterFallback = fs.readdirSync(downloads).filter(file => file.toLowerCase().endsWith('.pdf'));
    const fallbackBytes = fs.readFileSync(path.join(downloads, filesAfterFallback[0]));
    const fallbackStructure = {
      header: fallbackBytes.subarray(0, 8).toString('latin1'),
      hasXref: fallbackBytes.includes(Buffer.from('xref')),
      hasEof: fallbackBytes.includes(Buffer.from('%%EOF')),
      bytes: fallbackBytes.length
    };
    const completedDownloads = downloadEvents.filter(event => event.method === 'Page.downloadProgress' && event.params.state === 'completed').length;
    const result = { setup, filesAfterDoubleClick, startsAfterDoubleClick, filesAfterFallback, completedDownloads, fallbackStructure, downloadEvents, exceptions };

    if (setup.snapshotName !== 'Persona de Prueba' || setup.liveNameAfterSnapshot !== '') throw new Error(`Receipt snapshot is not stable: ${JSON.stringify(result)}`);
    if (filesAfterDoubleClick.length !== 1 || startsAfterDoubleClick !== 1) throw new Error(`Double click did not produce exactly one PDF: ${JSON.stringify(result)}`);
    if (filesAfterFallback.length < 1 || completedDownloads !== 2) throw new Error(`Local fallback did not complete its PDF download: ${JSON.stringify(result)}`);
    if (!fallbackStructure.header.startsWith('%PDF-1.4') || !fallbackStructure.hasXref || !fallbackStructure.hasEof || fallbackStructure.bytes < 1000) throw new Error(`Local fallback is not a valid PDF structure: ${JSON.stringify(result)}`);
    if (exceptions.length) throw new Error(`Runtime exceptions: ${JSON.stringify(result)}`);
    console.log(JSON.stringify({ status: 'PASS', ...result }, null, 2));
  } finally {
    try { socket?.close(); } catch (_) {}
    edge.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
    try { fs.rmSync(downloads, { recursive: true, force: true }); } catch (_) {}
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
