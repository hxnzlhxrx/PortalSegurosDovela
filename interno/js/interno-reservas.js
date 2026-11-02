/* ===========================================
   RESERVAS
   <<--- </gishikoDev_> --->>
=========================================== */

console.log("interno-reservas.js cargado");

let reservas = [];

/* ===========================================
                   CARGAR
=========================================== */

async function cargarReservas() {

    const token = PortalTableState.begin("tbody-reservas", 9, "Cargando reservas…");

    try {
        const datos = await ReservasRepository.obtenerTodos();
        if (!PortalTableState.current("tbody-reservas", token)) return;
        reservas = datos;

        prepararFiltrosReservas();

        PortalTableState.end("tbody-reservas", token);
        pintarReservas();

    } catch (error) {
        if (!PortalTableState.current("tbody-reservas", token)) return;
        PortalTableState.error("tbody-reservas", token, 9,
            "No fue posible cargar las reservas.", () => cargarReservas());
        console.error(
            "Error cargando reservas:",
            error
        );

        toast(
            "No fue posible cargar las reservas."
        );
    }
}

/* ===========================================
                   FILTROS
=========================================== */

function prepararFiltrosReservas() {

    const estados =
        [...new Set(
            reservas
                .map(r => r.estado)
                .filter(Boolean)
        )]
        .sort();

    const lineas =
        [...new Set(
            reservas
                .map(r => r.linea)
                .filter(Boolean)
        )]
        .sort();

    const productos =
        [...new Set(
            reservas
                .map(r => r.producto)
                .filter(Boolean)
        )]
        .sort();


    llenarSelectReserva(
        "fil-reserva-estado",
        "Todos los estados",
        estados
    );

    llenarSelectReserva(
        "fil-reserva-linea",
        "Todas las líneas",
        lineas
    );

    llenarSelectReserva(
        "fil-reserva-producto",
        "Todos los productos",
        productos
    );

}


function llenarSelectReserva(
    id,
    placeholder,
    valores
) {

    const select =
        document.getElementById(id);

    if (!select)
        return;

    const valorActual =
        select.value;

    select.innerHTML = `
        <option value="">
            ${placeholder}
        </option>
    `;

    valores.forEach(valor => {

        const option =
            document.createElement("option");

        option.value = valor;
        option.textContent = valor;

        select.appendChild(option);

    });

    select.value = valorActual;

}


/* ===========================================
   PINTAR TABLA
=========================================== */

function pintarReservas() {

    if (PortalTableState.blocked("tbody-reservas")) return;

    const tbody =
        document.getElementById(
            "tbody-reservas"
        );

    if (!tbody)
        return;


    const busqueda =
        sinAcentos(
            (
                document.getElementById(
                    "fil-reserva-busca"
                )?.value || ""
            )
            .trim()
        );


    const estado =
        document.getElementById(
            "fil-reserva-estado"
        )?.value || "";


    const linea =
        document.getElementById(
            "fil-reserva-linea"
        )?.value || "";


    const producto =
        document.getElementById(
            "fil-reserva-producto"
        )?.value || "";


    const filtradas =
        reservas.filter(reserva => {

            const texto = [

                reserva.num,
                reserva.nombre,
                reserva.cedula,
                reserva.email,
                reserva.tel,
                reserva.poliza,
                reserva.producto,
                reserva.proveedor

            ]
                .filter(Boolean)
                .join(" ");


            const coincideBusqueda =
                !busqueda ||
                sinAcentos(texto).includes(busqueda);


            const coincideEstado =
                !estado ||
                reserva.estado === estado;


            const coincideLinea =
                !linea ||
                reserva.linea === linea;


            const coincideProducto =
                !producto ||
                reserva.producto === producto;


            return (
                coincideBusqueda &&
                coincideEstado &&
                coincideLinea &&
                coincideProducto
            );

        });


    if (!filtradas.length) {

        PortalTableState.empty("tbody-reservas", 9, "No se encontraron reservas.");

        return;

    }


    tbody.innerHTML =
        filtradas
            .map(reserva => {

                const monto =
                    reserva.monto !== null &&
                    reserva.monto !== undefined
                        ? Number(
                            reserva.monto
                        ).toLocaleString(
                            "es-PA",
                            {
                                style: "currency",
                                currency: "USD"
                            }
                        )
                        : "-";


                return `

                        <tr
                        class="fila"
                        onclick="abrirReserva('${reserva.id}')"
                        >

                        <td>
                            <span class="mono">
                                ${reserva.num ?? "-"}
                            </span>
                        </td>

                        <td>
                            <b>
                                ${reserva.nombre ?? "-"}
                            </b>

                            <br>

                            <small class="ayuda">
                                ${reserva.cedula ?? ""}
                            </small>
                        </td>

                        <td>
                            ${reserva.linea ?? "-"}
                        </td>

                        <td>
                            ${reserva.producto ?? "-"}
                        </td>

                        <td>
                            ${reserva.poliza ?? "-"}
                        </td>

                        <td>
                            ${monto}
                        </td>

                        <td>
                            ${formatearFechaReserva(
                                reserva.recibido_en
                            )}
                        </td>

                        <td>
                            <span
                                class="estado estado-${estadoReservaClase(reserva.estado)}">

                                ${reserva.estado ?? "-"}

                            </span>
                        </td>

                        <td>
                            ${celdaSLA(evaluarSLA("reservas", reserva))}
                        </td>

                    </tr>

                `;

            })
            .join("");

}

/* ===========================================
   DETALLE DE RESERVA
   <<--- </gishikoDev_> --->
=========================================== */

