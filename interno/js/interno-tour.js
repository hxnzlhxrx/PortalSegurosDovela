/* ================= TUTORIAL "CÓMO FUNCIONA" (portal interno) =================
   Solo se abre a demanda, con el botón "Cómo funciona" del menú lateral.
   Hay una versión por rol de la sesión: Admin, Ajustador y Visualizador.
   Cada paso describe una función real del panel. Usa el mismo motor que el tutorial
   del portal público (public/js/tour.js); los textos se traducen con interno-i18n.js. */
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
  const buscador = (x, w, placeholder = "Buscar radicado, nombre o cédula…") => text(x, 10, w, 14, "ts-select ts-select--plain ts-select--muted", placeholder);
  const select = (x, w, valor, y = 10) => text(x, y, w, 14, "ts-select", valor);
  const boton = (x, y, w, cls, ico, label) => text(x, y, w, 14, `ts-btn ${cls}`, `${icon(ico)}<span>${label}</span>`);
  const historial = () => text(236, 10, 76, 100, "ts-panel", `<b>Historial de gestión</b>${bars(90, 70, 84, 60, 76)}`);
  const tabs = (y, lista) => text(88, y, 224, 40, "ts-tabs", lista
    .map(([ico, label, on]) => `<span class="ts-tab"${on ? " data-on" : ""}>${icon(ico)}<span>${label}</span></span>`).join(""));
  const TABS_ADMIN = [
    ["usuarios", "Usuarios y Roles"], ["imagen", "Portal Público (CMS)"], ["reloj", "SLAs por proceso"],
    ["catalogo", "Catálogos"], ["mapa", "Red Médica"], ["buscar", "Auditoría"],
  ];
  const tabsAdmin = (activa) => TABS_ADMIN.map(([ico, label]) => [ico, label, label === activa]);

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
  // Observaciones internas con capturas pegadas o arrastradas.
  const observaciones = (rol) => side("Bandeja de reclamos", rol)
    + text(88, 10, 224, 150, "ts-panel", "")
    + text(96, 18, 208, 12, "ts-title", "Observaciones Internas")
    + text(96, 34, 208, 9, "ts-chip", `${icon("candado")}<span>Uso interno · no visible para el asegurado</span>`)
    + text(96, 48, 208, 40, "ts-area", bars(92, 80, 56))
    + text(96, 94, 208, 34, "ts-drop", `${icon("camara")}<span>Ctrl+V</span>`);
  // Reservas: filtros, plantilla, importación con vista previa y reporte.
  function reservas(admin, importar) {
    return side("Reservas", admin)
      + buscador(88, 92, "Buscar número, nombre, cédula o póliza…")
      + (importar
        ? boton(184, 10, 40, "ts-btn--ghost", "documento", "Plantilla") + boton(228, 10, 84, "ts-btn--green", "subir", "Importar Excel/CSV")
        : boton(184, 10, 128, "ts-btn--ghost", "descargar", "Descargar reporte"))
      + (importar
        ? text(88, 34, 224, 50, "ts-panel ts-sla", [["documento", "48", "registros"], ["ok", "45", "nuevos"], ["deshacer", "2", "existentes"], ["error", "1", "inválidos"]]
          .map(([ico, n, label]) => `<span class="ts-chip">${icon(ico)}<b>${n}</b> <span>${label}</span></span>`).join(""))
        : fila(34, ["Número", "Asegurado", "Producto", "Estado"], true))
      + fila(importar ? 92 : 50, ["RS-2026-0142", "Amara Okafor", "Arco Integral 3", badge("ok", "Recibido")])
      + fila(importar ? 108 : 66, ["RS-2026-0141", "Kofi Mensah", "AP Escolar", badge("warn", "En Proceso")])
      + fila(importar ? 124 : 82, ["RS-2026-0139", "Itzel Haddad", "Arco Kids", badge("ok", "Pagado")]);
  }
  // Preferencias del panel: idioma, tema claro/oscuro y modo lectura.
  const preferencias = (admin) => side("Bandeja de reclamos", admin)
    + text(88, 10, 224, 12, "ts-title", "Su panel, a su manera")
    + text(88, 30, 224, 22, "ts-doc", `<span class="ts-ico">${icon("catalogo")}</span><span class="ts-doc__txt"><b>Idioma</b><small>Español · English · Français · Português</small></span>`)
    + text(88, 58, 224, 22, "ts-doc", `<span class="ts-ico">${icon("sparkle")}</span><span class="ts-doc__txt"><b>Apariencia</b><small>Modo claro u oscuro</small></span>`)
    + text(88, 86, 224, 22, "ts-doc", `<span class="ts-ico">${icon("ver")}</span><span class="ts-doc__txt"><b>Modo lectura</b><small>Menos brillo y menos luz azul</small></span>`)
    + text(88, 116, 224, 40, "ts-panel", bars(90, 72, 84));
  // Red Médica: búsqueda, filtros y exportación.
  const redMedica = (admin) => side("Red Médica", admin)
    + buscador(88, 92, "Buscar nombre, hospital, ciudad…") + select(184, 64, "Todas las especialidades") + select(252, 60, "Todas las provincias")
    + fila(32, ["Especialidad", "Nombre / Proveedor", "Provincia", "Teléfono"], true)
    + fila(48, ["Pediatría", "Okafor, Amara", "Valdoria", "200-1010"])
    + fila(64, ["Cardiología", "Nakamura, Jordan", "Serranova", "200-2020"])
    + fila(80, ["Dermatología", "Haddad, Itzel", "Valdoria", "200-3030"])
    + boton(88, 104, 70, "ts-btn--ghost", "descargar", "Exportar CSV");

  /* ---------- Pasos compartidos ---------- */
  const menu = (admin, nota, texto, points) => ({
    chapter: "Primeros pasos",
    title: admin ? "Su panel de administración" : "Su espacio de trabajo",
    text: texto,
    points,
    screen: side("Bandeja de reclamos", admin) + text(88, 10, 224, 12, "ts-title", "Bandeja de reclamos") + bandeja(30),
    notes: { circle: [40, admin ? 58 : 50, 38, admin ? 33 : 26], arrow: arrow(98, 140, 70, 150, 60, admin ? 96 : 82), note: [100, 128, -4, nota] },
  });
  const pasoObservaciones = (admin) => ({
    chapter: "Gestión del reclamo",
    title: "Deje observaciones internas",
    text: "Las observaciones internas no las ve el asegurado. Pegue capturas con Ctrl+V o arrástrelas al recuadro.",
    points: [
      "Hasta 6 imágenes PNG, JPEG, WebP o GIF por observación",
      "El historial de gestión registra cada cambio con usuario, fecha y hora",
      "El historial solo admite añadir entradas: nada se edita ni se borra",
    ],
    screen: observaciones(admin),
    notes: { circle: [200, 111, 108, 21], arrow: arrow(148, 150, 112, 160, 120, 134), note: [150, 142, -3, "Pegue capturas aquí"] },
  });
  const pasoPreferencias = (admin) => ({
    chapter: "Su panel",
    title: "Trabaje con comodidad",
    text: "Desde la parte superior del menú lateral cambia el idioma, alterna entre modo claro y oscuro, y activa el modo lectura para jornadas largas.",
    points: [
      "Cuatro idiomas: español, inglés, francés y portugués",
      "El modo lectura reduce el brillo y la luz azul en ambos temas",
      "Sus preferencias se recuerdan entre sesiones",
    ],
    tip: "Vuelva a esta guía cuando quiera con el botón «Cómo funciona» del menú lateral.",
    screen: preferencias(admin),
    notes: { circle: [200, 97, 112, 12], arrow: arrow(150, 168, 110, 172, 104, 112), note: [156, 158, -3, "¡Cuide su vista!"] },
  });
  const pasoRed = (admin) => ({
    chapter: "Consulta",
    title: "Consulte la Red Médica",
    text: "El directorio de prestadores contratados se filtra por especialidad y provincia, y se busca por nombre, hospital o ciudad.",
    points: [
      "Encuentre un prestador mientras atiende a un asegurado",
      "Exporte el directorio completo a CSV para compartirlo",
    ],
    screen: redMedica(admin),
    notes: { circle: [123, 111, 40, 12], arrow: arrow(200, 146, 160, 150, 160, 116), note: [196, 136, -3, "¡Directorio en CSV!"] },
  });

  const PASOS = {
    Admin: [
      menu(true, "¡Todo su menú aquí!", "Desde el menú lateral entra a la bandeja de reclamos, las reservas, la Red Médica y la Administración del portal.", [
        "Cada reclamo presentado en el portal público llega a la bandeja al instante",
        "Lo que ve cada persona depende de su rol y su perfil de acceso",
      ]),
      {
        chapter: "Bandeja de reclamos",
        title: "Priorice con el SLA",
        text: "Filtre la bandeja por estado, SLA o período. El color del SLA indica qué reclamos están por vencer o vencidos.",
        points: [
          "Busque por radicado, nombre o cédula y combine estado, línea, producto, asignado, SLA y período",
          "El resumen de SLA muestra cuántos reclamos hay en cada estado",
          "Pase de la bandeja activa a los archivados con un clic",
        ],
        screen: side("Bandeja de reclamos", true) + buscador(88, 74) + select(166, 52, "SLA: todos") + select(222, 62, "Todo el período") + bandeja(32),
        notes: { highlight: [168, 216, 26], circle: [283, 80, 26, 31], arrow: arrow(232, 140, 280, 150, 284, 114), note: [110, 128, -3, "Lo urgente, primero"] },
      },
      {
        chapter: "Bandeja de reclamos",
        title: "Asigne los reclamos",
        text: "Abra un reclamo y asígnelo a un Ajustador activo. Cada cambio queda en el historial con usuario, fecha y hora.",
        points: [
          "Solo aparecen como opción los Ajustadores activos",
          "La asignación se refleja en la columna «Asignado a» de la bandeja",
        ],
        screen: side("Bandeja de reclamos", true) + asignacion(true),
        notes: { circle: [158, 90, 70, 24], arrow: arrow(148, 152, 108, 160, 112, 116), note: [150, 144, -3, "Elija al ajustador"] },
      },
      {
        chapter: "Gestión del reclamo",
        title: "Gestione y archive",
        text: "Actualice el estado, los montos y el comentario para el asegurado, y guarde. Los reclamos Pagados o Rechazados se pueden archivar.",
        points: [
          "Registre el monto pagado y el monto aplicado al deducible",
          "El comentario visible aparece en la consulta de estado del portal público",
          "La fecha de cierre se registra sola al pasar a Pagado o Rechazado",
        ],
        screen: side("Bandeja de reclamos", true) + gestion(),
        notes: { circle: [158, 150, 70, 22], arrow: arrow(262, 62, 270, 120, 232, 142), note: [236, 32, -5, "¡Guarde aquí!", 76] },
      },
      pasoObservaciones(true),
      {
        chapter: "Bandeja de reclamos",
        title: "Pagos masivos en un solo lote",
        text: "Con «Pagos masivos» carga un archivo con radicado, monto pagado, Genelco y estado, y actualiza muchos reclamos de una vez.",
        points: [
          "Indique el origen del archivo: CheckPlus, Global Bank, Banco St. George u otro",
          "Solo los perfiles autorizados ven este botón",
        ],
        screen: side("Bandeja de reclamos", true) + bandeja(32) + buscador(88, 92) + boton(184, 10, 60, "ts-btn--ghost", "descargar", "Descargar reporte") + boton(248, 10, 64, "ts-btn--ghost", "tarjeta", "Pagos masivos")
          + text(120, 60, 170, 104, "ts-panel ts-modal", "")
          + text(130, 68, 150, 12, "ts-title", "Carga masiva de pagos")
          + text(130, 86, 150, 10, "ts-chip", `${icon("documento")}<span data-i18n-ignore>radicado, monto_pagado, genelco, estado</span>`)
          + text(130, 102, 150, 14, "ts-select", "CheckPlus")
          + text(130, 124, 150, 16, "ts-btn ts-btn--green", `${icon("subir")}<span>Procesar lote</span>`),
        notes: { circle: [280, 17, 36, 12], arrow: arrow(100, 150, 96, 120, 112, 96), note: [16, 150, -3, "¡Todo de una vez!"] },
      },
      {
        chapter: "Reservas",
        title: "Importe reservas con vista previa",
        text: "En Reservas descarga la plantilla, importa un Excel o CSV y revisa el resultado antes de confirmar: el portal normaliza fechas y montos y valida cada fila.",
        points: [
          "Detecta los registros que ya existen para no duplicarlos",
          "Separa las filas inválidas para que pueda corregirlas",
          "Exporte el reporte de reservas a Excel con los filtros que necesite",
        ],
        screen: reservas(true, true),
        notes: { circle: [200, 59, 116, 30], arrow: arrow(150, 162, 112, 170, 104, 142), note: [156, 152, -3, "Revise antes de importar"] },
      },
      {
        chapter: "Administración",
        title: "SLA, feriados y Freeze",
        text: "Defina el plazo de cada proceso en días hábiles, días calendario u horas, con un aviso antes de vencer. El cálculo usa la hora de Panamá y descuenta los feriados.",
        points: [
          "La regla más específica manda: producto, luego línea, luego la general",
          "En un Freeze operativo, el SLA empieza al terminar el periodo",
          "Los estados del semáforo se recalculan solos en la bandeja",
        ],
        screen: side("Administración", true)
          + text(88, 10, 224, 12, "ts-title", "SLAs por proceso")
          + fila(28, ["Proceso", "Plazo", "Aviso", "Estado"], true)
          + fila(44, ["Reclamos", "10", "80 %", badge("ok", "En plazo")])
          + fila(60, ["Reservas", "5", "80 %", badge("warn", "Por vencer")])
          + text(88, 84, 224, 80, "ts-panel", "")
          + text(96, 92, 208, 10, "ts-title", "Freeze operativo")
          + text(96, 110, 100, 14, "ts-select ts-select--plain", "20/12 → 05/01")
          + text(200, 110, 104, 14, "ts-select", "Inicio de tramitación")
          + text(96, 132, 90, 14, "ts-btn ts-btn--green", `${icon("guardar")}<span>Guardar periodos</span>`),
        notes: { circle: [200, 52, 116, 18], arrow: arrow(252, 156, 292, 146, 282, 130), note: [180, 150, -3, "Plazos a su medida"] },
      },
      {
        chapter: "Administración",
        title: "Publique novedades en el portal",
        text: "En «Portal Público (CMS)» crea las novedades del carrusel de la portada: título, texto, botón con enlace, fechas de vigencia y una vista previa.",
        points: [
          "Al guardar, se traducen automáticamente al inglés, francés y portugués",
          "Revise y ajuste cada traducción antes de publicar",
          "Ordene, active o desactive cada banner sin borrarlo",
        ],
        tip: "La identidad del portal (nombre y logo) también se configura aquí.",
        screen: side("Administración", true)
          + tabs(10, tabsAdmin("Portal Público (CMS)"))
          + text(88, 54, 224, 66, "ts-banner", `<small>NOVEDADES DOVELA</small><b>Encuentre atención cuando la necesite</b><span class="ts-btn ts-btn--green">Consultar red médica</span>`)
          + text(88, 126, 224, 18, "ts-tabs", ["ES", "EN", "FR", "PT"].map((code) => `<span class="ts-tab" data-i18n-ignore${code === "ES" ? "" : " data-on"}>${code}</span>`).join(""))
          + text(88, 150, 112, 16, "ts-btn ts-btn--ghost", `${icon("sparkle")}<span>Traducir automáticamente</span>`),
        notes: { circle: [144, 135, 60, 13], arrow: arrow(240, 158, 226, 136, 210, 134), note: [212, 154, -3, "¡En 4 idiomas!"] },
      },
      {
        chapter: "Administración",
        title: "Configure el portal",
        text: "En Administración gestiona usuarios y roles, el contenido del portal público, los SLA, los catálogos y la Red Médica.",
        points: [
          "Cree, edite, active o desactive cuentas y asigne su rol",
          "La auditoría de configuración registra quién cambió qué",
          "También: plantillas, correos automáticos, firmas digitales y formularios dinámicos",
        ],
        screen: side("Administración", true)
          + text(88, 10, 224, 12, "ts-title", "Configuración del Portal")
          + tabs(28, tabsAdmin("Usuarios y Roles"))
          + fila(78, ["Amara Okafor", badge("ok", "Admin"), "", ""])
          + fila(94, ["Jordan Nakamura", badge("warn", "Ajustador"), "", ""])
          + fila(110, ["Itzel Haddad", badge("", "Visualizador"), "", ""]),
        notes: { circle: [200, 47, 114, 24], arrow: arrow(118, 150, 92, 120, 108, 76), note: [120, 140, -3, "Todo se configura aquí"] },
      },
      pasoPreferencias(true),
    ],

    Ajustador: [
      menu(false, "¡Todo su menú aquí!", "Desde el menú lateral entra a la bandeja de reclamos, las reservas y la Red Médica.", [
        "Los reclamos del portal público llegan a la bandeja al instante",
        "Su perfil define qué puede editar en cada módulo",
      ]),
      {
        chapter: "Bandeja de reclamos",
        title: "Vea sus tickets",
        text: "Elija «Mis tickets» en el filtro de asignación para ver solo los reclamos a su nombre. El color del SLA indica qué vence primero.",
        points: [
          "Combine estado, línea, producto, SLA y período",
          "«Limpiar filtros» vuelve a la vista completa",
        ],
        screen: side("Bandeja de reclamos", false) + buscador(88, 80) + select(172, 58, "Mis tickets") + select(234, 52, "SLA: todos") + bandeja(32),
        notes: { circle: [201, 17, 34, 12], arrow: arrow(188, 136, 226, 104, 206, 32), note: [110, 128, -4, "Solo lo suyo"] },
      },
      {
        chapter: "Bandeja de reclamos",
        title: "Tome un ticket",
        text: "Abra un reclamo sin asignar y pulse «Tomar Ticket». Queda a su nombre y el cambio se registra en el historial.",
        points: [
          "Vea los datos completos y los documentos que cargó el asegurado",
        ],
        screen: side("Bandeja de reclamos", false) + asignacion(false),
        notes: { circle: [158, 73, 70, 18], arrow: arrow(138, 126, 104, 124, 112, 92), note: [140, 118, -4, "¡Tómelo!"] },
      },
      {
        chapter: "Gestión del reclamo",
        title: "Registre la gestión",
        text: "Actualice el estado, los montos y el comentario visible para el asegurado, y guarde la gestión.",
        points: [
          "Registre el monto pagado y el monto aplicado al deducible",
          "El comentario visible aparece en la consulta de estado del portal público",
          "Los reclamos Pagados o Rechazados se pueden archivar",
        ],
        screen: side("Bandeja de reclamos", false) + gestion(),
        notes: { circle: [158, 108, 70, 22], arrow: arrow(258, 84, 262, 112, 232, 112), note: [236, 40, -5, "Lo verá el asegurado", 76] },
      },
      pasoObservaciones(false),
      {
        chapter: "Reservas",
        title: "Siga las reservas",
        text: "En Reservas busca por número, nombre, cédula o póliza, filtra por estado, línea y producto, y abre cada reserva para ver su detalle.",
        points: [
          "El SLA de cada reserva se calcula igual que en los reclamos",
          "Descargue el reporte de reservas a Excel",
        ],
        screen: reservas(false, false),
        notes: { circle: [248, 17, 66, 12], arrow: arrow(150, 150, 110, 160, 104, 102), note: [150, 140, -3, "Todo a la vista"] },
      },
      pasoRed(false),
      pasoPreferencias(false),
    ],

    Visualizador: [
      menu(false, "¡Todo su menú aquí!", "Desde el menú lateral consulta la bandeja de reclamos, las reservas y la Red Médica.", [
        "Ideal para seguimiento, atención al cliente y supervisión",
      ]),
      {
        chapter: "Bandeja de reclamos",
        title: "Encuentre cualquier reclamo",
        text: "Busque por radicado, nombre o cédula y combine los filtros de estado, SLA y período.",
        points: [
          "El resumen de SLA muestra cuántos reclamos hay en cada estado",
          "Consulte también los reclamos archivados",
        ],
        screen: side("Bandeja de reclamos", false) + buscador(88, 140) + select(232, 52, "SLA: todos") + bandeja(32),
        notes: { circle: [158, 17, 74, 12], arrow: arrow(118, 138, 92, 104, 110, 30), note: [120, 128, -4, "Busque aquí"] },
      },
      {
        chapter: "Consulta",
        title: "Consulta sin cambios",
        text: "Su perfil es de consulta: puede abrir cada reclamo y revisar su gestión, documentos e historial, pero no modificarlos.",
        points: [
          "Vea el mismo comentario que lee el asegurado",
          "Revise el historial completo de cada reclamo",
        ],
        screen: side("Bandeja de reclamos", false) + gestion({ lectura: true }),
        notes: { circle: [158, 78, 70, 50], arrow: arrow(262, 62, 262, 94, 232, 96), note: [236, 32, -5, "Solo consulta", 76] },
      },
      {
        chapter: "Consulta",
        title: "Descargue reportes",
        text: "«Descargar reporte» exporta las filas visibles de la bandeja, con los filtros que tenga aplicados.",
        points: [
          "Filtre primero por período o SLA para obtener solo lo que necesita",
        ],
        screen: side("Bandeja de reclamos", false) + select(88, 52, "SLA: todos") + select(144, 64, "Todo el período")
          + text(212, 10, 100, 14, "ts-select ts-select--plain ts-btn--ghost", `${icon("descargar")}<span>Descargar reporte</span>`)
          + bandeja(32),
        notes: { circle: [262, 17, 54, 12], arrow: arrow(224, 136, 290, 120, 276, 32), note: [100, 128, -4, "Exporta lo filtrado"] },
      },
      {
        chapter: "Reservas",
        title: "Siga las reservas",
        text: "En Reservas busca por número, nombre, cédula o póliza, filtra por estado, línea y producto, y abre cada reserva para ver su detalle.",
        points: [
          "El SLA de cada reserva se calcula igual que en los reclamos",
          "Descargue el reporte de reservas a Excel",
        ],
        screen: reservas(false, false),
        notes: { circle: [248, 17, 66, 12], arrow: arrow(150, 150, 110, 160, 104, 102), note: [150, 140, -3, "Todo a la vista"] },
      },
      pasoRed(false),
      pasoPreferencias(false),
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
