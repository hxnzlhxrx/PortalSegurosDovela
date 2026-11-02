/* ===========================================
   BANDEJA
   <<--- </gishikoDev_> --->>
=========================================== */

console.log("bandeja.js cargado");

let bandeja = [];

function estadoReclamoClase(estado) {
    return String(estado || "sin-estado")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-");
}

async function cargarBandeja(archivados = false) {
    const token = PortalTableState.begin("tbody-bandeja", 10,
        archivados ? "Cargando reclamos archivados…" : "Cargando reclamos…");
    try {
        const datos = archivados
            ? await ReclamosRepository.obtenerArchivados()
            : await ReclamosRepository.obtenerTodos();
        if (!PortalTableState.current("tbody-bandeja", token)) return;
        bandeja = datos;
        prepararFiltrosBandeja();
        PortalTableState.end("tbody-bandeja", token);
        pintarBandeja();
        if (archivados) toast("Mostrando archivados.");
    } catch (error) {
        if (!PortalTableState.current("tbody-bandeja", token)) return;
        PortalTableState.error("tbody-bandeja", token, 10,
            "No fue posible cargar los reclamos.", () => cargarBandeja(archivados));
        console.error("ERROR CARGANDO BANDEJA:", error);
    }
}


function pintarBandeja(){

    if (PortalTableState.blocked("tbody-bandeja")) return;

    console.log("BANDEJA A PINTAR:", bandeja);

    const tbody =
        document.getElementById(
            "tbody-bandeja"
        );

    if(!tbody)
        return;

    pintarResumenSLA();

    if (!bandeja.length) {
        PortalTableState.empty("tbody-bandeja", 10, "No se encontraron reclamos.");
        return;
    }

    const visibles = filtrarBandeja(bandeja);
    if (!visibles.length) {
        PortalTableState.empty("tbody-bandeja", 10, "No hay reclamos con los filtros seleccionados.");
        return;
    }

    tbody.innerHTML =
        visibles.map(reclamo=>`

        <tr
    onclick="abrirReclamo('${reclamo.id}', 'bandeja')"
    style="cursor:pointer"
>

    <td>${reclamo.num}</td>

    <td>${reclamo.nombre}</td>

    <td>${reclamo.linea}</td>

    <td>${reclamo.producto}</td>

    <td>

        ${
            reclamo.monto
            ? Number(reclamo.monto).toLocaleString(
                "es-PA",
                {
                    style:"currency",
                    currency:"USD"
                }
            )
            : "-"
        }

    </td>

    <td>${reclamo.recibido_en ?? ""}</td>

    <td>
            <div>
            <span class="estado estado-${estadoReclamoClase(reclamo.estado)}">

            ${reclamo.estado} 

             </span>
             </div> 

    </td> 

    <td>${celdaSLA(evaluarSLA("reclamos", reclamo))}</td>

    <td>${reclamo.genelco ?? "-"}</td>

    <td>${reclamo.asignado_a ? `<span data-i18n-ignore>${esc(nombreAsignado(reclamo.asignado_a))}</span>` : "Sin asignar"}</td>

</tr>

        `).join("");

}

/* ===========================================
   FILTROS DE LA BANDEJA
   Búsqueda, estado, línea, producto, asignado y rango de fechas.
   Las opciones salen de los datos cargados (más los valores conocidos del
   portal), así siempre coinciden con lo que hay en la base.
=========================================== */

const sinAcentos = valor => String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Rellena un <select> conservando la opción elegida si sigue existiendo.
function llenarFiltroBandeja(id, placeholder, opciones) {
    const select = document.getElementById(id);
    if (!select) return;
    const previo = select.value;
    select.innerHTML = `<option value="">${esc(placeholder)}</option>` +
        opciones.map(([valor, texto, ignorar]) =>
            `<option value="${esc(valor)}"${ignorar ? " data-i18n-ignore" : ""}>${esc(texto)}</option>`).join("");
    select.value = opciones.some(([valor]) => valor === previo) ? previo : "";
}

function prepararFiltrosBandeja() {
    const presentes = campo => [...new Set(bandeja.map(r => r[campo]).filter(Boolean))];
    const conocidos = typeof ESTADOS !== "undefined" ? ESTADOS : [];
    const estados = [...conocidos, ...presentes("estado").filter(e => !conocidos.includes(e)).sort()];
    llenarFiltroBandeja("fil-estado", "Estado: todos", estados.map(e => [e, e]));

    const lineasConocidas = typeof LINEAS !== "undefined" ? LINEAS : [];
    const lineas = [
        ...lineasConocidas.map(l => [l.id, l.nombre]),
        ...presentes("linea").filter(id => !lineasConocidas.some(l => l.id === id)).sort().map(id => [id, id, true])
    ];
    llenarFiltroBandeja("fil-linea", "Línea: todas", lineas);
    actualizarFiltroProductos();
}