async function abrirReserva(id) {

    try {

        const reserva =
            await ReservasRepository.obtenerPorId(id);

        if (!reserva) {
            toast("No fue posible encontrar la reserva.");
            return;
        }

        const cont =
            document.getElementById("detalle-reserva-body");

        if (!cont)
            return;

        const permisos = permiso();

        const puedeEditar =
            !!permisos?.editReserva;

        const monto =
            reserva.monto !== null &&
            reserva.monto !== undefined
                ? Number(reserva.monto).toLocaleString(
                    "es-PA",
                    {
                        style: "currency",
                        currency: "USD"
                    }
                )
                : "-";

        const estado =
            reserva.estado || "Sin estado";

        const estadoClase =
            estadoReservaClase(estado);

        /*
         * ===========================================
         * ESTADOS
         * ===========================================
         */

        const estadosReserva = [
            "Recibido",
            "En Proceso",
            "Pendiente de Información",
            "Pagado",
            "Rechazado"
        ];

        const opcionesEstado =
            estadosReserva.map(e => `
                <option
                    value="${e}"
                    ${e === estado ? "selected" : ""}
                >
                    ${e}
                </option>
            `).join("");

        /*
         * ===========================================
         * BOTÓN ARCHIVAR
         * ===========================================
         */

        const botonArchivar =
            (
                estado === "Pagado" ||
                estado === "Rechazado"
            )
            ? `
                <br>

                <button
                    class="btn btn-danger"
                    style="width:100%"
                    onclick="confirmarArchivadoReserva('${reserva.id}')"
                    ${!puedeEditar ? "style='display:none'" : ""}
                >
                    <span class=ico data-icon=archivo aria-hidden=true></span> Archivar Reserva
                </button>
            `
            : "";

        /*
         * ===========================================
         * DETALLE
         * ===========================================
         */

        cont.innerHTML = `

            <header class="detalle-cabecera">
                <h2 data-i18n-ignore>${esc(reserva.num ?? "-")}</h2>
                <div class="detalle-cabecera-meta">
                    <span class="estado estado-${estadoClase}">${esc(estado)}</span>
                    ${reserva.nombre ? `<span class="detalle-cabecera-nombre" data-i18n-ignore>${esc(reserva.nombre)}</span>` : ""}
                </div>
            </header>


            <div class="detalle-grid">


                <!-- ================================
                     INFORMACIÓN DE LA RESERVA
                ================================= -->

                <div class="tarjeta">

                    <h3>
                        Información de la Reserva
                    </h3>

                    <p>
                        <b>Asegurado</b><br>
                        ${reserva.nombre ?? "-"}
                    </p>

                    <p>
                        <b>Cédula</b><br>
                        ${reserva.cedula ?? "-"}
                    </p>

                    <p>
                        <b>Email</b><br>
                        ${reserva.email ?? "-"}
                    </p>

                    <p>
                        <b>Teléfono</b><br>
                        ${reserva.tel ?? "-"}
                    </p>

                    <p>
                        <b>Línea</b><br>
                        ${reserva.linea ?? "-"}
                    </p>

                    <p>
                        <b>Producto</b><br>
                        ${reserva.producto ?? "-"}
                    </p>

                    <p>
                        <b>Póliza</b><br>
                        ${reserva.poliza ?? "-"}
                    </p>

                    <p>
                        <b>Perfil que presenta</b><br>
                        ${reserva.perfil_presenta ?? "-"}
                    </p>

                    <p>
                        <b>Hospital</b><br>
                        ${reserva.hospital ?? "-"}
                    </p>

                    <p>
                        <b>Corredora</b><br>
                        ${reserva.corredora ?? "-"}
                    </p>

                    <p>
                        <b>Proveedor</b><br>
                        ${reserva.proveedor ?? "-"}
                    </p>

                    <p>
                        <b>Monto</b><br>
                        ${monto}
                    </p>

                </div>

<div class="tarjeta">

    <h3>Gestión de la Reserva</h3>

    <label>
        Estado de la Reserva
    </label>

    <select
        id="reserva-estado"
        style="width:100%"
    >

        <option
    value="Recibido"
    ${reserva.estado === "Recibido" ? "selected" : ""}
>
    Recibido
</option>

<option
    value="En Proceso"
    ${reserva.estado === "En Proceso" ? "selected" : ""}
>
    En Proceso
</option>

<option
    value="Resuelto"
    ${reserva.estado === "Resuelto" ? "selected" : ""}
>
    Resuelto
</option>

<option
    value="Rechazado"
    ${reserva.estado === "Rechazado" ? "selected" : ""}
>
    Rechazado
</option>

<option
    value="Anulado"
    ${reserva.estado === "Anulado" ? "selected" : ""}
>
    Anulado
</option>

    </select>


    <br><br>


    <label>
        Asignado a
    </label>

    <select
        id="reserva-asignado"
        data-actual="${esc(reserva.asignado_a ?? "")}"
        style="width:100%"
        ${puedeAsignar() ? "" : "disabled"}
    >
        ${opcionesAsignacion(reserva.asignado_a ?? "")}
    </select>


    <br><br>


    <label>
        Número Genelco
    </label>

    <input
        type="text"
        id="reserva-genelco"
        value="${reserva.genelco ?? ""}"
        style="width:100%"
        placeholder="Número Genelco"
    >


    <br><br>


    <button
        class="btn btn-verde"
        style="width:100%"
        onclick="guardarGestionReserva('${reserva.id}')"
    >
        <span class=ico data-icon=guardar aria-hidden=true></span> Guardar Gestión
    </button>

</div>



                <!-- ================================
                     DESCRIPCIÓN
                ================================= -->

                <div
                    class="tarjeta"
                    style="margin-top:20px"
                >

                    <h3>
                        Descripción
                    </h3>

                    <div class="nota">
                        ${reserva.descripcion ?? "-"}
                    </div>

                </div>


                <!-- ================================
                     OBSERVACIONES
                ================================= -->

                <div
                    class="tarjeta"
                    style="margin-top:20px"
                >

                    <h3>
                        Observaciones Internas
                    </h3>

                    <textarea
                        id="reserva-observaciones"
                        style="width:100%;height:140px"
                        placeholder="Observaciones internas..."
                        ${!puedeEditar ? "disabled" : ""}
                    >${reserva.observaciones_internas ?? ""}</textarea>


                    ${
                        puedeEditar
                        ? `

                            <br><br>

                            <button
                                class="btn btn-verde"
                                style="width:100%"
                                onclick="guardarObservacionReserva('${reserva.id}')"
                            >
                                <span class=ico data-icon=guardar aria-hidden=true></span> Guardar Observación
                            </button>

                        `
                        : ""
                    }

                </div>


                <!-- ================================
                     TIMELINE
                ================================= -->

                <div
                    class="tarjeta"
                    style="margin-top:20px"
                >

                    <h3>
                        Timeline
                    </h3>

                    <div class="timeline">


                        <div class="timeline-item">

                            <div class="timeline-dot"></div>

                            <div>

                                <b>
                                    Reserva recibida
                                </b>

                                <br>

                                <small>
                                    ${formatearFechaReserva(
                                        reserva.recibido_en
                                    )}
                                </small>

                            </div>

                        </div>


                        ${
                            reserva.asignado_a
                            ? `

                                <div class="timeline-item">

                                    <div class="timeline-dot"></div>

                                    <div>

                                        Asignado a

                                        <b data-i18n-ignore>
                                            ${esc(nombreAsignado(reserva.asignado_a))}
                                        </b>

                                    </div>

                                </div>

                            `
                            : ""
                        }


                        ${
                            reserva.genelco
                            ? `

                                <div class="timeline-item">

                                    <div class="timeline-dot"></div>

                                    <div>

                                        Número Genelco

                                        <b>
                                            ${reserva.genelco}
                                        </b>

                                    </div>

                                </div>

                            `
                            : ""
                        }


                        ${
                            reserva.fecha_evento
                            ? `

                                <div class="timeline-item">

                                    <div class="timeline-dot"></div>

                                    <div>

                                        Fecha del evento

                                        <b>
                                            ${formatearFechaReserva(
                                                reserva.fecha_evento
                                            )}
                                        </b>

                                    </div>

                                </div>

                            `
                            : ""
                        }


                        <div class="timeline-item">

                            <div class="timeline-dot"></div>

                            <div>

                                Estado actual

                                <b>
                                    ${estado}
                                </b>

                            </div>

                        </div>


                    </div>

                </div>

            </div>
        `;


        /*
         * ===========================================
         * MOSTRAR DETALLE
         * ===========================================
         */

        tab("detalle-reserva");

    }

    catch (error) {

        console.error(
            "Error abriendo reserva:",
            error
        );

        toast(
            "No fue posible abrir la reserva."
        );
    }
}

