// Contenido de los recorridos guiados ("Cómo funciona"): cada texto visible tiene traducción
// en en/fr/pt, cada paso trae las piezas que el motor espera y el motor expone la navegación
// a pantalla completa. Sin navegador: los pasos se evalúan en un contexto vm.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

// Diccionarios: filas [es, en, fr, pt] del portal público y del interno.
function loadRows(extra) {
  const context = vm.createContext({
    window: extra ? {} : {},
    document: { readyState: 'loading', addEventListener() {} },
    navigator: { languages: ['es'], language: 'es' },
    localStorage: { getItem() { return null; }, setItem() {} },
    matchMedia() { return { matches: false }; },
    Intl, Date, Number, String, Object, Array, Map, WeakMap, RegExp, console
  });
  if (extra) vm.runInContext(read('interno/js/interno-i18n.js'), context);
  const extraRows = context.window.DovelaI18nExtraRows || [];
  // Las filas propias del portal público están en el arreglo `rows` de i18n.js.
  const source = read('public/js/i18n.js');
  const start = source.indexOf('const rows = [');
  const end = source.indexOf('].concat(', start);
  const rows = vm.runInNewContext(source.slice(start + 'const rows = '.length, end + 1));
  const map = new Map();
  for (const row of rows.concat(extraRows)) map.set(row[0].replace(/\s+/g, ' ').trim(), row);
  return map;
}

// Motor real del recorrido (para el kit de miniaturas) con un create() que solo guarda los pasos.
function loadKit() {
  const context = vm.createContext({ window: {}, document: {}, console, Math, Object, Array, String, Number });
  vm.runInContext(read('public/js/tour.js'), context);
  return context.window.DovelaTour.kit;
}

function publicSteps(kit) {
  const app = read('public/js/public-app.js');
  const start = app.indexOf('(function initEntryTour() {');
  const end = app.indexOf('})();', start) + '})();'.length;
  assert.ok(start > 0 && end > start, 'initEntryTour existe en public-app.js');
  let captured = null;
  const element = { addEventListener() {}, getAttribute() { return null; }, focus() {} };
  const context = vm.createContext({
    window: { DovelaTour: { kit, create: ({ steps }) => { captured = steps; return { open() {} }; } } },
    document: { referrer: '', querySelectorAll: () => [element], getElementById: () => null },
    location: { origin: 'https://dovela.test' },
    sessionStorage: { getItem: () => '1', setItem() {} },
    localStorage: { removeItem() {} },
    URL, setTimeout() {}, console, Object, Array, String, Number, Math, Boolean
  });
  vm.runInContext(app.slice(start, end), context);
  return captured;
}

function internalSteps(kit) {
  let opened = null;
  const context = vm.createContext({
    window: { DovelaTour: { kit, create: () => ({ open: (steps) => { opened = steps; } }) } },
    console, Object, Array, String, Number, Math, Boolean
  });
  vm.runInContext(read('interno/js/interno-tour.js'), context);
  const byRole = {};
  for (const rol of ['Admin', 'Ajustador', 'Visualizador']) {
    vm.runInContext(`var sesion = { rol: ${JSON.stringify(rol)} };`, context);
    context.window.abrirComoFunciona();
    byRole[rol] = opened;
  }
  return byRole;
}

// Datos de ejemplo que no se traducen (nombres, códigos, cifras, marcas, siglas).
const DATA = /^(?:[\d\s.,:%/→+\-–·()]+|SGP-[\w-]+|RS-[\w-]+|PDF|Excel|CSV|ES|EN|FR|PT|Ctrl\+V|Admin|CheckPlus|Okafor…|0\d \/ PDF|\d+\s*%|.*\d{3}-\d{4}.*)$/;
const NAMES = new Set(['Amara Okafor', 'Jordan Nakamura', 'Itzel Haddad', 'Kofi Mensah', 'Okafor, Amara', 'Nakamura, Jordan', 'Haddad, Itzel',
  'Valdoria', 'Serranova', 'Español', 'Arco Integral 3', 'Arco Kids', 'AP Escolar', '20/12 → 05/01', '1,250.00']);

