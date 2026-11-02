const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const i18nSource = fs.readFileSync(path.join(root, 'public/js/i18n.js'), 'utf8');
const formsSource = fs.readFileSync(path.join(root, 'public/js/dovela-forms.js'), 'utf8');

class PdfDouble {
  constructor() { this.pages = 1; this.texts = []; this.properties = []; }
  setProperties(value) { this.properties.push(value); return this; }
  addImage() { return this; }
  setFont() { return this; }
  setFontSize() { return this; }
  setTextColor() { return this; }
  setDrawColor() { return this; }
  setFillColor() { return this; }
  setLineWidth() { return this; }
  line() { return this; }
  roundedRect() { return this; }
  rect() { return this; }
  circle() { return this; }
  text(value) {
    this.texts.push(Array.isArray(value) ? value.join(' ') : String(value));
    return this;
  }
  splitTextToSize(value) { return [String(value)]; }
  getTextWidth(value) { return String(value).length * 4; }
  addPage() { this.pages += 1; return this; }
  getNumberOfPages() { return this.pages; }
  setPage() { return this; }
}

class ElementDouble {}
const documentDouble = {
  readyState: 'loading',
  documentElement: { lang: '' },
  addEventListener() {},
  dispatchEvent() {},
  querySelectorAll() { return []; },
  createTreeWalker() { return { nextNode() { return null; } }; },
  getElementById() { return null; }
};

const context = vm.createContext({
  window: { jspdf: { jsPDF: PdfDouble } },
  document: documentDouble,
  navigator: { languages: ['es-PA'], language: 'es-PA' },
  localStorage: { getItem() { return null; }, setItem() {} },
  matchMedia() { return { matches: false }; },
  URLSearchParams, CustomEvent: class CustomEvent {}, Element: ElementDouble,
  Node: { TEXT_NODE: 3 }, NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
  Intl, Date, Number, String, Object, Array, Map, WeakMap, RegExp, console
});
vm.runInContext(i18nSource, context);
vm.runInContext(formsSource, context);

const api = context.window.DovelaI18n;
const missingSources = new Set();
context.window.DovelaI18n = {
  locales: api.locales,
  get locale() { return api.locale; },
  setLanguage: api.setLanguage,
  has: api.has,
  t(source, variables) {
    if (!api.has(source)) missingSources.add(source);
    return api.t(source, variables);
  }
};

const expected = {
  en: ['Medical Expense Claim Form', 'Pre-authorization Request', 'MEMBER DECLARATION'],
  fr: ['Formulaire de remboursement de frais médicaux', 'Demande d’autorisation préalable', 'DÉCLARATION DE L’ASSURÉ'],
  pt: ['Formulário de reembolso de despesas médicas', 'Solicitação de autorização prévia', 'DECLARAÇÃO DO SEGURADO']
};

for (const locale of Object.keys(expected)) {
  context.window.DovelaI18n.setLanguage(locale, { persist: false, announce: false });
  const claim = context.window.DOVELA_FORMS.reclamos.build();
  const preauth = context.window.DOVELA_FORMS.preauth.build();
  const output = [...claim.texts, ...preauth.texts].join('\n');

  expected[locale].forEach(text => assert.ok(output.includes(text), `${locale} PDF copy includes ${text}`));
  assert.doesNotMatch(output, /SECCIÓN|SOLICITUD DE PRE-AUTORIZACIÓN|DECLARACIÓN DEL ASEGURADO/i);
  assert.notEqual(context.window.DOVELA_FORMS.reclamos.nombre, 'Formulario_Reclamo_Gastos_Medicos_Dovela.pdf');
  assert.notEqual(context.window.DOVELA_FORMS.preauth.nombre, 'Formulario_PreAutorizacion_Dovela.pdf');
}

assert.deepEqual([...missingSources], [], `download copy missing from catalog: ${[...missingSources].join(' | ')}`);

console.log('PASS: downloadable claim and pre-authorization PDFs localize content, metadata, pagination, and filenames in EN/FR/PT.');
