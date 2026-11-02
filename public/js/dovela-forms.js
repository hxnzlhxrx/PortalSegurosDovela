/* ===========================================
   Dovela Seguros · printable forms (jsPDF)
   Replaces the previously embedded third-party PDF files with original,
   brand-consistent forms that keep the same functional fields.
=========================================== */
(function () {
  // PulsePoint palette (DESIGN.md), print-safe on white paper.
  const C = { primary: [30, 58, 95], deep: [15, 23, 42], accent: [59, 130, 246], text: [15, 23, 42], muted: [71, 85, 105], line: [100, 116, 139], soft: [241, 245, 249] };
  const PAGE = { w: 595.28, h: 841.89, m: 40 };
  const t = (source, variables) => window.DovelaI18n?.t(source, variables) || source;

  function doc(opts = {}) {
    const { jsPDF } = window.jspdf;
    const d = new jsPDF({ unit: 'pt', format: 'a4', compress: opts.compress !== false });
    d.setProperties({ title: '', author: 'Dovela Seguros', creator: t('Portal de Autogestión Dovela') });
    return d;
  }
  function header(d, title, subtitle, code) {
    if (window.DOVELA_LOGO_PDF) d.addImage(window.DOVELA_LOGO_PDF, 'PNG', PAGE.m, 30, 117, 36, 'dovela-logo', 'FAST');
    d.setFont('helvetica', 'bold'); d.setFontSize(13); d.setTextColor(...C.primary);
    d.text(t(title), PAGE.w - PAGE.m, 44, { align: 'right' });
    d.setFont('helvetica', 'normal'); d.setFontSize(8.5); d.setTextColor(...C.muted);
    d.text(t(subtitle), PAGE.w - PAGE.m, 58, { align: 'right' });
    d.setDrawColor(...C.accent); d.setLineWidth(1.2); d.line(PAGE.m, 78, PAGE.w - PAGE.m, 78);
    d.setFontSize(7.5); d.text(t(code), PAGE.w - PAGE.m, 90, { align: 'right' });
    return 100;
  }
  function footer(d) {
    const n = d.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      d.setPage(i);
      d.setDrawColor(...C.line); d.setLineWidth(.4); d.line(PAGE.m, PAGE.h - 40, PAGE.w - PAGE.m, PAGE.h - 40);
      d.setFont('helvetica', 'normal'); d.setFontSize(7.5); d.setTextColor(...C.muted);
      d.text(t('Dovela Seguros · Entidad ficticia con fines demostrativos. Este formulario no constituye un contrato ni una cobertura real.'), PAGE.m, PAGE.h - 28);
      d.text(t('Página {current} de {total}', { current: i, total: n }), PAGE.w - PAGE.m, PAGE.h - 28, { align: 'right' });
    }
  }
  function section(d, y, label) {
    d.setFillColor(...C.primary); d.roundedRect(PAGE.m, y, PAGE.w - PAGE.m * 2, 18, 3, 3, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(8.5); d.setTextColor(241, 245, 249);
    d.text(t(label).toUpperCase(), PAGE.m + 8, y + 12.2);
    return y + 26;
  }
  // Row of fields: [[label, widthFraction], ...]; returns next y.
  function fields(d, y, row, h = 30) {
    const total = PAGE.w - PAGE.m * 2, gap = 10;
    let x = PAGE.m;
    row.forEach(([label, frac]) => {
      const w = total * frac - gap * (1 - frac);
      d.setFont('helvetica', 'bold'); d.setFontSize(6.8); d.setTextColor(...C.muted);
      d.text(t(label).toUpperCase(), x, y + 7, { maxWidth: w });
      d.setDrawColor(...C.line); d.setLineWidth(.6); d.line(x, y + h - 4, x + w, y + h - 4);
      x += w + gap;
    });
    return y + h + 4;
  }
  function box(d, y, label, h) {
    d.setFont('helvetica', 'bold'); d.setFontSize(6.8); d.setTextColor(...C.muted);
    d.text(t(label).toUpperCase(), PAGE.m, y + 7);
    d.setDrawColor(...C.line); d.setLineWidth(.6); d.roundedRect(PAGE.m, y + 11, PAGE.w - PAGE.m * 2, h, 3, 3);
    return y + h + 20;
  }
  function checks(d, y, label, options) {
    d.setFont('helvetica', 'bold'); d.setFontSize(6.8); d.setTextColor(...C.muted);
    d.text(t(label).toUpperCase(), PAGE.m, y + 7);
    let x = PAGE.m, yy = y + 14;
    d.setFont('helvetica', 'normal'); d.setFontSize(8.5); d.setTextColor(...C.text);
    options.forEach(source => {
      const opt = t(source);
      const w = d.getTextWidth(opt) + 26;
      if (x + w > PAGE.w - PAGE.m) { x = PAGE.m; yy += 16; }
      d.setDrawColor(...C.line); d.rect(x, yy, 9, 9);
      d.text(opt, x + 14, yy + 7.5);
      x += w;
    });
    return yy + 22;
  }
  function paragraph(d, y, text, size = 8.5) {
    d.setFont('helvetica', 'normal'); d.setFontSize(size); d.setTextColor(...C.text);
    const lines = d.splitTextToSize(t(text), PAGE.w - PAGE.m * 2);
    d.text(lines, PAGE.m, y);
    return y + lines.length * size * 1.35 + 6;
  }
  function bullets(d, y, items) {
    d.setFont('helvetica', 'normal'); d.setFontSize(8.5); d.setTextColor(...C.text);
    items.forEach(item => {
      const lines = d.splitTextToSize(t(item), PAGE.w - PAGE.m * 2 - 14);
      d.setFillColor(...C.accent); d.circle(PAGE.m + 3, y - 2.6, 1.6, 'F');
      d.text(lines, PAGE.m + 12, y);
      y += lines.length * 11.5 + 4;
    });
    return y + 4;
  }
  function signatures(d, y, labels) {
    const w = (PAGE.w - PAGE.m * 2 - 20 * (labels.length - 1)) / labels.length;
    labels.forEach((l, i) => {
      const x = PAGE.m + i * (w + 20);
      d.setDrawColor(...C.text); d.setLineWidth(.6); d.line(x, y + 34, x + w, y + 34);
      d.setFont('helvetica', 'normal'); d.setFontSize(7.5); d.setTextColor(...C.muted);
      d.text(t(l), x, y + 46);
    });
    return y + 60;
  }

  function claimForm(opts) {
    const d = doc(opts);
    d.setProperties({ title: t('Formulario de Reclamo de Gastos Médicos · Dovela Seguros') });
    let y = header(d, 'Formulario de Reclamo de Gastos Médicos', 'Complete en letra de imprenta y firme al final del documento.', 'Formulario DV-R01');
    y = section(d, y, 'Sección A · Póliza y asegurado');
    y = fields(d, y, [['1. Número de póliza', .34], ['2. N.º de certificado', .26], ['3. Teléfono celular', .4]]);
    y = fields(d, y, [['4. Nombre completo del asegurado principal', .6], ['5. Correo electrónico', .4]]);
    y = fields(d, y, [['6. Nombre completo del paciente atendido', .6], ['7. Cédula o pasaporte', .22], ['8. Fecha de nacimiento (DD/MM/AAAA)', .18]]);
    y = checks(d, y, '9. ¿El paciente tiene seguro con otra compañía?', ['Sí', 'No']);
    y = fields(d, y, [['Aseguradora', .4], ['N.º de póliza', .3], ['Fecha efectiva (DD/MM/AAAA)', .3]]);
    y = fields(d, y, [['10. País de atención', .3], ['11. Ocupación', .3], ['Lugar de empleo o estudio', .4]]);
    y = section(d, y, 'Sección B · Información del evento');
    y = box(d, y, '12. Reclamo por enfermedad: describa la condición y la fecha de los primeros síntomas', 38);
    y = box(d, y, '13. Reclamo por accidente: ¿dónde, cuándo (fecha y hora) y cómo ocurrió?', 38);
    y = checks(d, y, '¿La persona responsable es un tercero?', ['Sí', 'No']);
    y = fields(d, y, [['Nombre del responsable', .6], ['N.º de póliza del responsable', .4]]);
    y = checks(d, y, '14. ¿Recibió tratamiento previo por las lesiones o enfermedades descritas?', ['Sí', 'No']);
    y = fields(d, y, [['15. Clínica u hospital', .42], ['Fecha de ingreso', .2], ['Médicos consultados', .38]]);
    y = checks(d, y, 'Incapacidad', ['Total', 'Parcial', 'No aplica']);
    y = fields(d, y, [['Desde (DD/MM/AAAA)', .5], ['Hasta (DD/MM/AAAA)', .5]]);

    d.addPage();
    y = header(d, 'Formulario de Reclamo de Gastos Médicos', 'Continuación', 'Formulario DV-R01');
    y = section(d, y, '16. Detalle de cargos');
    [['Consulta', 'Medicinas', 'Laboratorios'], ['Imágenes (Rx / ultrasonido)', 'Terapias', 'Otros']].forEach(row => {
      y = fields(d, y, row.map(l => ['Monto · ' + l, 1 / 3]));
    });
    y = fields(d, y, [['Total reclamado', .4]]);
    y = section(d, y, 'Sección C · Médico tratante');
    y = fields(d, y, [['Diagnóstico', .7], ['Código de diagnóstico', .3]]);
    y = box(d, y, 'Procedimientos realizados', 34);
    y = signatures(d, y, ['Firma y sello del médico', 'Fecha']);
    y = section(d, y, 'Guía para presentar su reclamo');
    y = bullets(d, y, [
      'Complete todas las secciones del formulario; los campos vacíos o ilegibles retrasan la evaluación.',
      'Verifique que el médico haya indicado el diagnóstico y su código.',
      'Adjunte facturas o recibos originales con el detalle de cada medicamento, servicio o procedimiento.',
      'Incluya las órdenes médicas, resultados de estudios y cualquier documento adicional que le sea solicitado.',
      'Presente el formulario firmado junto con sus documentos a través del portal de autogestión de Dovela.',
    ]);
    y = section(d, y, 'Declaración del asegurado');
    y = paragraph(d, y, 'Declaro que la información de este formulario es veraz y completa, y autorizo el tratamiento de mis datos personales y de salud únicamente para la evaluación de este reclamo.');
    signatures(d, y + 4, ['Firma del asegurado', 'Cédula o pasaporte', 'Fecha']);
    footer(d);
    return d;
  }

  function preauthForm(opts) {
    const d = doc(opts);
    d.setProperties({ title: t('Solicitud de Pre-Autorización · Dovela Seguros') });
    let y = header(d, 'Solicitud de Pre-Autorización', 'Hospitalización, procedimientos electivos y estudios especializados', 'Formulario DV-P01');
    y = section(d, y, 'Tipo de servicio');
    y = checks(d, y, 'Marque el servicio solicitado', ['Hospitalización', 'Cirugía ambulatoria', 'Procedimiento especial ambulatorio', 'Examen especial intrahospitalario', 'Rayos X y laboratorio', 'Urgente']);
    y = fields(d, y, [['Extensión de días · número de días', .5], ['Interconsulta hospitalaria · número de visitas', .5]]);
    y = box(d, y, 'Motivo de la interconsulta o de la extensión de días', 26);
    y = section(d, y, 'Asegurado y paciente');
    y = fields(d, y, [['Nombre del asegurado', .5], ['Cédula o pasaporte del asegurado', .28], ['Póliza n.º', .22]]);
    y = fields(d, y, [['Nombre del paciente', .5], ['Fecha de nacimiento', .2], ['Edad', .12], ['Parentesco', .18]]);
    y = checks(d, y, 'Sexo', ['Femenino', 'Masculino']);
    y = fields(d, y, [['Cédula o pasaporte del paciente', .35], ['Dirección y teléfono', .65]]);
    y = section(d, y, 'Información médica');
    y = box(d, y, 'Historia clínica breve, antecedentes y fechas', 30);
    y = fields(d, y, [['Diagnóstico', .7], ['Código de diagnóstico', .3]]);
    y = fields(d, y, [['Otras condiciones declaradas', 1]]);
    y = fields(d, y, [['Procedimiento solicitado', .7], ['Código del procedimiento', .3]]);
    y = box(d, y, 'Pruebas diagnósticas realizadas y tratamiento aplicado (adjunte copia de los resultados)', 26);
    y = checks(d, y, '¿Requiere servicio de anestesia?', ['Sí', 'No']);
    y = fields(d, y, [['Hospital: nombre y dirección', .6], ['Teléfono del hospital', .4]]);
    y = fields(d, y, [['Fecha sugerida de ingreso', .34], ['Reclusión estimada (días)', .33], ['Registro médico', .33]]);

    d.addPage();
    y = header(d, 'Solicitud de Pre-Autorización', 'Continuación', 'Formulario DV-P01');
    y = section(d, y, 'Médico tratante');
    y = fields(d, y, [['Nombre del médico', .5], ['Correo electrónico', .5]]);
    y = fields(d, y, [['Enviar confirmación a', 1]]);
    y = signatures(d, y, ['Firma y sello del médico', 'Fecha']);
    y = section(d, y, 'Notas importantes');
    y = bullets(d, y, [
      'Para cirugías y procedimientos electivos, envíe esta solicitud con al menos tres (3) días hábiles de anticipación a la fecha sugerida.',
      'En casos urgentes, envíe la solicitud de inmediato a través del portal de autogestión de Dovela.',
      'Antes de referir al paciente o de realizar el estudio solicitado, se requiere la autorización escrita de Dovela Seguros.',
      'Los resultados de los estudios serán revisados por el equipo médico evaluador; inclúyalos con la solicitud.',
      'La pre-autorización emitida tiene una vigencia de treinta (30) días.',
    ]);
    y = section(d, y, 'Declaración del asegurado');
    y = paragraph(d, y, 'Autorizo a Dovela Seguros a tratar mis datos personales y de salud únicamente para la evaluación de esta solicitud.');
    signatures(d, y + 4, ['Firma del asegurado', 'Fecha']);
    footer(d);
    return d;
  }

  window.DOVELA_FORMS = {
    reclamos: { get nombre() { return t('Formulario_Reclamo_Gastos_Medicos_Dovela.pdf'); }, build: claimForm },
    preauth: { get nombre() { return t('Formulario_PreAutorizacion_Dovela.pdf'); }, build: preauthForm },
  };
})();