function volverDesdeDetalleReserva() {

    console.log(">>> VOLVIENDO A RESERVAS <<<");

    detalleOrigen = null;

    tab("reservas");
}


/* ===========================================
   GUARDAR GESTIÓN DE RESERVA
   <<--- </gishikoDev_> --->
=========================================== */

async function guardarGestionReserva(id) {

    console.log("========================================");
    console.log(">>> GUARDANDO GESTIÓN DE RESERVA <<<");
    console.log("ID:", id);
    console.log("========================================");

    const permisos = permiso();

    console.log("PERMISOS:", permisos);

    if (!permisos?.editReserva) {
        console.warn("USUARIO SIN PERMISO editReserva");
        toast("No tiene permisos para editar esta reserva.");
        return;
    }

    // ========================================
    // REFERENCIAS A LOS CAMPOS
    // ========================================

    const campoEstado = document.getElementById("reserva-estado");
    const campoAsignado = document.getElementById("reserva-asignado");
    const campoGenelco = document.getElementById("reserva-genelco");
    const campoObservaciones = document.getElementById("reserva-observaciones");

    console.log("CAMPO ESTADO:", campoEstado);
    console.log("CAMPO ASIGNADO:", campoAsignado);
    console.log("CAMPO GENELCO:", campoGenelco);
    console.log("CAMPO OBSERVACIONES:", campoObservaciones);

    // ========================================
    // VALIDAR QUE LOS CAMPOS EXISTAN
    // ========================================

    if (!campoEstado) {
        console.error("NO EXISTE #reserva-estado");
        toast("No se encontró el campo de estado.");
        return;
    }

    if (!campoAsignado) {
        console.error("NO EXISTE #reserva-asignado");
        toast("No se encontró el campo de asignación.");
        return;
    }

    if (!campoGenelco) {
        console.error("NO EXISTE #reserva-genelco");
        toast("No se encontró el campo GENELCO.");
        return;
    }

    // ========================================
    // LEER VALORES ACTUALES
    // ========================================

    const estado = campoEstado.value?.trim() || "";
    const asignado = campoAsignado.value?.trim() || "";
    const genelco = campoGenelco.value?.trim() || "";
    const observaciones = campoObservaciones
        ? campoObservaciones.value?.trim() || null
        : null;

    console.log("----------------------------------------");
    console.log("VALORES LEÍDOS DEL FORMULARIO");
    console.log("ESTADO:", JSON.stringify(estado));
    console.log("ASIGNADO:", JSON.stringify(asignado));
    console.log("GENELCO:", JSON.stringify(genelco));
    console.log("OBSERVACIONES:", JSON.stringify(observaciones));
    console.log("----------------------------------------");

    // ========================================
    // VALIDAR ESTADO
    // ========================================

    if (!estado) {
        console.error("EL ESTADO ESTÁ VACÍO");
        toast("Seleccione un estado para la reserva.");
        return;
    }

    // ========================================
    // VALIDAR ASIGNACIÓN (mismas reglas que reclamos)
    // ========================================

    if (asignado !== (campoAsignado.dataset.actual || "")) {
        const motivo = motivoNoAsignable(asignado, { permitirSinAsignar: true });
        if (motivo) {
            toast(motivo);
            return;
        }
    }

    // ========================================
    // PAYLOAD
    // ========================================

    const datos = {
        estado: estado,
        asignado_a: asignado || null,
        genelco: genelco || null,
        observaciones_internas: observaciones
    };

    console.log(">>> DATOS QUE SE ENVIARÁN AL REPOSITORY <<<");
    console.log(datos);

    // ========================================
    // ACTUALIZAR SUPABASE
    // ========================================

    try {

        const resultado = await ReservasRepository.actualizarGestion(
            id,
            datos
        );

        console.log(">>> RESULTADO ACTUALIZACIÓN <<<");
        console.log(resultado);

        toast("Gestión de la reserva actualizada correctamente.");

        // ========================================
        // RECARGAR DETALLE
        // ========================================

        await abrirReserva(id);

    } catch (error) {

        console.error(
            "ERROR GUARDANDO GESTIÓN DE RESERVA:",
            error
        );

        toast(`${i18nT("No fue posible actualizar la gestión de la reserva.")} ${motivoError(error)}`.trim());
    }
}

/* ===========================================
   GUARDAR OBSERVACIÓN
=========================================== */

async function guardarObservacionReserva(id) {

    const permisos = permiso();

    if (!permisos?.editReserva) {

        toast(
            "No tiene permisos para editar esta reserva."
        );

        return;
    }


    const observacion =
        document.getElementById(
            "reserva-observaciones"
        )?.value || "";


    try {

        await ReservasRepository.guardarObservacion(
            id,
            observacion
        );


        toast(
            "Observación guardada correctamente."
        );


        await abrirReserva(id);

    }

    catch (error) {

        console.error(
            "Error guardando observación:",
            error
        );

        toast(
            "No fue posible guardar la observación."
        );
    }
}


/* ===========================================
   ARCHIVAR RESERVA
=========================================== */

async function confirmarArchivadoReserva(id) {

    const permisos = permiso();

    if (!permisos?.editReserva) {

        toast(
            "No tiene permisos para archivar esta reserva."
        );

        return;
    }


    const confirmar =
        window.confirm(
            i18nT("¿Está seguro de que desea archivar esta reserva?")
        );


    if (!confirmar)
        return;


    try {

        await ReservasRepository.archivar(id);


        toast(
            "Reserva archivada correctamente."
        );


        /*
         * Regresamos a la bandeja de reservas.
         */

        tab("reservas");


        await cargarReservas();

    }

    catch (error) {

        console.error(
            "Error archivando reserva:",
            error
        );

        toast(
            "No fue posible archivar la reserva."
        );
    }
}


