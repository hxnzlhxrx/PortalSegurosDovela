/* ===========================================
   SLAs POR PROCESO
   Reglas guardadas en portal_parametros 'slas' y aplicadas como semáforo a
   reclamos y reservas (bandeja, detalle y reportes).
   El conteo empieza en la recepción (o en el inicio de tramitación si llegó
   durante un Freeze) y usa la hora de Panamá, los feriados configurados y la
   fecha de cierre (cerrado_en) que registra la base al pasar a Pagado/Rechazado.
=========================================== */

const SLA_ESTADOS_CERRADOS = ["Pagado", "Rechazado"];
const SLA_PROCESOS = { reclamos: "Reclamos", reservas: "Reservas" };
const SLA_UNIDADES = { habiles: "días hábiles", calendario: "días calendario", horas: "horas" };
const SLA_UNIDAD_CORTA = { habiles: "d háb.", calendario: "d", horas: "h" };
const SLA_ESTADOS = {
    "en-plazo": ["En plazo", "b-verde"],
    "por-vencer": ["Por vencer", "b-ambar"],
    "vencido": ["Vencido", "b-rojo"],
    "cumplido": ["Cumplido", "b-verde"],
    "incumplido": ["Incumplido", "b-rojo"],
    "cerrado": ["Cerrado", "b-gris"],
    "programado": ["Programado", "b-azul"],
    "sin-sla": ["Sin SLA", "b-gris"]
};

const slaConfig = { aviso: 80, reglas: [], feriados: "", periodos: [] };

async function cargarSLAs() {
    try {
        const p = await ParametrosRepository.obtener(["slas", "feriados", "periodos_freeze"]);
        slaConfig.aviso = Number(p.slas?.aviso) || 80;
        slaConfig.reglas = Array.isArray(p.slas?.reglas) ? p.slas.reglas : [];
        slaConfig.feriados = p.feriados || "";
        slaConfig.periodos = Array.isArray(p.periodos_freeze) ? p.periodos_freeze : [];
    } catch (error) {
        console.error("Error cargando SLAs:", error);
    }
    // El tablero usa el plazo general de reclamos.
    const general = slaConfig.reglas.find(r => r.proceso === "reclamos" && !r.linea && !r.producto);
    if (general && general.unidad !== "horas" && typeof CONFIG !== "undefined") CONFIG.sla = general.plazo;
    return slaConfig;
}

// La regla más específica gana: producto > línea > general del proceso.
function reglaSLA(proceso, registro, reglas = slaConfig.reglas) {
    const peso = r => (r.producto ? 2 : 0) + (r.linea ? 1 : 0);
    return reglas
        .filter(r => r.proceso === proceso &&
            (!r.linea || r.linea === registro.linea) &&
            (!r.producto || r.producto === registro.producto))
        .sort((a, b) => peso(b) - peso(a))[0] || null;
}

// Recepción: recibido_en (fecha de negocio, también en importaciones); si coincide
// con el día de creado_en se usa creado_en, que tiene la hora exacta.
function recepcionSLA(registro) {
    const C = GestionCalendario;
    const recibido = registro.recibido_en ? String(registro.recibido_en) : "";
    if (registro.creado_en && (!recibido || C.localPanama(registro.creado_en).slice(0, 10) === recibido.slice(0, 10))) {
        return new Date(registro.creado_en);
    }
    if (!recibido) return null;
    return new Date(recibido.length <= 10 ? recibido + "T00:00:00-05:00" : recibido);
}

function inicioSLA(registro) {
    const recepcion = recepcionSLA(registro);
    if (!recepcion || isNaN(recepcion)) return null;
    const periodo = GestionCalendario.periodoDe(recepcion, slaConfig.periodos);
    return periodo ? new Date(periodo.tramitacion + ":00-05:00") : recepcion;
}

const diaPanama = fecha => GestionCalendario.localPanama(fecha).slice(0, 10);
const diasEntreFechas = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);