// Los productos dependen de la línea elegida.
function actualizarFiltroProductos() {
    const linea = document.getElementById("fil-linea")?.value || "";
    const productos = [...new Set(bandeja
        .filter(r => !linea || r.linea === linea)
        .map(r => r.producto)
        .filter(Boolean))].sort((x, y) => x.localeCompare(y, "es"));
    llenarFiltroBandeja("fil-producto", "Producto: todos", productos.map(p => [p, p, true]));
}

// Fecha de recepción (YYYY-MM-DD, hora de Panamá) usada por el filtro de rango.
function fechaRecepcion(r) {
    if (r.recibido_en) return String(r.recibido_en).slice(0, 10);
    return r.creado_en ? GestionCalendario.localPanama(r.creado_en).slice(0, 10) : "";
}

function filtrarBandeja(lista) {
    const valor = id => document.getElementById(id)?.value || "";
    const busqueda = sinAcentos(valor("fil-busca").trim());
    const estado = valor("fil-estado");
    const linea = valor("fil-linea");
    const producto = valor("fil-producto");
    const asignado = valor("fil-asig");
    const desde = valor("fil-desde");
    const hasta = valor("fil-hasta");
    const sla = valor("fil-sla");
    const asignadoA = asignado === "__mios__" ? sesion?.id : asignado;

    return lista.filter(r => {
        if (busqueda) {
            const texto = sinAcentos([r.num, r.nombre, r.cedula, r.email, r.poliza, r.genelco, r.producto,
                nombreAsignado(r.asignado_a)].filter(Boolean).join(" "));
            if (!texto.includes(busqueda)) return false;
        }
        if (estado && r.estado !== estado) return false;
        if (linea && r.linea !== linea) return false;
        if (producto && r.producto !== producto) return false;
        if (asignado === "__nadie__" ? r.asignado_a : asignado && r.asignado_a !== asignadoA) return false;
        if (desde || hasta) {
            const fecha = fechaRecepcion(r);
            if (!fecha || (desde && fecha < desde) || (hasta && fecha > hasta)) return false;
        }
        if (sla && evaluarSLA("reclamos", r).estado !== sla) return false;
        return true;
    });
}

// Limpia todos los filtros de la bandeja.
function limpiarFiltrosBandeja() {
    ["fil-busca", "fil-estado", "fil-linea", "fil-producto", "fil-asig", "fil-sla", "fil-rango", "fil-desde", "fil-hasta"]
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    document.getElementById("fil-desde")?.classList.add("hidden");
    document.getElementById("fil-hasta")?.classList.add("hidden");
    actualizarFiltroProductos();
    pintarBandeja();
}

// Alertas de SLA sobre los reclamos abiertos cargados; cada chip aplica su filtro.
function pintarResumenSLA() {
    const caja = document.getElementById("sla-resumen");
    if (!caja) return;
    const cuenta = { "vencido": 0, "por-vencer": 0 };
    bandeja.forEach(r => {
        const estado = evaluarSLA("reclamos", r).estado;
        if (estado in cuenta) cuenta[estado]++;
    });
    const chips = [["vencido", "vencidos", "b-rojo"], ["por-vencer", "por vencer", "b-ambar"]]
        .filter(([estado]) => cuenta[estado])
        .map(([estado, texto, clase]) =>
            `<button type="button" class="badge ${clase} sla-chip" onclick="filtrarPorSLA('${estado}')">${cuenta[estado]} <span>${texto}</span></button>`);
    caja.innerHTML = chips.length
        ? `<span class="ico" data-icon="reloj" aria-hidden="true"></span> <span>SLA:</span> ${chips.join(" ")}`
        : "";
}

function filtrarPorSLA(estado) {
    const select = document.getElementById("fil-sla");
    if (select) select.value = estado;
    pintarBandeja();
}

window.limpiarFiltrosBandeja = limpiarFiltrosBandeja;
window.filtrarPorSLA = filtrarPorSLA;
window.actualizarFiltroProductos = actualizarFiltroProductos;