/* ===========================================
   EXPORTAR
=========================================== */

window.abrirReserva =
    abrirReserva;

window.guardarGestionReserva =
    guardarGestionReserva;

window.guardarObservacionReserva =
    guardarObservacionReserva;

window.confirmarArchivadoReserva =
    confirmarArchivadoReserva;



/* ===========================================
   UTILIDADES
=========================================== */

function formatearFechaReserva(fecha) {

    if (!fecha)
        return "-";

    const valor =
        String(fecha)
            .slice(0, 10);

    const partes =
        valor.split("-");

    if (partes.length !== 3)
        return valor;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function estadoReservaClase(estado) {

    return String(
        estado || "sin-estado"
    )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-");

}

/* ===========================================
   IMPORTACIÓN DE RESERVAS
   <<--- </gishikoDev_> --->
=========================================== */

let importacionReservasActual = null;

function normalizarEncabezadoReserva(valor) {

    return String(valor || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]+/g,
            "_"
        )
        .replace(
            /^_|_$/g,
            ""
        );
}


/* ===========================================
   MAPA DE COLUMNAS DE IMPORTACIÓN
=========================================== */

const MAPA_COLUMNAS_RESERVA = {

    num: [
        "num",
        "numero",
        "numero_reserva",
        "radicado"
    ],

    linea: [
        "linea",
        "linea_negocio"
    ],

    producto: [
        "producto"
    ],

    nombre: [
        "nombre",
        "asegurado",
        "nombre_asegurado"
    ],

    cedula: [
        "cedula",
        "identificacion"
    ],

    email: [
        "email",
        "correo",
        "correo_electronico"
    ],

    tel: [
        "tel",
        "telefono",
        "celular"
    ],

    poliza: [
        "poliza",
        "numero_poliza"
    ],

    perfil_presenta: [
        "perfil_presenta",
        "perfil",
        "presentado_por"
    ],

    hospital: [
        "hospital"
    ],

    corredora: [
        "corredora",
        "corredor"
    ],

    origen: [
        "origen"
    ],

    fecha_evento: [
        "fecha_evento",
        "fecha_del_evento"
    ],

    monto: [
        "monto",
        "monto_reserva"
    ],

    proveedor: [
        "proveedor"
    ],

    descripcion: [
        "descripcion",
        "detalle"
    ],

    estado: [
        "estado"
    ],

    genelco: [
        "genelco"
    ],

    asignado_a: [
        "asignado_a",
        "asignado"
    ],

    docs_count: [
        "docs_count",
        "documentos"
    ],

    recibido_en: [
        "recibido_en",
        "fecha_recibido",
        "recibido"
    ],

    resuelto_en: [
        "resuelto_en",
        "fecha_resuelto"
    ],

    creado_en: [
        "creado_en"
    ],

    actualizado_en: [
        "actualizado_en"
    ],

    servicio: [
        "servicio"
    ],

    creado_por: [
        "creado_por"
    ],

    observaciones_internas: [
        "observaciones_internas",
        "observaciones"
    ],

    archivado: [
        "archivado"
    ]

};

function obtenerCampoReserva(
    fila,
    campo
) {

    const filaNormalizada = {};


    Object.entries(fila)
        .forEach(([clave, valor]) => {

            filaNormalizada[
                normalizarEncabezadoReserva(clave)
            ] = valor;

        });


    const aliases =
        MAPA_COLUMNAS_RESERVA[campo] || [];


    for (const alias of aliases) {

        if (
            filaNormalizada[alias] !== undefined
        ) {

            return filaNormalizada[alias];

        }

    }


    return null;
}

function normalizarFechaReserva(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;
    }


    if (
        typeof valor === "number" &&
        typeof XLSX !== "undefined"
    ) {

        const fecha =
            XLSX.SSF.parse_date_code(valor);


        if (fecha) {

            return [
                fecha.y,
                String(fecha.m)
                    .padStart(2, "0"),
                String(fecha.d)
                    .padStart(2, "0")
            ].join("-");

        }

    }


    const texto =
        String(valor).trim();


    if (
        /^\d{4}-\d{2}-\d{2}/.test(texto)
    ) {

        return texto.slice(0, 10);

    }


    const partes =
        texto.split(/[\/\-]/);


    if (partes.length === 3) {

        const [
            primero,
            segundo,
            tercero
        ] = partes;


        if (tercero.length === 4) {

            return [
                tercero,
                segundo.padStart(2, "0"),
                primero.padStart(2, "0")
            ].join("-");

        }

    }


    return null;
}

function normalizarMontoReserva(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;
    }


    if (typeof valor === "number") {

        return valor;

    }


    let texto =
        String(valor)
            .trim()
            .replace(/\s/g, "")
            .replace(/[B/$]/gi, "");


    if (
        texto.includes(",") &&
        texto.includes(".")
    ) {

        texto =
            texto.replace(/,/g, "");

    } else {

        texto =
            texto.replace(",", ".");

    }


    const numero =
        Number(texto);


    return Number.isFinite(numero)
        ? numero
        : null;
}

