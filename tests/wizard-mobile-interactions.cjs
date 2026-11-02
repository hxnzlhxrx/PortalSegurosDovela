// Regression checks for the mobile language control and wizard radio cards.
// Usage: node tests/wizard-mobile-interactions.cjs
const { spawn } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.THEME_QA_BASE || 'http://127.0.0.1:4173';
const PORT = 12000 + Math.floor(Math.random() * 10000);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const profile = path.join(os.tmpdir(), `dovela-wizard-${Date.now()}`);
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
    for (let attempt = 0; attempt < 40 && !target; attempt += 1) {
      try {
        target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
      } catch (_) {
        await sleep(250);
      }
    }
    if (!target) throw new Error('Edge DevTools did not become available');

    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });

    let requestId = 0;
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

    const send = (method, params = {}) => new Promise((resolve) => {
      const id = ++requestId;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expression) => {
      const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description || response.result.exceptionDetails.text);
      return response.result?.result?.value;
    };
    const waitFor = async (expression, label) => {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        if (await evaluate(expression)) return;
        await sleep(150);
      }
      throw new Error(`Timed out waiting for ${label}`);
    };
    const assert = (condition, message, detail) => {
      if (!condition) throw new Error(`${message}: ${JSON.stringify(detail)}`);
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: "localStorage.setItem('dovela.language.preference', 'es'); localStorage.setItem('dovela-theme', 'light');"
    });
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: `${BASE}/index.html` });
    await waitFor("document.readyState === 'complete' && !!window.DovelaI18n && !!window.DovelaTheme", 'portal');
    await sleep(350);

    await evaluate("document.getElementById('nav-more-toggle').click()");
    const mobileOpen = await evaluate(`(() => {
      const select = document.getElementById('language-select');
      const wrap = select.closest('.language-select-wrap');
      const rect = select.getBoundingClientRect();
      return {
        expanded: document.getElementById('nav-more-toggle').getAttribute('aria-expanded'),
        visible: getComputedStyle(document.getElementById('nav-actions')).visibility,
        width: rect.width,
        wrapWidth: wrap.getBoundingClientRect().width,
        hit: document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) === select,
        pointerEvents: getComputedStyle(select).pointerEvents,
        inlineWidth: select.style.width
      };
    })()`);
    assert(mobileOpen.expanded === 'true' && mobileOpen.visible === 'visible', 'mobile language menu did not open', mobileOpen);
    assert(mobileOpen.hit && mobileOpen.pointerEvents === 'auto', 'language select is not touch-targetable', mobileOpen);
    assert(Math.abs(mobileOpen.width - mobileOpen.wrapWidth) <= 2.1 && mobileOpen.inlineWidth === '', 'language select did not fill its mobile card', mobileOpen);

    await evaluate(`(() => {
      const select = document.getElementById('language-select');
      select.value = 'en';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await sleep(100);
    const mobileChanged = await evaluate(`({
      locale: document.documentElement.lang,
      value: document.getElementById('language-select').value,
      expanded: document.getElementById('nav-more-toggle').getAttribute('aria-expanded'),
      visibility: getComputedStyle(document.getElementById('nav-actions')).visibility,
      focus: document.activeElement.id
    })`);
    assert(mobileChanged.locale === 'en-US' && mobileChanged.value === 'en', 'language did not change on mobile', mobileChanged);
    assert(mobileChanged.expanded === 'false' && mobileChanged.visibility === 'hidden' && mobileChanged.focus === 'nav-more-toggle', 'mobile menu did not close cleanly', mobileChanged);

    await evaluate("abrirWizard(); window.DovelaTheme.set('light')");
    await sleep(100);
    const semantics = await evaluate(`(() => {
      const cards = [...document.querySelectorAll('#perfiles .tipo')];
      return {
        groupRole: document.getElementById('perfiles').getAttribute('role'),
        tags: cards.map((card) => card.tagName),
        radioTypes: cards.map((card) => card.querySelector('input')?.type),
        names: cards.map((card) => card.querySelector('input')?.name)
      };
    })()`);
    assert(semantics.groupRole === 'radiogroup', 'profile choices lack radio-group semantics', semantics);
    assert(semantics.tags.every((tag) => tag === 'LABEL') && semantics.radioTypes.every((type) => type === 'radio'), 'profile cards are not native radio labels', semantics);
    assert(new Set(semantics.names).size === 1, 'profile radios are not grouped', semantics);

    const validation = await evaluate(`(() => ({
      valid: validarPaso(0),
      invalid: document.getElementById('perfiles').getAttribute('aria-invalid'),
      errorVisible: getComputedStyle(document.getElementById('err-perfil')).display !== 'none',
      focused: document.activeElement === document.querySelector('#perfiles input')
    }))()`);
    assert(!validation.valid && validation.invalid === 'true' && validation.errorVisible && validation.focused, 'invalid radio group does not expose and focus its error', validation);

    await evaluate("document.querySelector('#perfiles input').click()");
    const selected = await evaluate(`(() => {
      const card = document.querySelector('#perfiles .tipo.sel');
      return {
        value: card?.querySelector('input').value,
        checked: card?.querySelector('input').checked,
        selectedCount: document.querySelectorAll('#perfiles .tipo.sel').length,
        wizardValue: wizard.perfil
      };
    })()`);
    assert(selected.checked && selected.selectedCount === 1 && selected.value === selected.wizardValue, 'radio-card selection is not synchronized', selected);

    await evaluate("document.querySelector('#perfiles input:checked').focus()");
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await sleep(80);
    const keyboard = await evaluate(`(() => {
      const card = document.querySelector('#perfiles .tipo:has(input:checked)');
      const style = getComputedStyle(card);
      return {
        value: card?.querySelector('input').value,
        wizardValue: wizard.perfil,
        focused: document.activeElement === card?.querySelector('input'),
        outlineWidth: style.outlineWidth,
        selectedCount: document.querySelectorAll('#perfiles input:checked').length
      };
    })()`);
    assert(keyboard.focused && keyboard.selectedCount === 1 && keyboard.value === keyboard.wizardValue, 'arrow-key radio selection failed', keyboard);
    assert(parseFloat(keyboard.outlineWidth) >= 3, 'keyboard focus is not visibly indicated', keyboard);

    await evaluate("document.querySelectorAll('#perfiles .tipo')[2].scrollIntoView({ block: 'center' })");
    await sleep(80);
    const point = await evaluate(`(() => {
      const rect = document.querySelectorAll('#perfiles .tipo')[2].getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
    await sleep(160);
    const hovered = await evaluate(`(() => {
      const style = getComputedStyle(document.querySelectorAll('#perfiles .tipo')[2]);
      return { transform: style.transform, shadow: style.boxShadow, border: style.borderColor };
    })()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await sleep(100);
    const pressed = await evaluate(`(() => {
      const style = getComputedStyle(document.querySelectorAll('#perfiles .tipo')[2]);
      return { transform: style.transform, radius: style.borderRadius, shadow: style.boxShadow };
    })()`);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await sleep(650);
    assert(hovered.transform !== 'none' && hovered.shadow !== 'none', 'hover feedback is missing', hovered);
    assert(pressed.transform !== 'none' && parseFloat(pressed.radius) >= 6 && pressed.shadow.includes('inset'), 'pressed feedback is missing or has square corners', pressed);

    const contrast = await evaluate(`(() => {
      const parse = (value) => (value.match(/[\\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = (rgb) => {
        const channels = rgb.map((value) => {
          const channel = value / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
      };
      const ratio = (front, back) => {
        const a = luminance(parse(front));
        const b = luminance(parse(back));
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      };
      const card = document.querySelector('#perfiles .tipo');
      const background = getComputedStyle(card).backgroundColor;
      return {
        title: ratio(getComputedStyle(card.querySelector('h4')).color, background),
        body: ratio(getComputedStyle(card.querySelector('p')).color, background),
        background
      };
    })()`);
    assert(contrast.title >= 4.5 && contrast.body >= 4.5, 'wizard card text contrast is insufficient', contrast);

    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const reduced = await evaluate(`(() => {
      const style = getComputedStyle(document.querySelector('#perfiles .tipo'));
      return { animation: style.animationName, duration: style.transitionDuration };
    })()`);
    assert(reduced.animation === 'none' && parseFloat(reduced.duration) <= .00001, 'reduced-motion preference is not respected', reduced);
    assert(runtimeErrors.length === 0, 'runtime errors detected', runtimeErrors);

    console.log(JSON.stringify({
      status: 'PASS',
      mobileLanguage: mobileChanged,
      semantics,
      validation,
      selected,
      keyboard,
      hovered,
      pressed,
      contrast,
      reduced
    }, null, 2));
  } finally {
    try { socket?.close(); } catch (_) {}
    edge.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
