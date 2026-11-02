// Runtime regression for sticky navigation and the back-to-top control.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.STICKY_QA_BASE || 'http://127.0.0.1:4173';
const PORT = 18000 + Math.floor(Math.random() * 9000);
const OUT = path.join(os.tmpdir(), 'dovela-sticky-qa');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dovela-sticky-profile-'));
  const edge = spawn(EDGE, [
    '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore' });
  let socket;
  try {
    let target;
    for (let attempt = 0; attempt < 50 && !target; attempt += 1) {
      try { target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json(); }
      catch (_) { await sleep(200); }
    }
    if (!target) throw new Error('Edge DevTools did not become available');
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });

    let id = 0;
    const pending = new Map();
    const runtimeErrors = [];
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      } else if (message.method === 'Runtime.exceptionThrown') {
        runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
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
    const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: width >= 2560 ? 2 : 1, mobile: width <= 600
    });
    const assert = (condition, label, detail) => {
      if (!condition) throw new Error(`${label}: ${JSON.stringify(detail)}`);
    };
    const screenshot = async name => {
      const response = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      fs.writeFileSync(path.join(OUT, name), Buffer.from(response.result.data, 'base64'));
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: "localStorage.setItem('dovela.language.preference','es'); localStorage.setItem('dovela-theme','light');"
    });
    await viewport(390, 844);
    await send('Page.navigate', { url: `${BASE}/index.html` });
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (await evaluate("document.readyState === 'complete' && !!window.DovelaTheme && document.getElementById('back-to-top')")) break;
      await sleep(150);
    }
    await evaluate("document.getElementById('brand-preloader')?.remove()");

    const widths = [320, 360, 390, 480, 600, 768, 1024, 1280, 1440, 1600, 1920, 2560, 3440];
    const samples = [];
    for (const width of widths) {
      const height = width <= 600 ? 844 : 900;
      await viewport(width, height);
      await evaluate("window.scrollTo(0, 760)");
      await sleep(520);
      const sample = await evaluate(`(() => {
        const nav = document.querySelector('#v-landing .nav');
        const dock = document.getElementById('nav-dock');
        const back = document.getElementById('back-to-top');
        const backLabel = back.querySelector('span');
        const nr = nav.getBoundingClientRect();
        const br = back.getBoundingClientRect();
        const lr = backLabel.getBoundingClientRect();
        const hit = document.elementFromPoint(nr.left + nr.width / 2, nr.top + Math.min(20, nr.height / 2));
        return {
          width: innerWidth,
          dpr: devicePixelRatio,
          sticky: nav.dataset.sticky,
          navParent: nav.parentElement.id,
          position: getComputedStyle(nav).position,
          navRect: { left:nr.left, right:nr.right, top:nr.top, width:nr.width, height:nr.height },
          dockHeight: dock.getBoundingClientRect().height,
          navHit: nav.contains(hit),
          backVisible: back.dataset.visible,
          backAriaHidden: back.getAttribute('aria-hidden'),
          backTabIndex: back.tabIndex,
          backRect: { left:br.left, right:br.right, top:br.top, bottom:br.bottom, width:br.width, height:br.height },
          backLabel: { text:backLabel.textContent.trim(), width:lr.width, height:lr.height, color:getComputedStyle(backLabel).color, opacity:getComputedStyle(backLabel).opacity },
          overflow: document.documentElement.scrollWidth - innerWidth,
          moreVisible: getComputedStyle(document.getElementById('nav-more-toggle')).display !== 'none'
        };
      })()`);
      assert(sample.sticky === 'true' && sample.position === 'fixed', 'nav did not enter sticky state', sample);
      assert(sample.navParent === 'v-landing', 'sticky nav was not moved beyond its clipping header', sample);
      assert(sample.navRect.top >= 0 && sample.navRect.top <= 28 && sample.navRect.left >= 0 && sample.navRect.right <= sample.width + .5, 'sticky nav left the viewport', sample);
      assert(sample.navHit && sample.dockHeight >= 70, 'sticky nav is clipped or its dock collapsed', sample);
      assert(sample.backVisible === 'true' && sample.backAriaHidden === 'false' && sample.backTabIndex === 0, 'back-to-top is not operable', sample);
      assert(sample.backRect.left >= 0 && sample.backRect.right <= sample.width + .5 && sample.backRect.top >= 0 && sample.backRect.bottom <= height + .5 && sample.backRect.height >= 44, 'back-to-top left the viewport or is too small', sample);
      assert(sample.backLabel.text === 'Volver arriba' && sample.backLabel.width > 60 && sample.backLabel.height > 10 && sample.backLabel.opacity === '1', 'back-to-top label is not visibly laid out', sample);
      assert(sample.overflow <= 0, 'horizontal overflow detected', sample);
      if (width <= 600) assert(sample.moreVisible, 'mobile More control disappeared', sample);
      samples.push(sample);
      if (width === 390) await screenshot('sticky-mobile-390.png');
      if (width === 1440) await screenshot('sticky-desktop-1440.png');
    }

    await viewport(390, 844);
    await evaluate("window.scrollTo(0, 760)");
    await sleep(300);
    const mobileMenu = await evaluate(`(() => {
      const toggle = document.getElementById('nav-more-toggle');
      toggle.click();
      const nav = document.querySelector('#v-landing .nav');
      return {
        open: toggle.getAttribute('aria-expanded'),
        navHeight: nav.getBoundingClientRect().height,
        viewportHeight: innerHeight,
        overflowY: getComputedStyle(nav).overflowY
      };
    })()`);
    assert(mobileMenu.open === 'true' && mobileMenu.navHeight <= mobileMenu.viewportHeight && mobileMenu.overflowY === 'auto', 'sticky mobile disclosure is not contained', mobileMenu);
    await evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");

    await evaluate("document.getElementById('back-to-top').focus(); document.getElementById('back-to-top').click()");
    await sleep(1250);
    const returned = await evaluate(`(() => {
      const nav = document.querySelector('#v-landing .nav');
      const back = document.getElementById('back-to-top');
      return {
        scrollY,
        sticky: nav.dataset.sticky,
        navPosition: getComputedStyle(nav).position,
        navParent: nav.parentElement.id,
        backVisible: back.dataset.visible,
        backTabIndex: back.tabIndex,
        focus: document.activeElement === nav
      };
    })()`);
    assert(returned.scrollY <= 1 && returned.sticky === 'false' && returned.navPosition !== 'fixed' && returned.navParent === 'nav-dock', 'nav did not return to its original position', returned);
    assert(returned.backVisible === 'false' && returned.backTabIndex === -1 && returned.focus, 'back-to-top did not hide and return focus', returned);

    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await evaluate("window.scrollTo(0, 760)");
    await sleep(100);
    const reduced = await evaluate(`(() => {
      const nav = document.querySelector('#v-landing .nav');
      const back = document.getElementById('back-to-top');
      return {
        navAnimation: getComputedStyle(nav).animationName,
        backDuration: getComputedStyle(back).transitionDuration
      };
    })()`);
    assert(reduced.navAnimation === 'none' && parseFloat(reduced.backDuration) === 0, 'reduced-motion is not respected', reduced);

    if (runtimeErrors.length) throw new Error(`Runtime errors: ${JSON.stringify(runtimeErrors)}`);
    console.log(JSON.stringify({ status:'PASS', samples, mobileMenu, returned, reduced, screenshots:OUT }, null, 2));
  } finally {
    try { socket?.close(); } catch (_) {}
    edge.kill();
    try { fs.rmSync(profile, { recursive:true, force:true }); } catch (_) {}
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
