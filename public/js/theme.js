(function () {
  'use strict';

  const STORAGE_KEY = 'dovela-theme';
  const DARK = 'dark';
  const LIGHT = 'light';
  const root = document.documentElement;
  const systemPreference = window.matchMedia?.('(prefers-color-scheme: dark)');

  function readPreference() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored === DARK || stored === LIGHT ? stored : null;
    } catch (_) {
      return null;
    }
  }

  function writePreference(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {
      // The selected theme still applies for this page when storage is unavailable.
    }
  }

  function preferredTheme() {
    return readPreference() || (systemPreference?.matches ? DARK : LIGHT);
  }

  function syncLogos(scope) {
    scope.querySelectorAll?.('[data-logo-light][data-logo-dark]').forEach((logo) => {
      const source = root.dataset.theme === DARK ? logo.dataset.logoDark : logo.dataset.logoLight;
      if (source && logo.getAttribute('src') !== source) logo.setAttribute('src', source);
    });
  }

  function syncControls() {
    const isDark = root.dataset.theme === DARK;
    document.querySelectorAll('[data-theme-toggle]').forEach((control) => {
      control.checked = isDark;
      control.setAttribute('aria-checked', String(isDark));
      control.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');

      const label = control.closest('.theme-switch')?.querySelector('[data-theme-toggle-label]');
      if (label) label.textContent = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    });
  }

  function applyTheme(theme, options) {
    const nextTheme = theme === DARK ? DARK : LIGHT;
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', nextTheme === DARK ? '#0F172A' : '#F8FAFC');

    syncLogos(document);
    syncControls();

    if (options?.persist) writePreference(nextTheme);
    window.dispatchEvent(new CustomEvent('dovela:themechange', { detail: { theme: nextTheme } }));
  }

  function bindControls() {
    document.querySelectorAll('[data-theme-toggle]').forEach((control) => {
      if (control.dataset.themeBound === 'true') return;
      control.dataset.themeBound = 'true';
      control.addEventListener('change', () => applyTheme(control.checked ? DARK : LIGHT, { persist: true }));
      bindPointerDrag(control);
    });
    syncControls();
  }

  function bindPointerDrag(control) {
    const shell = control.closest('.theme-switch');
    const track = shell?.querySelector('.theme-switch__track');
    const thumb = shell?.querySelector('.theme-switch__thumb');
    if (!shell || !track || !thumb || !window.PointerEvent) return;

    let gesture = null;
    let settleTimer = 0;
    let suppressClickUntil = 0;

    function finishSettle() {
      shell.classList.remove('is-settling');
      thumb.style.removeProperty('transform-origin');
      track.style.removeProperty('--theme-thumb-settle-from');
      track.style.removeProperty('--theme-thumb-settle-ramp');
      track.style.removeProperty('--theme-thumb-settle-over');
      track.style.removeProperty('--theme-thumb-settle-back');
      track.style.removeProperty('--theme-thumb-settle-near');
      track.style.removeProperty('--theme-thumb-settle-to');
      window.clearTimeout(settleTimer);
    }

    function settle(fromPosition, toPosition) {
      const distance = toPosition - fromPosition;
      const direction = distance >= 0 ? 1 : -1;
      shell.classList.remove('is-dragging');
      track.style.removeProperty('--theme-thumb-x');
      track.style.removeProperty('--theme-drop-scale-x');
      track.style.removeProperty('--theme-drop-scale-y');
      track.style.removeProperty('--theme-drop-direction');
      track.style.setProperty('--theme-thumb-settle-from', `${fromPosition}px`);
      track.style.setProperty('--theme-thumb-settle-ramp', `${fromPosition + distance * .16}px`);
      track.style.setProperty('--theme-thumb-settle-over', `${toPosition + direction * 2}px`);
      track.style.setProperty('--theme-thumb-settle-back', `${toPosition - direction * 1.1}px`);
      track.style.setProperty('--theme-thumb-settle-near', `${toPosition + direction * .35}px`);
      track.style.setProperty('--theme-thumb-settle-to', `${toPosition}px`);
      shell.classList.remove('is-settling');
      // Restart the drop animation even when the user drags repeatedly.
      void shell.offsetWidth;
      shell.classList.add('is-settling');
      window.clearTimeout(settleTimer);
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        finishSettle();
        return;
      }
      settleTimer = window.setTimeout(finishSettle, 780);
    }

    shell.addEventListener('click', (event) => {
      if (performance.now() < suppressClickUntil && event.detail !== 0) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    control.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !event.isPrimary) return;

      const end = Number.parseFloat(getComputedStyle(track).getPropertyValue('--theme-thumb-end')) || 24;
      gesture = {
        id: event.pointerId,
        startX: event.clientX,
        startPosition: control.checked ? end : 0,
        position: control.checked ? end : 0,
        end,
        dragged: false
      };

      finishSettle();
      control.focus({ preventScroll: true });
      control.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    control.addEventListener('pointermove', (event) => {
      if (!gesture || event.pointerId !== gesture.id) return;

      const delta = event.clientX - gesture.startX;
      if (!gesture.dragged && Math.abs(delta) < 3) return;
      gesture.dragged = true;
      gesture.position = Math.min(gesture.end, Math.max(0, gesture.startPosition + delta));

      const progress = gesture.end ? gesture.position / gesture.end : 0;
      const stretch = 1 + Math.min(.28, Math.abs(delta) / Math.max(gesture.end, 1) * .22);
      const direction = delta >= 0 ? 1 : -1;

      shell.classList.add('is-dragging');
      track.style.setProperty('--theme-thumb-x', `${gesture.position}px`);
      track.style.setProperty('--theme-drop-scale-x', stretch.toFixed(3));
      track.style.setProperty('--theme-drop-scale-y', Math.max(.82, 2 - stretch).toFixed(3));
      track.style.setProperty('--theme-drop-direction', String(direction));
      thumb.style.transformOrigin = direction > 0 ? 'left center' : 'right center';
      control.setAttribute('aria-valuetext', progress >= .5 ? 'Modo oscuro' : 'Modo claro');
      event.preventDefault();
    });

    function endGesture(event, cancelled = false) {
      if (!gesture || event.pointerId !== gesture.id) return;

      const releasePosition = gesture.dragged ? gesture.position : gesture.startPosition;
      const nextIsDark = cancelled
        ? control.checked
        : gesture.dragged ? gesture.position >= gesture.end / 2 : !control.checked;
      const destination = nextIsDark ? gesture.end : 0;
      if (!cancelled) suppressClickUntil = performance.now() + 500;
      control.releasePointerCapture?.(event.pointerId);
      gesture = null;
      control.removeAttribute('aria-valuetext');
      if (!cancelled) applyTheme(nextIsDark ? DARK : LIGHT, { persist: true });
      settle(releasePosition, destination);
      if (!cancelled) event.preventDefault();
    }

    // Listen at window level as a resilient fallback for releases outside the
    // visually transparent input or when pointer capture changes mid-gesture.
    window.addEventListener('pointerup', (event) => endGesture(event));
    window.addEventListener('pointercancel', (event) => endGesture(event, true));
  }

  applyTheme(preferredTheme());

  const parserObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      if (node.matches?.('[data-logo-light][data-logo-dark]')) syncLogos(node.parentNode || document);
      else syncLogos(node);
    }));
  });
  parserObserver.observe(root, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', () => {
    parserObserver.disconnect();
    bindControls();
    syncLogos(document);
  });

  // Al cambiar la apariencia del dispositivo, esa preferencia vuelve a mandar: se aplica en todo el sitio
  // y reemplaza la elección manual anterior. Sin preferencia oscura del dispositivo, el modo claro es el predeterminado.
  systemPreference?.addEventListener?.('change', (event) => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (_) { /* almacenamiento no disponible */ }
    applyTheme(event.matches ? DARK : LIGHT);
  });

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && (event.newValue === DARK || event.newValue === LIGHT)) {
      applyTheme(event.newValue);
    }
  });

  window.DovelaTheme = Object.freeze({
    get: () => root.dataset.theme,
    set: (theme) => applyTheme(theme, { persist: true })
  });
})();