function screenTexts(html) {
  const ignored = html.replace(/<([a-z]+)[^>]*data-i18n-ignore[^>]*>[\s\S]*?<\/\1>/g, '');
  return [...ignored.matchAll(/>([^<>]+)</g)].map((m) => m[1].replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function stepTexts(step) {
  const own = [step.chapter, step.title, step.text, step.tip, step.notes.note[3], ...(step.points || [])].filter(Boolean);
  const screen = screenTexts(step.screen).filter((text) => !DATA.test(text) && !NAMES.has(text) && /\p{L}{2,}/u.test(text));
  return own.concat(screen);
}

function assertTranslated(label, steps, dictionary) {
  const missing = new Set();
  steps.forEach((step) => stepTexts(step).forEach((text) => {
    const row = dictionary.get(text.replace(/\s+/g, ' ').trim());
    if (!row || row.length < 4 || row.slice(1).some((value) => !value || !value.trim())) missing.add(text);
  }));
  assert.deepEqual([...missing], [], `${label}: textos sin traducción en/fr/pt`);
}

function assertShape(label, steps, min) {
  assert.ok(steps.length >= min, `${label}: al menos ${min} pasos (hay ${steps.length})`);
  steps.forEach((step, i) => {
    assert.ok(step.title && step.text && step.screen, `${label} paso ${i + 1}: título, texto y miniatura`);
    assert.ok(Array.isArray(step.notes?.arrow) && step.notes.arrow.length === 2, `${label} paso ${i + 1}: flecha`);
    assert.ok(Array.isArray(step.notes?.note) && step.notes.note[3], `${label} paso ${i + 1}: nota manuscrita`);
    if (step.points) assert.ok(step.points.every((p) => typeof p === 'string' && p.trim()), `${label} paso ${i + 1}: puntos`);
  });
}

const kit = loadKit();
const publicDictionary = loadRows(false);
const internalDictionary = loadRows(true);

const pub = publicSteps(kit);
assertShape('Portal público', pub, 9);
assertTranslated('Portal público', pub, publicDictionary);

const internal = internalSteps(kit);
assertShape('Interno · Admin', internal.Admin, 9);
assertShape('Interno · Ajustador', internal.Ajustador, 6);
assertShape('Interno · Visualizador', internal.Visualizador, 5);
for (const [rol, steps] of Object.entries(internal)) assertTranslated(`Interno · ${rol}`, steps, internalDictionary);

// Motor: textos propios traducidos y navegación accesible.
const engine = read('public/js/tour.js');
for (const text of ['Cerrar guía', 'Consejo', 'Pasos de la guía', 'Ir al paso {current}: {title}', 'Omitir guía', 'Anterior', 'Siguiente', 'Empezar']) {
  assert.ok(publicDictionary.has(text), `Motor: falta traducir «${text}»`);
}
assert.match(engine, /aria-current', 'step'/, 'El paso activo se anuncia con aria-current="step"');
assert.match(engine, /ArrowRight/, 'Las flechas del teclado recorren los pasos');

// Marco a pantalla completa con márgenes de 16 / 24 / 32 px y fondo translúcido.
const css = read('public/css/tour.css');
assert.match(css, /--tour-gap: 16px/);
assert.match(css, /min-width: 601px\) \{ \.tour-dialog \{ --tour-gap: 24px; \}/);
assert.match(css, /min-width: 1024px\) \{ \.tour-dialog \{ --tour-gap: 32px; \}/);
assert.match(css, /inset: var\(--tour-gap\)/);
assert.match(css, /backdrop-filter: blur\(\d+px\)/, 'El modal es translúcido');
assert.match(css, /prefers-reduced-transparency: reduce\), \(prefers-contrast: more\)/, 'Respaldo sólido para menos transparencia');

console.log(`tour-content: OK (${pub.length} pasos públicos; interno ${Object.values(internal).map((s) => s.length).join('/')})`);