// Último día (o instante, en horas) dentro del plazo.
function venceSLA(regla, inicio, feriados) {
    if (regla.unidad === "horas") return new Date(inicio.getTime() + regla.plazo * 3600000);
    const cursor = new Date(diaPanama(inicio) + "T00:00:00Z");
    if (regla.unidad === "calendario") {
        cursor.setUTCDate(cursor.getUTCDate() + regla.plazo - 1);
        return cursor.toISOString().slice(0, 10);
    }
    let contados = 0;
    for (let i = 0; i < 3660; i++) {
        const iso = cursor.toISOString().slice(0, 10);
        if (GestionCalendario.esHabil(iso, feriados) && ++contados === regla.plazo) return iso;
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return cursor.toISOString().slice(0, 10);
}

// Plazo consumido entre el inicio y `fin`, en la unidad de la regla.
function consumidoSLA(regla, inicio, fin, feriados) {
    if (fin <= inicio) return 0;
    if (regla.unidad === "horas") return (fin - inicio) / 3600000;
    if (regla.unidad === "calendario") return diasEntreFechas(diaPanama(inicio), diaPanama(fin));
    return GestionCalendario.diasHabilesEntre(inicio, fin, feriados);
}

function evaluarSLA(proceso, registro, ahora = new Date()) {
    const regla = reglaSLA(proceso, registro);
    const inicio = regla && inicioSLA(registro);
    if (!regla || !inicio) return { estado: "sin-sla", regla };

    const feriados = GestionCalendario.parseFeriados(slaConfig.feriados);
    const vence = venceSLA(regla, inicio, feriados);
    const base = { regla, inicio, vence };
    const fueraDePlazo = fecha => regla.unidad === "horas" ? fecha > vence : diaPanama(fecha) > vence;

    if (SLA_ESTADOS_CERRADOS.includes(registro.estado)) {
        if (!registro.cerrado_en) return { ...base, estado: "cerrado" };
        return { ...base, estado: fueraDePlazo(new Date(registro.cerrado_en)) ? "incumplido" : "cumplido", cierre: new Date(registro.cerrado_en) };
    }
    if (ahora < inicio) return { ...base, estado: "programado" };

    const consumido = consumidoSLA(regla, inicio, ahora, feriados);
    if (fueraDePlazo(ahora)) return { ...base, estado: "vencido", consumido };
    // En días, `restante` incluye el día en curso; el último día siempre es "Por vencer".
    const restante = Math.max(0, regla.plazo - consumido);
    const umbral = regla.plazo * (100 - slaConfig.aviso) / 100;
    const porVencer = regla.unidad === "horas" ? restante <= umbral : restante <= Math.max(1, umbral);
    return { ...base, estado: porVencer ? "por-vencer" : "en-plazo", consumido, restante };
}

function fechaSLA(valor) {
    return valor instanceof Date
        ? GestionCalendario.mostrarLocal(GestionCalendario.localPanama(valor))
        : GestionCalendario.mostrarLocal(valor);
}

// Texto secundario del semáforo.
function detalleSLA(ev) {
    switch (ev.estado) {
        case "en-plazo":
        case "por-vencer": {
            const restante = ev.regla.unidad === "horas" ? Math.floor(ev.restante) : ev.restante;
            return `${i18nT("Vence")} ${fechaSLA(ev.vence)} · ${i18nT("quedan")} ${restante} ${i18nT(SLA_UNIDAD_CORTA[ev.regla.unidad])}`;
        }
        case "vencido": return `${i18nT("Venció")} ${fechaSLA(ev.vence)}`;
        case "cumplido":
        case "incumplido": return `${i18nT("Cerrado")} ${fechaSLA(ev.cierre)}`;
        case "programado": return `${i18nT("Inicia")} ${fechaSLA(ev.inicio)}`;
        default: return "";
    }
}

function celdaSLA(ev) {
    const [texto, clase] = SLA_ESTADOS[ev.estado];
    const detalle = detalleSLA(ev);
    return `<span class="badge ${clase}">${texto}</span>${detalle ? `<br><small class="ayuda">${detalle}</small>` : ""}`;
}

function nombreReglaSLA(r) {
    const linea = r.linea ? (LINEAS.find(l => l.id === r.linea)?.nombre || r.linea) : i18nT("Todas las líneas");
    return `${i18nT(SLA_PROCESOS[r.proceso] || r.proceso)} · ${i18nT(linea)}${r.producto ? " · " + r.producto : ""}`;
}

// Tarjeta del detalle del reclamo.
function renderSLA(reclamo) {
    const ev = evaluarSLA("reclamos", reclamo);
    if (!ev.regla) {
        return `
<section class="tarjeta gestion-sla">
    <div class="tarjeta-titulo"><h3>SLA</h3>${celdaSLA(ev)}</div>
    <p class="ayuda">No hay una regla de SLA para esta línea y producto. Configúrela en Administración → SLAs por proceso.</p>
</section>`;
    }
    const [texto, clase] = SLA_ESTADOS[ev.estado];
    return `
<section class="tarjeta gestion-sla">
    <div class="tarjeta-titulo"><h3>SLA</h3><span class="badge ${clase}">${texto}</span></div>
    <dl class="dato-grid">
        <div><dt>Regla aplicada</dt><dd>${esc(nombreReglaSLA(ev.regla))}</dd></div>
        <div><dt>Plazo</dt><dd>${ev.regla.plazo} ${i18nT(SLA_UNIDADES[ev.regla.unidad])}</dd></div>
        ${ev.inicio ? `<div><dt>Inicio del conteo</dt><dd>${fechaSLA(ev.inicio)}</dd></div>` : ""}
        ${ev.vence ? `<div><dt>Vencimiento</dt><dd>${fechaSLA(ev.vence)}</dd></div>` : ""}
        ${ev.cierre ? `<div><dt>Cierre</dt><dd>${fechaSLA(ev.cierre)}</dd></div>` : ""}
    </dl>
    ${ev.estado === "cerrado" ? `<p class="ayuda">Cerrado antes de que se registrara la fecha de cierre; no se puede evaluar el cumplimiento.</p>` : ""}
</section>`;
}


/* ===========================================
   ADMINISTRACIÓN → SLAs POR PROCESO
=========================================== */

// Copia editable de las reglas: { aviso, reglas }, más el punto de partida y quién la abrió.
let slaEdicion = null;
let slaEdicionBase = { datos: "", usuario: null };

const datosSLA = e => JSON.stringify({ aviso: e.aviso, reglas: e.reglas });

function iniciarEdicionSLA() {
    slaEdicion = {
        aviso: slaConfig.aviso,
        reglas: slaConfig.reglas.map(r => ({ ...r }))
    };
    slaEdicionBase = { datos: datosSLA(slaEdicion), usuario: typeof sesion !== "undefined" ? sesion?.id : null };
    pintarSLA();
}

// Hay cambios propios sin guardar (de este mismo usuario).
function slaModificado() {
    return !!slaEdicion &&
        slaEdicionBase.usuario === (typeof sesion !== "undefined" ? sesion?.id : null) &&
        datosSLA(slaEdicion) !== slaEdicionBase.datos;
}

function pintarSLA() {
    const tb = document.getElementById("tbody-sla");
    if (!tb) return;
    if (!slaEdicion) {
        iniciarEdicionSLA();
        return;
    }
    const aviso = document.getElementById("sla-aviso");
    if (aviso) aviso.value = slaEdicion.aviso;
    const estado = document.getElementById("sla-estado");
    if (estado) estado.textContent = slaModificado() ? i18nT("Hay cambios sin guardar.") : "";

    if (!slaEdicion.reglas.length) {
        PortalTableState.empty("tbody-sla", 6, "No hay reglas de SLA. Agregue una con «Nuevo SLA».");
        return;
    }
    const opcion = (valor, texto, actual) =>
        `<option value="${esc(valor)}"${valor === actual ? " selected" : ""}>${esc(texto)}</option>`;
    tb.innerHTML = slaEdicion.reglas.map((r, i) => {
        const productos = r.linea ? (PRODUCTOS[r.linea] || []) : [];
        return `<tr>
      <td><select aria-label="Proceso" onchange="setSLA(${i},'proceso',this.value)">
        ${Object.entries(SLA_PROCESOS).map(([v, t]) => opcion(v, t, r.proceso)).join("")}</select></td>
      <td><select aria-label="Línea" onchange="setSLA(${i},'linea',this.value)">
        ${opcion("", "Todas las líneas", r.linea)}${LINEAS.map(l => opcion(l.id, l.nombre, r.linea)).join("")}</select></td>
      <td><select aria-label="Producto" onchange="setSLA(${i},'producto',this.value)"${r.linea ? "" : " disabled"}>
        ${opcion("", "Todos los productos", r.producto)}${productos.map(p => `<option value="${esc(p)}"${p === r.producto ? " selected" : ""} data-i18n-ignore>${esc(p)}</option>`).join("")}</select></td>
      <td><input type="number" min="1" step="1" value="${esc(r.plazo)}" style="width:80px;padding:4px 6px" aria-label="Plazo" onchange="setSLA(${i},'plazo',this.value)"></td>
      <td><select aria-label="Unidad" onchange="setSLA(${i},'unidad',this.value)">
        ${Object.entries(SLA_UNIDADES).map(([v, t]) => opcion(v, t, r.unidad)).join("")}</select></td>
      <td><button class="btn btn-rojo btn-sm" onclick="borrarSLA(${i})" aria-label="Eliminar" title="Eliminar"><span class=ico data-icon=borrar aria-hidden=true></span></button></td></tr>`;
    }).join("");
}

function setSLA(i, campo, valor) {
    const r = slaEdicion.reglas[i];
    if (!r) return;
    if (campo === "plazo") r.plazo = Number(valor);
    else r[campo] = valor;
    if (campo === "linea") r.producto = "";
    pintarSLA();
}

function setAvisoSLA(valor) {
    slaEdicion.aviso = Number(valor);
    pintarSLA();
}

function agregarSLA() {
    slaEdicion.reglas.push({
        id: "sla-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        proceso: "reclamos", linea: "", producto: "", plazo: 10, unidad: "habiles"
    });
    pintarSLA();
}

function borrarSLA(i) {
    slaEdicion.reglas.splice(i, 1);
    pintarSLA();
}

function descartarSLA() {
    iniciarEdicionSLA();
}

function validarSLA({ aviso, reglas }) {
    if (!Number.isInteger(aviso) || aviso < 1 || aviso > 99) return "El aviso «Por vencer» debe ser un porcentaje entre 1 y 99.";
    const vistas = new Set();
    for (const r of reglas) {
        const maximo = r.unidad === "horas" ? 8760 : 365;
        if (!Number.isInteger(r.plazo) || r.plazo < 1 || r.plazo > maximo) {
            return i18nT("Plazo inválido en") + " " + nombreReglaSLA(r) + ". " +
                i18nT(r.unidad === "horas" ? "Use un número entero entre 1 y 8760 horas." : "Use un número entero entre 1 y 365 días.");
        }
        const clave = [r.proceso, r.linea, r.producto].join("|");
        if (vistas.has(clave)) return i18nT("Hay dos reglas para") + " " + nombreReglaSLA(r) + ".";
        vistas.add(clave);
    }
    return null;
}

async function guardarSLAs() {
    const valor = {
        aviso: slaEdicion.aviso,
        reglas: slaEdicion.reglas.map(({ id, proceso, linea, producto, plazo, unidad }) =>
            ({ id, proceso, linea: linea || "", producto: linea ? producto || "" : "", plazo, unidad }))
    };
    const problema = validarSLA(valor);
    if (problema) {
        toast(problema);
        return false;
    }
    const boton = document.getElementById("sla-guardar");
    if (boton) boton.disabled = true;
    try {
        await ParametrosRepository.guardar("slas", valor, usuarioActual());
    } catch (error) {
        toast(i18nT("No fue posible guardar los SLAs.") + " " + (error?.message || ""));
        return false;
    } finally {
        if (boton) boton.disabled = false;
    }
    audit("SLAs por proceso", "", valor.reglas.length + " regla(s) · aviso " + valor.aviso + "%");
    await cargarSLAs();
    iniciarEdicionSLA();
    if (typeof pintarBandeja === "function") pintarBandeja();
    if (typeof pintarReservas === "function") pintarReservas();
    toast("SLAs guardados");
    return true;
}

window.cargarSLAs = cargarSLAs;
window.evaluarSLA = evaluarSLA;