function normalizarFilaReserva(
    fila,
    batchId,
    nombreArchivo
) {

    const ahora =
        new Date().toISOString();


    const archivadoRaw =
        obtenerCampoReserva(
            fila,
            "archivado"
        );


    const archivado =
        archivadoRaw === true ||
        String(archivadoRaw)
            .toLowerCase() === "true" ||
        String(archivadoRaw)
            .toLowerCase() === "si" ||
        String(archivadoRaw)
            .toLowerCase() === "sí";


    return {

        num:
            String(
                obtenerCampoReserva(
                    fila,
                    "num"
                ) || ""
            ).trim(),

        linea:
    String(
        obtenerCampoReserva(
            fila,
            "linea"
        ) || ""
    )
        .trim()
        .toUpperCase() || null,

        producto:
            obtenerCampoReserva(
                fila,
                "producto"
            ) || null,

        nombre:
            obtenerCampoReserva(
                fila,
                "nombre"
            ) || null,

        cedula:
            obtenerCampoReserva(
                fila,
                "cedula"
            ) || null,

        email:
            obtenerCampoReserva(
                fila,
                "email"
            ) || null,

        tel:
            obtenerCampoReserva(
                fila,
                "tel"
            ) || null,

        poliza:
            obtenerCampoReserva(
                fila,
                "poliza"
            ) || null,

        perfil_presenta:
            obtenerCampoReserva(
                fila,
                "perfil_presenta"
            ) || "asegurado",

        hospital:
            obtenerCampoReserva(
                fila,
                "hospital"
            ) || null,

        corredora:
            obtenerCampoReserva(
                fila,
                "corredora"
            ) || null,

        origen:
            obtenerCampoReserva(
                fila,
                "origen"
            ) || "Importado (Excel/CSV)",

        fecha_evento:
            normalizarFechaReserva(
                obtenerCampoReserva(
                    fila,
                    "fecha_evento"
                )
            ),

        monto:
            normalizarMontoReserva(
                obtenerCampoReserva(
                    fila,
                    "monto"
                )
            ),

        proveedor:
            obtenerCampoReserva(
                fila,
                "proveedor"
            ) || null,

        descripcion:
            obtenerCampoReserva(
                fila,
                "descripcion"
            ) || null,

        estado:
            obtenerCampoReserva(
                fila,
                "estado"
            ) || "Recibido",

        genelco:
            obtenerCampoReserva(
                fila,
                "genelco"
            ) || null,

        // La columna guarda el id del usuario; el archivo puede traer nombre, correo o id.
        asignado_a:
            resolverAsignado(
                obtenerCampoReserva(
                    fila,
                    "asignado_a"
                )
            ),

        docs_count:
            Number(
                obtenerCampoReserva(
                    fila,
                    "docs_count"
                ) || 0
            ),

        recibido_en:
            normalizarFechaReserva(
                obtenerCampoReserva(
                    fila,
                    "recibido_en"
                )
            ) ||
            new Date()
                .toISOString()
                .slice(0, 10),

        resuelto_en:
            normalizarFechaReserva(
                obtenerCampoReserva(
                    fila,
                    "resuelto_en"
                )
            ),

        creado_en:
            obtenerCampoReserva(
                fila,
                "creado_en"
            ) || null,

        actualizado_en:
            ahora,

        servicio:
            obtenerCampoReserva(
                fila,
                "servicio"
            ) || null,

        creado_por:
            obtenerCampoReserva(
                fila,
                "creado_por"
            ) || null,

        observaciones_internas:
            obtenerCampoReserva(
                fila,
                "observaciones_internas"
            ) || null,

        archivado:
            archivado,

        /*
         * TRAZABILIDAD
         *
         * Estos campos los dejamos preparados.
         * Solo se enviarán si existen realmente
         * en tu tabla actual.
         */
        import_batch:
            batchId,

        imported_at:
            ahora,

        original_source:
            nombreArchivo

    };
}

function normalizarFilaReserva(
    fila,
    batchId,
    nombreArchivo
) {

    const ahora =
        new Date().toISOString();


    const archivadoRaw =
        obtenerCampoReserva(
            fila,
            "archivado"
        );


    const archivado =
        archivadoRaw === true ||
        String(archivadoRaw)
            .toLowerCase() === "true" ||
        String(archivadoRaw)
            .toLowerCase() === "si" ||
        String(archivadoRaw)
            .toLowerCase() === "sí";


    return {

        num:
            String(
                obtenerCampoReserva(
                    fila,
                    "num"
                ) || ""
            ).trim(),

        linea:
            obtenerCampoReserva(
                fila,
                "linea"
            ) || null,

        producto:
            obtenerCampoReserva(
                fila,
                "producto"
            ) || null,

        nombre:
            obtenerCampoReserva(
                fila,
                "nombre"
            ) || null,

        cedula:
            obtenerCampoReserva(
                fila,
                "cedula"
            ) || null,

        email:
            obtenerCampoReserva(
                fila,
                "email"
            ) || null,

        tel:
            obtenerCampoReserva(
                fila,
                "tel"
            ) || null,

        poliza:
            obtenerCampoReserva(
                fila,
                "poliza"
            ) || null,

        perfil_presenta:
            obtenerCampoReserva(
                fila,
                "perfil_presenta"
            ) || "asegurado",

        hospital:
            obtenerCampoReserva(
                fila,
                "hospital"
            ) || null,

        corredora:
            obtenerCampoReserva(
                fila,
                "corredora"
            ) || null,

        origen:
            obtenerCampoReserva(
                fila,
                "origen"
            ) || "Importado (Excel/CSV)",

        fecha_evento:
            normalizarFechaReserva(
                obtenerCampoReserva(
                    fila,
                    "fecha_evento"
                )
            ),

        monto:
            normalizarMontoReserva(
                obtenerCampoReserva(
                    fila,
                    "monto"
                )
            ),

        proveedor:
            obtenerCampoReserva(
                fila,
                "proveedor"
            ) || null,

        descripcion:
            obtenerCampoReserva(
                fila,
                "descripcion"
            ) || null,

        estado:
            obtenerCampoReserva(
                fila,
                "estado"
            ) || "Recibido",

        genelco:
            obtenerCampoReserva(
                fila,
                "genelco"
            ) || null,

        // La columna guarda el id del usuario; el archivo puede traer nombre, correo o id.
        asignado_a:
            resolverAsignado(
                obtenerCampoReserva(
                    fila,
                    "asignado_a"
                )
            ),

        docs_count:
            Number(
                obtenerCampoReserva(
                    fila,
                    "docs_count"
                ) || 0
            ),

        recibido_en:
            normalizarFechaReserva(
                obtenerCampoReserva(
                    fila,
                    "recibido_en"
                )
            ) ||
            new Date()
                .toISOString()
                .slice(0, 10),

        resuelto_en:
            normalizarFechaReserva(
                obtenerCampoReserva(
                    fila,
                    "resuelto_en"
                )
            ),

        creado_en:
            obtenerCampoReserva(
                fila,
                "creado_en"
            ) || null,

        actualizado_en:
            ahora,

        servicio:
            obtenerCampoReserva(
                fila,
                "servicio"
            ) || null,

        creado_por:
            obtenerCampoReserva(
                fila,
                "creado_por"
            ) || null,

        observaciones_internas:
            obtenerCampoReserva(
                fila,
                "observaciones_internas"
            ) || null,

        archivado:
            archivado,

        /*
         * TRAZABILIDAD
         *
         * Estos campos los dejamos preparados.
         * Solo se enviarán si existen realmente
         * en tu tabla actual.
         */
        import_batch:
            batchId,

        imported_at:
            ahora,

        original_source:
            nombreArchivo

    };
}

