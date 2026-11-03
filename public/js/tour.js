/* Tutorial a pantalla completa compartido por el portal público y el interno.
   - DovelaTour.kit: piezas para dibujar miniaturas del sitio en un lienzo de 320×180 unidades
     y anotarlas "a mano" (marcador, círculo, flecha y nota manuscrita).
   - DovelaTour.create(): arma el modal (se llama al cargar la página, antes de DOMContentLoaded,
     para que theme.js e i18n.js enlacen su interruptor y sus textos).
   Cada paso: { chapter?, title, text, points?: [texto…], tip?, screen, notes }.
   Los textos van en español; el observador de i18n los traduce al idioma activo. */
(function () {
  'use strict';

  const t = (source, variables) => window.DovelaI18n?.t(source, variables) || source;

  /* ---------- Miniaturas ---------- */
  const box = (x, y, w, h, cls, inner = '') =>
    `<div class="${cls}" style="left:calc(var(--u)*${x});top:calc(var(--u)*${y});width:calc(var(--u)*${w});height:calc(var(--u)*${h})">${inner}</div>`;
  const bars = (...widths) => widths.map(w => `<i class="ts-bar" style="width:${w}%"></i>`).join('');
  const ICO = {
    claim: '<svg viewBox="0 0 32 32"><path d="M16 28s10-4.7 10-12V6l-10-3-10 3v10c0 7.3 10 12 10 12Z"/><path d="M11 16h10M16 11v10"/></svg>',
    network: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="4"/><circle cx="6" cy="8" r="2"/><circle cx="26" cy="8" r="2"/><circle cx="7" cy="26" r="2"/><circle cx="25" cy="26" r="2"/><path d="m8 9 5 4m11-4-5 4M8 25l5-6m11 6-5-6"/></svg>',
    status: '<svg viewBox="0 0 32 32"><path d="M18 4H8a3 3 0 0 0-3 3v18a3 3 0 0 0 3 3h11"/><path d="M11 11h10M11 16h7"/><circle cx="22" cy="22" r="5"/><path d="m26 26 3 3"/></svg>'
  };
  // Íconos de línea del sitio (public/js/iconos.js) cuando están disponibles.
  const icon = name => ICO[name] || (typeof window.icono === 'function' ? window.icono(name) : '');
  // Código QR de muestra (decorativo): tres marcas de posición y un patrón fijo.
  const QR_CELLS = '1011010010110100101100010110101101010011010010100101101011010011';
  function qr() {
    const finder = (x, y) => `<path fill-rule="evenodd" d="M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z"/>`;
    const cells = [...QR_CELLS].map((bit, i) => (bit === '1'
      ? `<rect x="${8 + (i % 8) * 1.6}" y="${8 + Math.floor(i / 8) * 1.6}" width="1.6" height="1.6"/>`
      : '')).join('');
    return `<svg class="ts-qr" viewBox="0 0 21 21">${finder(0, 0)}${finder(14, 0)}${finder(0, 14)}${cells}</svg>`;
  }

  /* ---------- Trazos "hechos a mano" ---------- */
  // Círculo que no cierra exacto, como trazado con marcador.
  function loop(cx, cy, rx, ry) {
    const k = .56;
    return `M${cx - rx * .96} ${cy - ry * .2}`
      + `C${cx - rx * .98} ${cy - ry * (1 + k * .1)} ${cx - rx * k} ${cy - ry * 1.04} ${cx} ${cy - ry}`
      + `C${cx + rx * k} ${cy - ry * .98} ${cx + rx * 1.02} ${cy - ry * k} ${cx + rx} ${cy}`
      + `C${cx + rx * .99} ${cy + ry * k} ${cx + rx * k} ${cy + ry * 1.03} ${cx} ${cy + ry}`
      + `C${cx - rx * k} ${cy + ry * .97} ${cx - rx * 1.03} ${cy + ry * k} ${cx - rx * .99} ${cy - ry * .05}`
      + `Q${cx - rx * .94} ${cy - ry * .62} ${cx - rx * .62} ${cy - ry * .9}`;
  }
  // Flecha curva (cuerpo y punta por separado para dibujarlos en secuencia).
  function arrow(x1, y1, qx, qy, x2, y2) {
    const a = Math.atan2(y2 - qy, x2 - qx), len = 8, spread = .5;
    const hx = s => (x2 - len * Math.cos(a + s * spread)).toFixed(1), hy = s => (y2 - len * Math.sin(a + s * spread)).toFixed(1);
    return [`M${x1} ${y1}Q${qx} ${qy} ${x2} ${y2}`, `M${hx(1)} ${hy(1)}L${x2} ${y2}L${hx(-1)} ${hy(-1)}`];
  }
  const marker = (x1, x2, y) => `M${x1} ${y}Q${(x1 + x2) / 2} ${y - 2.5} ${x2} ${y + 1}`;
  const ink = (d, delay, cls = 'ts-ink') => `<path class="${cls}" pathLength="1" style="--d:${delay}ms" d="${d}"/>`;
  function annotate({ highlight, circle, arrow: [a, b], note }) {
    const paths = [
      highlight ? ink(marker(...highlight), 150, 'ts-marker') : '',
      circle ? ink(loop(...circle), 350) : '',
      ink(a, 900), ink(b, 1350)
    ].join('');
    return `<svg class="ts-notes" viewBox="0 0 320 180" aria-hidden="true">${paths}</svg>`
      // note = [x, y, giro, texto, ancho opcional]; con ancho, la nota puede ocupar dos líneas.
      + `<p class="ts-note${note[4] ? ' ts-note--wrap' : ''}" style="left:calc(var(--u)*${note[0]});top:calc(var(--u)*${note[1]});--r:${note[2]}deg${note[4] ? `;width:calc(var(--u)*${note[4]})` : ''}">${note[3]}</p>`;
  }

  /* ---------- Modal ---------- */
  const THEME_SWITCH = `<label class="theme-switch">
      <input class="theme-switch__input" type="checkbox" role="switch" data-theme-toggle aria-label="Cambiar a modo claro">
      <span class="theme-switch__track" aria-hidden="true">
        <span class="theme-switch__thumb"></span>
        <svg class="theme-switch__icon theme-switch__icon--sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>
        <svg class="theme-switch__icon theme-switch__icon--moon" viewBox="0 0 24 24"><path d="M20 15.2A8.3 8.3 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z"/></svg>
      </span>
      <span class="sr-only" data-theme-toggle-label>Cambiar a modo claro</span>
    </label>`;
  const CLOSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 6.5l11 11m0-11-11 11"/></svg>';
  const CHECK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const TIP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>';

  function create({ id, steps: initialSteps = [] }) {
    const dialog = document.createElement('dialog');
    dialog.className = 'tour-dialog';
    dialog.id = id;
    dialog.setAttribute('aria-labelledby', `${id}-title`);
    dialog.setAttribute('aria-describedby', `${id}-text`);
    dialog.innerHTML = `
      <div class="dialog-head tour-head">
        <p class="tour-eyebrow" data-tour="step"></p>
        <span class="tour-tools">
          ${THEME_SWITCH}
          <button class="tour-close" data-tour="close" type="button" aria-label="Cerrar guía" title="Cerrar guía">${CLOSE_ICON}</button>
        </span>
      </div>
      <figure class="tour-shot" data-tour="shot" aria-hidden="true"></figure>
      <div class="tour-body" data-tour="body">
        <p class="tour-chapter" data-tour="chapter"></p>
        <h2 id="${id}-title" data-tour="title"></h2>
        <p class="tour-text" id="${id}-text" data-tour="text"></p>
        <ul class="tour-points" data-tour="points" role="list"></ul>
        <p class="tour-tip" data-tour="tip">${TIP_ICON}<span><b class="tour-tip__label">Consejo</b> <span data-tour="tip-text"></span></span></p>
      </div>
      <div class="tour-foot">
        <div class="tour-dots" data-tour="dots" role="group" aria-label="Pasos de la guía" data-i18n-ignore></div>
        <div class="tour-actions">
          <button class="btn btn-ghost tour-skip" data-tour="skip" type="button">Omitir guía</button>
          <span class="tour-nav">
            <button class="btn btn-ghost tour-prev" data-tour="prev" type="button"><span class="tour-prev__arrow" aria-hidden="true">←</span><span class="tour-prev__label">Anterior</span></button>
            <button class="btn btn-azul" data-tour="next" type="button">Siguiente</button>
          </span>
        </div>
      </div>`;
    document.body.appendChild(dialog);

    const $ = name => dialog.querySelector(`[data-tour="${name}"]`);
    let steps = initialSteps;
    let step = 0;
    let opener = null;

    // Textos con variables: se calculan en el idioma activo (el observador no los conoce).
    function renderCounter() {
      $('step').textContent = t('Guía rápida · Paso {current} de {total}', { current: step + 1, total: steps.length });
      $('dots').setAttribute('aria-label', t('Pasos de la guía'));
      [...$('dots').children].forEach((dot, i) => {
        dot.setAttribute('aria-label', t('Ir al paso {current}: {title}', { current: i + 1, title: t(steps[i].title) }));
      });
    }
    function renderDots() {
      const dots = $('dots');
      if (dots.children.length !== steps.length) {
        dots.innerHTML = steps.map((_, i) => `<button type="button" data-step="${i}"></button>`).join('');
      }
      [...dots.children].forEach((dot, i) => {
        if (i === step) dot.setAttribute('aria-current', 'step');
        else dot.removeAttribute('aria-current');
      });
    }
    function render() {
      const s = steps[step];
      $('shot').innerHTML = `<div class="ts-screen"><span class="ts-chrome"><i></i><i></i><i></i></span><div class="ts-canvas">${s.screen}${annotate(s.notes)}</div></div>`;
      $('chapter').textContent = s.chapter || '';
      $('chapter').hidden = !s.chapter;
      $('title').textContent = s.title;
      $('text').textContent = s.text;
      const points = s.points || [];
      $('points').innerHTML = points.map(() => `<li>${CHECK_ICON}<span></span></li>`).join('');
      [...$('points').children].forEach((item, i) => { item.lastElementChild.textContent = points[i]; });
      $('points').hidden = !points.length;
      $('tip-text').textContent = s.tip || '';
      $('tip').hidden = !s.tip;
      $('prev').hidden = step === 0;
      $('next').textContent = step === steps.length - 1 ? 'Empezar' : 'Siguiente';
      renderDots();
      renderCounter();
      $('body').scrollTop = 0;
    }
    // Cambia de paso; `focusTarget` elige qué control conserva el foco (por defecto, Siguiente).
    function go(index, focusTarget) {
      if (index < 0 || index >= steps.length || index === step) return;
      step = index;
      render();
      (focusTarget ? focusTarget() : $('next')).focus();
    }
    function close() {
      if (dialog.open) dialog.close();
      if (opener && document.contains(opener)) opener.focus();
    }
    // Abre el tutorial. Si hay otro modal nativo abierto (p. ej. el de idioma), espera a que se cierre.
    function open(nextSteps) {
      const other = [...document.querySelectorAll('dialog[open]')].find(d => d !== dialog);
      if (other) {
        other.addEventListener('close', () => setTimeout(() => open(nextSteps), 300), { once: true });
        return;
      }
      if (nextSteps) steps = nextSteps;
      if (!steps.length || dialog.open) return;
      step = 0;
      opener = document.activeElement;
      render();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      $('next').focus();
    }

    const dotFocus = () => $('dots').children[step];
    const prevFocus = () => (step === 0 ? $('next') : $('prev'));
    $('next').addEventListener('click', () => {
      if (step < steps.length - 1) go(step + 1);
      else close();
    });
    $('prev').addEventListener('click', () => go(step - 1, prevFocus));
    $('skip').addEventListener('click', close);
    $('close').addEventListener('click', close);
    $('dots').addEventListener('click', event => {
      const dot = event.target.closest('button[data-step]');
      if (dot) go(Number(dot.dataset.step), dotFocus);
    });
    // ← / → recorren los pasos (salvo dentro de un campo, como el interruptor de tema).
    dialog.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, select, textarea')) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const onDots = Boolean(event.target.closest('[data-step]'));
      if (event.key === 'ArrowRight') go(step + 1, onDots ? dotFocus : undefined);
      else go(step - 1, onDots ? dotFocus : prevFocus);
    });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    document.addEventListener('dovela:languagechange', () => { if (dialog.open) renderCounter(); });

    return { open, close, dialog };
  }

  window.DovelaTour = Object.freeze({ create, kit: Object.freeze({ box, bars, icon, qr, loop, arrow, marker, annotate }) });
}());
