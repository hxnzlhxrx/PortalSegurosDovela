// Dark/light theme checks in a real headless Edge instance through DevTools.
// Usage: node tests/theme.cjs [output-directory]
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = path.resolve(process.argv[2] || path.join(os.tmpdir(), 'dovela-theme-qa'));
const BASE = process.env.THEME_QA_BASE || 'http://127.0.0.1:4173';
const PORT = 12000 + Math.floor(Math.random() * 10000);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dovela-theme-profile-'));
  const edge = spawn(EDGE, [
    '--headless=new',
    '--disable-gpu',
    '--force-color-profile=srgb',
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
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
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
      if (response.result?.exceptionDetails) {
        throw new Error(response.result.exceptionDetails.exception?.description || response.result.exceptionDetails.text);
      }
      return response.result?.result?.value;
    };
    const waitFor = async (expression, label) => {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        if (await evaluate(expression)) return;
        await sleep(200);
      }
      throw new Error(`Timed out waiting for ${label}`);
    };
    const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width <= 600
    });
    const navigate = async (pathname) => {
      await send('Page.navigate', { url: `${BASE}/${pathname}` });
      await waitFor("document.readyState !== 'loading' && !!window.DovelaTheme", pathname);
      await sleep(350);
    };
    const screenshot = async (name) => {
      const response = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      fs.writeFileSync(path.join(OUT, name), Buffer.from(response.result.data, 'base64'));
    };
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('CSS.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Network.setBlockedURLs', { urls: ['*cdnjs.cloudflare.com/*', '*cdn.jsdelivr.net/*'] });
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: "localStorage.setItem('dovela.language.preference', 'es');"
    });

    const checks = [];
    const check = async (name, run) => {
      try {
        const detail = await run();
        checks.push({ name, status: 'PASS', detail });
      } catch (error) {
        checks.push({ name, status: 'FAIL', detail: String(error.message || error) });
      }
    };
    const assert = (condition, detail) => {
      if (!condition) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    };

    await viewport(1440, 1000);
    await navigate('index.html');
    await evaluate("localStorage.removeItem('dovela-theme'); window.DovelaTheme.set('light')");

    await check('Public portal: light theme state and accessible switch', async () => {
      const state = await evaluate(`(() => {
        const toggle = document.querySelector('[data-theme-toggle]');
        const box = toggle.closest('.theme-switch').getBoundingClientRect();
        return {
          theme: document.documentElement.dataset.theme,
          colorScheme: getComputedStyle(document.documentElement).colorScheme,
          checked: toggle.checked,
          ariaChecked: toggle.getAttribute('aria-checked'),
          label: toggle.getAttribute('aria-label'),
          themeColor: document.querySelector('meta[name="theme-color"]').content,
          stored: localStorage.getItem('dovela-theme'),
          target: [box.width, box.height],
          navControlHeights: [
            document.querySelector('.language-select-wrap').getBoundingClientRect().height,
            document.querySelector('#v-landing .theme-switch__track').getBoundingClientRect().height,
            document.querySelector('#v-landing .btn-portal').getBoundingClientRect().height
          ],
          themeTrackWidth: document.querySelector('#v-landing .theme-switch__track').getBoundingClientRect().width,
          navLogo: document.getElementById('logo-nav').getAttribute('src'),
          navBackdrop: getComputedStyle(document.querySelector('#v-landing .nav')).backdropFilter,
          overflow: document.documentElement.scrollWidth - innerWidth,
          ticketLogo: document.getElementById('logo-ticket').getAttribute('src')
        };
      })()`);
      assert(state.theme === 'light' && state.colorScheme === 'light', state);
      assert(!state.checked && state.ariaChecked === 'false' && /oscuro/.test(state.label), state);
      assert(state.themeColor === '#F8FAFC' && state.stored === 'light', state);
      assert(state.target[0] >= 44 && state.target[1] >= 44 && state.overflow <= 0, state);
      assert(state.navControlHeights.every((height) => height === 44), state);
      assert(state.themeTrackWidth === 78, state);
      assert(state.navLogo.endsWith('dovela-logo-horizontal.svg') && state.navBackdrop.includes('blur(28px)'), state);
      assert(state.ticketLogo.endsWith('dovela-logo-horizontal.svg'), state);
      return state;
    });
    await screenshot('public-light-1440.png');

    await check('Preloader uses the colorful HumanUI spinner', async () => {
      const state = await evaluate(`(() => {
        const loader = document.createElement('div');
        loader.className = 'brand-preloader';
        loader.setAttribute('role', 'status');
        loader.innerHTML = '<div class="brand-preloader__brand"><img class="brand-preloader__logo" src="public/assets/brand/dovela-logo-stacked.svg" alt=""><p class="brand-preloader__label">Cargando Dovela…</p><div class="brand-preloader__track brand-preloader__spinner" aria-hidden="true"><span class="brand-preloader__dot brand-preloader__dot--blue"></span><span class="brand-preloader__dot brand-preloader__dot--green"></span><span class="brand-preloader__dot brand-preloader__dot--amber"></span><span class="brand-preloader__dot brand-preloader__dot--red"></span></div></div>';
        document.body.prepend(loader);
        const spinner = loader.querySelector('.brand-preloader__spinner');
        return {
          dots: loader.querySelectorAll('.brand-preloader__dot').length,
          animation: getComputedStyle(spinner).animationName,
          colors: [...loader.querySelectorAll('.brand-preloader__dot')].map((dot) => getComputedStyle(dot).backgroundColor)
        };
      })()`);
      await screenshot('preloader-spinner-light.png');
      await evaluate("document.querySelector('.brand-preloader')?.remove()");
      assert(state.dots === 4 && state.animation === 'brand-preloader-orbit' && new Set(state.colors).size === 4, state);
      return state;
    });

    await check('Download actions ignore an immediate duplicate activation', async () => {
      const state = await evaluate(`(async () => {
        window.__downloadGuardCount = 0;
        const button = document.createElement('button');
        button.textContent = 'Descargar todos los archivos';
        button.setAttribute('onclick', 'window.__downloadGuardCount += 1');
        document.body.append(button);
        button.click();
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 30));
        const immediateCount = window.__downloadGuardCount;
        await new Promise((resolve) => setTimeout(resolve, 920));
        button.click();
        const afterCooldownCount = window.__downloadGuardCount;
        button.remove();
        delete window.__downloadGuardCount;
        return { immediateCount, afterCooldownCount };
      })()`);
      assert(state.immediateCount === 1 && state.afterCooldownCount === 2, state);
      return state;
    });

    await check('Public nav controls expose liquid-glass hover and pressed feedback', async () => {
      const hoverAndInspect = async (hitSelector, styleSelector, capture = false) => {
        const point = await evaluate(`(() => {
          const box = document.querySelector(${JSON.stringify(hitSelector)}).getBoundingClientRect();
          return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        })()`);
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
        await sleep(420);
        const state = await evaluate(`(() => {
          const style = getComputedStyle(document.querySelector(${JSON.stringify(styleSelector)}));
          return { selector: ${JSON.stringify(styleSelector)}, transform: style.transform, shadow: style.boxShadow, backdrop: style.backdropFilter };
        })()`);
        if (capture) await screenshot('public-light-1440-nav-hover.png');
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 500 });
        await sleep(80);
        return state;
      };
      const hovered = [];
      hovered.push(await hoverAndInspect('.language-select', '.language-select-wrap'));
      hovered.push(await hoverAndInspect('#v-landing .theme-switch__input', '#v-landing .theme-switch__track', true));
      hovered.push(await hoverAndInspect('#v-landing .btn-portal', '#v-landing .btn-portal'));
      assert(hovered.every((item) => item.shadow !== 'none' && item.backdrop !== 'none'), hovered);

      const pressAndInspect = async (hitSelector, styleSelector) => {
        const point = await evaluate(`(() => {
          const box = document.querySelector(${JSON.stringify(hitSelector)}).getBoundingClientRect();
          return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        })()`);
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        await sleep(240);
        const state = await evaluate(`(() => {
          const style = getComputedStyle(document.querySelector(${JSON.stringify(styleSelector)}));
          return { selector: ${JSON.stringify(styleSelector)}, transform: style.transform, radius: style.borderRadius };
        })()`);
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 500, button: 'left' });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 2, y: 500, button: 'left', clickCount: 1 });
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        return state;
      };
      const pressed = [];
      pressed.push(await pressAndInspect('.language-select', '.language-select-wrap'));
      pressed.push(await pressAndInspect('#v-landing .theme-switch__input', '#v-landing .theme-switch__track'));
      pressed.push(await pressAndInspect('#v-landing .btn-portal', '#v-landing .btn-portal'));
      assert(pressed.every((item) => item.transform.includes('0.94') && parseFloat(item.radius) >= 6), pressed);
      return { hovered, pressed };
    });

    await check('Theme switch supports a liquid pointer drag without losing native state', async () => {
      await evaluate("window.DovelaTheme.set('light')");
      const points = await evaluate(`(() => {
        const shell = document.querySelector('#v-landing .theme-switch');
        const track = shell.querySelector('.theme-switch__track').getBoundingClientRect();
        const thumb = shell.querySelector('.theme-switch__thumb').getBoundingClientRect();
        return {
          start: { x: thumb.left + thumb.width / 2, y: track.top + track.height / 2 },
          end: { x: track.right - thumb.width / 2 - 4, y: track.top + track.height / 2 }
        };
      })()`);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: points.start.x, y: points.start.y });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: points.start.x, y: points.start.y, button: 'left', buttons: 1, clickCount: 1 });
      for (let step = 1; step <= 4; step += 1) {
        const x = points.start.x + (points.end.x - points.start.x) * step / 4;
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: points.end.y, button: 'left', buttons: 1 });
        await sleep(35);
      }
      const dragging = await evaluate(`(() => {
        const shell = document.querySelector('#v-landing .theme-switch');
        const track = shell.querySelector('.theme-switch__track');
        const thumb = shell.querySelector('.theme-switch__thumb');
        return {
          dragging: shell.classList.contains('is-dragging'),
          position: parseFloat(getComputedStyle(track).getPropertyValue('--theme-thumb-x')),
          transform: getComputedStyle(thumb).transform,
          radius: getComputedStyle(thumb).borderRadius,
          valueText: shell.querySelector('input').getAttribute('aria-valuetext')
        };
      })()`);
      await screenshot('public-light-1440-theme-drag.png');
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: points.end.x, y: points.end.y, button: 'left', buttons: 0, clickCount: 1 });
      await sleep(120);
      const settlingMotion = await evaluate(`(() => {
        const shell = document.querySelector('#v-landing .theme-switch');
        const thumb = shell.querySelector('.theme-switch__thumb');
        const style = getComputedStyle(thumb);
        return {
          settling: shell.classList.contains('is-settling'),
          duration: parseFloat(style.animationDuration),
          animation: style.animationName,
          transform: style.transform
        };
      })()`);
      await screenshot('public-light-1440-theme-settling.png');
      await sleep(700);
      const settled = await evaluate(`(() => {
        const shell = document.querySelector('#v-landing .theme-switch');
        const input = shell.querySelector('input');
        return {
          theme: document.documentElement.dataset.theme,
          checked: input.checked,
          dragging: shell.classList.contains('is-dragging'),
          settling: shell.classList.contains('is-settling'),
          valueText: input.getAttribute('aria-valuetext')
        };
      })()`);
      assert(dragging.dragging && dragging.position >= 30 && dragging.transform !== 'none' && parseFloat(dragging.radius) >= 6 && dragging.valueText === 'Modo oscuro', dragging);
      assert(settlingMotion.settling && settlingMotion.duration >= .7 && settlingMotion.animation === 'theme-drop-settle', settlingMotion);
      assert(settled.theme === 'dark' && settled.checked && !settled.dragging && !settled.settling && settled.valueText === null, settled);
      await evaluate("window.DovelaTheme.set('light')");
      return { dragging, settlingMotion, settled };
    });

    await check('Developer tag is a compact external link with continuous spectral halo', async () => {
      await evaluate("scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })");
      await sleep(320);
      const point = await evaluate(`(() => {
        const tag = document.querySelector('[data-devtag-link]');
        const box = tag.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        return {
          x,
          y,
          target: [box.width, box.height],
          role: tag.tagName,
          href: tag.href,
          targetMode: tag.target,
          rel: tag.rel,
          pressed: tag.hasAttribute('aria-pressed'),
          label: tag.getAttribute('aria-label'),
          hit: document.elementFromPoint(x, y)?.closest('[data-devtag-link]') === tag,
          viewport: [innerWidth, innerHeight]
        };
      })()`);

      const documentNode = await send('DOM.getDocument', { depth: 0 });
      const tagNode = await send('DOM.querySelector', {
        nodeId: documentNode.result.root.nodeId,
        selector: '[data-devtag-link]'
      });
      await send('CSS.forcePseudoState', { nodeId: tagNode.result.nodeId, forcedPseudoClasses: ['hover'] });
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
      await sleep(380);
      const hovered = await evaluate(`(() => {
        const tag = document.querySelector('[data-devtag-link]');
        const glow = tag.querySelector('.footer__dev-glow');
        tag.getAnimations({ subtree:true }).forEach(animation => {
          if (animation instanceof CSSTransition) animation.finish();
        });
        const ripples = tag.querySelector('.footer__dev-ripples');
        const rippleAnimation = tag.getAnimations({ subtree:true }).find(animation => animation.animationName === 'devtag-ripple-hover');
        if (rippleAnimation) rippleAnimation.currentTime = 540;
        const ripple = getComputedStyle(ripples, '::before');
        const rippleBox = ripples.getBoundingClientRect();
        const tagBox = tag.getBoundingClientRect();
        return {
          opacity: parseFloat(getComputedStyle(glow).opacity),
          transform: getComputedStyle(tag).transform,
          outlineOffset: getComputedStyle(tag).outlineOffset,
          rippleAnimation: ripple.animationName,
          rippleOpacity: parseFloat(ripple.opacity),
          rippleBackground: ripple.backgroundImage,
          rippleOverflow: getComputedStyle(ripples).overflow,
          maskDelta: Math.max(
            Math.abs(rippleBox.left - tagBox.left),
            Math.abs(rippleBox.right - tagBox.right),
            Math.abs(rippleBox.top - tagBox.top),
            Math.abs(rippleBox.bottom - tagBox.bottom)
          )
        };
      })()`);
      await screenshot('public-footer-devtag-hover.png');

      await evaluate("document.querySelector('[data-devtag-link]').addEventListener('click', event => event.preventDefault(), { once:true })");
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', buttons: 1, clickCount: 1 });
      await sleep(120);
      const pressed = await evaluate(`(() => {
        const tag = document.querySelector('[data-devtag-link]');
        const glow = tag.querySelector('.footer__dev-glow');
        const matrix = new DOMMatrix(getComputedStyle(tag).transform);
        const tagRect = tag.getBoundingClientRect();
        const glowRect = glow.getBoundingClientRect();
        const ripple = getComputedStyle(tag.querySelector('.footer__dev-ripples'), '::before');
        return {
          scaleX: matrix.a,
          scaleY: matrix.d,
          radius: getComputedStyle(tag).borderRadius,
          filter: getComputedStyle(tag).filter,
          glowHeight: glowRect.height,
          glowRadius: getComputedStyle(glow).borderRadius,
          centerDelta: Math.abs((tagRect.top + tagRect.height / 2) - (glowRect.top + glowRect.height / 2)),
          rippleOpacity: parseFloat(ripple.opacity),
          rippleBackground: ripple.backgroundImage
        };
      })()`);
      await screenshot('public-footer-devtag-pressed.png');

      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', buttons: 0, clickCount: 1 });
      await sleep(100);
      const released = await evaluate(`(() => {
        const tag = document.querySelector('[data-devtag-link]');
        return {
          rebound: tag.classList.contains('is-rebounding'),
          animation: getComputedStyle(tag).animationName,
          transform: getComputedStyle(tag).transform,
          rippleAnimation: getComputedStyle(tag.querySelector('.footer__dev-ripples'), '::before').animationName
        };
      })()`);
      await screenshot('public-footer-devtag-link.png');

      await evaluate("const tag=document.querySelector('[data-devtag-link]'); tag.focus(); tag.addEventListener('click', event => event.preventDefault(), { once:true })");
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await sleep(100);
      const keyboard = await evaluate(`(() => {
        const tag = document.querySelector('[data-devtag-link]');
        return { focused: document.activeElement === tag, rebound: tag.classList.contains('is-rebounding') };
      })()`);

      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      const reduced = await evaluate(`(() => {
        const tag = document.querySelector('[data-devtag-link]');
        const glow = tag.querySelector('.footer__dev-glow');
        const logo = tag.querySelector('.footer__logo');
        return {
          orbit: getComputedStyle(glow).animationName,
          ripple: getComputedStyle(tag.querySelector('.footer__dev-ripples'), '::before').animationName,
          textAnimation: getComputedStyle(logo).animationName,
          transition: parseFloat(getComputedStyle(tag).transitionDuration)
        };
      })()`);
      await evaluate("scrollTo(0, 0)");
      await send('CSS.forcePseudoState', { nodeId: tagNode.result.nodeId, forcedPseudoClasses: [] });
      await send('Emulation.setEmulatedMedia', { features: [] });

      assert(point.role === 'A' && /linktr\.ee\/gishikoDev/.test(point.href) && point.targetMode === '_blank' && /noopener/.test(point.rel) && !point.pressed && point.target[1] >= 44 && /Linktree/.test(point.label) && point.hit, point);
      assert(pressed.scaleX >= .96 && pressed.scaleX <= .99 && Math.abs(pressed.scaleX - pressed.scaleY) <= .01 && parseFloat(pressed.radius) >= 6 && pressed.filter !== 'none' && pressed.glowHeight <= 32 && parseFloat(pressed.glowRadius) <= 16 && !pressed.glowRadius.includes('%') && pressed.centerDelta <= 1 && /radial-gradient/.test(pressed.rippleBackground), pressed);
      assert(hovered.opacity >= .7 && hovered.transform === 'none' && hovered.rippleAnimation === 'devtag-ripple-hover' && hovered.rippleOpacity > .15 && /radial-gradient/.test(hovered.rippleBackground) && hovered.rippleOverflow === 'hidden' && hovered.maskDelta >= 9.5 && hovered.maskDelta <= 10.5, hovered);
      assert(!released.rebound && released.animation === 'none' && released.transform === 'none' && released.rippleAnimation === 'devtag-ripple-hover', released);
      assert(keyboard.focused && !keyboard.rebound, keyboard);
      assert(reduced.orbit === 'none' && reduced.ripple === 'none' && reduced.textAnimation === 'none' && reduced.transition <= .00001, reduced);
      return { point, hovered, pressed, released, keyboard, reduced };
    });

    await check('Reduced motion keeps nav feedback without spatial movement', async () => {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await sleep(80);
      const state = await evaluate(`['.language-select-wrap', '#v-landing .theme-switch__track', '#v-landing .btn-portal'].map((selector) => {
        const style = getComputedStyle(document.querySelector(selector));
        return { selector, transform: style.transform, duration: style.transitionDuration };
      })`);
      assert(state.every((item) => item.transform === 'none' && parseFloat(item.duration) <= 0.00001), state);
      await send('Emulation.setEmulatedMedia', { features: [] });
      return state;
    });

    await check('Keyboard switch activates dark mode and synchronizes metadata', async () => {
      await evaluate("document.querySelector('[data-theme-toggle]').focus()");
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
      await sleep(200);
      const state = await evaluate(`(() => {
        const toggle = document.querySelector('[data-theme-toggle]');
        return {
          theme: document.documentElement.dataset.theme,
          checked: toggle.checked,
          ariaChecked: toggle.getAttribute('aria-checked'),
          label: toggle.getAttribute('aria-label'),
          themeColor: document.querySelector('meta[name="theme-color"]').content,
          stored: localStorage.getItem('dovela-theme')
        };
      })()`);
      assert(state.theme === 'dark' && state.checked && state.ariaChecked === 'true', state);
      assert(/claro/.test(state.label) && state.themeColor === '#0F172A' && state.stored === 'dark', state);
      return state;
    });
    await screenshot('public-dark-1440.png');

    await check('Dark preference survives reload', async () => {
      await send('Page.reload', { ignoreCache: true });
      await waitFor("document.readyState !== 'loading' && !!window.DovelaTheme", 'public reload');
      const state = await evaluate(`({
        theme: document.documentElement.dataset.theme,
        checked: document.querySelector('[data-theme-toggle]').checked,
        stored: localStorage.getItem('dovela-theme')
      })`);
      assert(state.theme === 'dark' && state.checked && state.stored === 'dark', state);
      return state;
    });

    await evaluate("window.DovelaTheme.set('light')");
    await viewport(320, 760);
    await sleep(300);
    await check('Public portal: 320px navigation is collapsed without horizontal overflow', async () => {
      const state = await evaluate(`(() => {
        const more = document.getElementById('nav-more-toggle');
        const menu = document.getElementById('nav-actions');
        const moreBox = more.getBoundingClientRect();
        const moreStyle = getComputedStyle(more);
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          expanded: more.getAttribute('aria-expanded'),
          moreVisible: moreBox.width >= 44 && moreBox.height >= 44,
          moreColor: moreStyle.color,
          menuVisibility: getComputedStyle(menu).visibility,
          navWidth: document.querySelector('#v-landing .nav').getBoundingClientRect().width,
          viewport: [innerWidth, innerHeight]
        };
      })()`);
      assert(state.overflow <= 0 && state.moreVisible && state.navWidth <= state.viewport[0], state);
      assert(state.expanded === 'false' && state.menuVisibility === 'hidden' && state.moreColor === 'rgb(15, 42, 77)', state);
      return state;
    });
    await screenshot('public-light-320.png');

    await check('Mobile More disclosure opens by keyboard and exposes stacked actions', async () => {
      await evaluate("document.getElementById('nav-more-toggle').focus()");
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
      await sleep(180);
      const state = await evaluate(`(() => {
        const more = document.getElementById('nav-more-toggle');
        const menu = document.getElementById('nav-actions');
        const menuBox = menu.getBoundingClientRect();
        const themeBox = menu.querySelector('.theme-switch').getBoundingClientRect();
        const items = [...menu.children].filter((item) => getComputedStyle(item).display !== 'none').map((item) => item.getBoundingClientRect().top);
        return {
          expanded: more.getAttribute('aria-expanded'),
          label: more.getAttribute('aria-label'),
          expectedLabel: window.DovelaI18n.t('Cerrar más opciones'),
          visibility: getComputedStyle(menu).visibility,
          insideViewport: menuBox.left >= 0 && menuBox.right <= innerWidth,
          themeTarget: [themeBox.width, themeBox.height],
          navControlHeights: [
            menu.querySelector('.language-select-wrap').getBoundingClientRect().height,
            menu.querySelector('.theme-switch__track').getBoundingClientRect().height,
            menu.querySelector('.btn-portal').getBoundingClientRect().height
          ],
          verticallyOrdered: items.every((top, index) => index === 0 || top >= items[index - 1])
        };
      })()`);
      assert(state.expanded === 'true' && state.label === state.expectedLabel && state.visibility === 'visible', state);
      assert(state.insideViewport && state.themeTarget[0] >= 44 && state.themeTarget[1] >= 44 && state.verticallyOrdered, state);
      assert(state.navControlHeights.every((height) => Math.abs(height - 44) < 0.01), state);
      return state;
    });
    await screenshot('public-light-320-menu.png');

    await check('Mobile More disclosure closes with Escape and restores focus', async () => {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await sleep(100);
      const state = await evaluate(`({
        expanded: document.getElementById('nav-more-toggle').getAttribute('aria-expanded'),
        visibility: getComputedStyle(document.getElementById('nav-actions')).visibility,
        focus: document.activeElement.id
      })`);
      assert(state.expanded === 'false' && state.visibility === 'hidden' && state.focus === 'nav-more-toggle', state);
      return state;
    });

    await check('Public navigation stays within the viewport across responsive classes', async () => {
      const samples = [];
      for (const width of [320, 360, 390, 480, 600, 601, 768, 1024, 1440, 1920, 2560, 3440]) {
        await viewport(width, 900);
        await sleep(60);
        const sample = await evaluate(`(() => {
          const nav = document.querySelector('#v-landing .nav').getBoundingClientRect();
          const more = document.getElementById('nav-more-toggle');
          return {
            width: innerWidth,
            navInside: nav.left >= 0 && nav.right <= innerWidth,
            overflow: document.documentElement.scrollWidth - innerWidth,
            moreDisplay: getComputedStyle(more).display,
            menuVisibility: getComputedStyle(document.getElementById('nav-actions')).visibility
          };
        })()`);
        assert(sample.navInside && sample.overflow <= 0, sample);
        if (width <= 600) assert(sample.moreDisplay !== 'none' && sample.menuVisibility === 'hidden', sample);
        else assert(sample.moreDisplay === 'none' && sample.menuVisibility === 'visible', sample);
        samples.push(sample);
      }
      return samples;
    });

    await evaluate("window.DovelaTheme.set('dark')");
    await viewport(1280, 900);
    await navigate('interno.html');
    await check('Internal portal: both controls stay synchronized', async () => {
      const state = await evaluate(`(() => {
        const toggles = [...document.querySelectorAll('[data-theme-toggle]')];
        return {
          theme: document.documentElement.dataset.theme,
          count: toggles.length,
          checked: toggles.map((toggle) => toggle.checked),
          labels: toggles.map((toggle) => toggle.getAttribute('aria-label')),
          visibleFallbackLabels: toggles.map((toggle) => getComputedStyle(toggle.closest('.theme-switch').querySelector('[data-theme-toggle-label]')).display),
          overflow: document.documentElement.scrollWidth - innerWidth
        };
      })()`);
      assert(state.theme === 'dark' && state.count === 2 && state.checked.every(Boolean), state);
      assert(state.labels.every((label) => /claro/.test(label)) && state.overflow <= 0, state);
      assert(state.visibleFallbackLabels.every((display) => display === 'none'), state);
      return state;
    });
    await screenshot('internal-dark-1280.png');

    await check('Internal portal: light mode updates both controls and surface logo', async () => {
      const state = await evaluate(`(() => {
        const toggle = document.querySelector('[data-theme-toggle]');
        toggle.click();
        const toggles = [...document.querySelectorAll('[data-theme-toggle]')];
        return {
          theme: document.documentElement.dataset.theme,
          checked: toggles.map((item) => item.checked),
          logo: document.getElementById('logo-login').getAttribute('src'),
          panel: getComputedStyle(document.querySelector('.login-panel')).backgroundColor,
          stored: localStorage.getItem('dovela-theme')
        };
      })()`);
      assert(state.theme === 'light' && state.checked.every((value) => !value), state);
      assert(state.logo.endsWith('dovela-logo-horizontal.svg') && state.stored === 'light', state);
      return state;
    });
    await screenshot('internal-light-1280.png');

    const result = {
      generatedAt: new Date().toISOString(),
      base: BASE,
      checks,
      runtimeErrors: runtimeErrors.filter((value) => /theme\.js|theme\.css/i.test(value))
    };
    fs.writeFileSync(path.join(OUT, 'theme-results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));

    if (checks.some((item) => item.status === 'FAIL') || result.runtimeErrors.length) process.exitCode = 1;
  } finally {
    try { socket?.close(); } catch (_) {}
    edge.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