async function abrirReclamo(id, origen = "bandeja") {

    detalleOrigen = origen;

    try {

        const [reclamo, documentos] = await Promise.all([
            ReclamosRepository.obtenerPorId(id),
            ReclamosRepository.obtenerDocumentos(id),
            cargarParametrosOperativos()
        ]);

        if (!reclamo) {
            toast("No fue posible abrir el reclamo.");
            return;
        }

        descartarObservacion();
        gestionVista.reclamo = reclamo;

        const soloLectura =
            sesion?.rol === "Visualizador";

        const programacion =
            GestionCalendario.programacion(
                reclamo,
                gestionVista.parametros
            );

        document.getElementById("detalle-body").innerHTML = `

<header class="detalle-cabecera">
    <h2 data-i18n-ignore>${esc(reclamo.num)}</h2>
    <div class="detalle-cabecera-meta">
        <span class="estado estado-${estadoReclamoClase(reclamo.estado)}">${esc(reclamo.estado)}</span>
        <span class="detalle-cabecera-nombre" data-i18n-ignore>${esc(reclamo.nombre)}</span>
    </div>
</header>

<div class="detalle-gestion">
    ${renderInfoReclamo(reclamo)}
    ${renderProgramacion(programacion)}
    ${renderSLA(reclamo)}
    ${renderGestion(reclamo, soloLectura)}
    ${renderAsignacion(reclamo)}
    <section class="tarjeta gestion-descripcion">
        <h3>Descripción del Evento</h3>
        <p class="nota" data-i18n-ignore>${esc(reclamo.descripcion ?? "-")}</p>
    </section>
    ${renderDocumentos(documentos)}
    ${renderObservaciones(reclamo, soloLectura)}
    ${renderHistorial([], false, null)}
    ${renderTimeline(reclamo)}
</div>
`;

        if (soloLectura) {
            document
                .querySelectorAll("#detalle-body .gestion-form input, #detalle-body .gestion-form select, #detalle-body .gestion-form textarea")
                .forEach(c => c.disabled = true);
        }

        enlazarObservaciones();
        tab("detalle");
        await pintarHistorial(reclamo);

    }

    catch(error){

        console.error(error);

        toast(
            "No fue posible abrir el reclamo."
        );

    }

}

async function abrirDocumento(ruta){

    const {

        data,

        error

    } = await db.storage

        .from("reclamos")

        .createSignedUrl(

            ruta,

            300

        );

    if(error){

        console.error(error);

        return;

    }

    window.open(

        data.signedUrl,

        "_blank"

    );

}

// Descarga sin mostrar: con { download } Storage responde con
// Content-Disposition: attachment, así el navegador guarda el archivo
// en vez de abrirlo (el atributo download solo no basta: la URL es de otro origen).
async function descargarDocumento(ruta, nombre){

    const archivo = nombre || String(ruta).split("/").pop();

    const { data, error } =
        await db.storage
            .from("reclamos")
            .createSignedUrl(
                ruta,
                300,
                { download: archivo }
            );

    if(error){

        console.error(error);

        toast("No se pudo descargar el documento. Intente de nuevo.");

        return;

    }

    const enlace = document.createElement("a");
    enlace.href = data.signedUrl;
    enlace.download = archivo;
    enlace.rel = "noopener";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

}


async function archivarReclamo(id){

    const reclamo =

        await ReclamosRepository.obtenerPorId(id);

    if(

        reclamo.estado !== "Pagado"

        &&

        reclamo.estado !== "Rechazado"

    ){

        toast(

            "Solo pueden archivarse reclamos Pagados o Rechazados."

        );

        return;

    }

    if(

        !confirm(

            i18nT("¿Desea archivar este reclamo?")

        )

    ){

        return;

    }

    try{

        await ReclamosRepository.archivar(id);

        await registrarEnHistorial(id, "sistema", "Reclamo archivado");

        toast(

            "Reclamo archivado."

        );

        tab("bandeja");

        await cargarBandeja();

    }

    catch(error){

        console.error(error);

    }

}

async function verArchivados(){
    return cargarBandeja(true);
}

window.verArchivados = verArchivados;

async function confirmarArchivado(id){

    const confirmar =
        confirm(

            i18nT("¿Desea archivar este reclamo?") + "\n\n" +

            i18nT("El reclamo desaparecerá de la bandeja principal pero podrá consultarse desde Archivados.")

        );

    if(!confirmar){

        return;

    }

    await archivarReclamo(id);
}

async function confirmarDesarchivado(id){

    const confirmar =
        confirm(

            i18nT("¿Desea desarchivar este reclamo?") + "\n\n" +

            i18nT("El reclamo volverá a aparecer en la bandeja principal.")

        );

    if(!confirmar){

        return;

    }

    try{

        await ReclamosRepository.desarchivar(id);

        await registrarEnHistorial(id, "sistema", "Reclamo desarchivado");

        toast(

            "Reclamo desarchivado."

        );

        tab("bandeja");

        await cargarBandeja(true);

    }

    catch(error){

        console.error(error);

        toast("No fue posible desarchivar el reclamo.");
    }

}

window.confirmarDesarchivado = confirmarDesarchivado;
window.confirmarArchivado = confirmarArchivado;
window.archivarReclamo = archivarReclamo;
window.verArchivados = verArchivados;
window.abrirReclamo = abrirReclamo;
window.abrirDocumento = abrirDocumento;
window.descargarDocumento = descargarDocumento;
window.archivarReclamo = archivarReclamo;