function validarFilaReserva(
    reserva,
    numeroFila
) {

    const errores = [];


    /* ===========================================
       NÚMERO DE RESERVA
    =========================================== */

    if (!reserva.num) {

        errores.push(
            "Número de reserva vacío"
        );
    }


    /* ===========================================
       ASEGURADO
    =========================================== */

    if (!reserva.nombre) {

        errores.push(
            "Asegurado vacío"
        );
    }


    /* ===========================================
       PÓLIZA
    =========================================== */

    if (!reserva.poliza) {

        errores.push(
            "Póliza vacía"
        );
    }


    /* ===========================================
       MONTO
    =========================================== */

    if (
        reserva.monto === null ||
        reserva.monto === undefined ||
        !Number.isFinite(reserva.monto)
    ) {

        errores.push(
            "Monto inválido"
        );
    }


    /* ===========================================
       LÍNEA
       
       Constraint actual de Supabase:
       SC / SI
    =========================================== */

    const lineasPermitidas = [
        "SC",
        "SI"
    ];

    const linea =
        String(
            reserva.linea || ""
        )
            .trim()
            .toUpperCase();


    if (!linea) {

        errores.push(
            "Línea vacía"
        );

    } else if (
        !lineasPermitidas.includes(linea)
    ) {

        errores.push(
            `Línea inválida: ${reserva.linea}. Permitidas: ${lineasPermitidas.join(", ")}`
        );
    }


    /* ===========================================
       ESTADO
       
       Constraint actual de Supabase:
       Recibido
       En Proceso
       Resuelto
       Rechazado
       Anulado
    =========================================== */

    const estadosPermitidos = [
        "Recibido",
        "En Proceso",
        "Resuelto",
        "Rechazado",
        "Anulado"
    ];

    const estado =
        String(
            reserva.estado || ""
        ).trim();


    if (!estado) {

        errores.push(
            "Estado vacío"
        );

    } else if (
        !estadosPermitidos.includes(estado)
    ) {

        errores.push(
            `Estado inválido: ${estado}. Permitidos: ${estadosPermitidos.join(", ")}`
        );
    }


    /* ===========================================
       DOCUMENTOS
    =========================================== */

    if (
        reserva.docs_count !== null &&
        reserva.docs_count !== undefined &&
        (
            !Number.isFinite(
                Number(reserva.docs_count)
            ) ||
            Number(reserva.docs_count) < 0
        )
    ) {

        errores.push(
            "Cantidad de documentos inválida"
        );
    }


    /* ===========================================
       FECHA DEL EVENTO
       
       Si viene informada debe haber podido
       normalizarse correctamente.
    =========================================== */

    if (
        reserva.fecha_evento !== null &&
        reserva.fecha_evento !== undefined &&
        reserva.fecha_evento !== "" &&
        !/^\d{4}-\d{2}-\d{2}$/.test(
            String(reserva.fecha_evento)
        )
    ) {

        errores.push(
            "Fecha del evento inválida"
        );
    }


    /* ===========================================
       FECHA RECIBIDO
    =========================================== */

    if (
        reserva.recibido_en &&
        !/^\d{4}-\d{2}-\d{2}$/.test(
            String(reserva.recibido_en)
                .slice(0, 10)
        )
    ) {

        errores.push(
            "Fecha de recibido inválida"
        );
    }


    /* ===========================================
       EMAIL
       
       No es obligatorio, pero si existe
       validamos una estructura básica.
    =========================================== */

    if (
        reserva.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            String(reserva.email).trim()
        )
    ) {

        errores.push(
            "Correo electrónico inválido"
        );
    }


    /* ===========================================
       RESULTADO
    =========================================== */

    return {

        valida:
            errores.length === 0,

        fila:
            numeroFila,

        errores:
            errores

    };
}

async function seleccionarArchivoReservas(
    input
) {

    const archivo =
        input.files?.[0];


    if (!archivo) {
        return;
    }


    try {

        if (
            typeof XLSX === "undefined"
        ) {

            throw new Error(
                "La librería XLSX no está disponible."
            );

        }


        const buffer =
            await archivo.arrayBuffer();


        const workbook =
            XLSX.read(
                buffer,
                {
                    type: "array",
                    cellDates: false
                }
            );


        const nombreHoja =
            workbook.SheetNames[0];


        const worksheet =
            workbook.Sheets[nombreHoja];


        const filas =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    defval: null,
                    raw: true
                }
            );


        await prepararImportacionReservas(
            filas,
            archivo
        );


    } catch (error) {

        console.error(
            "ERROR LEYENDO ARCHIVO DE RESERVAS:",
            error
        );


        toast(
            "No fue posible procesar el archivo."
        );


        input.value = "";

    }

}

async function prepararImportacionReservas(
    filas,
    archivo
) {

    if (!filas.length) {

        toast(
            "El archivo no contiene registros."
        );

        return;
    }


    const batchId =
        "RES_" +
        new Date()
            .toISOString()
            .replace(
                /[-:.TZ]/g,
                ""
            )
            .slice(0, 14);


    const procesadas =
        filas.map(
            (fila, index) => {

                const reserva =
                    normalizarFilaReserva(
                        fila,
                        batchId,
                        archivo.name
                    );


                const validacion =
                    validarFilaReserva(
                        reserva,
                        index + 2
                    );


                return {

                    reserva,
                    numeroFila:
                        index + 2,

                    errores:
                        validacion.errores,

                    valida:
                        validacion.valida,

                    duplicada:
                        false

                };

            }
        );
        


    const numerosValidos =
        procesadas
            .filter(
                item =>
                    item.valida &&
                    item.reserva.num
            )
            .map(
                item =>
                    item.reserva.num
            );


    const existentes =
        await ReservasRepository
            .obtenerNumerosExistentes(
                numerosValidos
            );


    const setExistentes =
        new Set(existentes);


    procesadas.forEach(item => {

        item.duplicada =
            setExistentes.has(
                item.reserva.num
            );

    });


    importacionReservasActual = {

    archivo:
        archivo.name,

    batchId,

    filas:
        procesadas

};


/* ===========================================
   PINTAR PREVIEW ANTES DE MOSTRAR EL MODAL
=========================================== */

pintarPreviewImportacionReservas();


/* ===========================================
   MOSTRAR MODAL
=========================================== */

document
    .getElementById(
        "modal-importar-reservas"
    )
    ?.classList
    .add("ver");

}

