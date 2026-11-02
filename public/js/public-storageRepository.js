/* ===========================================
   STORAGE REPOSITORY
   <<--- </gishikoDev_> --->>
=========================================== */

console.log("storageRepository.js cargado");

const StorageRepository = {

    async subirArchivo(file, carpeta = ""){

        console.log("================================");
        console.log("SUBIENDO ARCHIVO");
        console.log("Nombre:", file.name);
        console.log("Tamaño:", file.size);
        console.log("Tipo:", file.type);

                        const nombreLimpio =
                    file.name
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^\w.-]/g, "_")
                        .replace(/_+/g, "_");

                const nombreStorage =
                    crypto.randomUUID() +
                    "_" +
                    nombreLimpio;

        const ruta =
            carpeta
                ? `${carpeta}/${nombreStorage}`
                : nombreStorage;

        console.log("Ruta destino:", ruta);

        const { data, error } =
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

        console.log("DATA:", data);
        console.log("ERROR:", error);
        console.log("================================");

        if(error){

            console.error(
                "Error subiendo archivo:",
                error
            );

            throw error;

        }

        return {

            ruta,

            nombreStorage,

            data

        };

    },

    async guardarDocumento(documento){

        console.log(
            "Guardando metadata..."
        );

        console.table(documento);

        const { data, error } =
            await db
                .from("reclamos_documentos")
                .insert([documento])
                .select()
                .single();

        console.log("DATA:", data);
        console.log("ERROR:", error);

        if(error){

            console.error(
                "Error guardando metadata:",
                error
            );

            throw error;

        }

        console.log(
            "Metadata almacenada correctamente."
        );

        return data;

    }

};

window.StorageRepository = StorageRepository;