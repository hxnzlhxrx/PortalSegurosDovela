/* Iconos de línea (24×24, trazo currentColor). Sustituyen a los emojis del proyecto.
   - En JS:   icono('guardar')            → '<svg class="ico" …>…</svg>'
   - En HTML: <span class="ico" data-icon="guardar" aria-hidden="true"></span>  (se hidrata al cargar y al insertarse) */
(function () {
    'use strict';

    const TRAZOS = {
        documento: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
        nota: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m9.5 17 .5-2 4-4 1.5 1.5-4 4z"/>',
        factura: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
        guardar: '<path d="M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
        descargar: '<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5"/><path d="M5 19h14"/>',
        subir: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 19h14"/>',
        actualizar: '<path d="M19.5 11A7.5 7.5 0 0 0 6.2 6.8L4.5 8.5M4.5 4.5v4h4"/><path d="M4.5 13a7.5 7.5 0 0 0 13.3 4.2l1.7-1.7M19.5 19.5v-4h-4"/>',
        mas: '<path d="M12 5v14M5 12h14"/>',
        bandeja: '<path d="M4 13h4l1.5 3h5L16 13h4"/><path d="M5.5 6.5 4 13v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5l-1.5-6.5A1 1 0 0 0 17.5 6h-11a1 1 0 0 0-1 .5z"/>',
        ver: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.75"/>',
        check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
        ok: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>',
        error: '<circle cx="12" cy="12" r="8.5"/><path d="m9.2 9.2 5.6 5.6m0-5.6-5.6 5.6"/>',
        alerta: '<path d="M10.3 4.3 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 16.8v.01"/>',
        urgente: '<path d="M7 18v-5a5 5 0 0 1 10 0v5"/><path d="M5 18h14v2H5zM12 3v2M4.2 6.2l1.4 1.4M19.8 6.2l-1.4 1.4"/>',
        archivo: '<rect x="3.5" y="4" width="17" height="4.5" rx="1"/><path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5M10 12h4"/>',
        desarchivar: '<rect x="3.5" y="4" width="17" height="4.5" rx="1"/><path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5"/><path d="M12 17.5v-6m-2.5 2.5 2.5-2.5 2.5 2.5"/>',
        ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
        tarjeta: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
        carpeta: '<path d="M3.5 7.5V18a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-7.5L10 5.5H4.5a1 1 0 0 0-1 1z"/>',
        imagen: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m20.5 16-4.5-4.5L6 19.5"/>',
        correo: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
        usuario: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
        usuarios: '<circle cx="9" cy="8.5" r="3.25"/><path d="M3 19.5a6 6 0 0 1 12 0M15.5 5.6a3.25 3.25 0 0 1 0 5.8M17.5 14.3a6 6 0 0 1 3.5 5.2"/>',
        persona: '<circle cx="12" cy="5.5" r="2.25"/><path d="M12 9v6m0 0-2.5 5.5M12 15l2.5 5.5M7 11.5 12 9l5 2.5"/>',
        candado: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
        reloj: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M10 3h4"/>',
        hospital: '<path d="M4 20V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14M2.5 20h19"/><path d="M12 8.5v5M9.5 11h5M10 20v-3h4v3"/>',
        grafico: '<path d="M4 4v15a1 1 0 0 0 1 1h15"/><path d="M8.5 16v-4M12.5 16V8M16.5 16v-6"/>',
        portapapeles: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3.5h6v1M9 10h6M9 14h6M9 17.5h3"/>',
        mapa: '<path d="m9 4.5-5.5 2v13l5.5-2 6 2 5.5-2v-13l-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
        firma: '<path d="M4 18c2.5 0 3-4.5 5-4.5s1 3 3 3 2.5-2 4-2 1.5 1.5 4 1.5"/><path d="m14 4.5 3.5 3.5L10 15.5l-4 .5.5-4z"/>',
        deshacer: '<path d="M9 14 4.5 9.5 9 5"/><path d="M4.5 9.5H15a4.5 4.5 0 0 1 0 9h-3"/>',
        acuerdo: '<path d="m11 17 2 2a1.5 1.5 0 0 0 2.1-2.1"/><path d="m14 14 2.5 2.5a1.5 1.5 0 0 0 2.1-2.1l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a1.5 1.5 0 0 1-2.1-2.1l2.8-2.8a3 3 0 0 1 3.6-.5l.5.3a2 2 0 0 0 1.5.2L21 6"/><path d="m21 15-1.5-1.5M3 6l1.6.5a2 2 0 0 0 1.4 0L8 6M3 15l5.5 5.5a1.5 1.5 0 0 0 2.1-2.1"/>',
        catalogo: '<path d="M4.5 18.5V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1zM9.5 18.5V7.5a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-2.5"/><path d="m15.2 7.8 2.6-.7a1 1 0 0 1 1.2.7l2.6 9.6a1 1 0 0 1-.7 1.2l-2.6.7a1 1 0 0 1-1.2-.7z"/>',
        buscar: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
        camara: '<path d="M4 8a1 1 0 0 1 1-1h2.5l1.5-2h6l1.5 2H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><circle cx="12" cy="12.5" r="3.25"/>',
        clip: '<path d="m20 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/>',
        borrar: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12a1 1 0 0 0 1 1h7.4a1 1 0 0 0 1-1l.8-12M10 11v5.5M14 11v5.5"/>',
        estetoscopio: '<path d="M6 3.5H5a1 1 0 0 0-1 1V9a4.5 4.5 0 0 0 9 0V4.5a1 1 0 0 0-1-1h-1"/><path d="M8.5 13.5v1a5 5 0 0 0 10 0V12"/><circle cx="18.5" cy="10" r="2"/>',
        diente: '<path d="M12 6c-1.5-1.5-5.5-2.5-6.8.5-1 2.3.3 4.5.8 6.5.6 2.7.7 7 2.5 7s1.5-4.5 3.5-4.5 1.7 4.5 3.5 4.5 1.9-4.3 2.5-7c.5-2 1.8-4.2.8-6.5C17.5 3.5 13.5 4.5 12 6z"/>',
        lentes: '<circle cx="6.5" cy="15" r="3.5"/><circle cx="17.5" cy="15" r="3.5"/><path d="M10 15a2 2 0 0 1 4 0M3 15l1.5-7.5L7 6.5M21 15l-1.5-7.5L17 6.5"/>',
        idea: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
        medicamento: '<path d="m10.5 20.5-7-7a4.9 4.9 0 0 1 7-7l7 7a4.9 4.9 0 0 1-7 7z"/><path d="m8.5 8.5 7 7"/>',
        laboratorio: '<path d="M9.5 3.5h5M10.5 3.5v6L5 18.5A1.3 1.3 0 0 0 6.2 20.5h11.6a1.3 1.3 0 0 0 1.2-2L13.5 9.5v-6"/><path d="M7.5 15h9"/>',
        identificacion: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M5.8 16a3.3 3.3 0 0 1 6.4 0M14.5 10h3.5M14.5 13.5h3.5"/>',
        cerrar: '<path d="M6.5 6.5l11 11m0-11-11 11"/>',
        edificio: '<path d="M5 20.5V4.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 9.5h3a1 1 0 0 1 1 1v10M3 20.5h18"/><path d="M8.5 7.5h3M8.5 11h3M8.5 14.5h3"/>',
        ambulancia: '<path d="M3 17V7.5a1 1 0 0 1 1-1h10v10.5M14 10h3.5l3.5 3.5V17h-1.5"/><path d="M8.5 9v4M6.5 11h4"/><circle cx="7" cy="17.5" r="1.75"/><circle cx="17" cy="17.5" r="1.75"/><path d="M8.75 17.5h6.5"/>',
        paloma: '<path d="M4 16c4 0 6-2 7.5-5L13 7.5A3 3 0 0 1 19 8l2 .5-2 1.5c0 5.5-4.5 9-10 9H4z"/><path d="M11.5 11 8 7.5 6 9"/><circle cx="16.5" cy="8.2" r=".5"/>',
        sparkle: '<path d="M12 3.5l1.8 6.7 6.7 1.8-6.7 1.8L12 20.5l-1.8-6.7L3.5 12l6.7-1.8z"/>'
    };

    function icono(nombre, clase) {
        const trazo = TRAZOS[nombre];
        if (!trazo) return '';
        return '<svg class="ico' + (clase ? ' ' + clase : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + trazo + '</svg>';
    }

    function hidratar(raiz) {
        if (!raiz || !raiz.querySelectorAll) return;
        const lista = raiz.matches && raiz.matches('span.ico[data-icon]') ? [raiz] : raiz.querySelectorAll('span.ico[data-icon]');
        lista.forEach(span => {
            const svg = icono(span.getAttribute('data-icon'));
            if (svg) span.outerHTML = svg;
        });
    }

    function iniciar() {
        hidratar(document);
        new MutationObserver(cambios => cambios.forEach(c => c.addedNodes.forEach(n => n.nodeType === 1 && hidratar(n))))
            .observe(document.documentElement, { childList: true, subtree: true });
    }

    window.icono = icono;
    window.DovelaIconos = { icono, hidratar, nombres: Object.keys(TRAZOS) };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
    else iniciar();
})();
