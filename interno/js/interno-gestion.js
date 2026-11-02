/* ===========================================
   GESTIÓN DEL RECLAMO
   Programación operativa (Freeze), gestión,
   asignación, observaciones con capturas e historial.
   <<--- </gishikoDev_> --->>
=========================================== */

const ADJUNTOS_OBS = {
    tipos: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    maxBytes: 5 * 1024 * 1024,
    maxArchivos: 6
};

function esc(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function usuarioActual() {
    return (typeof sesion !== "undefined" && sesion?.nombre) || "Sistema";
}

function formatoBalboas(valor) {
    return valor === null || valor === undefined || valor === ""
        ? "—"
        : "B/. " + Number(valor).toFixed(2);
}


/* ===========================================
   CALENDARIO OPERATIVO (hora de Panamá, UTC−5 sin horario de verano)
=========================================== */

const GestionCalendario = (() => {

    const OFFSET_PANAMA_MS = -5 * 3600 * 1000;
    const MESES = {
        ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
        jul: "07", ago: "08", sep: "09", set: "09", oct: "10", nov: "11", dic: "12"
    };

    const pad = n => String(n).padStart(2, "0");

    // Fecha/hora local de Panamá como "YYYY-MM-DDTHH:MM".
    function localPanama(fecha) {
        const d = new Date(new Date(fecha).getTime() + OFFSET_PANAMA_MS);
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
            `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    }

    // "YYYY-MM-DDTHH:MM" → "DD/MM/YYYY HH:MM"
    function mostrarLocal(local) {
        const [f, h] = String(local).split("T");
        const [y, m, d] = f.split("-");
        return `${d}/${m}/${y}` + (h ? ` ${h.slice(0, 5)}` : "");
    }

    // Acepta "01-ene", "1/1", "2026-11-03". Devuelve MM-DD (anual) o YYYY-MM-DD.
    function parseFeriados(texto) {
        const feriados = new Set();
        String(texto || "").split(/[,;\n]/).forEach(token => {
            const t = token.trim().toLowerCase();
            let m;
            if ((m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/))) feriados.add(`${m[1]}-${m[2]}-${m[3]}`);
            else if ((m = t.match(/^(\d{1,2})[-\s/]([a-z]{3})/)) && MESES[m[2]]) feriados.add(`${MESES[m[2]]}-${pad(m[1])}`);
            else if ((m = t.match(/^(\d{1,2})\/(\d{1,2})$/))) feriados.add(`${pad(m[2])}-${pad(m[1])}`);
        });
        return feriados;
    }

    function esHabil(fechaISO, feriados) {
        const dia = new Date(fechaISO + "T00:00:00Z").getUTCDay();
        return dia !== 0 && dia !== 6 &&
            !feriados.has(fechaISO) && !feriados.has(fechaISO.slice(5));
    }

    // Días hábiles en [día de recepción, hoy): cuenta el día de recepción si es hábil, no el día en curso.
    // Coincide con producción: recibido vie 23/10 → 1 el lun 26/10; recibido sáb 24/10 → 0.
    function diasHabilesEntre(desde, hasta, feriados) {
        const fin = localPanama(hasta).slice(0, 10);
        const cursor = new Date(localPanama(desde).slice(0, 10) + "T00:00:00Z");
        let dias = 0;
        for (let iso = cursor.toISOString().slice(0, 10); iso < fin; iso = cursor.toISOString().slice(0, 10)) {
            if (esHabil(iso, feriados)) dias++;
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        return dias;
    }

    function periodoDe(fecha, periodos) {
        const dia = localPanama(fecha).slice(0, 10);
        return (periodos || []).find(p =>
            p && p.activo !== false && p.inicio && p.fin && p.tramitacion &&
            dia >= p.inicio && dia <= p.fin
        ) || null;
    }

    // SGP-YYDDD-NNNN-X → fecha codificada en el radicado (año + día del año).
    function fechaRadicado(num) {
        const m = String(num || "").match(/^SGP-(\d{2})(\d{3})-/);
        if (!m) return null;
        const d = new Date(Date.UTC(2000 + Number(m[1]), 0, 1));
        d.setUTCDate(Number(m[2]));
        return d.toISOString().slice(0, 10);
    }

    function programacion(reclamo, parametros, ahora = new Date()) {
        const recepcion = reclamo?.creado_en;
        if (!recepcion) return null;
        const periodo = periodoDe(recepcion, parametros?.periodos_freeze);
        if (!periodo) return null;

        const feriados = parseFeriados(parametros?.feriados);
        const recepcionLocal = localPanama(recepcion);
        const baseRadicado = fechaRadicado(reclamo.num);

        return {
            periodo: periodo.nombre || "Freeze operativo",
            recepcion: recepcionLocal,
            tramitacion: periodo.tramitacion,
            programado: localPanama(ahora) < periodo.tramitacion,
            baseRadicado:
                baseRadicado && baseRadicado !== recepcionLocal.slice(0, 10)
                    ? baseRadicado
                    : null,
            diasHabiles: diasHabilesEntre(recepcion, ahora, feriados)
        };
    }

    return { localPanama, mostrarLocal, parseFeriados, esHabil, diasHabilesEntre, periodoDe, fechaRadicado, programacion };

})();


/* ===========================================
   VALIDACIONES
=========================================== */

// "" → null; número no negativo con hasta 2 decimales; otro → NaN.
function leerMonto(texto) {
    const t = String(texto ?? "").trim().replace(",", ".");
    if (!t) return null;
    if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
    return Number(t);
}

function validarAdjuntoObs(file, cantidadActual) {
    if (cantidadActual >= ADJUNTOS_OBS.maxArchivos) return "Máximo 6 capturas por observación.";
    if (!ADJUNTOS_OBS.tipos.includes(file.type)) return "Formato no permitido. Use PNG, JPG, WEBP o GIF.";
    if (file.size > ADJUNTOS_OBS.maxBytes) return "La captura supera 5.0 MB.";
    return null;
}


/* ===========================================
   ESTADO DE LA VISTA
=========================================== */

const gestionVista = {
    reclamo: null,
    parametros: {},
    adjuntos: []    // [{ file, url }]
};

async function cargarParametrosOperativos() {
    try {
        gestionVista.parametros =
            await ParametrosRepository.obtener(["feriados", "periodos_freeze"]);
    } catch (error) {
        gestionVista.parametros = {};
    }
    return gestionVista.parametros;
}


/* ===========================================
   RENDER
=========================================== */

function renderInfoReclamo(r) {
    const campos = [
        ["Asegurado", r.nombre],
        ["Cédula", r.cedula],
        ["Email", r.email],
        ["Teléfono", r.tel],
        ["Línea", r.linea],
        ["Producto", r.producto],
        ["Número de póliza", r.poliza, "mono"],
        ...(r.tipo_proveedor ? [["Tipo de Proveedor", r.tipo_proveedor]] : []),
        ["Proveedor", r.proveedor],
        ["Hospital", r.hospital],
        ["Corredora", r.corredora],
        ["Perfil", r.perfil_presenta],
        ["Origen", r.origen],
        ["Monto", r.monto ? "USD " + Number(r.monto).toFixed(2) : null]
    ];

    return `
<section class="tarjeta gestion-info">
    <h3>Información del Reclamo</h3>
    <dl class="dato-grid">
        ${campos.map(([etiqueta, valor, clase]) => `
        <div>
            <dt>${etiqueta}</dt>
            <dd class="${clase || ""}" data-i18n-ignore>${esc(valor || "—")}</dd>
        </div>`).join("")}
    </dl>
</section>`;
}

function renderProgramacion(prog) {
    if (!prog) return "";
    const C = GestionCalendario;
    return `
<section class="tarjeta tarjeta-acento gestion-programacion">
    <div class="tarjeta-titulo">
        <h3>Programación operativa</h3>
        <span class="chip ${prog.programado ? "chip-info" : "chip-neutro"}">${prog.programado ? "Programado" : "En tramitación"}</span>
    </div>
    <dl class="dato-grid dato-grid-mayus">
        <div><dt>Período</dt><dd data-i18n-ignore>${esc(prog.periodo)}</dd></div>
        <div><dt>Recepción real</dt><dd>${C.mostrarLocal(prog.recepcion)}</dd></div>
        <div><dt>Inicio de tramitación</dt><dd>${C.mostrarLocal(prog.tramitacion)}</dd></div>
        ${prog.baseRadicado ? `<div><dt>Fecha base del radicado</dt><dd>${C.mostrarLocal(prog.baseRadicado)}</dd></div>` : ""}
        <div><dt>Antigüedad desde la recepción</dt><dd>${prog.diasHabiles} <span>días hábiles</span></dd></div>
    </dl>
    <p class="ayuda">Recibido durante el Freeze. Entra a la cola operativa en la fecha indicada (hora de Panamá); no requiere ninguna acción manual. La programación no modifica el estado del reclamo ni su radicado.</p>
</section>`;
}

function renderGestion(r, soloLectura) {
    const estados = ["Recibido", "En Proceso", "Pendiente de Información", "Pagado", "Rechazado"];
    const valorMonto = v => v === null || v === undefined ? "" : Number(v).toFixed(2);

    return `
<section class="tarjeta tarjeta-acento gestion-form">
    <h3>Gestión del Reclamo</h3>
    <div class="campo">
        <label for="g-estado">Estado del Reclamo</label>
        <select id="g-estado">
            ${estados.map(e => `<option value="${e}" ${r.estado === e ? "selected" : ""}>${e}</option>`).join("")}
        </select>
    </div>
    <hr class="separador">
    <div class="campo">
        <label for="g-monto-pagado">Monto Pagado (B/.)</label>
        <input id="g-monto-pagado" inputmode="decimal" placeholder="0.00" value="${valorMonto(r.monto_pagado)}">
    </div>
    <div class="campo">
        <label for="g-monto-deducible">Monto Aplicado a Deducible (B/.)</label>
        <input id="g-monto-deducible" inputmode="decimal" placeholder="0.00" value="${valorMonto(r.monto_deducible)}" aria-describedby="g-deducible-ayuda">
        <p class="ayuda" id="g-deducible-ayuda">Parte del reclamo que se aplica al deducible de la póliza. Use 0 cuando no aplique.</p>
    </div>
    <div class="campo">
        <label for="g-comentario" class="label-icono"><span class=ico data-icon=ver aria-hidden=true></span> Comentario visible para el asegurado</label>
        <textarea id="g-comentario" rows="4" maxlength="1000" placeholder="Mensaje para el asegurado (opcional)." aria-describedby="g-comentario-ayuda">${esc(r.motivo_estado || "")}</textarea>
        <p class="ayuda" id="g-comentario-ayuda">Opcional. Será visible en la consulta pública del reclamo.</p>
    </div>
    <p class="ayuda">Todo se registra al guardar la gestión, junto con el estado del reclamo.</p>
    ${soloLectura ? "" : `<button class="btn btn-verde btn-bloque" id="g-guardar" onclick="guardarGestionReclamo('${esc(r.id)}')"><span class=ico data-icon=guardar aria-hidden=true></span> Guardar gestión</button>`}
    ${renderArchivo(r, soloLectura)}
</section>`;
}

function renderArchivo(r, soloLectura) {
    if (soloLectura) return "";
    if (r.archivado) {
        return `<button class="btn btn-ghost btn-bloque" onclick="confirmarDesarchivado('${esc(r.id)}')"><span class=ico data-icon=desarchivar aria-hidden=true></span> Desarchivar Reclamo</button>`;
    }
    if (r.estado === "Pagado" || r.estado === "Rechazado") {
        return `<button class="btn btn-danger btn-bloque" onclick="confirmarArchivado('${esc(r.id)}')"><span class=ico data-icon=archivo aria-hidden=true></span> Archivar Reclamo</button>`;
    }
    return "";
}

/* Reglas de asignación (reclamos y reservas; la BD las valida también,
   ver supabase/2026-10-26-asignacion.sql). asignado_a guarda el id (uuid) del
   usuario en portal_usuarios; en pantalla se muestra su nombre.
   · Admin: asigna el ticket a cualquier Ajustador activo.
   · Ajustador: solo puede asignárselo a sí mismo ("Tomar Ticket").
   · Otros roles: solo lectura. */

function rolSesion() {
    return typeof sesion !== "undefined" && sesion?.nombre ? sesion.rol : null;
}

function ajustadoresActivos() {
    return typeof USUARIOS !== "undefined"
        ? USUARIOS.filter(u => u.activo && u.rol === "Ajustador")
        : [];
}

// Nombre visible de un asignado_a (uuid de portal_usuarios).
function nombreAsignado(id) {
    if (!id) return "";
    const u = typeof USUARIOS !== "undefined" ? USUARIOS.find(x => x.id === id) : null;
    return u ? u.nombre : "Usuario no disponible";
}

// Importaciones: acepta el id, el nombre o el correo del usuario y devuelve su id (o null).
function resolverAsignado(valor) {
    const v = String(valor ?? "").trim().toLowerCase();
    if (!v || typeof USUARIOS === "undefined") return null;
    const u = USUARIOS.find(x => x.id === v || x.email === v || x.nombre.toLowerCase() === v);
    return u ? u.id : null;
}

// Devuelve null si el usuario con sesión puede asignar el ticket a `destino` (id); si no, el motivo.
// `permitirSinAsignar`: el Admin puede dejarlo sin asignar (formulario de reservas).
function motivoNoAsignable(destino, { permitirSinAsignar = false } = {}) {
    const rol = rolSesion();
    if (rol === "Admin") {
        return (permitirSinAsignar && !destino) || ajustadoresActivos().some(u => u.id === destino)
            ? null
            : "Solo puede asignar el ticket a un Ajustador activo.";
    }
    if (rol === "Ajustador") {
        return destino === sesion.id
            ? null
            : "Un Ajustador solo puede asignarse tickets a sí mismo.";
    }
    return "No tiene permisos para asignar tickets.";
}

// <option>s del selector de asignación según el rol. La asignación actual siempre
// aparece seleccionada, aunque ya no sea un Ajustador activo, para no perderla al guardar.
function opcionesAsignacion(actual) {
    const rol = rolSesion();
    const ids = rol === "Admin"
        ? ["", ...ajustadoresActivos().map(u => u.id)]
        : rol === "Ajustador" ? [actual || "", sesion.id] : [actual || ""];
    if (actual && !ids.includes(actual)) ids.push(actual);
    return [...new Set(ids)].map(id => id
        ? `<option value="${esc(id)}" ${id === actual ? "selected" : ""} data-i18n-ignore>${esc(nombreAsignado(id))}</option>`
        : `<option value="" ${actual ? "" : "selected"}>Sin asignar</option>`).join("");
}

function puedeAsignar() {
    return ["Admin", "Ajustador"].includes(rolSesion());
}

function motivoError(error) {
    return error?.message || error?.details || error?.code || "";
}

function renderAsignacion(r) {
    const rol = rolSesion();
    let accion = "";

    if (rol === "Admin") {
        accion = `
    <div class="campo">
        <label for="g-asignado">Asignar a Ajustador</label>
        <select id="g-asignado">
            <option value="">— Seleccione un Ajustador —</option>
            ${ajustadoresActivos().map(u => `<option value="${esc(u.id)}" ${u.id === r.asignado_a ? "selected" : ""} data-i18n-ignore>${esc(u.nombre)}</option>`).join("")}
        </select>
    </div>
    <button class="btn btn-verde btn-bloque" type="button" id="g-asignar" onclick="asignarTicketSeleccionado('${esc(r.id)}')"><span class=ico data-icon=usuario aria-hidden=true></span> Asignar ticket</button>`;
    } else if (rol === "Ajustador") {
        accion = r.asignado_a === sesion.id
            ? `<button class="btn btn-verde btn-bloque" type="button" disabled><span class=ico data-icon=check aria-hidden=true></span> Ticket asignado a usted</button>`
            : `<button class="btn btn-verde btn-bloque" type="button" id="g-tomar" onclick="tomarTicket('${esc(r.id)}')"><span class=ico data-icon=usuario aria-hidden=true></span> Tomar Ticket</button>`;
    }

    return `
<section class="tarjeta gestion-asignacion">
    <h3>Asignación</h3>
    <p class="asignacion-actual">
        <span>Ticket asignado a</span>
        ${r.asignado_a ? `<b data-i18n-ignore>${esc(nombreAsignado(r.asignado_a))}</b>` : "<b>Sin asignar</b>"}
    </p>
    ${accion}
    <p class="ayuda">El cambio queda registrado en el historial con usuario, fecha y hora.</p>
</section>`;
}

function renderDocumentos(documentos) {
    return `
<section class="tarjeta gestion-documentos">
    <h3>Documentos Adjuntos</h3>
    ${documentos.length ? documentos.map(doc => `
    <div class="doc-item">
        <div>
            <b><span class=ico data-icon=documento aria-hidden=true></span> <span>${esc(doc.tipo_documento)}</span></b><br>
            <small data-i18n-ignore>${esc(doc.nombre_original)}</small>
        </div>
        <div class="doc-acciones">
            <button class="btn btn-ghost btn-sm" onclick="abrirDocumento('${esc(doc.ruta)}')"><span class=ico data-icon=ver aria-hidden=true></span> Ver</button>
            <button class="btn btn-verde btn-sm" data-ruta="${esc(doc.ruta)}" data-nombre="${esc(doc.nombre_original)}" onclick="descargarDocumento(this.dataset.ruta, this.dataset.nombre)"><span class=ico data-icon=descargar aria-hidden=true></span> Descargar</button>
        </div>
    </div>`).join("") : "<p>No existen documentos cargados.</p>"}
</section>`;
}

function renderObservaciones(r, soloLectura) {
    if (soloLectura) return "";
    return `
<section class="tarjeta tarjeta-interna gestion-observaciones">
    <div class="tarjeta-titulo">
        <h3>Observaciones Internas</h3>
        <span class="chip chip-neutro"><span class=ico data-icon=candado aria-hidden=true></span> Uso interno · no visible para el asegurado</span>
    </div>
    <label for="obs-texto" class="sr-only">Observación interna</label>
    <textarea id="obs-texto" rows="4" maxlength="4000" placeholder="Describa la gestión realizada. Puede pegar una captura con Ctrl+V aquí mismo."></textarea>
    <div class="obs-dropzone" id="obs-dropzone">
        <p>Pegue una captura con Ctrl+V en el cuadro de arriba, arrástrela aquí o
            <label class="btn-link obs-elegir">adjúntela desde el dispositivo<input type="file" id="obs-archivo" class="sr-only" accept="image/png,image/jpeg,image/webp,image/gif" multiple></label></p>
        <p class="ayuda">PNG, JPG, WEBP o GIF · hasta 5.0 MB c/u · máximo 6.</p>
        <ul class="obs-previas" id="obs-previas" aria-label="Capturas adjuntas"></ul>
        <div class="obs-acciones">
            <button class="btn btn-ghost btn-sm" type="button" onclick="descartarObservacion()">Descartar</button>
            <button class="btn btn-verde btn-sm" type="button" id="obs-guardar" onclick="guardarObservacion('${esc(r.id)}')"><span class=ico data-icon=guardar aria-hidden=true></span> Guardar observación</button>
        </div>
    </div>
</section>`;
}

function renderHistorial(entradas, error, legado) {
    let cuerpo;
    if (error) {
        cuerpo = `<p class="ayuda">No fue posible cargar el historial.</p>`;
    } else if (!entradas.length && !legado) {
        cuerpo = `<p class="ayuda">Aún no hay observaciones registradas en este reclamo.</p>`;
    } else {
        cuerpo = `<ol class="historial">
            ${entradas.map(renderEntradaHistorial).join("")}
            ${legado ? `
            <li class="historial-item">
                <div class="historial-cabecera"><span class="chip chip-neutro">Observación anterior</span></div>
                <p class="historial-texto" data-i18n-ignore>${esc(legado)}</p>
            </li>` : ""}
        </ol>`;
    }

    return `
<section class="tarjeta tarjeta-interna gestion-historial" id="gestion-historial">
    <div class="tarjeta-titulo">
        <h3>Historial de gestión</h3>
        <span class="chip chip-neutro"><span class=ico data-icon=candado aria-hidden=true></span> Uso interno</span>
    </div>
    ${cuerpo}
</section>`;
}

function formatoFechaHistorial(iso) {
    const tag = window.DovelaI18n?.locales?.[window.DovelaI18n.locale]?.tag || "es-PA";
    return new Intl.DateTimeFormat(tag, {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
        timeZone: "America/Panama"
    }).format(new Date(iso));
}

function renderEntradaHistorial(e) {
    const adjuntos = Array.isArray(e.adjuntos) ? e.adjuntos : [];
    return `
<li class="historial-item">
    <div class="historial-cabecera">
        <b data-i18n-ignore>${esc(e.usuario)}</b>
        <time datetime="${esc(e.creado_en)}" data-i18n-ignore>${formatoFechaHistorial(e.creado_en)}</time>
        <span class="chip ${e.tipo === "observacion" ? "chip-info" : "chip-neutro"}">${e.tipo === "observacion" ? "Observación" : "Sistema"}</span>
    </div>
    ${e.texto ? `<p class="historial-texto" data-i18n-ignore>${esc(e.texto)}</p>` : ""}
    ${adjuntos.length ? `<div class="historial-adjuntos">${adjuntos.map(a => `
        <button class="btn btn-ghost btn-sm" type="button" onclick="abrirDocumento('${esc(a.ruta)}')"><span class=ico data-icon=imagen aria-hidden=true></span> <span data-i18n-ignore>${esc(a.nombre)}</span></button>`).join("")}</div>` : ""}
</li>`;
}

function renderTimeline(r) {
    return `
<section class="tarjeta gestion-timeline">
    <h3>Timeline</h3>
    <div class="timeline">
        <div class="timeline-item"><div class="timeline-dot"></div><div><b>Reclamo recibido</b><br><small>${esc(r.recibido_en ?? "")}</small></div></div>
        ${r.asignado_a ? `<div class="timeline-item"><div class="timeline-dot"></div><div>Ticket asignado a <b data-i18n-ignore>${esc(nombreAsignado(r.asignado_a))}</b></div></div>` : ""}
        ${r.genelco ? `<div class="timeline-item"><div class="timeline-dot"></div><div>Número Genelco <b>${esc(r.genelco)}</b></div></div>` : ""}
        <div class="timeline-item"><div class="timeline-dot"></div><div>Estado actual <b>${esc(r.estado)}</b></div></div>
    </div>
</section>`;
}

async function pintarHistorial(r) {
    const destino = document.getElementById("gestion-historial");
    if (!destino) return;
    let entradas = [];
    let error = false;
    try {
        entradas = await ReclamosRepository.obtenerHistorial(r.id);
    } catch (_) {
        error = true;
    }
    destino.outerHTML = renderHistorial(entradas, error, r.observaciones_internas);
}


/* ===========================================
   ACCIONES
=========================================== */

async function registrarEnHistorial(reclamoId, tipo, texto, adjuntos) {
    try {
        await ReclamosRepository.registrarHistorial({
            reclamo_id: reclamoId,
            tipo,
            usuario: usuarioActual(),
            texto,
            adjuntos
        });
        return true;
    } catch (_) {
        return false;
    }
}

// Nombre distinto de guardarGestion(num) heredado en interno-app.js, que se carga después.
async function guardarGestionReclamo(id) {
    const r = gestionVista.reclamo;
    if (!r || String(r.id) !== String(id)) return;

    const estado = document.getElementById("g-estado").value;
    const montoPagado = leerMonto(document.getElementById("g-monto-pagado").value);
    const montoDeducible = leerMonto(document.getElementById("g-monto-deducible").value);
    const comentario = document.getElementById("g-comentario").value.trim();

    if (Number.isNaN(montoPagado) || Number.isNaN(montoDeducible)) {
        toast("Revise los montos: use números positivos con hasta 2 decimales.");
        return;
    }

    const cambios = [];
    if (estado !== r.estado) cambios.push(`Estado: ${r.estado} → ${estado}`);
    if (montoPagado !== (r.monto_pagado ?? null) && Number(montoPagado) !== Number(r.monto_pagado)) {
        cambios.push(`Monto pagado: ${formatoBalboas(r.monto_pagado)} → ${formatoBalboas(montoPagado)}`);
    }
    if (montoDeducible !== (r.monto_deducible ?? null) && Number(montoDeducible) !== Number(r.monto_deducible)) {
        cambios.push(`Monto aplicado a deducible: ${formatoBalboas(r.monto_deducible)} → ${formatoBalboas(montoDeducible)}`);
    }
    if (comentario !== (r.motivo_estado || "")) {
        cambios.push(comentario ? "Comentario para el asegurado actualizado" : "Comentario para el asegurado eliminado");
    }

    if (!cambios.length) {
        toast("No hay cambios que guardar.");
        return;
    }

    const boton = document.getElementById("g-guardar");
    if (boton) boton.disabled = true;

    try {
        await ReclamosRepository.actualizarGestion(id, {
            estado,
            monto_pagado: montoPagado,
            monto_deducible: montoDeducible,
            motivo_estado: comentario
        });
    } catch (error) {
        if (boton) boton.disabled = false;
        console.error("ERROR GUARDANDO GESTIÓN:", error);
        toast(`${i18nT("No fue posible guardar la gestión.")} ${motivoError(error)}`.trim());
        return;
    }

    const registrado = await registrarEnHistorial(id, "sistema", cambios.join(" · "));
    toast(registrado
        ? "Gestión guardada."
        : "Gestión guardada, pero no se pudo registrar en el historial.");

    await cargarBandeja(!!r.archivado);
    await abrirReclamo(id, detalleOrigen || "bandeja");
}

// Punto único de asignación: valida el rol aquí, no solo en la interfaz.
async function asignarTicket(id, destino) {
    const r = gestionVista.reclamo;
    if (!r || String(r.id) !== String(id)) return false;

    const motivo = motivoNoAsignable(destino);
    if (motivo) {
        toast(motivo);
        return false;
    }
    if (r.asignado_a === destino) {
        toast("No hay cambios que guardar.");
        return false;
    }

    const botones = [...document.querySelectorAll("#g-asignar, #g-tomar")];
    botones.forEach(b => b.disabled = true);

    try {
        await ReclamosRepository.actualizarAsignacion(id, destino);
    } catch (error) {
        botones.forEach(b => b.disabled = false);
        console.error("ERROR ASIGNANDO TICKET:", error);
        toast(`${i18nT("No fue posible asignar el ticket.")} ${motivoError(error)}`.trim());
        return false;
    }

    const registrado = await registrarEnHistorial(
        id,
        "sistema",
        r.asignado_a
            ? `Ticket reasignado de ${nombreAsignado(r.asignado_a)} a ${nombreAsignado(destino)}`
            : `Ticket asignado a ${nombreAsignado(destino)}`
    );
    toast(registrado
        ? (destino === sesion.id ? "Ticket asignado a usted." : "Ticket asignado.")
        : "Ticket asignado, pero no se pudo registrar en el historial.");

    // La asignación ya quedó guardada; un fallo al refrescar la bandeja no debe ocultarlo.
    try {
        await cargarBandeja(!!r.archivado);
    } catch (error) {
        console.error(error);
    }
    await abrirReclamo(id, detalleOrigen || "bandeja");
    return true;
}

// Admin: asigna al Ajustador elegido.
async function asignarTicketSeleccionado(id) {
    const destino = document.getElementById("g-asignado")?.value || "";
    if (!destino) {
        toast("Seleccione un Ajustador.");
        return;
    }
    const r = gestionVista.reclamo;
    if (r?.asignado_a && r.asignado_a !== destino && !confirm(
        i18nT("Este ticket ya está asignado a otra persona. ¿Desea reasignarlo?") + "\n\n" + nombreAsignado(r.asignado_a) + " → " + nombreAsignado(destino)
    )) return;
    await asignarTicket(id, destino);
}

// Ajustador: se asigna el ticket a sí mismo.
async function tomarTicket(id) {
    const r = gestionVista.reclamo;
    if (!r || rolSesion() !== "Ajustador") return;
    if (r.asignado_a && r.asignado_a !== sesion.id && !confirm(
        i18nT("Este ticket ya está asignado a otra persona. ¿Desea tomarlo?") + "\n\n" + nombreAsignado(r.asignado_a)
    )) return;
    await asignarTicket(id, sesion.id);
}


/* ---------- Observaciones con capturas ---------- */

function agregarAdjuntosObs(archivos) {
    for (const file of archivos) {
        const problema = validarAdjuntoObs(file, gestionVista.adjuntos.length);
        if (problema) {
            toast(problema);
            if (problema.startsWith("Máximo")) break;
            continue;
        }
        gestionVista.adjuntos.push({ file, url: URL.createObjectURL(file) });
    }
    pintarAdjuntosObs();
}

function pintarAdjuntosObs() {
    const lista = document.getElementById("obs-previas");
    if (!lista) return;
    lista.innerHTML = gestionVista.adjuntos.map((a, i) => `
        <li>
            <img src="${a.url}" alt="">
            <span data-i18n-ignore>${esc(a.file.name || "captura")}</span>
            <button class="btn-link" type="button" onclick="quitarAdjuntoObs(${i})" aria-label="Quitar captura"><span class=ico data-icon=cerrar aria-hidden=true></span></button>
        </li>`).join("");
}

function quitarAdjuntoObs(indice) {
    const [quitado] = gestionVista.adjuntos.splice(indice, 1);
    if (quitado) URL.revokeObjectURL(quitado.url);
    pintarAdjuntosObs();
}

function descartarObservacion() {
    gestionVista.adjuntos.forEach(a => URL.revokeObjectURL(a.url));
    gestionVista.adjuntos = [];
    const texto = document.getElementById("obs-texto");
    if (texto) texto.value = "";
    pintarAdjuntosObs();
}

function enlazarObservaciones() {
    const texto = document.getElementById("obs-texto");
    const zona = document.getElementById("obs-dropzone");
    const input = document.getElementById("obs-archivo");
    if (!texto || !zona || !input) return;

    texto.addEventListener("paste", event => {
        const imagenes = [...(event.clipboardData?.items || [])]
            .filter(item => item.kind === "file" && item.type.startsWith("image/"))
            .map(item => item.getAsFile())
            .filter(Boolean);
        if (!imagenes.length) return;
        event.preventDefault();
        agregarAdjuntosObs(imagenes);
    });

    ["dragenter", "dragover"].forEach(tipo => zona.addEventListener(tipo, event => {
        event.preventDefault();
        zona.classList.add("arrastrando");
    }));
    ["dragleave", "drop"].forEach(tipo => zona.addEventListener(tipo, () => zona.classList.remove("arrastrando")));
    zona.addEventListener("drop", event => {
        event.preventDefault();
        agregarAdjuntosObs([...(event.dataTransfer?.files || [])]);
    });

    input.addEventListener("change", () => {
        agregarAdjuntosObs([...input.files]);
        input.value = "";
    });
}

async function guardarObservacion(id) {
    const texto = document.getElementById("obs-texto").value.trim();
    if (!texto && !gestionVista.adjuntos.length) {
        toast("Escriba una observación o adjunte una captura.");
        return;
    }

    const boton = document.getElementById("obs-guardar");
    if (boton) boton.disabled = true;

    try {
        const adjuntos = [];
        for (const a of gestionVista.adjuntos) {
            adjuntos.push(await ReclamosRepository.subirAdjuntoObservacion(id, a.file));
        }
        await ReclamosRepository.registrarHistorial({
            reclamo_id: id,
            tipo: "observacion",
            usuario: usuarioActual(),
            texto,
            adjuntos
        });
    } catch (error) {
        if (boton) boton.disabled = false;
        toast("No fue posible guardar la observación.");
        return;
    }

    descartarObservacion();
    if (boton) boton.disabled = false;
    toast("Observación guardada.");
    await pintarHistorial(gestionVista.reclamo);
}


/* ===========================================
   ADMINISTRACIÓN · FREEZE Y FERIADOS
=========================================== */

let periodosFreezeEdicion = [];

async function pintarParametrosOperativos() {
    const tabla = document.getElementById("freeze-tbody");
    if (!tabla) return;
    const parametros = await cargarParametrosOperativos();
    const feriados = document.getElementById("cfg-feriados");
    if (feriados && typeof parametros.feriados === "string") feriados.value = parametros.feriados;
    periodosFreezeEdicion = Array.isArray(parametros.periodos_freeze)
        ? parametros.periodos_freeze.map(p => ({ ...p }))
        : [];
    pintarTablaFreeze();
}

function pintarTablaFreeze() {
    const tabla = document.getElementById("freeze-tbody");
    if (!tabla) return;
    if (!periodosFreezeEdicion.length) {
        tabla.innerHTML = `<tr><td colspan="6" class="ayuda">No hay periodos de Freeze configurados.</td></tr>`;
        return;
    }
    tabla.innerHTML = periodosFreezeEdicion.map((p, i) => `
        <tr>
            <td><input aria-label="Nombre del periodo" value="${esc(p.nombre || "")}" oninput="periodosFreezeEdicion[${i}].nombre=this.value"></td>
            <td><input type="date" aria-label="Desde" value="${esc(p.inicio || "")}" onchange="periodosFreezeEdicion[${i}].inicio=this.value"></td>
            <td><input type="date" aria-label="Hasta" value="${esc(p.fin || "")}" onchange="periodosFreezeEdicion[${i}].fin=this.value"></td>
            <td><input type="datetime-local" aria-label="Inicio de tramitación" value="${esc(p.tramitacion || "")}" onchange="periodosFreezeEdicion[${i}].tramitacion=this.value"></td>
            <td><input type="checkbox" aria-label="Activo" ${p.activo !== false ? "checked" : ""} onchange="periodosFreezeEdicion[${i}].activo=this.checked"></td>
            <td><button class="btn btn-rojo btn-sm" type="button" onclick="quitarPeriodoFreeze(${i})">Quitar</button></td>
        </tr>`).join("");
}

function agregarPeriodoFreeze() {
    periodosFreezeEdicion.push({ nombre: "", inicio: "", fin: "", tramitacion: "", activo: true });
    pintarTablaFreeze();
}

function quitarPeriodoFreeze(indice) {
    periodosFreezeEdicion.splice(indice, 1);
    pintarTablaFreeze();
}

function validarPeriodosFreeze(periodos) {
    for (const p of periodos) {
        if (!p.nombre?.trim() || !p.inicio || !p.fin || !p.tramitacion) {
            return "Complete nombre, fechas e inicio de tramitación de cada periodo.";
        }
        if (p.fin < p.inicio) return "La fecha final de un periodo es anterior a la inicial.";
        if (p.tramitacion.slice(0, 10) <= p.fin) return "El inicio de tramitación debe ser posterior al fin del periodo.";
    }
    return null;
}

async function guardarPeriodosFreeze() {
    const periodos = periodosFreezeEdicion.map(p => ({
        nombre: (p.nombre || "").trim(),
        inicio: p.inicio,
        fin: p.fin,
        tramitacion: (p.tramitacion || "").slice(0, 16),
        activo: p.activo !== false
    }));
    const problema = validarPeriodosFreeze(periodos);
    if (problema) {
        toast(problema);
        return;
    }
    try {
        await ParametrosRepository.guardar("periodos_freeze", periodos, usuarioActual());
        audit("Periodos de Freeze", "", periodos.length + " periodo(s)");
        toast("Periodos de Freeze guardados.");
        await refrescarSLAs();
    } catch (error) {
        toast("No fue posible guardar los periodos de Freeze.");
    }
}

async function guardarFeriados() {
    const valor = (document.getElementById("cfg-feriados")?.value || "").trim();
    try {
        await ParametrosRepository.guardar("feriados", valor, usuarioActual());
        audit("Feriados nacionales", "", valor);
        toast("Feriados guardados.");
        await refrescarSLAs();
    } catch (error) {
        toast("No fue posible guardar los feriados.");
    }
}


// Feriados y Freeze cambian el cálculo de los SLAs (interno-sla.js).
async function refrescarSLAs() {
    if (typeof cargarSLAs !== "function") return;
    await cargarSLAs();
    if (typeof pintarBandeja === "function") pintarBandeja();
    if (typeof pintarReservas === "function") pintarReservas();
}

window.GestionCalendario = GestionCalendario;
window.guardarGestionReclamo = guardarGestionReclamo;
window.tomarTicket = tomarTicket;
window.asignarTicket = asignarTicket;
window.asignarTicketSeleccionado = asignarTicketSeleccionado;
window.guardarObservacion = guardarObservacion;
window.descartarObservacion = descartarObservacion;
window.quitarAdjuntoObs = quitarAdjuntoObs;
window.agregarPeriodoFreeze = agregarPeriodoFreeze;
window.quitarPeriodoFreeze = quitarPeriodoFreeze;
window.guardarPeriodosFreeze = guardarPeriodosFreeze;
window.guardarFeriados = guardarFeriados;
