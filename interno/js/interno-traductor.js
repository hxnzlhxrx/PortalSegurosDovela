/* ================= TRADUCCIÓN AUTOMÁTICA DE BANNERS (CMS) =================
   Traduce el título, el texto y el botón de una novedad del portal público del español
   al inglés, francés y portugués con MyMemory (https://mymemory.translated.net):
   gratuito, sin clave y con CORS. Solo lo usa el Admin al guardar o al pulsar
   «Traducir automáticamente»; el portal público lee las traducciones guardadas y
   nunca llama a este servicio.

   TraductorBanner.traducir(campos, idiomas?, opciones?) nunca lanza: devuelve
   { resultado: { en: { titulo, … } }, errores: [{ idioma, campo, mensaje }] }.
   Si un campo falla, no aparece en `resultado` (el portal muestra el español). */
(function () {
  "use strict";

  const API = "https://api.mymemory.translated.net/get";
  const IDIOMAS = Object.freeze(["en", "fr", "pt"]);
  const CAMPOS = Object.freeze(["titulo", "texto", "boton"]);
  // Mismos límites que las columnas de portal_banners.
  const LIMITES = Object.freeze({ titulo: 90, texto: 220, boton: 40 });
  // Variante regional que usa el portal (i18n.js: en-US, fr-FR, pt-BR).
  const DESTINO = Object.freeze({ en: "en-US", fr: "fr-FR", pt: "pt-BR" });
  const TIEMPO_MAXIMO_MS = 8000;
  const SIMULTANEAS = 3;

  const ENTIDADES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  function decodificar(texto) {
    return String(texto).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entidad, codigo) => {
      if (codigo[0] === "#") {
        const numero = codigo[1].toLowerCase() === "x" ? parseInt(codigo.slice(2), 16) : parseInt(codigo.slice(1), 10);
        return Number.isFinite(numero) ? String.fromCodePoint(numero) : entidad;
      }
      return ENTIDADES[codigo.toLowerCase()] ?? entidad;
    });
  }

  // Traduce un texto. Lanza Error si el servicio falla, se agota la cuota o tarda demasiado.
  async function traducirTexto(texto, idioma, { fetchImpl = globalThis.fetch, tiempoMaximoMs = TIEMPO_MAXIMO_MS } = {}) {
    if (!DESTINO[idioma]) throw new Error(`Idioma no admitido: ${idioma}`);
    if (typeof fetchImpl !== "function") throw new Error("Este navegador no permite traducir automáticamente.");
    const url = `${API}?q=${encodeURIComponent(texto)}&langpair=${encodeURIComponent(`es|${DESTINO[idioma]}`)}`;
    const control = typeof AbortController === "function" ? new AbortController() : null;
    const temporizador = setTimeout(() => control?.abort(), tiempoMaximoMs);
    let datos;
    try {
      const respuesta = await fetchImpl(url, { signal: control?.signal, headers: { Accept: "application/json" } });
      if (!respuesta.ok) throw new Error(`El servicio de traducción respondió ${respuesta.status}.`);
      datos = await respuesta.json();
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("El servicio de traducción tardó demasiado.");
      throw error;
    } finally {
      clearTimeout(temporizador);
    }
    const salida = datos?.responseData?.translatedText;
    // MyMemory responde 200 con un aviso en el texto cuando se agota la cuota diaria.
    if (Number(datos?.responseStatus) !== 200 || datos?.quotaFinished || typeof salida !== "string" || /^MYMEMORY WARNING/i.test(salida)) {
      throw new Error(datos?.responseDetails && !/^MYMEMORY WARNING/i.test(salida || "")
        ? String(datos.responseDetails)
        : "Se alcanzó el límite diario del servicio de traducción.");
    }
    const limpio = decodificar(salida).replace(/\s+/g, " ").trim();
    if (!limpio) throw new Error("El servicio de traducción no devolvió texto.");
    return limpio;
  }

  // Traduce varios campos a varios idiomas, con pocas solicitudes simultáneas.
  async function traducir(campos, idiomas = IDIOMAS, opciones = {}) {
    const tareas = [];
    idiomas.forEach((idioma) => CAMPOS.forEach((campo) => {
      const texto = String(campos?.[campo] || "").trim();
      if (texto) tareas.push({ idioma, campo, texto });
    }));
    const resultado = {};
    const errores = [];
    let siguiente = 0;
    async function trabajador() {
      while (siguiente < tareas.length) {
        const { idioma, campo, texto } = tareas[siguiente++];
        try {
          const traducido = await traducirTexto(texto, idioma, opciones);
          (resultado[idioma] ||= {})[campo] = traducido.slice(0, LIMITES[campo]).trim();
        } catch (error) {
          errores.push({ idioma, campo, mensaje: error?.message || String(error) });
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(SIMULTANEAS, tareas.length) }, trabajador));
    return { resultado, errores };
  }

  window.TraductorBanner = Object.freeze({ IDIOMAS, CAMPOS, LIMITES, traducir, traducirTexto, decodificar });
})();
