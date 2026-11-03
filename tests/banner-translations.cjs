// Traducción de las novedades del CMS: el traductor del panel interno (MyMemory, con fetch simulado),
// la lectura en el portal público según el idioma activo y el respaldo sin la migración.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function loadTranslator() {
  const context = vm.createContext({ window: {}, globalThis: {}, setTimeout, clearTimeout, AbortController, encodeURIComponent, console, Promise, Number, String, Array, Math, Object, parseInt });
  vm.runInContext(read('interno/js/interno-traductor.js'), context);
  return context.window.TraductorBanner;
}

const respuesta = (body, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => Promise.resolve(body) });
const exito = (text) => respuesta({ responseStatus: 200, responseData: { translatedText: text } });

(async () => {
  const T = loadTranslator();
  assert.deepEqual([...T.IDIOMAS], ['en', 'fr', 'pt']);

  // Éxito: pide es|en-US, decodifica entidades y normaliza espacios.
  const urls = [];
  const fetchOk = (url) => { urls.push(url); return exito('Find care when you&#39;re  ready &amp; able'); };
  assert.equal(await T.traducirTexto('Encuentre atención', 'en', { fetchImpl: fetchOk }), 'Find care when you\'re ready & able');
  assert.match(urls[0], /^https:\/\/api\.mymemory\.translated\.net\/get\?q=Encuentre%20atenci%C3%B3n&langpair=es%7Cen-US$/);
  assert.equal(T.decodificar('&quot;Hola&quot; &#x41;&#66; &nbsp;&lt;b&gt;'), '"Hola" AB  <b>');

  // Cuota agotada: MyMemory responde 200 con un aviso en el texto; nunca se toma como traducción.
  const cuota = () => respuesta({ responseStatus: 200, quotaFinished: false, responseData: { translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.' } });
  await assert.rejects(T.traducirTexto('Hola', 'fr', { fetchImpl: cuota }), /límite diario/);
  await assert.rejects(T.traducirTexto('Hola', 'fr', { fetchImpl: () => respuesta({ responseStatus: '403', responseDetails: 'INVALID LANGUAGE PAIR' }) }), /INVALID LANGUAGE PAIR/);
  await assert.rejects(T.traducirTexto('Hola', 'fr', { fetchImpl: () => respuesta({}, false, 503) }), /503/);
  await assert.rejects(T.traducirTexto('Hola', 'de', { fetchImpl: fetchOk }), /no admitido/);

  // Tiempo agotado: se aborta la solicitud.
  const lento = (url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))));
  await assert.rejects(T.traducirTexto('Hola', 'pt', { fetchImpl: lento, tiempoMaximoMs: 20 }), /tardó demasiado/);

  // Varios campos e idiomas: omite campos vacíos, recorta al límite de la columna y reporta fallos sin lanzar.
  const pedidos = [];
  const mixto = (url) => {
    const params = new URL(url).searchParams;
    pedidos.push(params.get('langpair'));
    if (params.get('langpair') === 'es|fr-FR' && params.get('q') === 'Ver') return Promise.reject(new TypeError('Failed to fetch'));
    return exito(`${params.get('langpair')}:${params.get('q')}`.repeat(params.get('q') === 'Ver' ? 10 : 1));
  };
  const { resultado, errores } = await T.traducir({ titulo: 'Hola', texto: '', boton: 'Ver' }, ['en', 'fr'], { fetchImpl: mixto });
  assert.equal(pedidos.length, 4, 'texto vacío no se envía');
  assert.equal(resultado.en.titulo, 'es|en-US:Hola');
  assert.equal(resultado.en.boton.length <= T.LIMITES.boton, true);
  assert.equal(resultado.fr.titulo, 'es|fr-FR:Hola');
  assert.equal(resultado.fr.boton, undefined);
  assert.equal(errores.length, 1);
  assert.equal(errores[0].idioma, 'fr');
  assert.equal(errores[0].campo, 'boton');

  // Portal público: lee traducciones con respaldo si falta la columna y muestra el idioma activo.
  const repo = read('public/js/public-repository.js');
  assert.match(repo, /\$\{columnas\}, traducciones/);
  assert.match(repo, /error\?\.code === "42703"/);
  const app = read('public/js/public-app.js');
  const start = app.indexOf('const CAMPOS_TRADUCCION_BANNER=');
  const end = app.indexOf('function syncBannerRotation(){', start);
  assert.ok(start > 0 && end > start, 'textoBannerCms existe');
  const ctx = vm.createContext({ window: { DovelaI18n: { locale: 'fr' } } });
  vm.runInContext(app.slice(start, end) + ';this.textoBannerCms=textoBannerCms;', ctx);
  const slide = { t: 'Hola', s: 'Texto', cta: 'Ver', tr: { fr: { titulo: 'Bonjour', texto: '  ' } } };
  assert.deepEqual({ ...ctx.textoBannerCms(slide, 't') }, { valor: 'Bonjour', respaldo: false });
  assert.deepEqual({ ...ctx.textoBannerCms(slide, 's') }, { valor: 'Texto', respaldo: true }, 'vacío → español');
  assert.deepEqual({ ...ctx.textoBannerCms(slide, 'cta') }, { valor: 'Ver', respaldo: true });
  ctx.window.DovelaI18n.locale = 'es';
  assert.deepEqual({ ...ctx.textoBannerCms(slide, 't') }, { valor: 'Hola', respaldo: false });
  assert.match(app, /lang="es"/, 'El español de respaldo se marca con lang="es"');
  assert.match(app, /tr:b\.traducciones/, 'Los banners del CMS conservan sus traducciones');

  // Panel interno: respaldo sin la migración y script cargado antes de interno-app.js.
  const internoRepo = read('interno/js/interno-repository.js');
  assert.match(internoRepo, /"42703" \|\| error\?\.code === "PGRST204"/);
  const html = read('interno.html');
  assert.ok(html.indexOf('interno/js/interno-traductor.js') < html.indexOf('interno/js/interno-app.js'));
  for (const idioma of ['en', 'fr', 'pt']) for (const campo of ['titulo', 'texto', 'boton']) {
    assert.match(html, new RegExp(`id="mb-tr-${idioma}-${campo}"`));
  }
  const sql = read('supabase/2026-11-03-banners-traducciones.sql');
  assert.match(sql, /add column if not exists traducciones jsonb not null default '\{\}'::jsonb/);

  console.log('banner-translations: OK');
})().catch((error) => { console.error(error); process.exit(1); });