function pintarPreviewImportacionReservas() {

    console.log(
        ">>> PINTANDO PREVIEW IMPORTACIÓN <<<"
    );

    console.log(
        "importacionReservasActual:",
        importacionReservasActual
    );


    if (!importacionReservasActual) {

        console.error(
            "ERROR: importacionReservasActual no existe."
        );

        return;
    }


    if (
        !Array.isArray(
            importacionReservasActual.filas
        )
    ) {

        console.error(
            "ERROR: importacionReservasActual.filas no es un array.",
            importacionReservasActual.filas
        );

        return;
    }


    const filas =
        importacionReservasActual.filas;


    console.log(
        "FILAS PARA PREVIEW:",
        filas
    );


    const validas =
        filas.filter(
            item =>
                item.valida === true &&
                item.duplicada !== true
        );


    const duplicadas =
        filas.filter(
            item =>
                item.duplicada === true
        );


    const invalidas =
        filas.filter(
            item =>
                item.valida !== true
        );


    console.log(
        "NUEVAS:",
        validas.length
    );

    console.log(
        "DUPLICADAS:",
        duplicadas.length
    );

    console.log(
        "INVÁLIDAS:",
        invalidas.length
    );


    const resumen =
        document.getElementById(
            "reservas-import-resumen"
        );


    const preview =
        document.getElementById(
            "reservas-import-preview"
        );


    const boton =
        document.getElementById(
            "btn-confirmar-importacion-reservas"
        );


    console.log(
        "RESUMEN:",
        resumen
    );

    console.log(
        "PREVIEW:",
        preview
    );

    console.log(
        "BOTÓN:",
        boton
    );


    if (!resumen) {

        console.error(
            "No existe #reservas-import-resumen"
        );

        return;
    }


    if (!preview) {

        console.error(
            "No existe #reservas-import-preview"
        );

        return;
    }


    /* =========================================
       RESUMEN
    ========================================= */

    resumen.innerHTML = `

        <div
            style="
                padding: 14px;
                border: 1px solid var(--border-subtle);
                border-radius: 10px;
            "
        >

            <strong>
                ${importacionReservasActual.archivo || "Archivo"}
            </strong>

            <div
                style="
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    margin-top: 12px;
                "
            >

                <span>
                    <span class=ico data-icon=documento aria-hidden=true></span>
                    <strong>${filas.length}</strong>
                    registros
                </span>

                <span>
                    <span class=ico data-icon=ok aria-hidden=true></span>
                    <strong>${validas.length}</strong>
                    nuevos
                </span>

                <span>
                    <span class=ico data-icon=deshacer aria-hidden=true></span>
                    <strong>${duplicadas.length}</strong>
                    existentes
                </span>

                <span>
                    <span class=ico data-icon=error aria-hidden=true></span>
                    <strong>${invalidas.length}</strong>
                    inválidos
                </span>

            </div>

        </div>
    `;


    /* =========================================
       PREVIEW
    ========================================= */

    const muestra =
        filas.slice(0, 20);


    preview.innerHTML = `

        <table
            style="
                width: 100%;
                border-collapse: collapse;
            "
        >

            <thead>

                <tr>

                    <th>Fila</th>

                    <th>Número</th>

                    <th>Asegurado</th>

                    <th>Póliza</th>

                    <th>Monto</th>

                    <th>Estado</th>

                    <th>Resultado</th>

                </tr>

            </thead>


            <tbody>

                ${muestra.map(
                    item => {

                        const reserva =
                            item.reserva || {};


                        let resultado =
                            "<span class=ico data-icon=ok aria-hidden=true></span> Nuevo";


                        if (
                            item.duplicada === true
                        ) {

                            resultado =
                                "<span class=ico data-icon=deshacer aria-hidden=true></span> Ya existe";

                        }


                        if (
                            item.valida !== true
                        ) {

                            resultado =
                                "<span class=ico data-icon=error aria-hidden=true></span> " +
                                (
                                    item.errores || []
                                ).join(", ");

                        }


                        return `

                            <tr>

                                <td>
                                    ${
                                        item.numeroFila ??
                                        "—"
                                    }
                                </td>

                                <td>
                                    ${
                                        reserva.num ||
                                        "—"
                                    }
                                </td>

                                <td>
                                    ${
                                        reserva.nombre ||
                                        "—"
                                    }
                                </td>

                                <td>
                                    ${
                                        reserva.poliza ||
                                        "—"
                                    }
                                </td>

                                <td>
                                    ${
                                        reserva.monto ??
                                        "—"
                                    }
                                </td>

                                <td>
                                    ${
                                        reserva.estado ||
                                        "—"
                                    }
                                </td>

                                <td>
                                    ${resultado}
                                </td>

                            </tr>
                        `;

                    }
                ).join("")}

            </tbody>

        </table>


        ${
            filas.length > 20

                ? `

                    <p class="ayuda">

                        Mostrando los primeros
                        20 registros de
                        ${filas.length}.

                    </p>

                `

                : ""
        }
    `;


    /* =========================================
       BOTÓN
    ========================================= */

    if (boton) {

        boton.disabled =
            validas.length === 0;


        boton.textContent =
            `Importar ${validas.length} reservas`;

    }


    console.log(
        ">>> PREVIEW PINTADO CORRECTAMENTE <<<"
    );

}

async function confirmarImportacionReservas() {

    if (!importacionReservasActual) {
        return;
    }


    const nuevas =
        importacionReservasActual
            .filas
            .filter(
                item =>
                    item.valida &&
                    !item.duplicada
            )
            .map(
                item =>
                    item.reserva
            );


    if (!nuevas.length) {

        toast(
            "No hay reservas nuevas para importar."
        );

        return;
    }


    const boton =
        document.getElementById(
            "btn-confirmar-importacion-reservas"
        );


    try {

        if (boton) {

            boton.disabled = true;

            boton.textContent =
                "Importando...";

        }


        console.log(
            ">>> IMPORTANDO RESERVAS <<<"
        );

        console.log(
            "TOTAL:",
            nuevas.length
        );


        const insertadas =
            await ReservasRepository
                .insertarLote(
                    nuevas
                );


        console.log(
            "RESERVAS INSERTADAS:",
            insertadas
        );


        cerrarModalImportarReservas();


        toast(
            `${insertadas.length} reservas importadas correctamente.`
        );


        await cargarReservas();


    } catch (error) {

        console.error(
            "ERROR IMPORTANDO RESERVAS:",
            error
        );


        toast(
            "No fue posible completar la importación."
        );


        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "Reintentar importación";

        }

    }

}
function cerrarModalImportarReservas() {

    document
        .getElementById(
            "modal-importar-reservas"
        )
        ?.classList
        .remove("ver");


    const input =
        document.getElementById(
            "archivo-importar-reservas"
        );


    if (input) {
        input.value = "";
    }


    importacionReservasActual = null;
}

/* ===========================================
   REPORTE DE RESERVAS
=========================================== */

function abrirModalReporteReservas() {

    document
        .getElementById(
            "modal-reporte-reservas"
        )
        ?.classList
        .add("ver");

}


function cerrarModalReporteReservas() {

    document
        .getElementById(
            "modal-reporte-reservas"
        )
        ?.classList
        .remove("ver");

}

