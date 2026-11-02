/* Shared startup overlay for the two static portal entry pages. */
(() => {
  'use strict';
  const loader = document.getElementById('brand-preloader');
  // Fail open if the localized stylesheet is unavailable.
  if (!loader || getComputedStyle(loader).getPropertyValue('--brand-preloader-ready').trim() !== '1') return;

  let exiting = false;
  let exitTimer;
  const remove = () => {
    clearTimeout(safetyTimer);
    clearTimeout(exitTimer);
    document.removeEventListener('DOMContentLoaded', finish);
    window.removeEventListener('pageshow', finish);
    loader.remove();
  };
  const finish = () => {
    if (exiting) return;
    exiting = true;
    clearTimeout(safetyTimer);
    // Release pointer interaction immediately; never move or trap focus.
    loader.setAttribute('aria-hidden', 'true');
    loader.classList.add('is-exiting');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      remove();
      return;
    }
    loader.addEventListener('transitionend', event => {
      if (event.target === loader && event.propertyName === 'opacity') remove();
    });
    // Also remove if transitions are disabled or their event is missed.
    exitTimer = setTimeout(remove, 250);
  };
  const safetyTimer = setTimeout(finish, 6000);
  loader.hidden = false;
  if (document.readyState === 'loading') {
    // Existing synchronous app scripts initialize before this native event.
    document.addEventListener('DOMContentLoaded', finish, { once: true });
  } else {
    finish();
  }
  window.addEventListener('pageshow', finish, { once: true });
})();
