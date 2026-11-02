// /* ===========================================
//    SUPABASE  <<--- </gishikoDev_> --->>
// =========================================== */

// const SUPABASE_URL =
//     "https://yhbqzxbgxiaygykdjsjp.supabase.co";

// const SUPABASE_ANON_KEY =
//     "sb_publishable_i7tXNxaV5sVUhxpmA8cppg_ZZM0Xp7D";

// const db =
//     window.supabase.createClient(
//         SUPABASE_URL,
//         SUPABASE_ANON_KEY
//     );

// console.log("Supabase inicializado");

// async function probarConexion(){

//     const { data, error } =
//         await db
//             .from("reclamos")
//             .select("*")
//             .limit(1);

//     console.log("DATA:", data);
//     console.log("ERROR:", error);

// }

// probarConexion();

// async function guardarReclamoSupabase(reclamo){

//     const { data, error } = await db
//         .from("reclamos")
//         .insert([reclamo])
//         .select();

//     if(error){

//         console.error(error);

//         return null;

//     }

//     return data[0];

// }

// window.db = db;



/* ===========================================
   SUPABASE
   <<--- </gishikoDev_> --->>
=========================================== */

console.log("interno-supabase.js cargado");

/* ===========================================
   CONFIGURACIÓN
=========================================== */

const SUPABASE_URL =
    "https://iyqwvgpfcxsdnvjbnpvd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ySEOKEz11nGef1EvQB2aUQ_U2kjhf2Z";

/* ===========================================
   CLIENTE
=========================================== */

const db = supabase.createClient(

    SUPABASE_URL,

    SUPABASE_KEY,

    {

        // Sesión real de Supabase Auth del personal. Clave propia para no
        // compartirla con el cliente del portal público (mismo origen).
        auth: {

            persistSession: true,

            autoRefreshToken: true,

            detectSessionInUrl: false,

            storageKey: "dovela.interno.auth"

        }

    }

);

console.log("Supabase inicializado");

/* ===========================================
   EXPORT GLOBAL
=========================================== */

window.db = db;