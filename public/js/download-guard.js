/* Prevent an accidental double activation from starting the same download twice. */
(() => {
  'use strict';

  const COOLDOWN_MS = 900;
  const recentActions = new WeakMap();
  const downloadIntent = /descargar|download|exportar|descDocs|descDoc/i;

  document.addEventListener('click', (event) => {
    const action = event.target.closest?.('button, a');
    if (!action) return;

    const explicitDownloadAction = action.dataset.downloadAction;

    const signature = [
      explicitDownloadAction,
      action.id,
      action.getAttribute('onclick'),
      action.getAttribute('download'),
      action.getAttribute('aria-label'),
      action.textContent
    ].filter(Boolean).join(' ');
    if (!explicitDownloadAction && !downloadIntent.test(signature)) return;

    const now = performance.now();
    const previous = recentActions.get(action) || 0;
    if (previous && now - previous < COOLDOWN_MS) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    recentActions.set(action, now);
  }, true);
})();