function prepararDatosReporteReservas(
    datos
) {

    return datos.map(
        r => ({

            "Número":
                r.num,

            "Línea":
                r.linea,

            "Producto":
                r.producto,

            "Asegurado":
                r.nombre,

            "Cédula":
                r.cedula,

            "Correo":
                r.email,

            "Teléfono":
                r.tel,

            "Póliza":
                r.poliza,

            "Perfil presenta":
                r.perfil_presenta,

            "Hospital":
                r.hospital,

            "Corredora":
                r.corredora,

            "Origen":
                r.origen,

            "Fecha evento":
                r.fecha_evento,

            "Monto":
                r.monto,

            "Proveedor":
                r.proveedor,

            "Descripción":
                r.descripcion,

            "Estado":
                r.estado,

            "Genelco":
                r.genelco,

            "Asignado a":
                nombreAsignado(r.asignado_a),

            "Documentos":
                r.docs_count,

            "Recibido":
                r.recibido_en,

            "Resuelto":
                r.resuelto_en,

            "Creado":
                r.creado_en,

            "Actualizado":
                r.actualizado_en,

            "Servicio":
                r.servicio,

            "Creado por":
                r.creado_por,

            "Observaciones internas":
                r.observaciones_internas,

            "Archivado":
                r.archivado
                    ? "Sí"
                    : "No",

            "Lote importación":
                r.import_batch,

            "Fecha importación":
                r.imported_at,

            "Archivo origen":
                r.original_source

        })
    );
}

function prepararDatosReporteReservas(
    datos
) {

    return datos.map(
        r => ({

            "Número":
                r.num,

            "Línea":
                r.linea,

            "Producto":
                r.producto,

            "Asegurado":
                r.nombre,

            "Cédula":
                r.cedula,

            "Correo":
                r.email,

            "Teléfono":
                r.tel,

            "Póliza":
                r.poliza,

            "Perfil presenta":
                r.perfil_presenta,

            "Hospital":
                r.hospital,

            "Corredora":
                r.corredora,

            "Origen":
                r.origen,

            "Fecha evento":
                r.fecha_evento,

            "Monto":
                r.monto,

            "Proveedor":
                r.proveedor,

            "Descripción":
                r.descripcion,

            "Estado":
                r.estado,

            "Genelco":
                r.genelco,

            "Asignado a":
                nombreAsignado(r.asignado_a),

            "Documentos":
                r.docs_count,

            "Recibido":
                r.recibido_en,

            "Resuelto":
                r.resuelto_en,

            "Creado":
                r.creado_en,

            "Actualizado":
                r.actualizado_en,

            "Servicio":
                r.servicio,

            "Creado por":
                r.creado_por,

            "Observaciones internas":
                r.observaciones_internas,

            "Archivado":
                r.archivado
                    ? "Sí"
                    : "No",

            "Lote importación":
                r.import_batch,

            "Fecha importación":
                r.imported_at,

            "Archivo origen":
                r.original_source

        })
    );
}

function exportarReservasExcel(
    datos
) {

    const reporte =
        prepararDatosReporteReservas(
            datos
        );


    const workbook =
        XLSX.utils.book_new();


    const hojaReservas =
        XLSX.utils.json_to_sheet(
            reporte
        );


    XLSX.utils.book_append_sheet(
        workbook,
        hojaReservas,
        "Reservas"
    );


    const estados = {};


    let montoTotal = 0;


    datos.forEach(r => {

        const estado =
            r.estado || "Sin estado";


        estados[estado] =
            (estados[estado] || 0) + 1;


        montoTotal +=
            Number(r.monto) || 0;

    });


    const resumen = [

        [
            "Indicador",
            "Valor"
        ],

        [
            "Total reservas",
            datos.length
        ],

        [
            "Monto total",
            montoTotal
        ],

        [
            "Fecha del reporte",
            new Date().toLocaleString()
        ],

        [],

        [
            "Estado",
            "Cantidad"
        ],

        ...Object.entries(estados)

    ];


    const hojaResumen =
        XLSX.utils.aoa_to_sheet(
            resumen
        );


    XLSX.utils.book_append_sheet(
        workbook,
        hojaResumen,
        "Resumen"
    );


    const fecha =
        new Date()
            .toISOString()
            .slice(0, 10);


    XLSX.writeFile(
        workbook,
        `Reservas_Dovela_${fecha}.xlsx`
    );
}

async function descargarReporteReservas() {

    try {

        const formato =
            document.getElementById(
                "formato-reporte-reservas"
            )?.value || "xlsx";


        toast(
            "Preparando reporte de reservas..."
        );


        /*
         * IMPORTANTE:
         * consultamos nuevamente Supabase.
         *
         * No exportamos simplemente lo que
         * esté visible en la tabla HTML.
         */
        const datos =
            await ReservasRepository
                .obtenerTodos();


        if (!datos.length) {

            toast(
                "No existen reservas para exportar."
            );

            return;
        }


        if (formato === "csv") {

            exportarReservasCSV(
                datos
            );

        } else {

            exportarReservasExcel(
                datos
            );

        }


        cerrarModalReporteReservas();


        toast(
            `Reporte generado: ${datos.length} reservas.`
        );


    } catch (error) {

        console.error(
            "ERROR GENERANDO REPORTE DE RESERVAS:",
            error
        );


        toast(
            "No fue posible generar el reporte."
        );

    }

}

function descargarPlantillaReservas() {

    const columnas = [{

        Numero: "",
        Linea: "",
        Producto: "",
        Asegurado: "",
        Cedula: "",
        Correo: "",
        Telefono: "",
        Poliza: "",
        PerfilPresenta: "asegurado",
        Hospital: "",
        Corredora: "",
        Origen: "Importado (Excel)",
        FechaEvento: "",
        Monto: "",
        Proveedor: "",
        Descripcion: "",
        Estado: "Recibido",
        Genelco: "",
        AsignadoA: "",
        RecibidoEn: "",
        Servicio: "M"

    }];


    const worksheet =
        XLSX.utils.json_to_sheet(
            columnas
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Reservas"
    );


    XLSX.writeFile(
        workbook,
        "Plantilla_Importacion_Reservas.xlsx"
    );
}

// ============== Exportaciones <gishikoDev_> ==============
// =========================================================

window.cargarReservas =
    cargarReservas;

window.pintarReservas =
    pintarReservas;

window.abrirReserva =
    abrirReserva;

window.seleccionarArchivoReservas =
    seleccionarArchivoReservas;

window.confirmarImportacionReservas =
    confirmarImportacionReservas;

window.cerrarModalImportarReservas =
    cerrarModalImportarReservas;

window.descargarPlantillaReservas =
    descargarPlantillaReservas;

window.abrirModalReporteReservas =
    abrirModalReporteReservas;

window.cerrarModalReporteReservas =
    cerrarModalReporteReservas;

window.descargarReporteReservas =
    descargarReporteReservas;