/* ===========================================
   Product-name compatibility (Dovela rebrand)
   Claims stored before the rebrand keep their original `producto` value in the
   database. Reads present the current catalogue name so the UI, filters and
   counts stay consistent without rewriting historical rows.
=========================================== */
window.PRODUCTO_LEGADO = Object.freeze({
  'Millenial': 'Arco Esencial',
  'Preferencial': 'Arco Preferente',
  'Capital Care 3': 'Arco Integral 3',
  'Capital Care 4': 'Arco Integral 4',
  'Global Care 1': 'Arco Global 1',
  'Global Care 2': 'Arco Global 2',
});
window.productoActual = function (nombre) {
  return window.PRODUCTO_LEGADO[nombre] || nombre;
};
window.normalizarProducto = function (registro) {
  if (registro && typeof registro.producto === 'string') registro.producto = window.productoActual(registro.producto);
  return registro;
};
