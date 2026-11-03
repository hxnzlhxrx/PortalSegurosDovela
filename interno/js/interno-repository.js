/* ===========================================
 *
 *   REPOSITORY
 *
 *   Reclamos + Reservas
 *
 *   <<--- </gishikoDev_> --->
 *
 * =========================================== */

console.log("repository.js cargado");


/* ===========================================
 *
 *   RECLAMOS REPOSITORY
 *
 * =========================================== */

const ReclamosRepository = {

    /* -----------------------------------------
     * OBTENER TODOS LOS RECLAMOS ACTIVOS
     * ----------------------------------------- */

    async obtenerTodos() {

        const { data, error } =
            await db
                .from("reclamos")
                .select("*")
                .eq("archivado", false)
                .order("creado_en", {
                    ascending: false
                });

        if (error) {

            console.error(
                "Error obteniendo reclamos:",
                error
            );

            throw error;
        }

        return (data || []).map(normalizarProducto);
    },

    /* -----------------------------------------
 * OBTENER NÚMEROS DE RESERVA EXISTENTES
 * ----------------------------------------- */

async obtenerNumerosExistentes(numeros) {

    if (!Array.isArray(numeros) || !numeros.length) {
        return [];
    }

    const encontrados = [];

    const TAMANO_LOTE = 100;

    for (
        let i = 0;
        i < numeros.length;
        i += TAMANO_LOTE
    ) {

        const lote =
            numeros.slice(
                i,
                i + TAMANO_LOTE
            );

        const { data, error } =
            await db
                .from("reserva")
                .select("num")
                .in("num", lote);


        if (error) {

            console.error(
                "Error verificando reservas existentes:",
                error
            );

            throw error;
        }


        if (data) {

            encontrados.push(
                ...data.map(r => r.num)
            );

        }

    }


    return encontrados;
},

/* -----------------------------------------
 * INSERTAR RESERVAS EN LOTE
 * ----------------------------------------- */

async insertarLote(reservasNuevas) {

    if (
        !Array.isArray(reservasNuevas) ||
        !reservasNuevas.length
    ) {

        return [];

    }


    const insertadas = [];

    const TAMANO_LOTE = 100;


    for (
        let i = 0;
        i < reservasNuevas.length;
        i += TAMANO_LOTE
    ) {

        const lote =
            reservasNuevas.slice(
                i,
                i + TAMANO_LOTE
            );


        console.log(
            "INSERTANDO LOTE DE RESERVAS:",
            lote.length
        );


        const { data, error } =
            await db
                .from("reserva")
                .insert(lote)
                .select();


        if (error) {

    console.error(
        "ERROR INSERTANDO LOTE DE RESERVAS:"
    );

    console.error(
        "CODE:",
        error.code
    );

    console.error(
        "MESSAGE:",
        error.message
    );

    console.error(
        "DETAILS:",
        error.details
    );

    console.error(
        "HINT:",
        error.hint
    );

    console.error(
        "ERROR COMPLETO:",
        JSON.stringify(
            error,
            null,
            2
        )
    );

    console.error(
        "LOTE QUE GENERÓ EL ERROR:",
        lote
    );

    throw error;
}


        if (data) {

            insertadas.push(
                ...data
            );

        }

    }


    return insertadas;
}, 


    /* -----------------------------------------
     * OBTENER RECLAMO POR ID
     * ----------------------------------------- */

    async obtenerPorId(id) {

        const { data, error } =
            await db
                .from("reclamos")
                .select("*")
                .eq("id", id)
                .single();

        if (error) {

            console.error(
                "Error obteniendo reclamo:",
                error
            );

            return null;
        }

        return normalizarProducto(data);
    },


    /* -----------------------------------------
     * OBTENER DOCUMENTOS DEL RECLAMO
     * ----------------------------------------- */

    async obtenerDocumentos(reclamoId) {

        const { data, error } =
            await db
                .from("reclamos_documentos")
                .select("*")
                .eq("reclamo_id", reclamoId);

        if (error) {

            console.error(
                "Error obteniendo documentos del reclamo:",
                error
            );

            return [];
        }

        return data || [];
    },


    /* -----------------------------------------
     * ACTUALIZAR ESTADO
     * ----------------------------------------- */

    async actualizarEstado(id, estado) {

        const { data, error } =
            await db
                .from("reclamos")
                .update({
                    estado: estado,
                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error actualizando estado del reclamo:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * ACTUALIZAR GESTIÓN
     * (estado, montos y comentario visible)
     * ----------------------------------------- */

    async actualizarGestion(id, gestion) {

        const { data, error } =
            await db
                .from("reclamos")
                .update({
                    estado: gestion.estado,
                    monto_pagado: gestion.monto_pagado,
                    monto_deducible: gestion.monto_deducible,
                    motivo_estado:
                        gestion.motivo_estado || null,
                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error actualizando gestión del reclamo:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * HISTORIAL DE GESTIÓN
     * ----------------------------------------- */

    async obtenerHistorial(reclamoId) {

        const { data, error } =
            await db
                .from("reclamos_historial")
                .select("*")
                .eq("reclamo_id", reclamoId)
                .order("creado_en", {
                    ascending: false
                });

        if (error) {

            console.error(
                "Error obteniendo historial del reclamo:",
                error
            );

            throw error;
        }

        return data || [];
    },

    async registrarHistorial(entrada) {

        const { data, error } =
            await db
                .from("reclamos_historial")
                .insert({
                    reclamo_id: entrada.reclamo_id,
                    tipo: entrada.tipo,
                    usuario: entrada.usuario,
                    texto: entrada.texto || "",
                    adjuntos: entrada.adjuntos || []
                })
                .select()
                .single();

        if (error) {

            console.error(
                "Error registrando historial del reclamo:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * SUBIR CAPTURA DE OBSERVACIÓN
     * ----------------------------------------- */

    async subirAdjuntoObservacion(reclamoId, file) {

        const extension =
            ({
                "image/png": "png",
                "image/jpeg": "jpg",
                "image/webp": "webp",
                "image/gif": "gif"
            })[file.type] || "bin";

        const ruta =
            `observaciones/${reclamoId}/${crypto.randomUUID()}.${extension}`;

        const { error } =
            await db.storage
                .from("reclamos")
                .upload(
                    ruta,
                    file,
                    {
                        upsert: false,
                        contentType: file.type
                    }
                );

        if (error) {

            console.error(
                "Error subiendo captura de observación:",
                error
            );

            throw error;
        }

        return {
            ruta,
            nombre: file.name || `captura.${extension}`,
            tipo: file.type,
            tamano: file.size
        };
    },


    /* -----------------------------------------
     * GUARDAR OBSERVACIÓN
     * ----------------------------------------- */

    async guardarObservacion(
        id,
        observacion
    ) {

        const { data, error } =
            await db
                .from("reclamos")
                .update({
                    observaciones_internas:
                        observacion || null,
                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error guardando observación del reclamo:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * ACTUALIZAR ASIGNACIÓN
     * ----------------------------------------- */

    async actualizarAsignacion(
        id,
        asignado
    ) {

        const { data, error } =
            await db
                .from("reclamos")
                .update({
                    asignado_a:
                        asignado || null,
                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error actualizando asignación del reclamo:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * ARCHIVAR RECLAMO
     * ----------------------------------------- */

    async archivar(id) {

        const { data, error } =
            await db
                .from("reclamos")
                .update({
                    archivado: true,
                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error archivando reclamo:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * DESARCHIVAR RECLAMO
     * ----------------------------------------- */

    async desarchivar(id) {

        const { data, error } =
            await db
                .from("reclamos")
                .update({
                    archivado: false,
                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error desarchivando reclamo:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * OBTENER RECLAMOS ARCHIVADOS
     * ----------------------------------------- */

    async obtenerArchivados() {

        const { data, error } =
            await db
                .from("reclamos")
                .select("*")
                .eq("archivado", true)
                .order("creado_en", {
                    ascending: false
                });

        if (error) {

            console.error(
                "Error obteniendo reclamos archivados:",
                error
            );

            throw error;
        }

        return (data || []).map(normalizarProducto);
    }

};


/* ===========================================
 *
 *   PARÁMETROS OPERATIVOS (compartidos)
 *
 * =========================================== */

const ParametrosRepository = {

    async obtener(claves) {

        const { data, error } =
            await db
                .from("portal_parametros")
                .select("clave, valor")
                .in("clave", claves);

        if (error) {

            console.error(
                "Error obteniendo parámetros:",
                error
            );

            throw error;
        }

        return Object.fromEntries(
            (data || []).map(p => [p.clave, p.valor])
        );
    },

    async guardar(clave, valor, usuario) {

        const { error } =
            await db
                .from("portal_parametros")
                .upsert({
                    clave,
                    valor,
                    actualizado_por: usuario || null,
                    actualizado_en: new Date().toISOString()
                });

        if (error) {

            console.error(
                "Error guardando parámetro:",
                error
            );

            throw error;
        }
    }

};


/* ===========================================
 *
 *   AUTENTICACIÓN (Supabase Auth)
 *
 * =========================================== */

const COLUMNAS_USUARIO = "id, auth_id, nombre, email, rol, perfil, activo";

const AuthRepository = {

    async iniciarSesion(email, password) {

        const { data, error } =
            await db.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        return data.user;
    },

    async usuarioActual() {

        const { data, error } =
            await db.auth.getSession();

        if (error) {
            throw error;
        }

        return data.session?.user || null;
    },

    async cerrarSesion() {

        const { error } =
            await db.auth.signOut();

        if (error) {

            console.error(
                "Error cerrando sesión:",
                error
            );
        }
    },

    // Perfil del portal (rol, perfil de permisos, activo) de la cuenta autenticada.
    async obtenerPerfil(authId) {

        const { data, error } =
            await db
                .from("portal_usuarios")
                .select(COLUMNAS_USUARIO)
                .eq("auth_id", authId)
                .maybeSingle();

        if (error) {

            console.error(
                "Error obteniendo perfil:",
                error
            );

            throw error;
        }

        return data;
    },

    alCambiarSesion(callback) {
        return db.auth.onAuthStateChange(callback);
    }

};


/* ===========================================
 *
 *   USUARIOS DEL PORTAL (portal_usuarios)
 *
 * =========================================== */

const UsuariosRepository = {

    async obtenerTodos() {

        const { data, error } =
            await db
                .from("portal_usuarios")
                .select(COLUMNAS_USUARIO)
                .order("nombre", { ascending: true });

        if (error) {

            console.error(
                "Error obteniendo usuarios:",
                error
            );

            throw error;
        }

        return data || [];
    },

    // Crea el perfil; la cuenta de acceso se crea en Supabase Auth con el mismo correo
    // y se vincula automáticamente (trigger portal_vincular_cuenta).
    async crear({ nombre, email, rol, perfil }) {

        const { data, error } =
            await db
                .from("portal_usuarios")
                .insert({ nombre, email, rol, perfil, activo: true })
                .select(COLUMNAS_USUARIO)
                .single();

        if (error) {

            console.error(
                "Error creando usuario:",
                error
            );

            throw error;
        }

        return data;
    },

    async actualizar(id, cambios) {

        const { data, error } =
            await db
                .from("portal_usuarios")
                .update(cambios)
                .eq("id", id)
                .select(COLUMNAS_USUARIO)
                .single();

        if (error) {

            console.error(
                "Error actualizando usuario:",
                error
            );

            throw error;
        }

        return data;
    }

};


/* ===========================================
 *
 *   CMS DEL PORTAL PÚBLICO (banners)
 *
 * =========================================== */

const COLUMNAS_BANNER_BASE =
    "id, titulo, texto, boton, url, desde, hasta, activo, orden, actualizado_por, actualizado_en";
const COLUMNAS_BANNER = COLUMNAS_BANNER_BASE + ", traducciones";

// Falta la columna traducciones (2026-11-03-banners-traducciones.sql aún no se ejecutó):
// Postgres responde 42703 al leerla y PostgREST PGRST204 al escribirla.
function faltaColumnaTraducciones(error) {
    const texto = `${error?.message || ""} ${error?.details || ""}`;
    return (error?.code === "42703" || error?.code === "PGRST204") && texto.includes("traducciones");
}

const BannersRepository = {

    // false cuando la base todavía no tiene la columna de traducciones.
    conTraducciones: true,

    // Ejecuta la consulta con la columna de traducciones y, si la base aún no la tiene,
    // la repite sin ella para que el CMS siga funcionando.
    async conRespaldo(consulta, payload) {
        if (this.conTraducciones) {
            const resultado = await consulta(COLUMNAS_BANNER, payload);
            if (!resultado.error || !faltaColumnaTraducciones(resultado.error)) return resultado;
            console.warn("portal_banners.traducciones no existe; ejecute supabase/2026-11-03-banners-traducciones.sql.");
            this.conTraducciones = false;
        }
        const { traducciones, ...resto } = payload || {};
        return consulta(COLUMNAS_BANNER_BASE, payload ? resto : payload);
    },

    async obtenerTodos() {

        const { data, error } = await this.conRespaldo((columnas) =>
            db
                .from("portal_banners")
                .select(columnas)
                .order("orden", { ascending: true }));

        if (error) {

            console.error(
                "Error obteniendo banners:",
                error
            );

            throw error;
        }

        return data || [];
    },

    async crear(banner, usuario) {

        const { data, error } = await this.conRespaldo((columnas, fila) =>
            db
                .from("portal_banners")
                .insert(fila)
                .select(columnas)
                .single(),
            { ...banner, actualizado_por: usuario || null });

        if (error) {

            console.error(
                "Error creando banner:",
                error
            );

            throw error;
        }

        return data;
    },

    async actualizar(id, cambios, usuario) {

        const { data, error } = await this.conRespaldo((columnas, fila) =>
            db
                .from("portal_banners")
                .update(fila)
                .eq("id", id)
                .select(columnas)
                .single(),
            {
                ...cambios,
                actualizado_por: usuario || null,
                actualizado_en: new Date().toISOString()
            });

        if (error) {

            console.error(
                "Error actualizando banner:",
                error
            );

            throw error;
        }

        return data;
    },

    async eliminar(id) {

        const { data, error } =
            await db
                .from("portal_banners")
                .delete()
                .eq("id", id)
                .select("id");

        if (error) {

            console.error(
                "Error eliminando banner:",
                error
            );

            throw error;
        }

        // Con RLS, un borrado sin permiso no da error: afecta 0 filas.
        if (!data?.length) {
            throw new Error("No tiene permisos para eliminar este banner.");
        }
    }

};


/* ===========================================
 *
 *   RESERVAS REPOSITORY
 *
 * =========================================== */

const ReservasRepository = {

    /* -----------------------------------------
     * OBTENER TODAS LAS RESERVAS
     * ----------------------------------------- */

    async obtenerTodos() {

        const { data, error } =
            await db
                .from("reserva")
                .select("*")
                .order("recibido_en", {
                    ascending: false
                });

        if (error) {

            console.error(
                "Error obteniendo reservas:",
                error
            );

            throw error;
        }

        return data || [];
    },


    /* -----------------------------------------
     * OBTENER RESERVA POR ID
     * ----------------------------------------- */

    async obtenerPorId(id) {

        const { data, error } =
            await db
                .from("reserva")
                .select("*")
                .eq("id", id)
                .single();

        if (error) {

            console.error(
                "Error obteniendo reserva:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * ACTUALIZAR ESTADO
     * ----------------------------------------- */

    async actualizarEstado(
        id,
        estado
    ) {

        const { data, error } =
            await db
                .from("reserva")
                .update({
                    estado: estado,
                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error actualizando estado de reserva:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * ACTUALIZAR ASIGNACIÓN
     * ----------------------------------------- */

    async actualizarAsignacion(
        id,
        asignado
    ) {

        const { data, error } =
            await db
                .from("reserva")
                .update({
                    asignado_a:
                        asignado || null,

                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error actualizando asignación de reserva:",
                error
            );

            throw error;
        }

        return data;
    },


    /* ===========================================
       ACTUALIZAR GESTIÓN DE RESERVA
       <<--- </gishikoDev_> --->
    =========================================== */

    async actualizarGestion(
        id,
        datos
    ) {

        console.log(
            ">>> ACTUALIZANDO GESTIÓN DE RESERVA <<<"
        );

        console.log(
            "ID:",
            id
        );

        console.log(
            "DATOS RECIBIDOS:",
            datos
        );


        const payload = {

            estado:
                datos.estado || null,

            asignado_a:
                datos.asignado_a || null,

            genelco:
                datos.genelco || null,

            observaciones_internas:
                datos.observaciones_internas || null,

            actualizado_en:
                new Date().toISOString()
        };


        console.log(
            "PAYLOAD A ENVIAR:",
            payload
        );


        const { data, error } =
            await db
                .from("reserva")
                .update(payload)
                .eq("id", id)
                .select()
                .single();


        if (error) {

            console.error(
                "ERROR ACTUALIZANDO GESTIÓN DE RESERVA:",
                error
            );

            throw error;
        }


        console.log(
            "RESERVA ACTUALIZADA EN SUPABASE:",
            data
        );


        console.log(
            "ESTADO ANTES:",
            datos.estado
        );


        console.log(
            "ESTADO DESPUÉS:",
            data?.estado
        );


        return data;
    },


    /* -----------------------------------------
     * GUARDAR OBSERVACIÓN
     * ----------------------------------------- */

    async guardarObservacion(
        id,
        observacion
    ) {

        const { data, error } =
            await db
                .from("reserva")
                .update({

                    observaciones_internas:
                        observacion || null,

                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error guardando observación de reserva:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * ARCHIVAR RESERVA
     * ----------------------------------------- */

    async archivar(id) {

        const { data, error } =
            await db
                .from("reserva")
                .update({

                    archivado: true,

                    actualizado_en:
                        new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {

            console.error(
                "Error archivando reserva:",
                error
            );

            throw error;
        }

        return data;
    },


    /* -----------------------------------------
     * OBTENER RESERVAS ARCHIVADAS
     * ----------------------------------------- */

    async obtenerArchivados() {

        const { data, error } =
            await db
                .from("reserva")
                .select("*")
                .eq("archivado", true)
                .order("recibido_en", {
                    ascending: false
                });

        if (error) {

            console.error(
                "Error obteniendo reservas archivadas:",
                error
            );

            throw error;
        }

        return data || [];
    },


    /* ===========================================
       OBTENER NÚMEROS DE RESERVA EXISTENTES
       USADO POR IMPORTACIÓN EXCEL / CSV
       <<--- </gishikoDev_> --->
    =========================================== */

    async obtenerNumerosExistentes(
        numeros
    ) {

        if (
            !Array.isArray(numeros) ||
            !numeros.length
        ) {

            return [];
        }


        /*
         * Eliminamos duplicados del propio
         * archivo antes de consultar Supabase.
         */
        const numerosUnicos =
            [
                ...new Set(
                    numeros
                        .filter(Boolean)
                        .map(
                            numero =>
                                String(numero).trim()
                        )
                )
            ];


        if (!numerosUnicos.length) {

            return [];
        }


        const encontrados = [];

        const TAMANO_LOTE = 100;


        /*
         * Consultamos en bloques para evitar
         * una condición .in() demasiado grande.
         */
        for (
            let i = 0;
            i < numerosUnicos.length;
            i += TAMANO_LOTE
        ) {

            const lote =
                numerosUnicos.slice(
                    i,
                    i + TAMANO_LOTE
                );


            console.log(
                "VERIFICANDO RESERVAS EXISTENTES:",
                lote.length
            );


            const { data, error } =
                await db
                    .from("reserva")
                    .select("num")
                    .in(
                        "num",
                        lote
                    );


            if (error) {

                console.error(
                    "ERROR VERIFICANDO RESERVAS EXISTENTES:",
                    error
                );

                throw error;
            }


            if (data) {

                encontrados.push(
                    ...data.map(
                        reserva =>
                            reserva.num
                    )
                );

            }
        }


        console.log(
            "RESERVAS YA EXISTENTES:",
            encontrados
        );


        return encontrados;
    },


    /* ===========================================
       INSERTAR RESERVAS EN LOTE
       USADO POR IMPORTACIÓN EXCEL / CSV
       <<--- </gishikoDev_> --->
    =========================================== */

    async insertarLote(
        reservasNuevas
    ) {

        if (
            !Array.isArray(reservasNuevas) ||
            !reservasNuevas.length
        ) {

            return [];
        }


        const insertadas = [];

        const TAMANO_LOTE = 100;


        console.log(
            ">>> INICIANDO IMPORTACIÓN DE RESERVAS <<<"
        );

        console.log(
            "TOTAL A INSERTAR:",
            reservasNuevas.length
        );


        /*
         * Insertamos por bloques.
         *
         * No usamos UPSERT deliberadamente:
         * las reservas existentes no deben
         * ser sobrescritas por una importación.
         */
        for (
            let i = 0;
            i < reservasNuevas.length;
            i += TAMANO_LOTE
        ) {

            const lote =
                reservasNuevas.slice(
                    i,
                    i + TAMANO_LOTE
                );


            console.log(
                `INSERTANDO LOTE ${
                    Math.floor(
                        i / TAMANO_LOTE
                    ) + 1
                }:`,
                lote.length,
                "reservas"
            );


            const { data, error } =
                await db
                    .from("reserva")
                    .insert(lote)
                    .select();


            if (error) {

                console.error(
                    "ERROR INSERTANDO LOTE DE RESERVAS:",
                    error
                );

                console.error(
                    "LOTE QUE GENERÓ EL ERROR:",
                    lote
                );

                throw error;
            }


            if (data) {

                insertadas.push(
                    ...data
                );

            }


            console.log(
                "LOTE INSERTADO CORRECTAMENTE:",
                data?.length || 0
            );
        }


        console.log(
            ">>> IMPORTACIÓN FINALIZADA <<<"
        );

        console.log(
            "TOTAL INSERTADAS:",
            insertadas.length
        );


        return insertadas;
    }

};








/* ===========================================
 *
 *   EXPONER REPOSITORIES GLOBALMENTE
 *
 * =========================================== */

window.ReclamosRepository =
    ReclamosRepository;

window.ReservasRepository =
    ReservasRepository;

window.ParametrosRepository =
    ParametrosRepository;

window.AuthRepository =
    AuthRepository;

window.UsuariosRepository =
    UsuariosRepository;

window.BannersRepository =
    BannersRepository;

window.db = db;
