// Focused runtime check for the external developer link and its clipped hover ripples.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.DEVTAG_QA_BASE || 'http://127.0.0.1:4173';
const PORT = 19000 + Math.floor(Math.random() * 7000);
const OUT = path.join(os.tmpdir(), 'dovela-devtag-qa');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
fs.mkdirSync(OUT, { recursive:true });

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dovela-devtag-profile-'));
  const edge = spawn(EDGE, [
    '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio:'ignore' });
  let socket;
  try {
    let target;
    for (let attempt = 0; attempt < 50 && !target; attempt += 1) {
      try { target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method:'PUT' })).json(); }
      catch (_) { await sleep(150); }
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
      socket.send(JSON.stringify({ id:requestId, method, params }));
    });
    const evaluate = async expression => {
      const response = await send('Runtime.evaluate', { expression, awaitPromise:true, returnByValue:true });
      if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description || response.result.exceptionDetails.text);
      return response.result?.result?.value;
    };
    const assert = (condition, label, detail) => {
      if (!condition) throw new Error(`${label}: ${JSON.stringify(detail)}`);
    };
    const screenshot = async name => {
      const response = await send('Page.captureScreenshot', { format:'png', fromSurface:true });
      fs.writeFileSync(path.join(OUT, name), Buffer.from(response.result.data, 'base64'));
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('CSS.enable');
    await send('Emulation.setDeviceMetricsOverride', { width:1440, height:1000, deviceScaleFactor:1, mobile:false });
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source:"localStorage.setItem('dovela-theme','light'); localStorage.setItem('dovela.language.preference','es');"
    });
    await send('Page.navigate', { url:`${BASE}/index.html` });
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (await evaluate("document.readyState === 'complete' && !!document.querySelector('[data-devtag-link]')")) break;
      await sleep(100);
    }
    await evaluate("document.getElementById('brand-preloader')?.remove(); scrollTo(0, document.documentElement.scrollHeight)");
    await sleep(250);

    const documentNode = await send('DOM.getDocument', { depth:0 });
    const tagNode = await send('DOM.querySelector', { nodeId:documentNode.result.root.nodeId, selector:'[data-devtag-link]' });
    await send('CSS.forcePseudoState', { nodeId:tagNode.result.nodeId, forcedPseudoClasses:['hover'] });

    const sample = async theme => {
      await evaluate(`window.DovelaTheme.set('${theme}'); scrollTo(0, document.documentElement.scrollHeight)`);
      await sleep(120);
      const state = await evaluate(`(() => {
        const tag = document.querySelector('[data-devtag-link]');
        const ripples = tag.querySelector('.footer__dev-ripples');
        const glow = tag.querySelector('.footer__dev-glow');
        tag.getAnimations({subtree:true}).forEach(animation => {
          if (animation instanceof CSSTransition) animation.finish();
          if (animation.animationName === 'devtag-ripple-hover') animation.currentTime = 540;
        });
        const tagBox = tag.getBoundingClientRect();
        const rippleBox = ripples.getBoundingClientRect();
        const glowBox = glow.getBoundingClientRect();
        const ripple = getComputedStyle(ripples, '::before');
        return {
          theme:document.documentElement.dataset.theme,
          href:tag.href,
          target:tag.target,
          rel:tag.rel,
          height:tagBox.height,
          transform:getComputedStyle(tag).transform,
          rippleAnimation:ripple.animationName,
          rippleOpacity:parseFloat(ripple.opacity),
          rippleBackground:ripple.backgroundImage,
          overflow:getComputedStyle(ripples).overflow,
          clipPath:getComputedStyle(ripples).clipPath,
          maskContained:
            rippleBox.left >= tagBox.left + 3 && rippleBox.right <= tagBox.right - 3 &&
            rippleBox.top >= tagBox.top + 2.5 && rippleBox.bottom <= tagBox.bottom - 2.5,
          insideGlow:
            rippleBox.left >= glowBox.left && rippleBox.right <= glowBox.right &&
            rippleBox.top >= glowBox.top && rippleBox.bottom <= glowBox.bottom,
          maskDelta:Math.max(
            Math.abs(tagBox.left-rippleBox.left), Math.abs(tagBox.right-rippleBox.right),
            Math.abs(tagBox.top-rippleBox.top), Math.abs(tagBox.bottom-rippleBox.bottom)
          )
        };
      })()`);
      await screenshot(`devtag-hover-${theme}.png`);
      return state;
    };

    const light = await sample('light');
    const dark = await sample('dark');
    assert(light.href === 'https://linktr.ee/gishikoDev' && light.target === '_blank' && /noopener/.test(light.rel), 'external link contract failed', light);
    for (const state of [light, dark]) {
      assert(state.height >= 44 && state.transform === 'none', `${state.theme} hover moved or shrank the link`, state);
      assert(state.rippleAnimation === 'devtag-ripple-hover' && state.rippleOpacity >= .5, `${state.theme} ripples lack contrast`, state);
      assert(state.overflow === 'hidden' && state.maskContained && state.insideGlow && state.maskDelta >= 9.5 && state.maskDelta <= 10.5, `${state.theme} ripple mask escaped the glow`, state);
      assert(state.clipPath !== 'none', `${state.theme} ripple clip-path is missing`, state);
    }
    assert(light.rippleBackground !== dark.rippleBackground, 'light/dark ripple palettes did not change', { light, dark });

    await send('Emulation.setEmulatedMedia', { features:[{ name:'prefers-reduced-motion', value:'reduce' }] });
    const reduced = await evaluate(`getComputedStyle(document.querySelector('.footer__dev-ripples'), '::before').animationName`);
    assert(reduced === 'none', 'reduced motion did not stop ripples', { reduced });
    assert(runtimeErrors.length === 0, 'runtime errors detected', runtimeErrors);
    console.log(JSON.stringify({ status:'PASS', light, dark, reduced, screenshots:OUT }, null, 2));
  } finally {
    try { socket?.close(); } catch (_) {}
    edge.kill();
    try { fs.rmSync(profile, { recursive:true, force:true }); } catch (_) {}
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
