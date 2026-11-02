/* ================= MODO LECTURA (portal interno) =================
   Paleta de protección visual: menos luz azul y menos brillo, en modo claro y oscuro.
   Se carga en el <head> después de theme.js para aplicarse antes de pintar la página.
   Los colores están en interno/css/interno-lectura.css. */
(function () {
  "use strict";

  const STORAGE_KEY = "dovela-reading";
  const root = document.documentElement;

  function leer() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "on";
    } catch (_) {
      return false;
    }
  }

  function sincronizarBotones() {
    const activo = root.dataset.reading === "on";
    document.querySelectorAll("[data-reading-toggle]").forEach((boton) => {
      const etiqueta = activo ? "Desactivar modo lectura" : "Activar modo lectura";
      boton.setAttribute("aria-pressed", String(activo));
      boton.setAttribute("aria-label", etiqueta);
      boton.setAttribute("title", etiqueta);
    });
  }

  function aplicar(activo, { guardar = false } = {}) {
    if (activo) root.dataset.reading = "on";
    else delete root.dataset.reading;
    if (guardar) {
      try {
        window.localStorage.setItem(STORAGE_KEY, activo ? "on" : "off");
      } catch (_) {
        /* el modo se aplica igual en esta página */
      }
    }
    sincronizarBotones();
  }

  aplicar(leer());

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-reading-toggle]").forEach((boton) => {
      boton.addEventListener("click", () => aplicar(root.dataset.reading !== "on", { guardar: true }));
    });
    sincronizarBotones();
  });

  // Mantiene el modo sincronizado entre pestañas abiertas del portal.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) aplicar(event.newValue === "on");
  });
})();
