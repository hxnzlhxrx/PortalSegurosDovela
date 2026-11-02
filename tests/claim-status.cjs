const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public/css/public-styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'public/js/public-app.js'), 'utf8');
const repository = fs.readFileSync(path.join(root, 'public/js/public-repository.js'), 'utf8');

function element() {
  return {
    value: '', textContent: '', className: '', hidden: false, disabled: false,
    readOnly: false, dataset: {}, attrs: {}, focused: false,
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; },
    hasAttribute(name) { return name in this.attrs; },
    focus() { this.focused = true; }
  };
}

function makeUi(lookup) {
  const ids = ['cs-title','cs-form','cs-code','cs-code-error','cs-cedula','cs-cedula-error',
    'cs-feedback','cs-submit','cs-result','cs-result-code','cs-result-state',
    'cs-result-description','cs-result-date'];
  const elements = Object.fromEntries(ids.map(id => [id, element()]));
  elements['cs-form'].reset = () => {
    elements['cs-code'].value = '';
    elements['cs-cedula'].value = '';
  };
  const context = vm.createContext({
    $: id => elements[id], document: { querySelector: () => element() },
    ir: () => {}, ReclamosRepository: { consultarEstado: lookup },
    BADGE: {'Recibido':'b-azul','Pagado':'b-verde'},
    navigator: { onLine: true }, Intl, Date, Number
  });
  const start = app.indexOf('/* ================= CONSULTA REAL DE ESTADO DE RECLAMO');
  const end = app.indexOf('/* ================= TRACKING (reclamos + pre-autorizaciones)', start);
  assert(start > 0 && end > start);
  vm.runInContext(app.slice(start, end), context);
  return {context, elements};
}

async function main() {
  assert.equal((html.match(/class="card-acc(?: card-acc--network)?"/g) || []).length, 3);
  assert.match(html, /Presentar un reclamo/);
  assert.match(html, /Red Médica Dovela/);
  assert.match(html, /Consultar estado de reclamo/);
  assert.match(html, /onclick="abrirConsultaReclamo\(\)"/);
  assert.match(html, /<label for="cs-code">/);
  assert.match(html, /<label for="cs-cedula">/);
  assert.match(css, /#v-landing \.cards-acceso \{[^}]*repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?#v-landing \.cards-acceso, #v-landing \.forms-grid \{ grid-template-columns: 1fr;/);
  assert.match(css, /prefers-reduced-motion: reduce/);

  let calls = 0;
  let resolvePending;
  const ui = makeUi(() => { calls++; return new Promise(resolve => { resolvePending = resolve; }); });
  const submit = () => ui.context.consultarEstadoReclamo({preventDefault() {}});
  await submit();
  assert.equal(calls, 0, 'empty input does not call backend');
  assert.equal(ui.elements['cs-code'].attrs['aria-invalid'], 'true');
  ui.elements['cs-code'].value = 'SGP-2026-00001';
  ui.elements['cs-cedula'].value = '8-888-8888';
  await submit();
  assert.equal(calls, 0, 'legacy demo identifier is rejected');
  ui.elements['cs-code'].value = ' sgp-26294-0001-m ';
  const pending = submit();
  assert.equal(calls, 1);
  assert.equal(ui.elements['cs-submit'].disabled, true);
  await submit();
  assert.equal(calls, 1, 'duplicate click is ignored');
  resolvePending({estado:'Recibido',actualizado_en:'2026-10-21T10:00:00Z'});
  await pending;
  assert.equal(ui.elements['cs-result'].hidden, false);
  assert.equal(ui.elements['cs-result-state'].textContent, 'Recibido');
  assert.equal(ui.elements['cs-result-code'].textContent, 'SGP-26294-0001-M');
  assert.equal(ui.elements['cs-submit'].disabled, false);
  ui.context.volverDeConsultaReclamo();
  assert.equal(ui.elements['cs-code'].value, '', 'return clears sensitive code');
  assert.equal(ui.elements['cs-cedula'].value, '', 'return clears identity');
  assert.equal(ui.elements['cs-result'].hidden, true);

  const missing = makeUi(async () => null);
  missing.elements['cs-code'].value = 'SGP-26294-0001-M';
  missing.elements['cs-cedula'].value = '8-888-8888';
  await missing.context.consultarEstadoReclamo({preventDefault() {}});
  assert.equal(missing.elements['cs-result'].hidden, true);
  assert.match(missing.elements['cs-feedback'].textContent, /No pudimos verificar/);

  const failed = makeUi(async () => { throw Error('private database detail'); });
  failed.elements['cs-code'].value = 'SGP-26294-0001-M';
  failed.elements['cs-cedula'].value = '8-888-8888';
  await failed.context.consultarEstadoReclamo({preventDefault() {}});
  assert.doesNotMatch(failed.elements['cs-feedback'].textContent, /private database detail/);
  assert.match(failed.elements['cs-feedback'].textContent, /No pudimos consultar/);
  failed.context.navigator.onLine = false;
  await failed.context.consultarEstadoReclamo({preventDefault() {}});
  assert.match(failed.elements['cs-feedback'].textContent, /No hay conexión/);

  let response = {data:[{estado:'En Proceso',actualizado_en:null,nombre:'No exponer',poliza:'88888888',monto:123123}],error:null};
  let rpcArgs;
  const repoContext = vm.createContext({
    db:{rpc:async (...args) => { rpcArgs=args; return response; }},
    window:{},console:{log(){},error(){}}
  });
  vm.runInContext(repository, repoContext);
  const record = await repoContext.window.ReclamosRepository.consultarEstado('SGP-26294-0001-M','8-888-8888');
  assert.equal(rpcArgs[0], 'consultar_reclamo');
  assert.equal(rpcArgs[1].p_num, 'SGP-26294-0001-M');
  assert.equal(rpcArgs[1].p_identidad, '8-888-8888');
  assert.deepEqual(Object.keys(record), ['estado','actualizado_en']);
  response = {data:[],error:null};
  assert.equal(await repoContext.window.ReclamosRepository.consultarEstado('SGP-26294-0001-M','8-888-8888'), null);
  response = {data:null,error:{message:'private database detail'}};
  await assert.rejects(() => repoContext.window.ReclamosRepository.consultarEstado('SGP-26294-0001-M','8-888-8888'), /SERVICE_UNAVAILABLE/);
  console.log('PASS: claim status card, validation, async states, privacy projection and regressions (controlled mocks only).');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
