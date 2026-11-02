const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public/css/public-styles.css'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'public/js/i18n.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'public/js/public-app.js'), 'utf8');

function loadPublicApi(languages = ['en-US']) {
  const context = vm.createContext({
    window: {},
    document: { readyState: 'loading', addEventListener() {} },
    navigator: { languages, language: languages[0] },
    localStorage: { getItem() { return null; }, setItem() {} },
    matchMedia() { return { matches: false }; },
    Intl, Date, Number, String, Object, Array, Map, WeakMap, RegExp, console
  });
  vm.runInContext(i18n, context);
  return context.window.DovelaI18n;
}

const api = loadPublicApi();

assert.match(html, /<select[^>]+data-language-select[^>]+aria-label="Idioma"/);
for (const locale of ['es', 'en', 'fr', 'pt']) assert.match(html, new RegExp(`<option value="${locale}">`));
assert.match(html, /<dialog[^>]+id="i18n-language-dialog"[^>]+aria-labelledby=/);
assert.match(html, /id="i18n-location-status"[^>]+role="status"[^>]+aria-live="polite"/);
assert.ok(html.indexOf('public/js/i18n.js') < html.indexOf('public/js/public-app.js'), 'i18n loads before dynamic UI');

assert.match(css, /\.language-select[^}]*min-height:\s*42px/);
assert.match(css, /\.language-select-wrap::after[^}]*right:\s*\.82rem[^}]*border-right:/s);
assert.match(css, /\.language-select[^}]*width:\s*auto[^}]*appearance:\s*none[^}]*field-sizing:\s*content/s);
assert.match(css, /\.language-dialog::backdrop/);
assert.match(css, /@media \(max-width: 390px\)[\s\S]*?\.language-select/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.language-dialog\[open\]/);

assert.match(i18n, /dovela\.language\.preference/);
assert.match(i18n, /function fitLanguageSelect\(select\)[\s\S]*?getBoundingClientRect\(\)[\s\S]*?horizontalPadding/);
assert.match(i18n, /navigator\.geolocation\.getCurrentPosition/);
assert.match(i18n, /enableHighAccuracy:\s*false/);
assert.doesNotMatch(i18n, /fetch\(|XMLHttpRequest|sendBeacon/);
assert.match(i18n, /Location is optional\. It is used only on this device/);
assert.match(i18n, /What matters most,/);
assert.match(i18n, /L’essentiel,/);
assert.match(i18n, /O que mais importa,/);
assert.ok((i18n.match(/^\s*\['/gm) || []).length >= 140, 'curated catalog has broad public-surface coverage');

assert.equal(api.detectBrowserRecommendation().locale, 'en');
assert.equal(api.languageFromCoordinates(-23.55, -46.63), 'pt', 'São Paulo recommends Portuguese');
assert.equal(api.languageFromCoordinates(48.86, 2.35), 'fr', 'Paris recommends French');
assert.equal(api.languageFromCoordinates(40.42, -3.7), 'es', 'Madrid recommends Spanish');
assert.equal(api.languageFromCoordinates(40.71, -74.0), 'en', 'New York recommends English');
assert.equal(api.languageFromCoordinates(0, 0), null, 'unknown region does not invent a recommendation');

assert.match(app, /const i18nT =/);
assert.match(app, /document\.addEventListener\('dovela:languagechange'/);
assert.match(app, /i18nT\(slide\.t\)/);
assert.match(app, /countCopy=\{/);

console.log('PASS: native ES/EN/FR/PT catalog, accessible selector/dialog, private opt-in GPS mapping, and dynamic UI integration.');
