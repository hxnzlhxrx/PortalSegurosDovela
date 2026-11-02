/* ================= TUTORIAL "CÓMO FUNCIONA" (portal interno) =================
   Solo se abre a demanda, con el botón "Cómo funciona" del menú lateral.
   Hay una versión por rol de la sesión: Admin, Ajustador y Visualizador.
   Usa el mismo motor que el tutorial del portal público (public/js/tour.js). */
(function () {
  "use strict";

  if (!window.DovelaTour) return;
  const { box, bars, icon, arrow } = window.DovelaTour.kit;

  /* ---------- Piezas de las miniaturas (lienzo de 320×180) ---------- */
  const LOGO = '<img src="public/assets/brand/dovela-logo-horizontal-dark.svg" alt="">';
  const MENU = [
    ["bandeja", "Bandeja de reclamos"],
    ["portapapeles", "Reservas"],
    ["mapa", "Red Médica"],
  ];
  // Menú lateral; el Admin ve además "Administración".
  function side(activo, admin) {
    const items = admin ? MENU.concat([["ajustes", "Administración"]]) : MENU;
    return box(0, 0, 80, 180, "ts-side",
      LOGO
      + items.map(([ico, label]) => `<span class="ts-item"${label === activo ? " data-on" : ""}>${icon(ico)}<span>${label}</span></span>`).join("")
      + `<span class="ts-item ts-item--help">${icon("idea")}<span>Cómo funciona</span></span>`);
  }
  const text = (x, y, w, h, cls, contenido) => box(x, y, w, h, cls, contenido);
  const badge = (tipo, label) => `<span class="ts-badge ts-badge--${tipo}">${label}</span>`;
  const fila = (y, celdas, cabecera) =>
    box(88, y, 224, 15, `ts-row ts-row--4${cabecera ? " ts-row--head" : ""}`, celdas.map((c) => `<span>${c}</span>`).join(""));
  // Bandeja con radicados y asegurados ficticios; el SLA se muestra con sus colores reales.
  const bandeja = (y0) =>
    fila(y0, ["Radicado", "Asegurado", "Estado", "SLA"], true)
    + fila(y0 + 16, ["SGP-26301-0007-M", "Amara Okafor", "Recibido", badge("ok", "En plazo")])
    + fila(y0 + 32, ["SGP-26298-0004-M", "Jordan Nakamura", "En Proceso", badge("warn", "Por vencer")])
    + fila(y0 + 48, ["SGP-26290-0011-M", "Itzel Haddad", "Recibido", badge("late", "Vencido")])
    + fila(y0 + 64, ["SGP-26287-0002-M", "Kofi Mensah", "Pagado", badge("ok", "En plazo")]);
  const buscador = (x, w) => text(x, 10, w, 14, "ts-select ts-select--plain ts-select--muted", "Buscar radicado, nombre o cédula…");
  const select = (x, w, valor) => text(x, 10, w, 14, "ts-select", valor);
  const historial = () => text(236, 10, 76, 100, "ts-panel", `<b>Historial de gestión</b>${bars(90, 70, 84, 60, 76)}`);

  // Ficha de gestión del reclamo; `lectura` la muestra deshabilitada y sin botones (Visualizador).
  function gestion({ lectura = false, archivar = true } = {}) {
    const off = lectura ? " ts-off" : "";
    return text(88, 8, 140, 166, "ts-panel", "")
      + text(96, 14, 124, 12, "ts-title", "Gestión del Reclamo")
      + text(96, 32, 124, 8, "ts-label", "Estado del Reclamo")
      + text(96, 41, 124, 14, "ts-select" + off, "Pagado")
      + text(96, 61, 124, 8, "ts-label", "Monto Pagado (B/.)")
      + text(96, 70, 124, 14, "ts-select ts-select--plain" + off, "1,250.00")
      + text(96, 90, 124, 8, "ts-label", `${icon("ver")}<span>Comentario visible para el asegurado</span>`)
      + text(96, 100, 124, 24, "ts-area" + off, bars(90, 64))
      + (lectura ? "" : text(96, 132, 124, 16, "ts-btn ts-btn--green", `${icon("guardar")}<span>Guardar gestión</span>`))
      + (lectura || !archivar ? "" : text(96, 152, 124, 16, "ts-btn ts-btn--danger", `${icon("archivo")}<span>Archivar Reclamo</span>`));
  }
  // Tarjeta de asignación: el Admin elige un Ajustador; el Ajustador toma el ticket.
  function asignacion(admin) {
    const accion = admin
      ? text(96, 60, 124, 8, "ts-label", "Asignar a Ajustador")
        + text(96, 70, 124, 15, "ts-select", "Jordan Nakamura")
        + text(96, 92, 124, 17, "ts-btn ts-btn--green", `${icon("usuario")}<span>Asignar ticket</span>`)
      : text(96, 64, 124, 18, "ts-btn ts-btn--green", `${icon("usuario")}<span>Tomar Ticket</span>`);
    return text(88, 10, 140, 128, "ts-panel", "")
      + text(96, 18, 124, 12, "ts-title", "Asignación")
      + text(96, 34, 124, 8, "ts-muted", "Ticket asignado a")
      + text(96, 43, 124, 10, "ts-value", "Sin asignar")
      + accion
      + text(96, admin ? 116 : 92, 124, 14, "", bars(94, 70))
      + historial();
  }

  /* ---------- Pasos por rol (textos en español; i18n los traduce) ---------- */
  const menu = (admin, nota, texto) => ({
    title: admin ? "Su panel de administración" : "Su espacio de trabajo",
    text: texto,
    screen: side("Bandeja de reclamos", admin) + text(88, 10, 224, 12, "ts-title", "Bandeja de reclamos") + bandeja(30),
    notes: { circle: [40, admin ? 58 : 50, 38, admin ? 33 : 26], arrow: arrow(98, 140, 70, 150, 60, admin ? 96 : 82), note: [100, 128, -4, nota] },
  });

  const PASOS = {
    Admin: [
      menu(true, "¡Todo su menú aquí!", "Desde el menú lateral entra a la bandeja de reclamos, las reservas, la Red Médica y la Administración del portal."),
      {
        title: "Priorice con el SLA",
        text: "Filtre la bandeja por estado, SLA o período. El color del SLA indica qué reclamos están por vencer o vencidos.",
        screen: side("Bandeja de reclamos", true) + buscador(88, 74) + select(166, 52, "SLA: todos") + select(222, 62, "Todo el período") + bandeja(32),
        notes: { highlight: [168, 216, 26], circle: [283, 80, 26, 31], arrow: arrow(232, 140, 280, 150, 284, 114), note: [110, 128, -3, "Lo urgente, primero"] },
      },
      {
        title: "Asigne los reclamos",
        text: "Abra un reclamo y asígnelo a un Ajustador activo. Cada cambio queda en el historial con usuario, fecha y hora.",
        screen: side("Bandeja de reclamos", true) + asignacion(true),
        notes: { circle: [158, 90, 70, 24], arrow: arrow(148, 152, 108, 160, 112, 116), note: [150, 144, -3, "Elija al ajustador"] },
      },
      {
        title: "Gestione y archive",
        text: "Actualice el estado, los montos y el comentario para el asegurado, y guarde. Los reclamos Pagados o Rechazados se pueden archivar.",
        screen: side("Bandeja de reclamos", true) + gestion(),
        notes: { circle: [158, 150, 70, 22], arrow: arrow(262, 62, 270, 120, 232, 142), note: [236, 32, -5, "¡Guarde aquí!", 76] },
      },
      {
        title: "Configure el portal",
        text: "En Administración gestiona usuarios y roles, el contenido del portal público, los SLA, los catálogos y la Red Médica.",
        screen: side("Administración", true)
          + text(88, 10, 224, 12, "ts-title", "Configuración del Portal")
          + text(88, 28, 224, 40, "ts-tabs", [
            ["usuarios", "Usuarios y Roles", true], ["imagen", "Portal Público (CMS)"], ["reloj", "SLAs por proceso"],
            ["catalogo", "Catálogos"], ["mapa", "Red Médica"], ["buscar", "Auditoría"],
          ].map(([ico, label, on]) => `<span class="ts-tab"${on ? " data-on" : ""}>${icon(ico)}<span>${label}</span></span>`).join(""))
          + fila(78, ["Amara Okafor", badge("ok", "Admin"), "", ""])
          + fila(94, ["Jordan Nakamura", badge("warn", "Ajustador"), "", ""])
          + fila(110, ["Itzel Haddad", badge("", "Visualizador"), "", ""]),
        notes: { circle: [200, 47, 114, 24], arrow: arrow(118, 150, 92, 120, 108, 76), note: [120, 140, -3, "Todo se configura aquí"] },
      },
    ],

    Ajustador: [
      menu(false, "¡Todo su menú aquí!", "Desde el menú lateral entra a la bandeja de reclamos, las reservas y la Red Médica."),
      {
        title: "Vea sus tickets",
        text: "Elija «Mis tickets» en el filtro de asignación para ver solo los reclamos a su nombre. El color del SLA indica qué vence primero.",
        screen: side("Bandeja de reclamos", false) + buscador(88, 80) + select(172, 58, "Mis tickets") + select(234, 52, "SLA: todos") + bandeja(32),
        notes: { circle: [201, 17, 34, 12], arrow: arrow(188, 136, 226, 104, 206, 32), note: [110, 128, -4, "Solo lo suyo"] },
      },
      {
        title: "Tome un ticket",
        text: "Abra un reclamo sin asignar y pulse «Tomar Ticket». Queda a su nombre y el cambio se registra en el historial.",
        screen: side("Bandeja de reclamos", false) + asignacion(false),
        notes: { circle: [158, 73, 70, 18], arrow: arrow(138, 126, 104, 124, 112, 92), note: [140, 118, -4, "¡Tómelo!"] },
      },
      {
        title: "Registre la gestión",
        text: "Actualice el estado, los montos y el comentario visible para el asegurado, y guarde la gestión.",
        screen: side("Bandeja de reclamos", false) + gestion(),
        notes: { circle: [158, 108, 70, 22], arrow: arrow(258, 84, 262, 112, 232, 112), note: [236, 40, -5, "Lo verá el asegurado", 76] },
      },
      {
        title: "Deje observaciones internas",
        text: "Las observaciones internas no las ve el asegurado. Pegue capturas con Ctrl+V o arrástrelas al recuadro.",
        screen: side("Bandeja de reclamos", false)
          + text(88, 10, 224, 150, "ts-panel", "")
          + text(96, 18, 208, 12, "ts-title", "Observaciones Internas")
          + text(96, 34, 208, 9, "ts-chip", `${icon("candado")}<span>Uso interno · no visible para el asegurado</span>`)
          + text(96, 48, 208, 40, "ts-area", bars(92, 80, 56))
          + text(96, 94, 208, 34, "ts-drop", `${icon("camara")}<span>Ctrl+V</span>`),
        notes: { circle: [200, 111, 108, 21], arrow: arrow(148, 150, 112, 160, 120, 134), note: [150, 142, -3, "Pegue capturas aquí"] },
      },
    ],

    Visualizador: [
      menu(false, "¡Todo su menú aquí!", "Desde el menú lateral consulta la bandeja de reclamos, las reservas y la Red Médica."),
      {
        title: "Encuentre cualquier reclamo",
        text: "Busque por radicado, nombre o cédula y combine los filtros de estado, SLA y período.",
        screen: side("Bandeja de reclamos", false) + buscador(88, 140) + select(232, 52, "SLA: todos") + bandeja(32),
        notes: { circle: [158, 17, 74, 12], arrow: arrow(118, 138, 92, 104, 110, 30), note: [120, 128, -4, "Busque aquí"] },
      },
      {
        title: "Consulta sin cambios",
        text: "Su perfil es de consulta: puede abrir cada reclamo y revisar su gestión, documentos e historial, pero no modificarlos.",
        screen: side("Bandeja de reclamos", false) + gestion({ lectura: true }),
        notes: { circle: [158, 78, 70, 50], arrow: arrow(262, 62, 262, 94, 232, 96), note: [236, 32, -5, "Solo consulta", 76] },
      },
      {
        title: "Descargue reportes",
        text: "«Descargar reporte» exporta las filas visibles de la bandeja, con los filtros que tenga aplicados.",
        screen: side("Bandeja de reclamos", false) + select(88, 52, "SLA: todos") + select(144, 64, "Todo el período")
          + text(212, 10, 100, 14, "ts-select ts-select--plain ts-btn--ghost", `${icon("descargar")}<span>Descargar reporte</span>`)
          + bandeja(32),
        notes: { circle: [262, 17, 54, 12], arrow: arrow(224, 136, 290, 120, 276, 32), note: [100, 128, -4, "Exporta lo filtrado"] },
      },
    ],
  };

  // Se crea al cargar (antes de DOMContentLoaded) para que theme.js enlace su interruptor.
  const tour = window.DovelaTour.create({ id: "tour-interno" });

  // Botón "Cómo funciona": abre la versión del rol con sesión iniciada.
  window.abrirComoFunciona = function () {
    const rol = typeof sesion !== "undefined" && sesion?.rol;
    tour.open(PASOS[rol] || PASOS.Visualizador);
  };
})();
