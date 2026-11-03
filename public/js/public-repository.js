/* ===========================================
   RECLAMOS REPOSITORY
   <<--- </gishikoDev_> --->
=========================================== */

console.log("repository.js cargado");

console.log("db =", db);

const ReclamosRepository = {

    async actualizarCantidadDocumentos(id, cantidad) {

        const { error } =
            await db
                .from("reclamos")
                .update({
                    docs_count: cantidad
                })
                .eq("id", id);

        if (error) {

            throw error;

        }

    },

    async crear(reclamo) {

        const { data, error } =
            await db
                .from("reclamos")
                .insert([reclamo])
                .select()
                .single();

        if (error) {

            console.error(
                "Error creando reclamo:",
                error
            );

            throw error;
        }

        return data;

    },

    async buscar(numero) {

        const { data, error } =
            await db
                .from("reclamos")
                .select("*")
                .eq("num", numero)
                .single();

        if (error) {

            console.error(
                "Error buscando reclamo:",
                error
            );

            return null;

        }

        return data;

    },

    // Solo consume estado, fecha y el comentario visible para el asegurado desde una función SQL.
    async consultarEstado(numero, identidad) {
        const { data, error } = await db.rpc("consultar_reclamo", {
            p_num: numero,
            p_identidad: identidad
        });

        if (error) throw new Error("CLAIM_STATUS_SERVICE_UNAVAILABLE");

        const resultado = Array.isArray(data) ? data[0] : data;
        if (!resultado) return null;
        if (typeof resultado.estado !== "string" || !resultado.estado.trim()) {
            throw new Error("CLAIM_STATUS_INVALID_RESPONSE");
        }

        return {
            estado: resultado.estado.trim(),
            actualizado_en: resultado.actualizado_en || null,
            // Comentario que el equipo marca como visible para el asegurado.
            comentario: typeof resultado.motivo_estado === "string" ? resultado.motivo_estado.trim() : ""
        };
    }

};


/* ===========================================
   CONTENIDO DEL PORTAL (CMS del panel de administración)
   RLS: anon solo ve banners activos y vigentes, y el parámetro 'identidad'.
=========================================== */

const PortalContenidoRepository = {

    async bannersVigentes() {

        const columnas = "id, titulo, texto, boton, url, desde, hasta, activo, orden";
        const consulta = (seleccion) =>
            db
                .from("portal_banners")
                .select(seleccion)
                .eq("activo", true)
                .order("orden", { ascending: true });

        // Las traducciones (EN/FR/PT) llegan con el banner. Si la base aún no tiene la columna
        // (2026-11-03-banners-traducciones.sql sin ejecutar), se leen los banners sin ellas.
        let { data, error } = await consulta(`${columnas}, traducciones`);
        if (error?.code === "42703") {
            ({ data, error } = await consulta(columnas));
        }

        if (error) {

            throw error;

        }

        return data || [];

    },

    async identidad() {

        const { data, error } =
            await db
                .from("portal_parametros")
                .select("valor")
                .eq("clave", "identidad")
                .maybeSingle();

        if (error) {

            throw error;

        }

        return data?.valor || null;

    }

};


window.ReclamosRepository = ReclamosRepository;
window.PortalContenidoRepository = PortalContenidoRepository;
