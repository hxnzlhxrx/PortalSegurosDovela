/* ===========================================
          <<--- </gishikoDev_> --->>
=========================================== */

/* ================= SESIÓN DEL SITIO =================
   Marca la pestaña como "ya dentro del sitio": al volver al portal público no se repite el tutorial de ingreso. */
try {
  sessionStorage.setItem("dovela.site.session", "1");
} catch (_) {
  /* almacenamiento bloqueado */
}

/* ================= MARCA ================= */
const LOGO_FC = "public/assets/brand/dovela-logo-horizontal-dark.svg"; // login panel is dark glass
let LOGO_WH = "public/assets/brand/dovela-logo-horizontal-dark.svg"; // replaceable via Configuración > logo
document.getElementById("logo-login").src = LOGO_FC;
document.getElementById("logo-side").src = LOGO_WH;

/* ================= CATÁLOGOS ================= */
const LINEAS = [
  { id: "SI", nombre: "Salud Individual" },
  { id: "SC", nombre: "Colectivo Salud" },
  { id: "VD", nombre: "Vida" },
  { id: "AP", nombre: "Accidentes Personales" },
];
const PRODUCTOS = {
  SI: [
    "Arco Esencial",
    "Arco Preferente",
    "Arco Integral 3",
    "Arco Integral 4",
    "Arco Kids",
    "Arco Kids Plus",
    "Arco Global 1",
    "Arco Global 2",
  ],
  SC: ["Colectivo Salud"],
  VD: ["Vida Individual", "Colectivo Vida"],
  AP: ["AP Regular", "AP Escolar"],
};
const TODOS_PRODUCTOS = [...new Set(Object.values(PRODUCTOS).flat())];
const ESTADOS = [
  "Recibido",
  "En Proceso",
  "Pendiente de Información",
  "Pagado",
  "Rechazado",
];
const BADGE = {
  Recibido: "b-azul",
  "En Proceso": "b-ambar",
  "Pendiente de Información": "b-ambar",
  Pagado: "b-verde",
  Rechazado: "b-rojo",
};
const ESTADOS_PA = [
  "Recibida",
  "En Evaluación",
  "2da opinión médica",
  "Aprobado",
  "Declinada",
];
const BADGE_PA = {
  Recibida: "b-azul",
  "En Evaluación": "b-ambar",
  "2da opinión médica": "b-ambar",
  Aprobado: "b-verde",
  Declinada: "b-rojo",
};
const ESTADOS_PROV = ["Recibido", "En revisión", "Aprobado", "Rechazado"];
const BADGE_PROV = {
  Recibido: "b-azul",
  "En revisión": "b-ambar",
  Aprobado: "b-verde",
  Rechazado: "b-rojo",
};

// Personal del portal: se carga de Supabase (tabla portal_usuarios) al iniciar sesión.
// Se modifica en el mismo arreglo para que los módulos que lo leen vean siempre la lista vigente.
const USUARIOS = [];

/* ============ DECLARACION DE PERMISOS POR ROL <gishikoDev_> ============ */
const PERMISOS = {

    admin: {
        label: "Administrador IT",
        modulos: ["dash", "bandeja", "reservas", "preauth", "provs", "red", "admin"],
        editReclamo: true,
        editReserva: true,
        editPA: true,
        pagosMasivos: true,
        verAdmin: true,
        crearPA: true,
        aprobarProv: true,
    },

    gerencia: {
        label: "Gerencia",
        modulos: ["dash", "bandeja", "reservas", "preauth", "provs", "red"],
        editReclamo: false,
        editReserva: false,
        editPA: false,
        pagosMasivos: false,
        verAdmin: true,
        crearPA: false,
        aprobarProv: false,
    },

    lider: {
        label: "Líder (supervisión)",
        modulos: ["dash", "bandeja", "reservas", "preauth", "provs", "red"],
        editReclamo: true,
        editReserva: true,
        editPA: true,
        pagosMasivos: true,
        verAdmin: false,
        crearPA: true,
        aprobarProv: true,
    },

    coordinador: {
        label: "Coordinación",
        modulos: ["dash", "bandeja", "reservas", "preauth", "provs", "red"],
        editReclamo: true,
        editReserva: true,
        editPA: true,
        pagosMasivos: true,
        verAdmin: false,
        crearPA: true,
        aprobarProv: false,
    },

    reclamos: {
        label: "Reclamos",
        modulos: ["dash", "bandeja", "reservas", "preauth", "red"],
        editReclamo: true,
        editReserva: true,
        editPA: true,
        pagosMasivos: false,
        verAdmin: false,
        crearPA: true,
        aprobarProv: false,
    },

    contabilidad: {
        label: "Contabilidad",
        modulos: ["dash", "bandeja", "reservas"],
        editReclamo: true,
        editReserva: true,
        editPA: false,
        pagosMasivos: true,
        verAdmin: false,
        crearPA: false,
        aprobarProv: false,
    },

    atencion: {
        label: "Atención al Cliente",
        modulos: ["dash", "bandeja", "reservas", "preauth", "red"],
        editReclamo: false,
        editReserva: false,
        editPA: false,
        pagosMasivos: false,
        verAdmin: false,
        crearPA: false,
        aprobarProv: false,
    },

    ventas: {
        label: "Ventas",
        modulos: ["dash", "red"],
        editReclamo: false,
        editReserva: false,
        editPA: false,
        pagosMasivos: false,
        verAdmin: false,
        crearPA: false,
        aprobarProv: false,
    },

    operaciones: {
        label: "Operaciones",
        modulos: ["dash", "bandeja", "reservas", "preauth", "provs", "red"],
        editReclamo: true,
        editReserva: true,
        editPA: true,
        pagosMasivos: false,
        verAdmin: false,
        crearPA: true,
        aprobarProv: true,
    },

    suscripcion: {
        label: "Suscripción Médica",
        modulos: ["dash", "preauth", "provs", "red"],
        editReclamo: false,
        editReserva: false,
        editPA: true,
        pagosMasivos: false,
        verAdmin: false,
        crearPA: true,
        aprobarProv: true,
    },

    auditoria: {
        label: "Auditoría",
        modulos: ["dash", "bandeja", "reservas", "preauth", "provs", "red", "admin"],
        editReclamo: false,
        editReserva: false,
        editPA: false,
        pagosMasivos: false,
        verAdmin: true,
        crearPA: false,
        aprobarProv: false,
    },

    especialista: {
        label: "Gestión de reclamos",
        modulos: ["dash", "bandeja", "reservas", "preauth", "red"],
        editReclamo: true,
        editReserva: true,
        editPA: true,
        pagosMasivos: false,
        verAdmin: false,
        crearPA: true,
        aprobarProv: false,
    },

};

//  ===================== Funcion PERMISO <gishikoDev_> ======================

function permiso() {
    if (!sesion) {
        return null;
    }

    const permisos = PERMISOS[sesion.perfil];

    if (!permisos) {
        console.error(
            "Perfil sin permisos:",
            sesion.perfil,
            sesion
        );

        return null;
    }

    return permisos;
}


// Personal al que se le pueden asignar tickets: Ajustadores activos (portal_usuarios).
function especialistas() {
  return USUARIOS.filter((u) => u.activo && u.rol === "Ajustador").map((u) => u.nombre);
}

const CONFIG = {
  titulo: "Gestión de Reclamos",
  sla: 10,
  modPA: true,
  modProv: true,
};

/* ================= DATOS DEMO ================= */
let seq = 10,
  seqProv = 4,
  seqPA = 3;
const hoy = new Date();
const HOY = hoy.toISOString().slice(0, 10);
function fechaRel(d) {
  const f = new Date(hoy);
  f.setDate(f.getDate() - d);
  return f.toISOString().slice(0, 10);
}
function radicado(n) {
  return "SGP-2026-" + String(n).padStart(5, "0");
}
function diasDesde(iso) {
  return Math.round((hoy - new Date(iso)) / 86400000);
}

const reclamos = [
  {
    num: radicado(1),
    linea: "SI",
    producto: "Preferencial",
    nombre: "Carlos Espinosa",
    cedula: "8-401-220",
    email: "c.espinosa@mail.com",
    tel: "6231-0021",
    poliza: "SI-11842",
    perfil: "Asegurado / Titular",
    origen: "Portal",
    fecha: fechaRel(21),
    monto: 842.5,
    proveedor: "Clínica Monteazul",
    desc: "Consulta y exámenes por dolor lumbar.",
    estado: "Pagado",
    genelco: "GN-778121",
    asignado: "Jaime Chong",
    recibido: fechaRel(20),
    resuelto: fechaRel(10),
    docs: 5,
    bit: [
      ["Recibido por portal", "Sistema", fechaRel(20)],
      ["Asignado a Jaime Chong", "Aurora Polo", fechaRel(19)],
      ["Vinculado a Genelco GN-778121", "Jaime Chong", fechaRel(18)],
      ["Estado: Recibido → En Proceso", "Jaime Chong", fechaRel(18)],
      ["Estado: En Proceso → Pagado · US$ 842.50", "Jaime Chong", fechaRel(10)],
    ],
  },
  {
    num: radicado(2),
    linea: "SC",
    producto: "Colectivo Salud",
    nombre: "Ana Lucía Herrera",
    cedula: "3-712-889",
    email: "aherrera@empresa.com",
    tel: "6600-1123",
    poliza: "SC-2205 / Grupo Delta",
    perfil: "Asegurado / Titular",
    origen: "Portal",
    fecha: fechaRel(14),
    monto: 1560.0,
    proveedor: "Hospital Manglar",
    desc: "Hospitalización por apendicectomía.",
    estado: "En Proceso",
    genelco: "GN-778940",
    asignado: "Katherine Hidalgo",
    recibido: fechaRel(13),
    resuelto: "",
    docs: 5,
    bit: [
      ["Recibido por portal", "Sistema", fechaRel(13)],
      ["Asignado a Katherine Hidalgo", "Aurora Polo", fechaRel(12)],
      ["Vinculado a Genelco GN-778940", "Katherine Hidalgo", fechaRel(11)],
      ["Estado: Recibido → En Proceso", "Katherine Hidalgo", fechaRel(11)],
    ],
  },
  {
    num: radicado(3),
    linea: "AP",
    producto: "AP Regular",
    nombre: "Luis Miguel Batista",
    cedula: "8-712-455",
    email: "lm.batista@mail.com",
    tel: "6455-8890",
    poliza: "AP-3310",
    perfil: "Asegurado / Titular",
    origen: "Portal",
    fecha: fechaRel(9),
    monto: 395.0,
    proveedor: "Centro Médico Raíces",
    desc: "Caída en bicicleta: radiografías y férula.",
    estado: "En Proceso",
    genelco: "GN-779301",
    recibido: fechaRel(8),
    resuelto: "",
    docs: 5,
    bit: [
      ["Recibido por portal", "Sistema", fechaRel(8)],
      ["Aurora Polo", fechaRel(7)],
      ["Vinculado a Genelco GN-779301", fechaRel(6)],
      ["Estado: Recibido → En Proceso", fechaRel(6)],
    ],
  },
  {
    num: radicado(4),
    linea: "VD",
    producto: "Vida Individual",
    nombre: "Rosa E. Quintero (Q.E.P.D.)",
    cedula: "9-101-882",
    email: "beneficiarios.quintero@mail.com",
    tel: "6788-2210",
    poliza: "VI-0921",
    perfil: "Asegurado / Titular",
    origen: "Portal",
    fecha: fechaRel(30),
    monto: 50000.0,
    proveedor: "",
    desc: "Reclamación de beneficiarios por fallecimiento.",
    estado: "En Proceso",
    genelco: "GN-779455",
    asignado: "Aileen Rodríguez",
    recibido: fechaRel(28),
    resuelto: "",
    docs: 5,
    bit: [
      ["Recibido por portal", "Sistema", fechaRel(28)],
      ["Asignado a Aileen Rodríguez", "Aurora Polo", fechaRel(26)],
      ["Vinculado a Genelco GN-779455", "Aileen Rodríguez", fechaRel(24)],
      ["Estado: Recibido → En Proceso", "Aileen Rodríguez", fechaRel(24)],
    ],
  },
  {
    num: radicado(5),
    linea: "SI",
    producto: "Arco Esencial",
    nombre: "Melissa Tejada",
    cedula: "8-899-102",
    email: "mtejada@mail.com",
    tel: "6120-4451",
    poliza: "",
    perfil: "Corredor de seguros",
    origen: "Portal",
    fecha: fechaRel(5),
    monto: 213.75,
    proveedor: "Laboratorio Clínico Raíces",
    desc: "Reembolso de exámenes de laboratorio.",
    estado: "Recibido",
    genelco: "",
    asignado: "",
    recibido: fechaRel(4),
    resuelto: "",
    docs: 4,
    bit: [["Recibido por portal", "Sistema", fechaRel(4)]],
  },
  {
    num: radicado(6),
    linea: "SC",
    producto: "Colectivo Salud",
    nombre: "Jorge A. Pinzón",
    cedula: "4-220-676",
    email: "facturacion@hgvaldoria.example",
    tel: "6902-3345",
    poliza: "SC-1180 / Textiles PTY",
    perfil: "Hospital / Clínica · Hospital General de Valdoria",
    origen: "Portal",
    fecha: fechaRel(3),
    monto: 4890.0,
    proveedor: "Hospital General de Valdoria",
    desc: "Cirugía ambulatoria, factura hospitalaria directa.",
    estado: "Recibido",
    genelco: "",
    asignado: "",
    recibido: fechaRel(2),
    resuelto: "",
    docs: 5,
    bit: [["Recibido por portal", "Sistema", fechaRel(2)]],
  },
  {
    num: radicado(7),
    linea: "AP",
    producto: "AP Escolar",
    nombre: "Diana Vergara",
    cedula: "8-555-303",
    email: "dvergara@mail.com",
    tel: "6333-7788",
    poliza: "AP-2288",
    perfil: "Asegurado / Titular",
    origen: "Portal",
    fecha: fechaRel(16),
    monto: 120.0,
    proveedor: "Centro escolar / clínica",
    desc: "Consulta de seguimiento posterior a accidente.",
    estado: "Pendiente de Información",
    genelco: "",
    asignado: "Jaime Chong",
    recibido: fechaRel(15),
    resuelto: "",
    docs: 3,
    bit: [
      ["Recibido por portal", "Sistema", fechaRel(15)],
      ["Asignado a Jaime Chong", "Aurora Polo", fechaRel(14)],
      [
        "Estado: Recibido → Pendiente de Información · falta factura original legible",
        "Jaime Chong",
        fechaRel(13),
      ],
    ],
  },
  {
    num: radicado(8),
    linea: "SI",
    producto: "Arco Integral 3",
    nombre: "Ricardo Samudio",
    cedula: "2-118-990",
    email: "rsamudio@mail.com",
    tel: "6011-9080",
    poliza: "SI-13020",
    perfil: "Asegurado / Titular",
    origen: "Portal",
    fecha: fechaRel(1),
    monto: 76.3,
    proveedor: "Farmacia Sanavida",
    desc: "Reembolso de medicamentos recetados.",
    estado: "Recibido",
    genelco: "",
    asignado: "",
    recibido: fechaRel(0),
    resuelto: "",
    docs: 5,
    bit: [["Recibido por portal", "Sistema", fechaRel(0)]],
  },
  {
    num: radicado(9),
    linea: "SI",
    producto: "Arco Kids",
    nombre: "Valeria Núñez (menor)",
    cedula: "8-990-115",
    email: "padres.nunez@mail.com",
    tel: "6788-9911",
    poliza: "SI-14011",
    perfil: "Asegurado / Titular",
    origen: "Importado (Excel)",
    fecha: fechaRel(12),
    monto: 310.0,
    proveedor: "Consultorios Pediátricos",
    desc: "Atención pediátrica y laboratorios.",
    estado: "Pagado",
    genelco: "GN-779820",
    asignado: "Katherine Hidalgo",
    recibido: fechaRel(11),
    resuelto: fechaRel(3),
    docs: 4,
    bit: [
      ["Importado desde Excel (registro físico)", "Aurora Polo", fechaRel(11)],
      ["Vinculado a Genelco GN-779820", "Katherine Hidalgo", fechaRel(9)],
      ["Estado: En Proceso → Pagado", "Katherine Hidalgo", fechaRel(3)],
    ],
  },
  {
    num: radicado(10),
    linea: "AP",
    producto: "AP Escolar",
    nombre: "Colegio Alborada (lote)",
    cedula: "RUC-45512",
    email: "admin@colegioalborada.example",
    tel: "260-4455",
    poliza: "AP-ESC-102",
    perfil: "Hospital / Clínica",
    origen: "Importado (Excel)",
    fecha: fechaRel(6),
    monto: 980.0,
    proveedor: "Clínica escolar",
    desc: "Lote de atenciones escolares del mes.",
    estado: "Rechazado",
    genelco: "GN-779901",
    recibido: fechaRel(5),
    resuelto: fechaRel(1),
    docs: 2,
    bit: [
      ["Importado desde Excel (registro físico)", "Aurora Polo", fechaRel(5)],
      ["Vinculado a Genelco GN-779901", fechaRel(4)],
      [
        "Estado: En Proceso → Rechazado · póliza en suspensión de cobertura a la fecha de atención",
        fechaRel(1),
      ],
    ],
  },
];

const preauths = [
  {
    num: "PA-2026-001",
    asegurado: "Carlos Espinosa",
    paciente: "Carlos Espinosa",
    cedula: "8-401-220",
    email: "c.espinosa@mail.com",
    tel: "6231-0021",
    tipo: "Cirugía ambulatoria",
    medico: "Dr. K. Mensah",
    hospital: "Hospital General de Valdoria",
    urgente: false,
    estado: "En Evaluación",
    autorizacion: "",
    recibido: fechaRel(4),
    desc: "Hernia inguinal: reparación laparoscópica. CPT 49650.",
    bit: [
      ["Recibida por portal", "Sistema", fechaRel(4)],
      ["Aurora Polo", fechaRel(3)],
      ["Estado: Recibida → En Evaluación", fechaRel(2)],
    ],
  },
  {
    num: "PA-2026-002",
    asegurado: "Ana Lucía Herrera",
    paciente: "Sofía Herrera (hija)",
    cedula: "3-712-889",
    email: "aherrera@empresa.com",
    tel: "6600-1123",
    tipo: "Rayos X y laboratorios",
    medico: "Dra. P. Iyer",
    hospital: "Hospital Manglar",
    urgente: true,
    estado: "Recibida",
    asignado: "",
    autorizacion: "",
    recibido: fechaRel(1),
    desc: "Resonancia magnética de rodilla por trauma deportivo.",
    bit: [["Recibida por portal (URGENTE)", "Sistema", fechaRel(1)]],
  },
];

const proveedores = [
  {
    num: "PRV-2026-001",
    nombre: "Centro Médico Brisaclara",
    ruc: "155-698-2210",
    tipo: "Hospital / clínica",
    esp: "Urgencias y hospitalización",
    contacto: "L. Moreno",
    email: "admisiones@cmbrisaclara.example",
    tel: "260-1100",
    dir: "Valdoria, Mirafuentes",
    recibido: fechaRel(12),
    estado: "En revisión",
    notas: "Pendiente verificación de idoneidad.",
    bit: [
      ["Recibido por portal", "Sistema", fechaRel(12)],
      ["Aurora Polo", fechaRel(11)],
      ["Estado: Recibido → En revisión", fechaRel(10)],
    ],
  },
  {
    num: "PRV-2026-002",
    nombre: "Dra. Paola Rangel",
    ruc: "8-777-1020",
    tipo: "Médico especialista",
    esp: "Pediatría",
    contacto: "P. Rangel",
    email: "dra.rangel@mail.com",
    tel: "6788-1102",
    dir: "Ciudad de Panamá",
    recibido: fechaRel(6),
    estado: "Aprobado",
    notas: "Expediente completo. Incluida en tarifario general.",
    bit: [
      ["Recibido por portal", "Sistema", fechaRel(6)],
      ["Estado: En revisión → Aprobado", fechaRel(2)],
    ],
  },
  {
    num: "PRV-2026-003",
    nombre: "LabExpress Panamá",
    ruc: "155-210-4478",
    tipo: "Laboratorio / imágenes",
    esp: "Laboratorio clínico",
    contacto: "M. Ríos",
    email: "info@labexpress.com",
    tel: "302-5566",
    dir: "Vía España",
    recibido: fechaRel(1),
    estado: "Recibido",
    asignado: "",
    notas: "",
    bit: [["Recibido por portal", "Sistema", fechaRel(1)]],
  },
];

let sesion = null;
let usuarioEditando = -1;

/* ============ EXPEDIENTES DOCUMENTALES ============ */
const DOCS_RECLAMO = {
  SI: [
    ["Formulario de reclamo firmado", "formulario"],
    ["Factura original", "factura"],
    ["Recetas médicas", "receta"],
    ["Resultados de laboratorio / imágenes", "resultado"],
    ["Copia de cédula del titular", "identificacion"],
  ],
  SC: [
    ["Formulario colectivo", "formulario"],
    ["Factura hospitalaria", "factura"],
    ["Récipes / indicaciones médicas", "receta"],
    ["Reportes clínicos", "resultado"],
    ["Carnet o cédula del beneficiario", "identificacion"],
  ],
  AP: [
    ["Formulario de accidente", "formulario"],
    ["Facturas médicas", "factura"],
    ["Informe médico", "resultado"],
    ["Copia de cédula", "identificacion"],
  ],
  VD: [
    ["Formulario de beneficiarios", "formulario"],
    ["Certificado de defunción", "identificacion"],
    ["Cédulas de beneficiarios", "identificacion"],
    ["Copia de póliza", "identificacion"],
  ],
};
const DOCS_PROVEEDOR = [
  {
    cat: "Constitución legal",
    items: [
      "Certificado de Registro Público",
      "Aviso de Operación / Idoneidad",
      "Copia de RUC / cédula del representante",
    ],
  },
  {
    cat: "Bancarios y fiscales",
    items: [
      "Certificación bancaria",
      "Formulario W-9 / declaración fiscal",
      "Datos para transferencia (ACH)",
    ],
  },
  {
    cat: "Habilitaciones sanitarias",
    items: [
      "Licencia MINSA vigente",
      "Certificado de idoneidad profesional",
      "Póliza de responsabilidad civil médica",
    ],
  },
  {
    cat: "Operativos",
    items: [
      "Tarifario propuesto",
      "Horarios y sedes de atención",
      "Datos de contacto de facturación",
    ],
  },
];
function docSeed(seed, n) {
  // determinístico simple para "cargado / pendiente"
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return Math.abs((h >> n) & 1);
}
function fmtDocIcon(cat) {
  return (
    {
      formulario: "<span class=ico data-icon=nota aria-hidden=true></span>",
      factura: "<span class=ico data-icon=factura aria-hidden=true></span>",
      receta: "<span class=ico data-icon=medicamento aria-hidden=true></span>",
      resultado: "<span class=ico data-icon=laboratorio aria-hidden=true></span>",
      identificacion: "<span class=ico data-icon=identificacion aria-hidden=true></span>",
    }[cat] || "<span class=ico data-icon=clip aria-hidden=true></span>"
  );
}
function renderDocsReclamo(r) {
  const lista = DOCS_RECLAMO[r.linea] || DOCS_RECLAMO.SI;
  const items = lista
    .map((d, i) => {
      const [nombre, cat] = d;
      const cargado = docSeed(r.num + nombre, i) || i < (r.docs || 0);
      const archivo = cargado
        ? nombre
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "") +
          "_" +
          r.num.replace(/-/g, "") +
          ".pdf"
        : "";
      return `<li style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--niebla);border-radius:10px;margin-bottom:8px;background:${cargado ? "var(--surface-elevated)" : "var(--warning-soft)"}">
      <span style="font-size:18px">${fmtDocIcon(cat)}</span>
      <div style="min-width:0"><b style="color:var(--text-primary);font-size:13.5px">${nombre}</b><br>
        <span style="font-size:11.5px;color:var(--pizarra)">${cargado ? "<span class=ico data-icon=clip aria-hidden=true></span> " + archivo : "<span class=ico data-icon=alerta aria-hidden=true></span> Pendiente por el asegurado"}</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
        ${cargado ? `<button class="btn-link" onclick="verDoc('${archivo}')"><span class=ico data-icon=ver aria-hidden=true></span> Vista previa</button><button class="btn-link" onclick="descDoc('${archivo}')"><span class=ico data-icon=descargar aria-hidden=true></span> Descargar</button>` : ""}
      </div></li>`;
    })
    .join("");
  return `<div class="tarjeta"><h3>Documentos cargados por el asegurado</h3>
    <p class="ayuda">Expediente documental completo · vista previa y descarga individual sin salir del portal.</p>
    <ul style="list-style:none;padding:0;margin:10px 0 6px">${items}</ul>
    <button class="btn btn-ghost btn-sm" onclick="descDocsZip('${r.num}')"><span class=ico data-icon=descargar aria-hidden=true></span> Descargar expediente completo (.zip)</button></div>`;
}
function renderDocsProveedor(p) {
  const bloques = DOCS_PROVEEDOR.map((g, gi) => {
    const items = g.items
      .map((n, i) => {
        const cargado = docSeed(p.num + n, i + gi);
        const archivo = cargado
          ? n
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_|_$/g, "") +
            "_" +
            p.num.replace(/-/g, "") +
            ".pdf"
          : "";
        return `<li style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:9px 11px;border:1px solid var(--niebla);border-radius:9px;margin-bottom:6px;background:${cargado ? "var(--surface-elevated)" : "var(--warning-soft)"}">
        <span style="font-size:16px"><span class=ico data-icon=clip aria-hidden=true></span></span>
        <div style="min-width:0"><b style="color:var(--text-primary);font-size:13px">${n}</b><br>
          <span style="font-size:11px;color:var(--pizarra)">${cargado ? archivo : "Pendiente por el proveedor"}</span></div>
        <div>${cargado ? `<button class="btn-link" onclick="verDoc('${archivo}')"><span class=ico data-icon=ver aria-hidden=true></span></button> <button class="btn-link" onclick="descDoc('${archivo}')"><span class=ico data-icon=descargar aria-hidden=true></span></button>` : '<span class="badge b-ambar">Falta</span>'}</div></li>`;
      })
      .join("");
    return `<div style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><b style="color:var(--text-primary);font-size:13px;text-transform:uppercase;letter-spacing:.4px">${g.cat}</b><span class="badge b-gris">${g.items.length} docs</span></div><ul style="list-style:none;padding:0;margin:0">${items}</ul></div>`;
  }).join("");
  return `<div class="tarjeta"><h3>Expediente documental del proveedor</h3>
    <p class="ayuda">Documentación segregada por categoría · verifique la completitud antes de iniciar la evaluación.</p>
    ${bloques}
    <button class="btn btn-ghost btn-sm" onclick="descDocsZip('${p.num}')"><span class=ico data-icon=descargar aria-hidden=true></span> Descargar expediente completo (.zip)</button></div>`;
}
function verDoc(a) {
  if (!a) return;
  toast("Vista previa: " + a + " (demo)");
}
function descDoc(a) {
  if (!a) return;
  toast("Descargando " + a + " (demo)");
}
function descDocsZip(id) {
  toast("Generando expediente " + id + ".zip (demo)");
}

/* ================= UTILIDADES <gishikoDev_> ================= */
function $(id) {
  return document.getElementById(id);
}
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("ver");
  setTimeout(() => t.classList.remove("ver"), 3000);
}
function money(n) {
  return (
    "US$ " +
    Number(n || 0).toLocaleString("es-PA", { minimumFractionDigits: 2 })
  );
}
function lineaNombre(id) {
  return (LINEAS.find((l) => l.id === id) || {}).nombre || id;
}
// function esAdmin(){ return sesion && ['admin','auditoria'].includes(sesion.perfil); }
function esAdmin() {
  return sesion?.rol === "Admin";
}

/* ================= <gishikoDev_> ================= */
function puedeEditarCampos() {
    return !!(sesion && permiso().editReclamo);
}

/* ================= <gishikoDev_> ================= */
function puedeEditarReserva() {
    return !!(sesion && permiso().editReserva);
}

/* ================= LOGIN (Supabase Auth) ================= */
// Restablece el formulario de acceso. El directorio del personal ya no se expone antes de autenticarse.
function pintarLogin() {
  $("l-pass").value = "";
  mostrarErrorLogin("");
}

function mostrarErrorLogin(mensaje) {
  const caja = $("l-error");
  if (!caja) return;
  caja.textContent = mensaje ? i18nT(mensaje) : "";
  caja.hidden = !mensaje;
}

function ocupadoLogin(ocupado) {
  const boton = $("l-entrar");
  if (!boton) return;
  boton.disabled = ocupado;
  boton.setAttribute("aria-busy", String(ocupado));
}

async function cargarUsuariosPortal() {
  try {
    const lista = await UsuariosRepository.obtenerTodos();
    USUARIOS.splice(0, USUARIOS.length, ...lista);
  } catch (_) {
    toast("No fue posible cargar el directorio del personal.");
  }
}

// Valida el perfil del portal asociado a la cuenta Auth y abre el panel.
async function entrarConCuenta(user, { saludar }) {
  const perfil = await AuthRepository.obtenerPerfil(user.id);
  if (!perfil || !perfil.activo || !PERMISOS[perfil.perfil]) {
    await AuthRepository.cerrarSesion();
    mostrarErrorLogin("Su usuario no está habilitado para el portal interno. Contacte a un administrador.");
    return false;
  }

  sesion = perfil;
  await Promise.all([cargarUsuariosPortal(), cargarIdentidad(), cargarSLAs()]);
  pintarFiltros();

  $("pantalla-login").style.display = "none";
  $("app").classList.add("activa");
  $("u-nombre").textContent = perfil.nombre;
  $("u-rol").textContent = perfil.rol;

  aplicarConfigVisual();
  tab("bandeja");

  if (saludar) toast(i18nT("Bienvenido/a,") + " " + perfil.nombre.split(" ")[0]);
  return true;
}

//      Fun loginEquipo         <<<--- </gishikoDev_> --->>>

async function loginEquipo(e) {
  e.preventDefault();

  const email = $("l-email").value.trim().toLowerCase();
  const password = $("l-pass").value;

  if (!email || !password) {
    mostrarErrorLogin("Ingrese su correo y contraseña.");
    return;
  }

  mostrarErrorLogin("");
  ocupadoLogin(true);
  try {
    const user = await AuthRepository.iniciarSesion(email, password);
    await entrarConCuenta(user, { saludar: true });
  } catch (error) {
    console.error("Error de inicio de sesión:", error);
    mostrarErrorLogin(
      error?.status === 400 || /invalid login credentials/i.test(error?.message || "")
        ? "Correo o contraseña incorrectos."
        : "No fue posible iniciar sesión. Intente nuevamente."
    );
  } finally {
    ocupadoLogin(false);
    $("l-pass").value = "";
  }
}

function mostrarPantallaLogin() {
  sesion = null;
  USUARIOS.splice(0);
  $("app").classList.remove("activa");
  $("pantalla-login").style.display = "flex";
  pintarLogin();
}

async function logout() {
  await AuthRepository.cerrarSesion();
  mostrarPantallaLogin();
}

// Retoma una sesión vigente (recarga de página) y vuelve al login si la sesión termina.
async function restaurarSesion() {
  AuthRepository.alCambiarSesion((evento) => {
    if (evento === "SIGNED_OUT" && sesion) {
      mostrarPantallaLogin();
      mostrarErrorLogin("Su sesión terminó. Inicie sesión nuevamente.");
    }
  });

  try {
    const user = await AuthRepository.usuarioActual();
    if (user) await entrarConCuenta(user, { saludar: false });
  } catch (error) {
    console.error("Error restaurando sesión:", error);
  }
}

//            <<---</gishikoDev_>--->>
function tab(t) {

    document
        .querySelectorAll(".tabpane")
        .forEach((p) => p.classList.add("hidden"));

    const pantalla = $("tab-" + t);

    if (pantalla) {
        pantalla.classList.remove("hidden");
    }

    const marcado =
        {
            detalle: "bandeja",
            "detalle-pa": "preauth",
            "detalle-prov": "provs",
            "detalle-reserva": "reservas",
        }[t] || t;

    document
        .querySelectorAll(".sidebar .item")
        .forEach((i) =>
            i.classList.toggle(
                "on",
                i.dataset.tab === marcado
            )
        );

    // ============================
    // BANDEJA DE RECLAMOS
    // ============================

    if (t === "bandeja") {
        cargarBandeja();
    }

    // ============================
    // RESERVAS
    // ============================

    if (t === "reservas") {
        cargarReservas();
    }

    // ============================
    // PREAUTORIZACIONES
    // ============================

    if (t === "preauth") {
        pintarPA();
    }

    // ============================
    // PROVEEDORES
    // ============================

    if (t === "provs") {
        pintarProvs();
    }

    // ============================
    // ADMINISTRACIÓN
    // ============================

    if (t === "admin") {
        pintarAdmin();
    }
}

/* ================= TABLERO ================= */
function pintarDash() {
  const abiertos = reclamos.filter((r) =>
    ["Recibido", "En Proceso", "Pendiente de Información"].includes(r.estado),
  );
  const sinAsignar = reclamos.filter(
    (r) => !r.asignado && !["Pagado", "Rechazado"].includes(r.estado),
  );
  const pendInfo = reclamos.filter(
    (r) => r.estado === "Pendiente de Información",
  );
  const pagados = reclamos.filter((r) => r.estado === "Pagado");
  const pagadoTotal = pagados.reduce((s, r) => s + r.monto, 0);
  const cerrados = reclamos.filter((r) => r.resuelto);
  const tprom = cerrados.length
    ? cerrados.reduce(
        (s, r) => s + diasDesde(r.recibido) - diasDesde(r.resuelto),
        0,
      ) / cerrados.length
    : 0;
  const dentroSLA = cerrados.length
    ? Math.round(
        (100 *
          cerrados.filter(
            (r) => diasDesde(r.recibido) - diasDesde(r.resuelto) <= CONFIG.sla,
          ).length) /
          cerrados.length,
      )
    : 100;
  const enCursoMonto = abiertos.reduce((s, r) => s + (r.monto || 0), 0);
  $("kpis").innerHTML = `
    <div class="kpi acento"><div class="v">${abiertos.length}</div><div class="l">En curso</div></div>
    <div class="kpi acento"><div class="v">${money(enCursoMonto)}</div><div class="l">Monto en curso</div></div>
    <div class="kpi ambar"><div class="v">${sinAsignar.length}</div><div class="l">Sin asignar</div></div>
    <div class="kpi ambar"><div class="v">${pendInfo.length}</div><div class="l">Pendiente de info</div></div>
    <div class="kpi verde"><div class="v">${money(pagadoTotal)}</div><div class="l">Monto pagado</div></div>
    <div class="kpi"><div class="v">${tprom.toFixed(1)} d</div><div class="l">T. promedio resolución</div></div>
    <div class="kpi"><div class="v">${reclamos.length}</div><div class="l">Total radicados</div></div>`;

  const bar = (datos, clase = "") => {
    const max = Math.max(1, ...datos.map((d) => d[1]));
    return datos
      .map(
        (d) =>
          `<div class="barra ${clase}"><b>${d[2] || d[1]}</b><div class="col" style="height:${Math.max(4, (d[1] / max) * 100)}%"></div><span>${d[0]}</span></div>`,
      )
      .join("");
  };
  $("chart-estados").innerHTML = bar(
    ESTADOS.map((e) => [
      e.replace("Pendiente de Información", "Pend. Info"),
      reclamos.filter((r) => r.estado === e).length,
    ]),
  );
  $("chart-lineas").innerHTML = bar(
    LINEAS.map((l) => [l.id, reclamos.filter((r) => r.linea === l.id).length]),
    "v",
  );
  const prodCount = {};
  reclamos.forEach((r) => {
    if (r.producto) prodCount[r.producto] = (prodCount[r.producto] || 0) + 1;
  });
  const topProd = Object.entries(prodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  $("chart-productos").innerHTML = bar(
    topProd.map(([p, n]) => [p, n]),
    "v",
  );
  const reclamado = reclamos.reduce((s, r) => s + r.monto, 0);
  $("chart-montos").innerHTML = bar(
    [
      ["Reclamado", reclamado, money(reclamado)],
      ["Pagado", pagadoTotal, money(pagadoTotal)],
    ],
    "a",
  );

  const alertas = [];
  preauths
    .filter((p) => p.urgente && !["Autorizada", "Negada"].includes(p.estado))
    .forEach((p) =>
      alertas.push(
        `<span class=ico data-icon=urgente aria-hidden=true></span> Pre-autorización <b>${p.num}</b> marcada <span class="chip-urgente">URGENTE</span> sin resolución (${p.tipo}).`,
      ),
    );
  sinAsignar.forEach((r) =>
    alertas.push(
      `<span class=ico data-icon=alerta aria-hidden=true></span> <b>${r.num}</b> (${lineaNombre(r.linea)} · ${r.producto || "—"}) está <b>sin asignar</b> desde el ${r.recibido}.`,
    ),
  );
  pendInfo.forEach((r) =>
    alertas.push(
      `<span class=ico data-icon=deshacer aria-hidden=true></span> <b>${r.num}</b> pendiente de información del asegurado desde el ${r.bit[r.bit.length - 1][2]}.`,
    ),
  );
  abiertos
    .filter((r) => diasDesde(r.recibido) > CONFIG.sla)
    .forEach((r) =>
      alertas.push(
        `<span class=ico data-icon=reloj aria-hidden=true></span> <b>${r.num}</b> supera el SLA: ${diasDesde(r.recibido)} días abierto${r.genelco ? " (Genelco " + r.genelco + ")" : ""}.`,
      ),
    );
  $("sla-label").textContent = CONFIG.sla;
  $("alertas").innerHTML = alertas.length
    ? alertas.map((a) => `<div class="alerta-item">${a}</div>`).join("")
    : '<div class="alerta-item">Sin alertas activas.</div>';
}

/* ================= BANDEJA ================= */
function pintarFiltros() {
  // Estado, línea y producto se arman con los datos cargados (interno-bandeja.js).
  prepararFiltrosBandeja();
  const previo = $("fil-asig").value;
  $("fil-asig").innerHTML =
    '<option value="">Asignado: todos</option>' +
    (sesion?.rol === "Ajustador" ? '<option value="__mios__">Mis tickets</option>' : "") +
    '<option value="__nadie__">Sin asignar</option>' +
    ajustadoresActivos()
      .map((u) => `<option value="${esc(u.id)}" data-i18n-ignore>${esc(u.nombre)}</option>`)
      .join("");
  if ([...$("fil-asig").options].some((o) => o.value === previo)) $("fil-asig").value = previo;
}
function filtrar() {
  const q = $("fil-busca").value.toLowerCase();
  const fe = $("fil-estado").value,
    fl = $("fil-linea").value,
    fp = $("fil-producto").value,
    fa = $("fil-asig").value;
  return reclamos.filter(
    (r) =>
      (!q || (r.num + r.nombre + r.cedula).toLowerCase().includes(q)) &&
      (!fe || r.estado === fe) &&
      (!fl || r.linea === fl) &&
      (!fp || r.producto === fp) &&
      (!fa || (fa === "__nadie__" ? !r.asignado : r.asignado === fa)),
  );
}
// function pintarBandeja(){
//   $('tbody-bandeja').innerHTML = filtrar().map(r=>`
//     <tr class="fila" onclick="abrirDetalle('${r.num}')">
//       <td class="mono">${r.num}</td>
//       <td><b style="color:var(--text-primary)">${r.nombre}</b><br><span class="mono" style="color:var(--pizarra)">${r.cedula}</span></td>
//       <td>${lineaNombre(r.linea)}</td>
//       <td>${r.producto||'—'}</td>
//       <td>${r.monto?money(r.monto):'Por determinar'}</td>
//       <td>${r.recibido}</td>
//       <td><span class="badge ${BADGE[r.estado]}">${r.estado}</span></td>
//       <td class="mono">${r.genelco||'—'}</td>
//       <td>${r.asignado||'<span class="badge b-ambar">Sin asignar</span>'}</td>
//     </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;color:var(--pizarra);padding:28px">No hay reclamos que coincidan con los filtros.</td></tr>';
// }

/* ---- Exportar / Importar ---- */
const COLS = [
  "Radicado",
  "Asegurado",
  "Cedula",
  "Linea",
  "Producto",
  "Monto",
  "Recibido",
  "Estado",
  "Genelco",
  "Asignado",
  "Poliza",
  "Correo",
  "Telefono",
  "Descripcion",
];
function exportarCSV() {
  const filas = [COLS];
  filtrar().forEach((r) =>
    filas.push([
      r.num,
      r.nombre,
      r.cedula,
      lineaNombre(r.linea),
      r.producto,
      r.monto,
      r.recibido,
      r.estado,
      r.genelco,
      r.asignado,
      r.poliza,
      r.email,
      r.tel,
      r.desc,
    ]),
  );
  const csv = filas
    .map((f) =>
      f.map((c) => '"' + String(c ?? "").replace(/"/g, '""') + '"').join(","),
    )
    .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv" }),
  );
  a.download = "reclamos_dovela_" + HOY + ".csv";
  a.click();
  toast("CSV exportado con " + (filas.length - 1) + " reclamos");
}
function descargarPlantilla() {
  const csv =
    "Asegurado,Cedula,Linea,Producto,Monto,FechaEvento,Poliza,Correo,Telefono,Descripcion\n" +
    '"Juan Pérez","8-111-222","Salud Individual","Arco Esencial","150.00","2026-06-20","SI-99999","jperez@mail.com","6000-0000","Reembolso de consulta"';
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv" }),
  );
  a.download = "plantilla_importacion_reclamos.csv";
  a.click();
}
function lineaId(nombre) {
  const n = String(nombre || "").toLowerCase();
  if (n.includes("individual") && n.includes("salud")) return "SI";
  if (n.includes("colectivo") && n.includes("salud")) return "SC";
  if (n.includes("vida")) return "VD";
  if (n.includes("accidente") || n === "ap") return "AP";
  return "SI";
}
function importarFilas(filas) {
  let ok = 0;
  filas.forEach((f) => {
    const nombre = f.Asegurado || f.asegurado || f.ASEGURADO;
    if (!nombre) return;
    seq++;
    reclamos.unshift({
      num: radicado(seq),
      linea: lineaId(f.Linea || f.linea),
      producto: String(f.Producto || f.producto || ""),
      nombre: String(nombre),
      cedula: String(f.Cedula || f.cedula || ""),
      email: String(f.Correo || f.correo || ""),
      tel: String(f.Telefono || f.telefono || ""),
      poliza: String(f.Poliza || f.poliza || ""),
      perfil: "Registro físico (importado)",
      origen: "Importado (Excel/CSV)",
      fecha: String(f.FechaEvento || f.fechaevento || HOY),
      monto: Number(f.Monto || f.monto || 0) || 0,
      proveedor: "",
      desc: String(f.Descripcion || f.descripcion || ""),
      estado: "Recibido",
      genelco: "",
      asignado: "",
      recibido: HOY,
      resuelto: "",
      docs: 0,
      bit: [["Importado desde archivo (registro físico)", sesion.nombre, HOY]],
    });
    ok++;
  });
  pintarFiltros();
  pintarBandeja();
  toast(ok + " reclamo(s) importados a la bandeja");
}
function importarArchivo(input) {
  const f = input.files[0];
  if (!f) return;
  const ext = f.name.split(".").pop().toLowerCase();
  if (ext === "csv") {
    const lector = new FileReader();
    lector.onload = () => {
      const lineas = lector.result
        .replace(/^\ufeff/, "")
        .split(/\r?\n/)
        .filter((l) => l.trim());
      const head = lineas[0]
        .split(",")
        .map((h) => h.replace(/^"|"$/g, "").trim());
      const filas = lineas.slice(1).map((l) => {
        const vals = l
          .match(/("([^"]|"")*"|[^,]*)(,|$)/g)
          .map((v) =>
            v.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'),
          );
        const o = {};
        head.forEach((h, i) => (o[h] = vals[i] || ""));
        return o;
      });
      importarFilas(filas);
    };
    lector.readAsText(f);
  } else if (typeof XLSX !== "undefined") {
    const lector = new FileReader();
    lector.onload = () => {
      const wb = XLSX.read(new Uint8Array(lector.result), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      importarFilas(XLSX.utils.sheet_to_json(ws));
    };
    lector.readAsArrayBuffer(f);
  } else {
    toast(
      "Sin conexión a la librería XLSX: convierta el archivo a CSV con la plantilla e intente de nuevo.",
    );
  }
  input.value = "";
}

/* ================= DETALLE RECLAMO ================= */
function abrirDetalle(num) {
  const r = reclamos.find((x) => x.num === num);
  if (!r) return;
  $("detalle-body").innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:10px 0 4px">
      <h2 style="margin:0">${r.num}</h2>
      <span class="badge ${BADGE[r.estado]}">${r.estado}</span>
      <span class="badge b-gris">${r.origen}</span>
    </div>
    <p class="sub">${lineaNombre(r.linea)} · ${r.producto || "Producto por validar"} · Recibido el ${r.recibido} · ${r.docs} documento(s)</p>
    <div class="detalle-grid">
      <div>
        <div class="tarjeta">
          <h3>Datos del reclamo</h3>
          <dl class="resumen">
            <dt>Asegurado</dt><dd>${r.nombre} · ${r.cedula}</dd>
            <dt>Contacto</dt><dd>${r.email || "—"} · ${r.tel || "—"}</dd>
            <dt>Presentado por</dt><dd>${r.perfil}</dd>
            <dt>Póliza</dt><dd>${puedeEditarCampos() ? `<input id="d-poliza" value="${r.poliza || ""}" placeholder="Ej. SI-11842" style="font-family:var(--mono);font-size:12.5px;padding:6px 9px">` : r.poliza || "No indicada"}</dd>
            <dt>Evento</dt><dd>${r.fecha} · ${puedeEditarCampos() ? `<input id="d-monto" type="number" step="0.01" value="${r.monto || ""}" placeholder="0.00" style="width:130px;display:inline-block;padding:6px 9px">` : r.monto ? money(r.monto) : "Monto por determinar en el análisis"}${r.proveedor ? " · " + r.proveedor : ""}</dd>
            <dt>Descripción</dt><dd>${r.desc || "—"}</dd>
          </dl>
        </div>
        <div class="tarjeta">
          <h3>Bitácora de trazabilidad</h3>
          <div class="bitacora">${r.bit
            .slice()
            .reverse()
            .map(
              (b) =>
                `<div class="ev"><b>${b[0]}</b><span>${b[1]} · ${b[2]}</span></div>`,
            )
            .join("")}</div>
        </div>
      </div>
      <div>
        <div class="tarjeta">
          <h3>Gestión</h3>
          <div class="campo"><label>Asignar a especialista</label>
            <select id="d-asig"><option value="">Sin asignar</option>${especialistas()
              .map(
                (e) =>
                  `<option ${r.asignado === e ? "selected" : ""}>${e}</option>`,
              )
              .join("")}</select></div>
          <div class="campo"><label>Estado del reclamo</label>
            <select id="d-estado">${ESTADOS.map((e) => `<option ${r.estado === e ? "selected" : ""}>${e}</option>`).join("")}</select>
            <p class="ayuda">Ciclo de vida: Recibido → En Proceso → Pagado. Use "Pendiente de Información" para devoluciones al asegurado.</p></div>
          <div class="campo"><label>Producto (póliza)</label>
            <select id="d-producto"><option value="">Por validar</option>${PRODUCTOS[r.linea].map((p) => `<option ${r.producto === p ? "selected" : ""}>${p}</option>`).join("")}</select></div>
          <div class="campo"><label>N° de reclamo en Core Genelco</label>
            <input id="d-genelco" value="${r.genelco}" placeholder="GN-000000" style="font-family:var(--mono)">
            <p class="ayuda">Requerido para pasar a En Proceso o Pagado: registre el reclamo en Genelco y vincule aquí el número para mantener la trazabilidad.</p></div>
          <div class="campo"><label>Nota de gestión</label>
            <textarea id="d-nota" rows="2" placeholder="Opcional: se registra en la bitácora"></textarea></div>
          <button class="btn btn-azul" style="width:100%;justify-content:center" onclick="
          '${r.num}')">Guardar cambios</button>
        </div>
        ${renderDocsReclamo(r)}
      </div>
    </div>`;
  tab("detalle");
}
function guardarGestion(num) {
  const r = reclamos.find((x) => x.num === num);
  if (!r) return;
  const cambios = [];
  const nAsig = $("d-asig").value,
    nEst = $("d-estado").value,
    nGen = $("d-genelco").value.trim(),
    nProd = $("d-producto").value,
    nota = $("d-nota").value.trim();
  if (nAsig !== r.asignado) {
    cambios.push("Asignado a " + (nAsig || "nadie"));
    r.asignado = nAsig;
  }
  if (puedeEditarCampos()) {
    const nPol = ($("d-poliza")?.value || "").trim();
    const nMon = Number($("d-monto")?.value || 0) || 0;
    if (nPol !== (r.poliza || "")) {
      cambios.push(
        "Póliza corregida: " +
          (r.poliza || "(vacía)") +
          " → " +
          (nPol || "(vacía)"),
      );
      r.poliza = nPol;
    }
    if (nMon !== (r.monto || 0)) {
      cambios.push(
        "Monto corregido: " + money(r.monto || 0) + " → " + money(nMon),
      );
      r.monto = nMon;
    }
  }
  if (nProd !== r.producto) {
    cambios.push("Producto: " + (nProd || "por validar"));
    r.producto = nProd;
  }
  if (nGen !== r.genelco) {
    cambios.push("Vinculado a Genelco " + (nGen || "(retirado)"));
    r.genelco = nGen;
  }
  if (nEst !== r.estado) {
    if (["En Proceso", "Pagado"].includes(nEst) && !r.genelco) {
      toast(
        'Para pasar a "' +
          nEst +
          '" primero registre el reclamo en Genelco y vincule el número.',
      );
      return;
    }
    cambios.push(
      "Estado: " + r.estado + " → " + nEst + (nota ? " · " + nota : ""),
    );
    r.estado = nEst;
    if (["Pagado", "Rechazado"].includes(nEst)) r.resuelto = HOY;
  } else if (nota) cambios.push("Nota: " + nota);
  if (!cambios.length) {
    toast("No hay cambios que guardar.");
    return;
  }
  cambios.forEach((c) => r.bit.push([c, sesion.nombre, HOY]));
  toast("Cambios guardados en " + num);
  abrirDetalle(num);
}

let detalleOrigen = "bandeja";

function volverDesdeDetalle() {
    tab(detalleOrigen);
}

/* ================= PRE-AUTORIZACIONES ================= */
function pintarFiltrosPA() {
  const tipos = [...new Set(preauths.map((p) => p.tipo))].sort();
  $("pa-fil-estado").innerHTML =
    '<option value="">Estado: todos</option>' +
    ESTADOS_PA.map((e) => `<option>${e}</option>`).join("");
  $("pa-fil-tipo").innerHTML =
    '<option value="">Tipo: todos</option>' +
    tipos.map((t) => `<option>${t}</option>`).join("");
  $("pa-fil-asig").innerHTML =
    '<option value="">Asignado: todos</option><option value="__nadie__">Sin asignar</option>' +
    especialistas()
      .map((e) => `<option>${e}</option>`)
      .join("");
}
function filtrarPA() {
  const q = ($("pa-busca").value || "").toLowerCase();
  const fe = $("pa-fil-estado").value,
    ft = $("pa-fil-tipo").value,
    fa = $("pa-fil-asig").value;
  return preauths.filter(
    (p) =>
      (!q ||
        (p.num + p.asegurado + p.paciente + (p.cedula || ""))
          .toLowerCase()
          .includes(q)) &&
      (!fe || p.estado === fe) &&
      (!ft || p.tipo === ft) &&
      (!fa || (fa === "__nadie__" ? !p.asignado : p.asignado === fa)),
  );
}
function pintarPA() {
  if (!$("pa-fil-estado").options.length) pintarFiltrosPA();
  $("tbody-pa").innerHTML =
    filtrarPA()
      .map(
        (p) => `
    <tr class="fila" onclick="abrirDetallePA('${p.num}')">
      <td class="mono">${p.num} ${p.urgente ? '<span class="chip-urgente">URGENTE</span>' : ""}</td>
      <td><b style="color:var(--text-primary)">${p.asegurado}</b><br><span style="color:var(--pizarra);font-size:12px">Paciente: ${p.paciente}</span></td>
      <td>${p.tipo}</td><td>${p.recibido}</td>
      <td><span class="badge ${BADGE_PA[p.estado]}">${p.estado}</span></td>
      <td class="mono">${p.autorizacion || "—"}</td>
      <td>${p.asignado || '<span class="badge b-ambar">Sin asignar</span>'}</td>
    </tr>`,
      )
      .join("") ||
    '<tr><td colspan="7" style="text-align:center;color:var(--pizarra);padding:28px">No hay solicitudes de pre-autorización.</td></tr>';
}
const COLS_PA = [
  "Numero",
  "Asegurado",
  "Paciente",
  "Cedula",
  "Tipo",
  "Medico",
  "Hospital",
  "Estado",
  "Autorizacion",
  "Recibida",
  "Asignado",
  "Correo",
  "Telefono",
  "Urgente",
];
function exportarCSV_PA() {
  const filas = [COLS_PA];
  filtrarPA().forEach((p) =>
    filas.push([
      p.num,
      p.asegurado,
      p.paciente,
      p.cedula,
      p.tipo,
      p.medico,
      p.hospital,
      p.estado,
      p.autorizacion,
      p.recibido,
      p.asignado,
      p.email,
      p.tel,
      p.urgente ? "Sí" : "No",
    ]),
  );
  const csv = filas
    .map((f) =>
      f.map((c) => '"' + String(c ?? "").replace(/"/g, '""') + '"').join(","),
    )
    .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv" }),
  );
  a.download = "preautorizaciones_dovela_" + HOY + ".csv";
  a.click();
  toast("CSV exportado con " + (filas.length - 1) + " pre-autorizaciones");
}
function descargarPlantillaPA() {
  const csv =
    "Asegurado,Paciente,Cedula,Tipo,Medico,Hospital,Diagnostico,Correo,Telefono,Urgente\n" +
    '"Ana Pérez","Ana Pérez","8-111-222","Cirugía ambulatoria","Dr. X","Hospital Y","Colecistectomía","aperez@mail.com","6000-0000","No"';
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv" }),
  );
  a.download = "plantilla_importacion_preautorizaciones.csv";
  a.click();
}
function importarFilasPA(filas) {
  let ok = 0;
  filas.forEach((f) => {
    const aseg = f.Asegurado || f.asegurado;
    if (!aseg) return;
    seqPA++;
    preauths.unshift({
      num: "PA-2026-" + String(seqPA).padStart(3, "0"),
      asegurado: String(aseg),
      paciente: String(f.Paciente || f.paciente || aseg),
      cedula: String(f.Cedula || f.cedula || ""),
      email: String(f.Correo || f.correo || ""),
      tel: String(f.Telefono || f.telefono || ""),
      tipo: String(f.Tipo || f.tipo || "Consulta"),
      medico: String(f.Medico || f.medico || ""),
      hospital: String(f.Hospital || f.hospital || ""),
      urgente: String(f.Urgente || f.urgente || "")
        .toLowerCase()
        .startsWith("s"),
      estado: "Recibida",
      asignado: "",
      autorizacion: "",
      recibido: HOY,
      desc: String(f.Diagnostico || f.diagnostico || ""),
      bit: [["Importada desde archivo", sesion.nombre, HOY]],
    });
    ok++;
  });
  pintarPA();
  toast(ok + " pre-autorización(es) importadas");
}
function importarArchivoPA(input) {
  const f = input.files[0];
  if (!f) return;
  const ext = f.name.split(".").pop().toLowerCase();
  if (ext === "csv") {
    const lector = new FileReader();
    lector.onload = () => {
      const lineas = lector.result
        .replace(/^\ufeff/, "")
        .split(/\r?\n/)
        .filter((x) => x.trim());
      if (!lineas.length) {
        toast("Archivo vacío");
        return;
      }
      const heads = lineas
        .shift()
        .split(",")
        .map((h) => h.replace(/^"|"$/g, "").trim());
      const filas = lineas.map((l) => {
        const c = l
          .match(/("([^"]|"")*"|[^,]*)(,|$)/g)
          .map((x) =>
            x.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'),
          );
        const o = {};
        heads.forEach((h, i) => (o[h] = c[i] || ""));
        return o;
      });
      importarFilasPA(filas);
    };
    lector.readAsText(f);
  } else if (typeof XLSX !== "undefined") {
    const lector = new FileReader();
    lector.onload = () => {
      const wb = XLSX.read(new Uint8Array(lector.result), { type: "array" });
      importarFilasPA(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
    };
    lector.readAsArrayBuffer(f);
  }
  input.value = "";
}
function abrirDetallePA(num) {
  const p = preauths.find((x) => x.num === num);
  if (!p) return;
  $("detalle-pa-body").innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:10px 0 4px">
      <h2 style="margin:0">${p.num}</h2>
      <span class="badge ${BADGE_PA[p.estado]}">${p.estado}</span>
      ${p.urgente ? '<span class="chip-urgente">URGENTE</span>' : ""}
    </div>
    <p class="sub">${p.tipo} · Recibida el ${p.recibido} · Válida por 30 días desde su autorización</p>
    <div class="detalle-grid">
      <div>
        <div class="tarjeta">
          <h3>Datos de la solicitud</h3>
          <dl class="resumen">
            <dt>Asegurado</dt><dd>${p.asegurado} · ${p.cedula}</dd>
            <dt>Paciente</dt><dd>${p.paciente}</dd>
            <dt>Contacto</dt><dd>${p.email} · ${p.tel}</dd>
            <dt>Médico tratante</dt><dd>${p.medico}</dd>
            <dt>Hospital / centro</dt><dd>${p.hospital || "—"}</dd>
            <dt>Diagnóstico y procedimientos</dt><dd>${p.desc}</dd>
          </dl>
        </div>
        <div class="tarjeta">
          <h3>Bitácora</h3>
          <div class="bitacora">${p.bit
            .slice()
            .reverse()
            .map(
              (b) =>
                `<div class="ev"><b>${b[0]}</b><span>${b[1]} · ${b[2]}</span></div>`,
            )
            .join("")}</div>
        </div>
      </div>
      <div>
        <div class="tarjeta">
          <h3>Gestión</h3>
          <div class="campo"><label>Asignar a</label>
            <select id="pa-asig"><option value="">Sin asignar</option>${especialistas()
              .map(
                (e) =>
                  `<option ${p.asignado === e ? "selected" : ""}>${e}</option>`,
              )
              .join("")}</select></div>
          <div class="campo"><label>Estado</label>
            <select id="pa-estado">${ESTADOS_PA.map((e) => `<option ${p.estado === e ? "selected" : ""}>${e}</option>`).join("")}</select></div>
          <div class="campo"><label>N° de autorización</label>
            <input id="pa-auth" value="${p.autorizacion}" placeholder="AUT-000000" style="font-family:var(--mono)">
            <p class="ayuda">Requerido para emitir la Autorización escrita.</p></div>
          <div class="campo"><label>Decisión de la especialista</label>
            <select id="pa-decision">
              <option value="">— seleccione —</option>
              <option value="aprobada">Aprobada</option>
              <option value="declinada">Declinada</option>
              <option value="pendiente">Pendiente de información adicional</option>
            </select></div>
          <div class="campo"><label>Monto aprobado (US$)</label><input id="pa-monto" type="number" step="0.01" placeholder="0.00" value="${p.montoAprob || ""}"></div>
          <div class="campo"><label>Deducible / copago (US$)</label><input id="pa-copago" type="number" step="0.01" placeholder="0.00" value="${p.copago || ""}"></div>
          <div class="campo"><label>Observaciones / exclusiones / condiciones</label>
            <textarea id="pa-obs" rows="3" placeholder="Se registra en la carta y en el expediente">${p.observaciones || ""}</textarea></div>
          <div class="campo"><label>Nota interna (bitácora)</label><textarea id="pa-nota" rows="2"></textarea></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-azul" style="flex:1;justify-content:center" onclick="guardarPA('${p.num}')"><span class=ico data-icon=guardar aria-hidden=true></span> Guardar</button>
            <button class="btn btn-verde" style="flex:1;justify-content:center" onclick="emitirCartaPA('${p.num}')"><span class=ico data-icon=documento aria-hidden=true></span> Emitir carta</button>
          </div>
          <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-top:8px" onclick="enviarCartaPA('${p.num}')"><span class=ico data-icon=correo aria-hidden=true></span> Enviar por correo al asegurado / hospital</button>
        </div>
        <div class="tarjeta">
          <h3>Documentos cargados por el asegurado</h3>
          <p class="ayuda">Expediente documental completo · vista previa y descarga individual.</p>
          <ul style="list-style:none;padding:0;margin:8px 0 0">
            ${(p.docs || ["Formulario_PreAutorizacion_firmado.pdf", "Orden_medica.pdf", "Cotizacion_hospital.pdf", "Examenes_previos.pdf"]).map((d) => `<li style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--niebla);border-radius:10px;margin-bottom:8px;background:var(--surface-elevated)"><span style="font-size:18px"><span class=ico data-icon=clip aria-hidden=true></span></span><div style="min-width:0"><b style="color:var(--text-primary);font-size:13.5px">${d.replace(/_/g, " ").replace(/\.pdf$/, "")}</b><br><span style="font-size:11.5px;color:var(--pizarra)">${d}</span></div><div style="display:flex;gap:6px"><button class="btn-link" onclick="verDoc('${d}')"><span class=ico data-icon=ver aria-hidden=true></span> Ver</button><button class="btn-link" onclick="descDoc('${d}')"><span class=ico data-icon=descargar aria-hidden=true></span></button></div></li>`).join("")}
          </ul>
          <button class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="descDocsZip('${p.num}')"><span class=ico data-icon=descargar aria-hidden=true></span> Descargar expediente completo (.zip)</button>
        </div>
      </div>
    </div>`;
  tab("detalle-pa");
}
let seqAuth = 1000;
function proxAuth() {
  seqAuth++;
  return "AUT-2026-" + String(seqAuth).padStart(5, "0");
}
const DEC_MAP = {
  aprobada: "Autorizada",
  declinada: "Negada",
  pendiente: "En evaluación",
};
function guardarPA(num) {
  const p = preauths.find((x) => x.num === num);
  if (!p) return;
  const cambios = [];
  const nAsig = $("pa-asig").value,
    nEst = $("pa-estado").value,
    nAuth = $("pa-auth").value.trim(),
    nota = $("pa-nota").value.trim();
  const nMon = Number($("pa-monto")?.value || 0) || 0,
    nCop = Number($("pa-copago")?.value || 0) || 0,
    nObs = ($("pa-obs")?.value || "").trim(),
    dec = $("pa-decision")?.value || "";
  if (nAsig !== p.asignado) {
    cambios.push("Asignada a " + (nAsig || "nadie"));
    p.asignado = nAsig;
  }
  let nuevoEstado = nEst;
  if (dec) {
    nuevoEstado = DEC_MAP[dec];
  }
  if (nuevoEstado === "Autorizada" && !nAuth && !p.autorizacion) {
    p.autorizacion = proxAuth();
    cambios.push("N° de autorización asignado: " + p.autorizacion);
  } else if (nAuth !== p.autorizacion) {
    cambios.push("N° de autorización: " + (nAuth || "(retirado)"));
    p.autorizacion = nAuth;
  }
  if (nMon !== (p.montoAprob || 0)) {
    cambios.push("Monto aprobado: " + money(nMon));
    p.montoAprob = nMon;
  }
  if (nCop !== (p.copago || 0)) {
    cambios.push("Deducible/copago: " + money(nCop));
    p.copago = nCop;
  }
  if (nObs !== (p.observaciones || "")) {
    cambios.push("Observaciones actualizadas");
    p.observaciones = nObs;
  }
  if (nuevoEstado !== p.estado) {
    cambios.push(
      "Estado: " + p.estado + " → " + nuevoEstado + (nota ? " · " + nota : ""),
    );
    p.estado = nuevoEstado;
  } else if (nota) cambios.push("Nota: " + nota);
  if (!cambios.length) {
    toast("No hay cambios que guardar.");
    return;
  }
  cambios.forEach((c) => p.bit.push([c, sesion.nombre, HOY]));
  toast("Cambios guardados en " + num);
  abrirDetallePA(num);
}
function emitirCartaPA(num) {
  const p = preauths.find((x) => x.num === num);
  if (!p) return;
  if (!["Autorizada", "Negada", "En evaluación"].includes(p.estado)) {
    toast("Registre primero la decisión.");
    return;
  }
  const validaHasta = new Date(Date.now() + 30 * 864e5).toLocaleDateString(
    "es-PA",
    { day: "numeric", month: "long", year: "numeric" },
  );
  generarCertPreauth({
    num: p.autorizacion || p.num,
    paciente: p.paciente,
    asegurado: p.asegurado,
    cedula: p.cedula,
    cedulaPac: p.cedula,
    poliza: p.poliza || "—",
    hospital: p.hospital,
    medico: p.medico,
    diagnostico: p.desc || "",
    procedimientos: p.tipo,
    observaciones:
      p.observaciones ||
      (p.estado === "Negada"
        ? "Solicitud declinada."
        : p.estado === "En evaluación"
          ? "Pendiente de información adicional."
          : "Autorización emitida."),
    hospitalizacion:
      p.tipo.toLowerCase().includes("cirug") ||
      p.tipo.toLowerCase().includes("hospital")
        ? "SÍ"
        : "NO",
    validaHasta,
    aprobadoPor: sesion.nombre + " · " + sesion.rol,
    estadoDecision: p.estado,
    montoAprob: p.montoAprob || 0,
    copago: p.copago || 0,
  });
  p.bit.push(["Carta emitida (" + p.estado + ")", sesion.nombre, HOY]);
  toast("Carta generada en nueva pestaña");
}
function enviarCartaPA(num) {
  const p = preauths.find((x) => x.num === num);
  if (!p) return;
  if (!p.email) {
    toast("El expediente no tiene correo del asegurado.");
    return;
  }
  p.bit.push([
    "Carta enviada por correo a " +
      p.email +
      (p.hospital ? " y a " + p.hospital : ""),
    sesion.nombre,
    HOY,
  ]);
  toast("Correo enviado (simulado) a " + p.email);
  abrirDetallePA(num);
}

/* ================= PROVEEDORES ================= */
function pintarProvs() {
  $("tbody-provs").innerHTML =
    proveedores
      .map(
        (p) => `
    <tr class="fila" onclick="abrirDetalleProv('${p.num}')">
      <td class="mono">${p.num}</td>
      <td><b style="color:var(--text-primary)">${p.nombre}</b><br><span style="color:var(--pizarra);font-size:12px">${p.email}</span></td>
      <td>${p.tipo}</td><td>${p.esp}</td>
      <td>${p.contacto}</td>
      <td class="mono">${p.tel}</td>
      <td>${p.recibido}</td>
      <td><span class="badge ${BADGE_PROV[p.estado]}">${p.estado}</span></td>
    </tr>`,
      )
      .join("") ||
    '<tr><td colspan="8" style="text-align:center;color:var(--pizarra);padding:28px">No hay solicitudes de proveedores.</td></tr>';
}
function abrirDetalleProv(num) {
  const p = proveedores.find((x) => x.num === num);
  if (!p) return;
  $("detalle-prov-body").innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:10px 0 4px">
      <h2 style="margin:0">${p.num}</h2>
      <span class="badge ${BADGE_PROV[p.estado]}">${p.estado}</span>
    </div>
    <p class="sub">${p.tipo} · ${p.esp} · Recibido el ${p.recibido}</p>
    <div class="detalle-grid">
      <div>
        <div class="tarjeta">
          <h3>Expediente del proveedor</h3>
          <div class="grid2">
            <div class="campo"><label>Razón social</label><input id="pv-nombre" value="${p.nombre}"></div>
            <div class="campo"><label>RUC / cédula</label><input id="pv-ruc" value="${p.ruc}"></div>
            <div class="campo"><label>Persona de contacto</label><input id="pv-contacto" value="${p.contacto}"></div>
            <div class="campo"><label>Teléfono de seguimiento</label><input id="pv-tel" value="${p.tel}"></div>
            <div class="campo"><label>Correo</label><input id="pv-email" value="${p.email}"></div>
            <div class="campo"><label>Dirección</label><input id="pv-dir" value="${p.dir || ""}"></div>
          </div>
        </div>
        <div class="tarjeta">
          <h3>Bitácora</h3>
          <div class="bitacora">${p.bit
            .slice()
            .reverse()
            .map(
              (b) =>
                `<div class="ev"><b>${b[0]}</b><span>${b[1]} · ${b[2]}</span></div>`,
            )
            .join("")}</div>
        </div>
      </div>
      <div>
        <div class="tarjeta">
          <h3>Gestión Red Médica</h3>
          <div class="campo"><label>Asignar a</label>
            <select id="pv-asig"><option value="">Sin asignar</option>${especialistas()
              .map(
                (e) =>
                  `<option ${p.asignado === e ? "selected" : ""}>${e}</option>`,
              )
              .join("")}</select></div>
          <div class="campo"><label>Estado del expediente</label>
            <select id="pv-estado">${ESTADOS_PROV.map((e) => `<option ${p.estado === e ? "selected" : ""}>${e}</option>`).join("")}</select></div>
          <div class="campo"><label>Notas de seguimiento (llamadas / correos)</label>
            <textarea id="pv-notas" rows="3" placeholder="Ej. Llamada 04-jul: pendiente certificación bancaria.">${p.notas || ""}</textarea></div>
          <button class="btn btn-azul" style="width:100%;justify-content:center" onclick="guardarProv('${p.num}')">Guardar cambios</button>
        </div>
        ${renderDocsProveedor(p)}
      </div>
    </div>`;
  tab("detalle-prov");
}
function guardarProv(num) {
  const p = proveedores.find((x) => x.num === num);
  if (!p) return;
  const cambios = [];
  const campos = [
    ["pv-nombre", "nombre", "Razón social"],
    ["pv-ruc", "ruc", "RUC"],
    ["pv-contacto", "contacto", "Contacto"],
    ["pv-tel", "tel", "Teléfono"],
    ["pv-email", "email", "Correo"],
    ["pv-dir", "dir", "Dirección"],
  ];
  campos.forEach(([id, prop, label]) => {
    const v = $(id).value.trim();
    if (v !== (p[prop] || "")) {
      cambios.push(label + " actualizado");
      p[prop] = v;
    }
  });
  const nAsig = $("pv-asig").value,
    nEst = $("pv-estado").value,
    nNotas = $("pv-notas").value.trim();
  if (nAsig !== p.asignado) {
    cambios.push("Asignado a " + (nAsig || "nadie"));
    p.asignado = nAsig;
  }
  if (nNotas !== (p.notas || "")) {
    cambios.push("Nota de seguimiento actualizada");
    p.notas = nNotas;
  }
  if (nEst !== p.estado) {
    cambios.push("Estado: " + p.estado + " → " + nEst);
    p.estado = nEst;
  }
  if (!cambios.length) {
    toast("No hay cambios que guardar.");
    return;
  }
  cambios.forEach((c) => p.bit.push([c, sesion.nombre, HOY]));
  toast("Expediente " + num + " actualizado");
  abrirDetalleProv(num);
}

/* ================= ADMINISTRACIÓN ================= */
function pintarAdmin() {
  pintarRolesTable();
  cargarBanners();
  // Conserva una edición de SLAs en curso; si no hay cambios, parte de lo guardado.
  if (slaModificado()) pintarSLA();
  else iniciarEdicionSLA();
  pintarCatSelect();
  pintarCat();
  pintarRedAdmin();
  pintarPlantSelect();
  pintarPlantilla();
  pintarMail();
  pintarParam();
  pintarAudit();
  const perfilNombre = Object.fromEntries(
    Object.entries(PERMISOS).map(([k, v]) => [k, v.label]),
  );
  $("tbody-users").innerHTML = USUARIOS.map(
    (u, i) => `
    <tr>
      <td><b style="color:var(--text-primary)">${u.nombre}</b></td>
      <td class="mono" style="font-size:11.5px">${u.email}</td>
      <td>${u.rol}</td>
      <td><span class="badge ${["admin", "auditoria"].includes(u.perfil) ? "b-verde" : ["lider", "gerencia", "coordinador"].includes(u.perfil) ? "b-azul" : "b-gris"}">${perfilNombre[u.perfil] || u.perfil}</span></td>
      <td><span class="badge ${u.activo ? "b-verde" : "b-rojo"}">${u.activo ? "Activo" : "Inactivo"}</span></td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="abrirModalUsuario(${i})">Editar</button>
        <button class="btn ${u.activo ? "btn-rojo" : "btn-verde"} btn-sm" onclick="toggleUsuario(${i})">${u.activo ? "Anular" : "Activar"}</button>
      </td>
    </tr>`,
  ).join("");
  aplicarIdentidad();
  $("cfg-mod-pa").checked = CONFIG.modPA;
  $("cfg-mod-prov").checked = CONFIG.modProv;
}
function abrirModalUsuario(i) {
  usuarioEditando = i;
  $("mu-titulo").textContent = i < 0 ? "Crear usuario" : "Editar usuario";
  $("mu-nombre").value = i < 0 ? "" : USUARIOS[i].nombre;
  $("mu-email").value = i < 0 ? "" : USUARIOS[i].email;
  $("mu-email").disabled = i >= 0;
  $("mu-rol").value = i < 0 ? "" : USUARIOS[i].rol;
  $("mu-perfil").value = i < 0 ? "especialista" : USUARIOS[i].perfil;
  $("mu-ayuda").hidden = i >= 0;
  $("modal-usuario").classList.add("ver");
}
function cerrarModalUsuario() {
  $("modal-usuario").classList.remove("ver");
}
async function guardarUsuario() {
  const nombre = $("mu-nombre").value.trim(),
    email = $("mu-email").value.trim().toLowerCase(),
    rol = $("mu-rol").value,
    perfil = $("mu-perfil").value;
  if (nombre.length < 3 || !/.+@.+\..+/.test(email) || !rol) {
    toast("Complete nombre, correo válido y rol.");
    return;
  }
  try {
    if (usuarioEditando < 0) {
      if (USUARIOS.some((u) => u.email === email)) {
        toast("Ya existe un usuario con ese correo.");
        return;
      }
      const creado = await UsuariosRepository.crear({ nombre, email, rol, perfil });
      USUARIOS.push(creado);
      toast(
        creado.auth_id
          ? i18nT("Usuario creado:") + " " + nombre
          : i18nT("Perfil creado. Cree la cuenta de acceso en Supabase Auth con el correo") + " " + email
      );
    } else {
      // El correo identifica la cuenta Auth vinculada: no se edita aquí.
      const actualizado = await UsuariosRepository.actualizar(USUARIOS[usuarioEditando].id, { nombre, rol, perfil });
      Object.assign(USUARIOS[usuarioEditando], actualizado);
      if (actualizado.id === sesion.id) Object.assign(sesion, actualizado);
      toast("Usuario actualizado");
    }
  } catch (error) {
    toast(i18nT("No fue posible guardar el usuario.") + " " + (error?.message || ""));
    return;
  }
  cerrarModalUsuario();
  pintarAdmin();
  pintarFiltros();
}
async function toggleUsuario(i) {
  if (USUARIOS[i].id === sesion.id) {
    toast("No puede anular su propia sesión.");
    return;
  }
  try {
    const actualizado = await UsuariosRepository.actualizar(USUARIOS[i].id, { activo: !USUARIOS[i].activo });
    Object.assign(USUARIOS[i], actualizado);
  } catch (error) {
    toast(i18nT("No fue posible guardar el usuario.") + " " + (error?.message || ""));
    return;
  }
  toast(
    USUARIOS[i].nombre +
      (USUARIOS[i].activo ? " activado" : " anulado (no podrá iniciar sesión)"),
  );
  pintarAdmin();
  pintarFiltros();
}
function aplicarConfig() {
  CONFIG.modPA = $("cfg-mod-pa").checked;
  CONFIG.modProv = $("cfg-mod-prov").checked;
  aplicarConfigVisual();
  toast("Configuración aplicada");
}
function aplicarConfigVisual() {
  $("titulo-portal").textContent = CONFIG.titulo;
  const p = permiso();
  const mods = p.modulos;
  const has = (m) => mods.includes(m);
  // Sidebar por rol + configuración global
  document.querySelectorAll(".sidebar .item").forEach((btn) => {
    const t = btn.getAttribute("data-tab");
    let visible = has(t);
    if (t === "preauth") visible = visible && CONFIG.modPA;
    if (t === "provs") visible = visible && CONFIG.modProv;
    if (t === "admin") {
      visible = esAdmin();
    }
    btn.style.display = visible ? "flex" : "none";
  });
  // Ocultar acciones específicas
  const pm = document.querySelector('[onclick="SC.abrirPagosMasivos()"]');
  if (pm) pm.style.display = p.pagosMasivos ? "" : "none";
}

/* ================= INICIO ================= */
pintarLogin();
pintarFiltros();

// En tablet/móvil la barra de navegación queda fija arriba: su altura desplaza
// las tarjetas sticky del detalle (--alto-barra) para que no queden tapadas.
(function () {
  const barra = document.querySelector(".sidebar");
  if (!barra) return;
  const medir = () => {
    const arriba = getComputedStyle(barra).position === "sticky" && window.matchMedia("(max-width: 1024px)").matches;
    document.documentElement.style.setProperty("--alto-barra", arriba ? barra.offsetHeight + "px" : "0px");
  };
  if ("ResizeObserver" in window) new ResizeObserver(medir).observe(barra);
  window.addEventListener("resize", medir);
  medir();
})();

// Selector de idioma compacto: la píldora muestra el código (ES, EN…) y el
// <select> transparente encima conserva la lista completa y la accesibilidad.
(function () {
  const pintar = () => document.querySelectorAll(".language-select-wrap").forEach((wrap) => {
    const codigo = wrap.querySelector(".language-code");
    const select = wrap.querySelector("select");
    if (codigo && select) codigo.textContent = String(select.value || "es").toUpperCase();
  });
  document.addEventListener("dovela:languagechange", pintar);
  document.addEventListener("change", (e) => { if (e.target.matches?.("[data-language-select]")) pintar(); });
  pintar();
})();

/* ================= RED MÉDICA (datos ficticios con fines demostrativos · corte 05 jul 2026) ================= */
const RED = [
  {
    e: "Alergología",
    n: "Kowalski, Min-jun",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-5404",
  },
  {
    e: "Alergología",
    n: "Lindqvist, Morgan",
    d: "Centro Médico Luz de Valle, piso 6",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "555-8533",
  },
  {
    e: "Alergología",
    n: "Quispe, Ana Lucía",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-1457",
  },
  {
    e: "Alergología - Pediátrica",
    n: "Coloma, Rohan",
    d: "Centro Médico Luz de Valle, piso 11",
    p: "Serranova",
    c: "Nebliza",
    t: "",
  },
  {
    e: "Algiologia - Medicina del Dolor",
    n: "Barahona, Hiroshi",
    d: "Clínica Monteazul, consultorio 304",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-5858",
  },
  {
    e: "Anestesiologia",
    n: "Valencia, Ignacio",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-1881",
  },
  {
    e: "Anestesiologia",
    n: "Fujita, Sakura",
    d: "Policlínica Valdoria Norte, consultorio 882",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2503",
  },
  {
    e: "Anestesiologia",
    n: "Ríos, Lin",
    d: "Centro Médico Faro Verde",
    p: "Valdoria Poniente",
    c: "Villa Ponientes",
    t: "6555-7767",
  },
  {
    e: "Anestesiologia",
    n: "Mendoza Ito, Gael",
    d: "Clínica Monteazul, consultorio 671",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2035",
  },
  {
    e: "Anestesiologia - Algiología",
    n: "Pineda, Luz Marina",
    d: "Torre Médica Manglar, piso 12",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1765",
  },
  {
    e: "Anestesiologia y Reanimacion",
    n: "Achebe, Soo-ah",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-0373",
  },
  {
    e: "Anestesiologia y Reanimación",
    n: "Medina, Elif",
    d: "Clínica Monteazul, consultorio 112",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7466",
  },
  {
    e: "Anestesiologos",
    n: "Grupo Médico Brisaclara",
    d: "Av. del Faro, local 16",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3538",
  },
  {
    e: "Anestesiología",
    n: "Esposito, Andrea",
    d: "Clínica Monteazul, piso 3",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7897",
  },
  {
    e: "Anestesiología",
    n: "Patel, Ravi",
    d: "Hospital General de Valdoria, consultorio 656",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-7737",
  },
  {
    e: "Anestesiología",
    n: "Hayashi, Paloma",
    d: "Clínica Monteazul, piso 7",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-1250",
  },
  {
    e: "Anestesiología",
    n: "Abebe, Jun",
    d: "Clínica Monteazul, consultorio 656",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-9556",
  },
  {
    e: "Anestesiología",
    n: "Nguyen, Akosua",
    d: "Hospital General de Valdoria, consultorio 349",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-2084",
  },
  {
    e: "Anestesiología",
    n: "Delgado, Julián",
    d: "Centro Médico Horizonte Vital, consultorio 597",
    p: "Vega Sonora",
    c: "Sonoria",
    t: "",
  },
  {
    e: "Anestesiología",
    n: "Peralta, Darius",
    d: "Torre Médica Cielo Abierto, piso 8",
    p: "Isla Corviña",
    c: "Puerto Corviña",
    t: "555-5561",
  },
  {
    e: "Anestesiología",
    n: "Osei, Adaeze",
    d: "Hospital General de Valdoria, piso 6",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5896",
  },
  {
    e: "Anestesiología",
    n: "Okoro, Laila",
    d: "Torre Médica Manglar, piso 4",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1548",
  },
  {
    e: "Anestesiología",
    n: "Okoro, Paz",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2090",
  },
  {
    e: "Anestesiología",
    n: "Adeyemi, Julián",
    d: "Clínica Monteazul, piso 12",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2539",
  },
  {
    e: "Anestesiología",
    n: "Patel, Wanjiru",
    d: "Clínica Monteazul, consultorio 439",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-6801",
  },
  {
    e: "Anestesiología",
    n: "Arango, Esperanza",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-6059",
  },
  {
    e: "Anestesiología",
    n: "Lee, Halima",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-8774",
  },
  {
    e: "Anestesiología",
    n: "Kowalski, Dmitri",
    d: "Policlínica Valdoria Norte, consultorio 365",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6086",
  },
  {
    e: "Anestesiología",
    n: "Castillo Nández, Hiroshi",
    d: "Torre Médica Manglar, consultorio 333",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-0878",
  },
  {
    e: "Anestesiología",
    n: "Kim, Pilar",
    d: "Torre Médica Cielo Abierto, piso 1",
    p: "Isla Corviña",
    c: "Puerto Corviña",
    t: "6555-3576",
  },
  {
    e: "Anestesiología",
    n: "Rojas, René",
    d: "Policlínica Valdoria Norte, consultorio 721",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7239",
  },
  {
    e: "Anestesiología",
    n: "Tanaka, Akosua",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2378",
  },
  {
    e: "Anestesiología",
    n: "Tuiasosopo, Aiko",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-0911",
  },
  {
    e: "Anestesiología",
    n: "Ruiz, Tenzin",
    d: "Centro Médico Luz de Valle, piso 4",
    p: "Serranova",
    c: "Nebliza",
    t: "555-2744",
  },
  {
    e: "Anestesiología",
    n: "Cohen, Kalani",
    d: "Hospital General de Valdoria, consultorio 826",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-8012",
  },
  {
    e: "Anestesiología",
    n: "Kowalski, Julián",
    d: "Clínica Monteazul, piso 4",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-8880",
  },
  {
    e: "Anestesiología",
    n: "Hwang, Ayasha",
    d: "Torre Médica Manglar, consultorio 449",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-6056",
  },
  {
    e: "Anestesiología",
    n: "Benítez, Celeste",
    d: "Policlínica Valdoria Norte, consultorio 638",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-8506",
  },
  {
    e: "Anestesiología",
    n: "Ruiz, Amara",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-7010",
  },
  {
    e: "Anestesiología",
    n: "Chen, Alex",
    d: "Hospital General de Valdoria, piso 7",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-1073",
  },
  {
    e: "Anestesiología",
    n: "Yilmaz, Ravi",
    d: "Clínica Monteazul, piso 11",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9915",
  },
  {
    e: "Anestesiología",
    n: "Pineda, Ayasha",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0985",
  },
  {
    e: "Anestesiología",
    n: "Cabrera, Celeste",
    d: "Clínica Monteazul, piso 6",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2495",
  },
  {
    e: "Anestesiología",
    n: "Nguyen, Marisol",
    d: "Policlínica Valdoria Norte, piso 3",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-2378",
  },
  {
    e: "Anestesiología",
    n: "Choque, Gael",
    d: "Torre Médica Manglar, consultorio 305",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-1020",
  },
  {
    e: "Anestesiología",
    n: "Shah, Daniela",
    d: "Centro Médico Raíces, piso 4",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-1780",
  },
  {
    e: "Anestesiología",
    n: "Kowalski, Maya",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2652",
  },
  {
    e: "Anestesiología",
    n: "Duarte, Gael",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2877",
  },
  {
    e: "Anestesiología",
    n: "Al-Sayed, Maya",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6044",
  },
  {
    e: "Anestesiología",
    n: "Aguirre, Sienna",
    d: "Centro Médico Raíces, piso 1",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-4070",
  },
  {
    e: "Anestesiología",
    n: "Quispe, Sakura",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9787",
  },
  {
    e: "Anestesiología",
    n: "Iyer, Yaretzi",
    d: "Policlínica Valdoria Norte, consultorio 352",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-8114",
  },
  {
    e: "Anestesiología",
    n: "Valencia, Amani",
    d: "Torre Médica Manglar, consultorio 600",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-4322",
  },
  {
    e: "Anestesiología",
    n: "Coloma, Maya",
    d: "Policlínica Valdoria Norte, consultorio 481",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-8103",
  },
  {
    e: "Anestesiología",
    n: "Diallo, Julián",
    d: "Centro Médico Raíces, consultorio 407",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3628",
  },
  {
    e: "Anestesiología",
    n: "Salazar, Thandiwe",
    d: "Hospital General de Serranova, consultorio 363",
    p: "Serranova",
    c: "Nebliza",
    t: "6555-8445",
  },
  {
    e: "Anestesiología",
    n: "Arango, Sasha",
    d: "Policlínica Serranova Norte, consultorio 898",
    p: "Serranova",
    c: "Villa Serranova",
    t: "555-6785",
  },
  {
    e: "Anestesiología",
    n: "Cabrera, Zainab",
    d: "Centro Médico Ceiba Viva, piso 9",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-8769",
  },
  {
    e: "Anestesiología",
    n: "Touré, Mariam",
    d: "Hospital General de Valdoria, piso 1",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7512",
  },
  {
    e: "Anestesiología",
    n: "Abebe, Elif",
    d: "Centro Médico Raíces, piso 1",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3693",
  },
  {
    e: "Anestesiología",
    n: "Nwosu, Chidi",
    d: "Centro Médico Luz de Valle, piso 2",
    p: "Serranova",
    c: "Nebliza",
    t: "6555-3527",
  },
  {
    e: "Anestesiología",
    n: "Escobar, Lior",
    d: "Clínica Monteazul, consultorio 578",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-5007",
  },
  {
    e: "Anestesiología",
    n: "Wu, Omar",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-1391",
  },
  {
    e: "Anestesiología",
    n: "Montoya, Wei",
    d: "Torre Médica Manglar, piso 9",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-4554",
  },
  {
    e: "Anestesiología",
    n: "Pineda, Dmitri",
    d: "Hospital General de Valdoria, consultorio 442",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6101",
  },
  {
    e: "Anestesiología",
    n: "Okoro, Bilal",
    d: "Hospital General de Valdoria, piso 1",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5173",
  },
  {
    e: "Anestesiología",
    n: "Oduya, Ayelén",
    d: "Clínica Monteazul, consultorio 132",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2719",
  },
  {
    e: "Anestesiología",
    n: "Lee, Itzel",
    d: "Torre Médica Manglar, piso 12",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-4702",
  },
  {
    e: "Anestesiología",
    n: "Romero Takeda, Sofía",
    d: "Torre Médica Manglar, consultorio 538",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-1885",
  },
  {
    e: "Anestesiología",
    n: "Mensah, Yusuf",
    d: "Hospital General de Valdoria, consultorio 238",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-8178",
  },
  {
    e: "Anestesiología",
    n: "Banerjee, Yuna",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-9525",
  },
  {
    e: "Anestesiología",
    n: "Chen, Oluwaseun",
    d: "Hospital General de Costa Lumbre",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-7822",
  },
  {
    e: "Anestesiología",
    n: "Owusu, Bruno",
    d: "Policlínica Valdoria Norte, consultorio 320",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-7022",
  },
  {
    e: "Anestesiología",
    n: "Ferreira, Kiri",
    d: "Torre Médica Brisaclara, piso 3",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-0436",
  },
  {
    e: "Anestesiología",
    n: "Aguirre, Fatima",
    d: "Hospital General de Valdoria Poniente, consultorio 302",
    p: "Valdoria Poniente",
    c: "Arenaluz",
    t: "555-7321",
  },
  {
    e: "Anestesiología",
    n: "Hwang, Adaeze",
    d: "Torre Médica Manglar, piso 7",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6917",
  },
  {
    e: "Anestesiología",
    n: "Nkosi, Nadia",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8914",
  },
  {
    e: "Anestesiología",
    n: "Barahona, Leilani",
    d: "Clínica Mareaviva, piso 9",
    p: "Serranova",
    c: "Nebliza",
    t: "555-1346",
  },
  {
    e: "Anestesiología",
    n: "Esposito, Taiwo",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2895",
  },
  {
    e: "Anestesiología",
    n: "Huanca, Marisol",
    d: "Torre Médica Manglar, piso 5",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5804",
  },
  {
    e: "Anestesiología",
    n: "Aguirre, Paz",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2759",
  },
  {
    e: "Anestesiología",
    n: "Benítez, Mónica",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-6618",
  },
  {
    e: "Anestesiología",
    n: "Afolabi, Luz Marina",
    d: "Torre Médica Monteazul",
    p: "Serranova",
    c: "Nebliza",
    t: "555-5255",
  },
  {
    e: "Anestesiología",
    n: "Shah, Elif",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-7121",
  },
  {
    e: "Anestesiología",
    n: "Rivera Solís, Gael",
    d: "Clínica Mareaviva, piso 10",
    p: "Serranova",
    c: "Nebliza",
    t: "555-9148",
  },
  {
    e: "Anestesiología",
    n: "Montoya, René",
    d: "Clínica Monteazul, piso 3",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-7523",
  },
  {
    e: "Anestesiología",
    n: "Campos, Zhen",
    d: "Policlínica Valdoria Norte, consultorio 366",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "",
  },
  {
    e: "Anestesiología",
    n: "Ono, Anh",
    d: "Hospital General de Valdoria, piso 7",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-4057",
  },
  {
    e: "Anestesiología",
    n: "Kaur, Bilal",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5278",
  },
  {
    e: "Anestesiología",
    n: "Hayashi, Ibrahim",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-4713",
  },
  {
    e: "Anestesiología",
    n: "Achebe, Ravi",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-9209",
  },
  {
    e: "Anestesiología",
    n: "Arias, Aylin",
    d: "Policlínica Llano Norte, piso 1",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "6555-8452",
  },
  {
    e: "Anestesiología",
    n: "Rojas, Maya",
    d: "Policlínica Valdoria Norte, consultorio 206",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3875",
  },
  {
    e: "Anestesiología",
    n: "Castillo Nández, Rohan",
    d: "Policlínica Valdoria Norte, consultorio 770",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-4020",
  },
  {
    e: "Anestesiología",
    n: "Osei, Teodoro",
    d: "Clínica Mareaviva, consultorio 114",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-9057",
  },
  {
    e: "Anestesiología",
    n: "Kaur, Noa",
    d: "Policlínica Valdoria Norte, piso 3",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-4951",
  },
  {
    e: "Anestesiología",
    n: "Navarro Tzul, Lucía",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6108",
  },
  {
    e: "Anestesiología",
    n: "Tuiasosopo, Tenzin",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-7186",
  },
  {
    e: "Anestesiología",
    n: "Vargas, Jun",
    d: "Clínica Aurelia",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-1807",
  },
  {
    e: "Anestesiología",
    n: "Nakamura, Sami",
    d: "Clínica Aurelia",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-2396",
  },
  {
    e: "Anestesiología",
    n: "Delgado, Mónica",
    d: "Torre Médica Manglar, consultorio 827",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-4133",
  },
  {
    e: "Anestesiología",
    n: "Diallo, Wanjiru",
    d: "Hospital General de Valdoria, piso 5",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1432",
  },
  {
    e: "Anestesiología",
    n: "Romero Takeda, Yaretzi",
    d: "Centro Médico Raíces, piso 8",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9292",
  },
  {
    e: "Anestesiología",
    n: "Duarte, Pilar",
    d: "Torre Médica Manglar, piso 6",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-0765",
  },
  {
    e: "Anestesiología",
    n: "Tran, Joaquín",
    d: "Policlínica Valdoria Norte, piso 6",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-6962",
  },
  {
    e: "Anestesiología",
    n: "Sato, Nkechi",
    d: "Clínica Monteazul, consultorio 242",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3013",
  },
  {
    e: "Anestesiología",
    n: "Mendoza Ito, Omar",
    d: "Clínica Monteazul, consultorio 437",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9277",
  },
  {
    e: "Anestesiología",
    n: "Sánchez Wong, Morgan",
    d: "Torre Médica Manglar, piso 9",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-7865",
  },
  {
    e: "Anestesiología",
    n: "Ferreira, Fatima",
    d: "Centro Médico Raíces, consultorio 380",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-6131",
  },
  {
    e: "Anestesiología",
    n: "Campos, Adaeze",
    d: "Centro Médico Raíces, piso 3",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-1562",
  },
  {
    e: "Anestesiología",
    n: "Osei, Aiko",
    d: "Policlínica Valdoria Norte, consultorio 790",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-6681",
  },
  {
    e: "Anestesiología",
    n: "Ndiaye, Xiomara",
    d: "Policlínica Valdoria Norte, piso 3",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1588",
  },
  {
    e: "Anestesiología",
    n: "Kealoha, Diego",
    d: "Clínica Monteazul, piso 7",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7241",
  },
  {
    e: "Anestesiología",
    n: "Shah, Carmen",
    d: "Centro Médico Raíces, consultorio 465",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2890",
  },
  {
    e: "Anestesiología",
    n: "Okoro, Camila",
    d: "Hospital General de Valdoria, consultorio 220",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2563",
  },
  {
    e: "Anestesiología",
    n: "Al-Sayed, Alex",
    d: "Hospital General de Valdoria, consultorio 105",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9325",
  },
  {
    e: "Anestesiología",
    n: "Escobar, Thiago",
    d: "Policlínica Valdoria Norte, piso 1",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-1961",
  },
  {
    e: "Anestesiología",
    n: "Choque, Paloma",
    d: "Clínica Monteazul, consultorio 568",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1148",
  },
  {
    e: "Anestesiología",
    n: "Achterberg, Javier",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7482",
  },
  {
    e: "Anestesiología",
    n: "Cohen, Zainab",
    d: "Policlínica Valdoria Norte, consultorio 777",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-4370",
  },
  {
    e: "Anestesiología",
    n: "Petrov, Gael",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8432",
  },
  {
    e: "Anestesiología",
    n: "Escobar, Yaretzi",
    d: "Torre Médica Manglar, piso 11",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-6308",
  },
  {
    e: "Anestesiología",
    n: "Nwosu, Gael",
    d: "Torre Médica Manglar, consultorio 503",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3542",
  },
  {
    e: "Anestesiología",
    n: "Acosta, Gabriela",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-4237",
  },
  {
    e: "Anestesiología",
    n: "Ortiz Kahale, Nikhil",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3635",
  },
  {
    e: "Anestesiología",
    n: "Benítez, Isabela",
    d: "Hospital General de Valdoria, consultorio 449",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0168",
  },
  {
    e: "Anestesiología",
    n: "Rojas, Lin",
    d: "Policlínica Valdoria Norte, consultorio 185",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-8964",
  },
  {
    e: "Anestesiología",
    n: "Osei, Kalani",
    d: "Hospital General de Valdoria, consultorio 892",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7635",
  },
  {
    e: "Anestesiología",
    n: "Zelaya, Arjun",
    d: "Centro Médico Luz de Valle",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "6555-2568",
  },
  {
    e: "Anestesiología",
    n: "Méndez, Morgan",
    d: "Torre Médica Manglar, consultorio 646",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-0794",
  },
  {
    e: "Anestesiología",
    n: "Benítez, Anh",
    d: "Policlínica Valdoria Norte, consultorio 899",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8630",
  },
  {
    e: "Anestesiología",
    n: "Mendoza Ito, Rosa Elena",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-5010",
  },
  {
    e: "Anestesiología",
    n: "Clínica Sanavida",
    d: "Calle Luna Clara, local 27",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6717",
  },
  {
    e: "Anestesiología",
    n: "Huamán, Kofi",
    d: "Torre Médica Manglar, consultorio 598",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6832",
  },
  {
    e: "Anestesiología",
    n: "Romero Takeda, Nikhil",
    d: "Torre Médica Manglar, piso 7",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-1459",
  },
  {
    e: "Anestesiología",
    n: "Banerjee, Robin",
    d: "Centro Médico Raíces, consultorio 588",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-4112",
  },
  {
    e: "Anestesiología",
    n: "Ramírez, Hamza",
    d: "Centro Médico Raíces, consultorio 737",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-5979",
  },
  {
    e: "Anestesiología",
    n: "Nakamura, Samir",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-4905",
  },
  {
    e: "Anestesiología",
    n: "Kowalski, Amara",
    d: "Clínica Monteazul, piso 5",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-0053",
  },
  {
    e: "Anestesiología - Algiología - Medicina del Dolor",
    n: "Mbeki, Kiri",
    d: "Policlínica Valdoria Norte, consultorio 105",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2517",
  },
  {
    e: "Anestesiología - Algiología - Medicina del dolor",
    n: "Ruiz, Mei Ling",
    d: "Torre Médica Manglar, consultorio 103",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7122",
  },
  {
    e: "Anestesiología - Neuroanestesiólogo",
    n: "Méndez, Nayeli",
    d: "Clínica Monteazul, piso 6",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7455",
  },
  {
    e: "Anestesiología - obstétricia y Anestesia Regional Basadaenanatomía",
    n: "Yilmaz, Sasha",
    d: "Centro Médico Raíces, piso 1",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-5344",
  },
  {
    e: "Anestesiología Pediátrica",
    n: "Acosta, Fatima",
    d: "Clínica Monteazul, piso 2",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2566",
  },
  {
    e: "Anestesiología Pediátrica",
    n: "Valencia, Hiroshi",
    d: "Hospital General de Valdoria, consultorio 432",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-8185",
  },
  {
    e: "Anestesiología Pediátrica",
    n: "Méndez, Min-jun",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "",
  },
  {
    e: "Anestesiología y Reanimación",
    n: "Hayashi, Ayo",
    d: "Clínica Monteazul, consultorio 853",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-8686",
  },
  {
    e: "Anestesiología y Reanimación",
    n: "Hosseini, Omar",
    d: "Centro Médico Raíces, piso 4",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3827",
  },
  {
    e: "Anestesiología y Reanimación",
    n: "Torres Akana, Celeste",
    d: "Torre Médica Manglar, piso 7",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-0916",
  },
  {
    e: "Anestesiología y Reanimación",
    n: "Torres Akana, Sofía",
    d: "Centro Médico Raíces, piso 10",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3382",
  },
  {
    e: "Anestesiología y Reanimación",
    n: "Ortiz Kahale, Rubí",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-8469",
  },
  {
    e: "Anestesiología y Reanimación",
    n: "Choque, Wanjiru",
    d: "Hospital General de Valdoria, piso 3",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-6679",
  },
  {
    e: "Anestesiología y Reanimación",
    n: "Valencia, Santiago",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1298",
  },
  {
    e: "Anestesiología- Medicina Critica - Terapia Intensiva (cuidados intensivos)",
    n: "Tuiasosopo, Rosa Elena",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3016",
  },
  {
    e: "Anestesiología-Cuidados Intesivos- Med. Critica",
    n: "Rosenthal, Andrea",
    d: "Hospital General de Valdoria, piso 10",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-2731",
  },
  {
    e: "Anestesioloía - Algeología",
    n: "Rahman, Thiago",
    d: "Policlínica Valdoria Norte, piso 7",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-4848",
  },
  {
    e: "Atención Médica",
    n: "Hayashi, Thandiwe",
    d: "Torre Médica Manglar, piso 8",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7422",
  },
  {
    e: "Atroscopias, Vasectomia, Circunsicion, Colonoscopia, Endoscopia, Biopsias, Hernias, etc",
    n: "Centro Médico Orquídea",
    d: "Av. del Faro, local 49",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4435",
  },
  {
    e: "Cardiología",
    n: "Mendoza Ito, Taiwo",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3265",
  },
  {
    e: "Cardiología",
    n: "Cabrera, Kalani",
    d: "Centro Médico Raíces, consultorio 359",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2072",
  },
  {
    e: "Cardiología",
    n: "Torres Akana, Yuna",
    d: "Clínica Monteazul, consultorio 642",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9109",
  },
  {
    e: "Cardiología",
    n: "Achebe, Santiago",
    d: "Hospital General de Valdoria, consultorio 640",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7235",
  },
  {
    e: "Cardiología - Electrofisiólogo - Estimulación Cardíaca",
    n: "Afolabi, René",
    d: "Hospital General de Valdoria, consultorio 832",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7854",
  },
  {
    e: "Cardiología - Med. Interna - Cardiología Intervencionista",
    n: "Kim, Esteban",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-2523",
  },
  {
    e: "Cardiología Pediátrica - Cardiología Intervencionista",
    n: "Fujita, Ezequiel",
    d: "Torre Médica Manglar, consultorio 130",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0918",
  },
  {
    e: "Cardiovascular",
    n: "Clínica Arcoíris",
    d: "Calle 12 Norte, local 1",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0269",
  },
  {
    e: "Cirugia General",
    n: "Moreno Ibáñez, Aiyana",
    d: "Clínica Mareaviva, piso 11",
    p: "Serranova",
    c: "Nebliza",
    t: "555-2975",
  },
  {
    e: "Cirugia General",
    n: "Chen, Lucía",
    d: "Policlínica Valdoria Norte, consultorio 198",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-4625",
  },
  {
    e: "Cirugia Maxilofacial",
    n: "Al-Sayed, Mei Ling",
    d: "Hospital General de Llano Dorado",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "6555-3286",
  },
  {
    e: "Cirugias, Endoscopias, estudios especiales",
    n: "Quispe, Yerlan",
    d: "Hospital General de Valdoria, consultorio 232",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9964",
  },
  {
    e: "Cirugía Dermatológica",
    n: "Bermúdez, Ilan",
    d: "Centro Médico Raíces, consultorio 277",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-8276",
  },
  {
    e: "Cirugía Dermatológica - Oncología - Reconstrucción",
    n: "Delgado, Nayeli",
    d: "Clínica Monteazul, consultorio 890",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-1718",
  },
  {
    e: "Cirugía General",
    n: "Navarro Tzul, Lin",
    d: "Centro Médico Raíces, consultorio 817",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7887",
  },
  {
    e: "Cirugía General",
    n: "Okoro, Elif",
    d: "Hospital General de Serranova, piso 5",
    p: "Serranova",
    c: "Villa Serranova",
    t: "555-1286",
  },
  {
    e: "Cirugía General",
    n: "Kim, Renata",
    d: "Centro Médico Raíces, consultorio 745",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-2231",
  },
  {
    e: "Cirugía General",
    n: "Ben-David, Xiomara",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-7087",
  },
  {
    e: "Cirugía General",
    n: "Pineda, Bilal",
    d: "Policlínica Valdoria Norte, consultorio 534",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1654",
  },
  {
    e: "Cirugía General",
    n: "Achebe, Teodoro",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-8811",
  },
  {
    e: "Cirugía General",
    n: "Gallardo, Bilal",
    d: "Hospital General de Valdoria, piso 10",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9580",
  },
  {
    e: "Cirugía General",
    n: "Wu, Ngozi",
    d: "Torre Médica Brisaclara, consultorio 376",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-6100",
  },
  {
    e: "Cirugía General",
    n: "Kealoha, Valentina",
    d: "Clínica Aurelia, consultorio 583",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-3369",
  },
  {
    e: "Cirugía General",
    n: "Mahmoud, Jun",
    d: "Hospital General de Montebrisa, piso 12",
    p: "Montebrisa",
    c: "Brisalta",
    t: "555-3667",
  },
  {
    e: "Cirugía General",
    n: "Choque, Rocío",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-9496",
  },
  {
    e: "Cirugía General",
    n: "Tanaka, Lucía",
    d: "Clínica Monteazul, consultorio 219",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0537",
  },
  {
    e: "Cirugía General",
    n: "Barahona, Ana Lucía",
    d: "Hospital General de Valdoria, consultorio 347",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5985",
  },
  {
    e: "Cirugía General",
    n: "Asante, Nikhil",
    d: "Hospital General de Vega Sonora, piso 5",
    p: "Vega Sonora",
    c: "Las Calandrias",
    t: "",
  },
  {
    e: "Cirugía General",
    n: "Cuéllar, Morgan",
    d: "Clínica Monteazul, piso 2",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5327",
  },
  {
    e: "Cirugía General",
    n: "Nguyen, Morgan",
    d: "Torre Médica Trébol, piso 5",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "6555-3801",
  },
  {
    e: "Cirugía General",
    n: "Yilmaz, Aiko",
    d: "Policlínica Costa Norte",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-2650",
  },
  {
    e: "Cirugía General",
    n: "Abebe, Ariel",
    d: "Hospital General de Valdoria, consultorio 592",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2564",
  },
  {
    e: "Cirugía General",
    n: "Medina, Kiri",
    d: "Hospital General de Serranova, consultorio 207",
    p: "Serranova",
    c: "Nebliza",
    t: "555-5699",
  },
  {
    e: "Cirugía General",
    n: "Achebe, Diego",
    d: "Policlínica Costa Norte, consultorio 817",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-2030",
  },
  {
    e: "Cirugía General",
    n: "Wu, Celeste",
    d: "Hospital General de Serranova, consultorio 374",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-4469",
  },
  {
    e: "Cirugía General",
    n: "Rahman, Paloma",
    d: "Clínica Aurelia",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "6555-8661",
  },
  {
    e: "Cirugía General",
    n: "Ikeda, Noa",
    d: "Hospital General de Valdoria, consultorio 622",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-1981",
  },
  {
    e: "Cirugía General",
    n: "Campos, Abena",
    d: "Policlínica Valdoria Norte, consultorio 196",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-5126",
  },
  {
    e: "Cirugía General",
    n: "Mendoza Ito, Javier",
    d: "Centro Médico Raíces, consultorio 362",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4259",
  },
  {
    e: "Cirugía General",
    n: "Baptiste, Amani",
    d: "Policlínica Cumbrelinda Norte, piso 9",
    p: "Cumbrelinda",
    c: "Villa Cumbre",
    t: "555-9601",
  },
  {
    e: "Cirugía General",
    n: "Odhiambo, Renata",
    d: "Torre Médica Trébol, consultorio 640",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "6555-0535",
  },
  {
    e: "Cirugía General",
    n: "Kaur, Laila",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-5901",
  },
  {
    e: "Cirugía General",
    n: "Sánchez Wong, Arjun",
    d: "Torre Médica Cielo Abierto",
    p: "Isla Corviña",
    c: "Puerto Corviña",
    t: "6555-0808",
  },
  {
    e: "Cirugía General",
    n: "Villalobos, Noa",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-8513",
  },
  {
    e: "Cirugía General",
    n: "Acosta, Ilan",
    d: "Policlínica Valdoria Norte, piso 4",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-8618",
  },
  {
    e: "Cirugía General",
    n: "Balogun, Luz Marina",
    d: "Hospital General de Valdoria, consultorio 677",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-0474",
  },
  {
    e: "Cirugía General",
    n: "Montoya, Luz Marina",
    d: "Torre Médica Monteazul, consultorio 337",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "6555-0310",
  },
  {
    e: "Cirugía General",
    n: "Danso, Femi",
    d: "Hospital General de Serranova",
    p: "Serranova",
    c: "Nebliza",
    t: "",
  },
  {
    e: "Cirugía General",
    n: "Abdi, Santiago",
    d: "Policlínica Costa Norte",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-8271",
  },
  {
    e: "Cirugía General",
    n: "Yilmaz, Samir",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-9571",
  },
  {
    e: "Cirugía General",
    n: "Méndez, Robin",
    d: "Clínica Monteazul, consultorio 328",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7789",
  },
  {
    e: "Cirugía General",
    n: "Tuiasosopo, Chidi",
    d: "Centro Médico Luz de Valle, consultorio 877",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-6503",
  },
  {
    e: "Cirugía General",
    n: "Peralta, Luz Marina",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6183",
  },
  {
    e: "Cirugía General",
    n: "Torres Akana, Bruno",
    d: "Centro Médico Luz de Valle",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-1187",
  },
  {
    e: "Cirugía General",
    n: "Osei, Sakura",
    d: "Centro Médico Ceiba Viva",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-5670",
  },
  {
    e: "Cirugía General",
    n: "Eze, Mariam",
    d: "Hospital General de Valdoria, piso 9",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0949",
  },
  {
    e: "Cirugía General",
    n: "Achebe, Tenzin",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-9979",
  },
  {
    e: "Cirugía General",
    n: "Villalobos, Mei Ling",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5592",
  },
  {
    e: "Cirugía General",
    n: "Pineda, Ariel",
    d: "Hospital General de Valdoria, consultorio 686",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2734",
  },
  {
    e: "Cirugía General",
    n: "Bermúdez, Ravi",
    d: "Hospital General de Isla Corviña",
    p: "Isla Corviña",
    c: "Puerto Corviña",
    t: "555-8692",
  },
  {
    e: "Cirugía General",
    n: "Singh, Rafael",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-8107",
  },
  {
    e: "Cirugía General",
    n: "Nkosi, Morgan",
    d: "Torre Médica Raíces, piso 12",
    p: "Vega Sonora",
    c: "Las Calandrias",
    t: "6555-8086",
  },
  {
    e: "Cirugía General",
    n: "Tran, Eun-ji",
    d: "Clínica Monteazul, piso 1",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1631",
  },
  {
    e: "Cirugía General",
    n: "Vargas, Daniela",
    d: "Clínica Monteazul, consultorio 771",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5042",
  },
  {
    e: "Cirugía General",
    n: "Solano, Isabela",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-6190",
  },
  {
    e: "Cirugía General - Cirugía Bariátrica y Metabólica",
    n: "Banerjee, Ezequiel",
    d: "Centro Médico Raíces, consultorio 296",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-2232",
  },
  {
    e: "Cirugía General - Cirugía Oncológica",
    n: "Arias, Ilan",
    d: "Torre Médica Manglar, piso 1",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-0588",
  },
  {
    e: "Cirugía General - Cirugía Toráxica",
    n: "Kim, Itzel",
    d: "Clínica Mareaviva, piso 9",
    p: "Serranova",
    c: "Nebliza",
    t: "555-2417",
  },
  {
    e: "Cirugía General - Coloproctología",
    n: "Fujita, Imani",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-9575",
  },
  {
    e: "Cirugía General - Coloproctología",
    n: "Rosenthal, Kalani",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-1230",
  },
  {
    e: "Cirugía General - Coloproctología",
    n: "Rosenthal, Gael",
    d: "Hospital General de Valdoria, piso 5",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-9598",
  },
  {
    e: "Cirugía General - Coloproctología",
    n: "Serrano, Aiyana",
    d: "Policlínica Serranova Norte, consultorio 824",
    p: "Serranova",
    c: "Villa Serranova",
    t: "555-6928",
  },
  {
    e: "Cirugía General - Coloproctología",
    n: "Arias, Mei Ling",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3168",
  },
  {
    e: "Cirugía General - Coloproctología",
    n: "Moreno Ibáñez, Rafael",
    d: "Centro Médico Raíces, consultorio 430",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-6252",
  },
  {
    e: "Cirugía General - Endocrinologo",
    n: "Sato, Aiyana",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3968",
  },
  {
    e: "Cirugía General - Hepatobiliar y Transplante",
    n: "Benítez, Min-jun",
    d: "Hospital General de Valdoria, piso 11",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-8112",
  },
  {
    e: "Cirugía General - Laparoscopia - Trauma",
    n: "Odhiambo, Laila",
    d: "Centro Médico Raíces, consultorio 418",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6951",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Iyer, Kiri",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-1751",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Sato, Cruz",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9295",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Singh, Ravi",
    d: "Centro Médico Raíces, consultorio 517",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5167",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Touré, Isabela",
    d: "Hospital General de Costa Lumbre, piso 11",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "6555-5609",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Nwosu, Femi",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-3722",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Acosta, Gael",
    d: "Clínica Monteazul, consultorio 705",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-5866",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Yilmaz, René",
    d: "Torre Médica Manglar, piso 8",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-6569",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Fuentes, Nayeli",
    d: "Hospital General de Valdoria, consultorio 625",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3120",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Salazar, Rohan",
    d: "Clínica Monteazul, piso 11",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-8681",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Vargas, Paloma",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-9279",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Liu, Túpac",
    d: "Policlínica Valdoria Norte, piso 11",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3554",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Serrano, Nkechi",
    d: "Centro Médico Raíces, consultorio 278",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-7446",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Medina, Rosa Elena",
    d: "Clínica Monteazul, piso 9",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-0607",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Arango, Eun-ji",
    d: "Centro Médico Raíces, piso 2",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7597",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Okoro, Wei",
    d: "Policlínica Valdoria Norte, consultorio 134",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3232",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Nakamura, Carmen",
    d: "Hospital General de Valdoria, consultorio 429",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-9321",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Kaur, Ximena",
    d: "Policlínica Valdoria Norte, consultorio 393",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-2016",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Fernández Levi, Clara",
    d: "Policlínica Valdoria Norte, consultorio 366",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-5521",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Cuéllar, Ibrahim",
    d: "Torre Médica Manglar, consultorio 131",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5026",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Guerrero, Esteban",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8563",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Kaur, Xiomara",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-5752",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Valencia, Pilar",
    d: "Torre Médica Manglar, consultorio 650",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-5622",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Achterberg, Nayeli",
    d: "Clínica Monteazul, consultorio 771",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3311",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Delgado, Nadia",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7344",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Kamau, Arjun",
    d: "Torre Médica Monteazul, consultorio 100",
    p: "Serranova",
    c: "Nebliza",
    t: "6555-3672",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Nkosi, Elías",
    d: "Clínica Aurelia, piso 11",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-3220",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Ben-David, Itzel",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-6550",
  },
  {
    e: "Cirugía General - Laparoscópia",
    n: "Owusu, Laila",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-1054",
  },
  {
    e: "Cirugía General - Transplante de Hígado y Cirugía Hepato Pancreato Biliar",
    n: "Oduya, Tomás",
    d: "Clínica Monteazul, piso 10",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6890",
  },
  {
    e: "Cirugía General - adulto y niños",
    n: "Benítez, Soo-ah",
    d: "Clínica Monteazul, piso 6",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3663",
  },
  {
    e: "Cirugía General y Laparascopica",
    n: "Pineda, Rafael",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-6912",
  },
  {
    e: "Cirugía General y Oncología",
    n: "Owusu, Leilani",
    d: "Policlínica Valdoria Norte, consultorio 208",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-3759",
  },
  {
    e: "Cirugía General-Laparascópica y Hepato Pancreatico Biliar",
    n: "Achterberg, Andrés",
    d: "Centro Médico Faro Verde, consultorio 160",
    p: "Valdoria Poniente",
    c: "Arenaluz",
    t: "555-0533",
  },
  {
    e: "Cirugía Mamaria",
    n: "Nasser, Paloma",
    d: "Hospital General de Serranova",
    p: "Serranova",
    c: "Nebliza",
    t: "555-1955",
  },
  {
    e: "Cirugía Mamaria- Ginecología - Oncólogo",
    n: "Oduya, Lior",
    d: "Centro Médico Raíces, consultorio 188",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-1288",
  },
  {
    e: "Cirugía Maxilofacial",
    n: "Kealoha, Sami",
    d: "Centro Médico Raíces, piso 11",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2217",
  },
  {
    e: "Cirugía Maxilofacial",
    n: "Domínguez, Mónica",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-6394",
  },
  {
    e: "Cirugía Maxilofacial- Cirugía Plastica y reconstructiva",
    n: "Adeyemi, Ezequiel",
    d: "Hospital General de Valdoria, consultorio 571",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0693",
  },
  {
    e: "Cirugía Oncológica",
    n: "Afolabi, Lucía",
    d: "Clínica Monteazul, consultorio 234",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3098",
  },
  {
    e: "Cirugía Oncológica",
    n: "Cohen, Celeste",
    d: "Hospital General de Valdoria, consultorio 236",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-6711",
  },
  {
    e: "Cirugía Oncológica",
    n: "Nakamura, Aiko",
    d: "Policlínica Valdoria Norte, consultorio 451",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-9149",
  },
  {
    e: "Cirugía Oncológica",
    n: "Mwangi, Ayo",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-1991",
  },
  {
    e: "Cirugía Oncológica - Cirugía General",
    n: "Osei, Kwame",
    d: "Torre Médica Manglar, consultorio 380",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-5327",
  },
  {
    e: "Cirugía Pediátrica",
    n: "Mahmoud, Ngozi",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-4288",
  },
  {
    e: "Cirugía Plástica",
    n: "Eze, Túpac",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9515",
  },
  {
    e: "Cirugía Plástica",
    n: "Medina, Mateo",
    d: "Policlínica Valdoria Norte, piso 1",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-1547",
  },
  {
    e: "Cirugía Plástica",
    n: "Ferreira, Laila",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-4374",
  },
  {
    e: "Cirugía Plástica",
    n: "Bravo, Sakura",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-2966",
  },
  {
    e: "Cirugía Plástica",
    n: "Diallo, Fatima",
    d: "Centro Médico Raíces, consultorio 224",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1282",
  },
  {
    e: "Cirugía Plástica",
    n: "Medina, Teodoro",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-0220",
  },
  {
    e: "Cirugía Plástica",
    n: "Danso, Elif",
    d: "Torre Médica Manglar, piso 8",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-6598",
  },
  {
    e: "Cirugía Plástica",
    n: "Romero Takeda, Sakura",
    d: "Policlínica Valdoria Norte, consultorio 585",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7693",
  },
  {
    e: "Cirugía Plástica",
    n: "Vargas, Leilani",
    d: "Torre Médica Manglar, consultorio 182",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-5078",
  },
  {
    e: "Cirugía Plástica y Reconstructiva",
    n: "Abiodun, Anh",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-0578",
  },
  {
    e: "Cirugía Plástica y Reconstructiva",
    n: "Ben-David, Sasha",
    d: "Clínica Aurelia, consultorio 661",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-7100",
  },
  {
    e: "Cirugía Plástica, Estética, reconstructiva y Microcirugía reconstructiva",
    n: "Ríos, Eun-ji",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-8406",
  },
  {
    e: "Cirugía Plástica, urgencias",
    n: "Suzuki, Maya",
    d: "Clínica Monteazul, piso 1",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-1719",
  },
  {
    e: "Cirugía Proctológica",
    n: "Diallo, Thandiwe",
    d: "Torre Médica Manglar, consultorio 166",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-4045",
  },
  {
    e: "Cirugía Proctológica",
    n: "Valencia, Alex",
    d: "Torre Médica Manglar, consultorio 204",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-1818",
  },
  {
    e: "Cirugía Proctológica",
    n: "Zhang, Fatima",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3001",
  },
  {
    e: "Cirugía Proctológica",
    n: "Fernández Levi, Ariel",
    d: "Clínica Monteazul, piso 6",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9705",
  },
  {
    e: "Cirugía Proctológica",
    n: "Obi, Sienna",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-7583",
  },
  {
    e: "Cirugía Proctológica",
    n: "Pineda, Xiomara",
    d: "Hospital General de Isla Corviña, consultorio 403",
    p: "Isla Corviña",
    c: "Puerto Corviña",
    t: "6555-6523",
  },
  {
    e: "Cirugía Proctológica",
    n: "Cuéllar, Adaeze",
    d: "Policlínica Serranova Norte, piso 2",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-9164",
  },
  {
    e: "Cirugía Sub - Gastro Intestinal",
    n: "Medina, Min-jun",
    d: "Policlínica Serranova Norte, consultorio 119",
    p: "Serranova",
    c: "Villa Serranova",
    t: "555-9919",
  },
  {
    e: "Cirugía de Manos y Microcirugía",
    n: "Shah, Ibrahim",
    d: "Centro Médico Raíces, piso 10",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2888",
  },
  {
    e: "CirugíaGeneral",
    n: "Ramírez, Morgan",
    d: "Centro Médico Almendro Azul, piso 11",
    p: "Cumbrelinda",
    c: "Villa Cumbre",
    t: "555-2284",
  },
  {
    e: "CirugíaGeneral - Coloproctología",
    n: "Wu, Túpac",
    d: "Hospital General de Valdoria, piso 11",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3264",
  },
  {
    e: "CirugíaGeneral - Hepato - Pancreto - biliar y tranplante hepático",
    n: "Haddad, Santiago",
    d: "Centro Médico Raíces, piso 12",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-7320",
  },
  {
    e: "Cirujano Oftalmologo",
    n: "Kowalski, Camila",
    d: "Hospital General de Valdoria, consultorio 328",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3150",
  },
  {
    e: "Cirujano Onclogo - Torácica",
    n: "Lozano, Marisol",
    d: "Centro Médico Raíces, consultorio 787",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-2280",
  },
  {
    e: "Cirujano Oncologo - Laparascopia",
    n: "Mamani, Jun",
    d: "Hospital General de Valdoria, consultorio 857",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4634",
  },
  {
    e: "Clinica, Laboratorio, Consulta Med. General y Especialistas, Urgencias Menores,Ultrasonidos",
    n: "Policlínica Ámbar",
    d: "Paseo Mareaviva, local 60",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9574",
  },
  {
    e: "Clinica, consultas medicas, terapias, urgencias medicas",
    n: "Policlínica Alborada",
    d: "Calle Luna Clara, local 33",
    p: "Vega Sonora",
    c: "Las Calandrias",
    t: "6555-5505",
  },
  {
    e: "Coloproctologo - coloproctoliga",
    n: "Lozano, Thandiwe",
    d: "Torre Médica Monteazul",
    p: "Serranova",
    c: "Villa Serranova",
    t: "555-2161",
  },
  {
    e: "Consulta Med. General, Especialista, Urgencias Menores,Laboratorios etc.",
    n: "Policlínica Brisaclara",
    d: "Calle Los Guayabos Azules, local 51",
    p: "Selvarrica",
    c: "Riolindo",
    t: "555-9397",
  },
  {
    e: "Consulta Med. General, Especialista, Urgencias Menores,Laboratorios, Electrocardiograma, Cauterizacion de Lunares y Verrugas etc.",
    n: "Policlínica Ceiba Viva",
    d: "Calle Colibrí, local 33",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2608",
  },
  {
    e: "Consultas - Laboratorios",
    n: "Coloma, Soo-ah",
    d: "Policlínica Llano Norte, consultorio 541",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "6555-8828",
  },
  {
    e: "Consultas Med. General y Especialistas - Laboratorios- Urgencias Menores -",
    n: "Policlínica Bienestar Integral",
    d: "Calle Luna Clara, local 38",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-1747",
  },
  {
    e: "Consultas Medicas, Laboratorio",
    n: "Clínica Manglar",
    d: "Calle Luna Clara, local 54",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-6614",
  },
  {
    e: "Consultas con especialistas, atencion medica, examenes",
    n: "Centro Médico Equilibra",
    d: "Vía Alborada, local 50",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7267",
  },
  {
    e: "Consultas con especialistas, estudios cardiologicos Holter, Eco,USG, Cirugias",
    n: "Clínica Bienestar Integral",
    d: "Calle Luna Clara, local 49",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-1732",
  },
  {
    e: "Dermatología",
    n: "Arias, Emeka",
    d: "Centro Médico Raíces, consultorio 859",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-8560",
  },
  {
    e: "Dermatología",
    n: "Fujita, Paz",
    d: "Torre Médica Manglar, consultorio 395",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-0182",
  },
  {
    e: "Electrocardiograma con Informe - Pruebade Esfuerzo o Ergometría - Holter Cardiaco - Mapa - Ecocardiograma Transtorácico",
    n: "Danso, Renata",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-0704",
  },
  {
    e: "Endocrinología",
    n: "Chen, Lin",
    d: "Torre Médica Trébol, consultorio 614",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "555-0750",
  },
  {
    e: "Especialistas en Resonancia Magnética",
    n: "Centro Médico Colibrí",
    d: "Calle Colibrí, local 25",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-7343",
  },
  {
    e: "Especialistas en Resonancia Magnética- Tomografía- Ultrasonidos",
    n: "Centro de Imágenes Lumen",
    d: "Av. Las Ceibas Altas, local 23",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0463",
  },
  {
    e: "Fisioterapia y Rehabilitación",
    n: "Centro de Rehabilitación Sendero",
    d: "Calle 12 Norte, local 20",
    p: "Valdoria Poniente",
    c: "Villa Ponientes",
    t: "555-9427",
  },
  {
    e: "Fisioterapia y Rehabilitación",
    n: "Policlínica Mareaviva",
    d: "Calle Luna Clara, local 24",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0455",
  },
  {
    e: "Gastroenterologia - Endoscopia Digestiva",
    n: "Delgado, Kwame",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7137",
  },
  {
    e: "Gastroenterología",
    n: "Singh, Isabela",
    d: "Hospital General de Valdoria, consultorio 177",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-7904",
  },
  {
    e: "Gastroenterología",
    n: "Quispe, Dalia",
    d: "Centro Médico Raíces, consultorio 505",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-5030",
  },
  {
    e: "Gastroenterología",
    n: "Rosenthal, Ariel",
    d: "Torre Médica Manglar, piso 12",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3916",
  },
  {
    e: "Gastroenterología",
    n: "Nguyen, Sofía",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6005",
  },
  {
    e: "Gastroenterología",
    n: "Sánchez Wong, Zainab",
    d: "Centro Médico Raíces, consultorio 354",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-0150",
  },
  {
    e: "Gastroenterología",
    n: "Mendoza Ito, Ana Lucía",
    d: "Policlínica Valdoria Norte, piso 10",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-4207",
  },
  {
    e: "Gastroenterología",
    n: "Haddad, Valentina",
    d: "Centro Médico Luz de Valle",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "555-4394",
  },
  {
    e: "Gastroenterología",
    n: "Achterberg, Emeka",
    d: "Centro Médico Raíces, consultorio 425",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-7615",
  },
  {
    e: "Gastroenterología",
    n: "Aguirre, Min-jun",
    d: "Clínica Monteazul, piso 4",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-7049",
  },
  {
    e: "Gastroenterología",
    n: "Ikeda, Paloma",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2127",
  },
  {
    e: "Gastroenterología",
    n: "Okafor, Santiago",
    d: "Hospital General de Valdoria, piso 11",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3331",
  },
  {
    e: "Ginecologia - Obstetricia",
    n: "Lindqvist, Pilar",
    d: "Policlínica Valdoria Norte, consultorio 718",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0368",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Abiodun, Taiwo",
    d: "Clínica Monteazul, consultorio 811",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-8692",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Nasser, Diego",
    d: "Hospital General de Valdoria, consultorio 153",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-6793",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Herrera Luna, Min-jun",
    d: "Policlínica Valdoria Norte, piso 7",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4816",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Tran, Ezequiel",
    d: "Centro Médico Raíces, piso 6",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-6077",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Medina, Santiago",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1826",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Vargas, Ariel",
    d: "Centro Médico Raíces, consultorio 658",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-5455",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Esposito, Inés",
    d: "Policlínica Valdoria Norte, piso 3",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3552",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Shah, Ayelén",
    d: "Policlínica Valdoria Norte, consultorio 693",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-1035",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Rivera Solís, Camila",
    d: "Centro Médico Raíces, piso 3",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-8753",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Villalobos, Tomás",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9419",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Benítez, Ngozi",
    d: "Centro Médico Raíces, consultorio 128",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8962",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Valencia, Gabriela",
    d: "Hospital General de Valdoria, piso 4",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-1334",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Torres Akana, Kiri",
    d: "Clínica Monteazul, piso 11",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-5541",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Herrera Luna, Isabela",
    d: "Hospital General de Valdoria, piso 5",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-4512",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Montoya, Soo-ah",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-9591",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Ono, Imani",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-1856",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Aguirre, Gabriela",
    d: "Policlínica Valdoria Norte, piso 8",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7533",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Medina, Kofi",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-6767",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Touré, Sami",
    d: "Clínica Monteazul, consultorio 390",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3065",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Abiodun, Ayasha",
    d: "Torre Médica Brisaclara, piso 12",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-8837",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Haddad, Dmitri",
    d: "Torre Médica Manglar, consultorio 108",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-5206",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Hayashi, Zhen",
    d: "Clínica Monteazul, piso 3",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-4196",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Tran, Mariam",
    d: "Hospital General de Valdoria, piso 11",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6833",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Ferreira, Diego",
    d: "Clínica Monteazul, consultorio 594",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-0871",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Singh, Nikhil",
    d: "Torre Médica Manglar, piso 12",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-8354",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Benítez, Inés",
    d: "Policlínica Valdoria Norte, piso 7",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-3758",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Duarte, Daniela",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0653",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Fuentes, Teodoro",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-0907",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Liu, Camila",
    d: "Hospital General de Valdoria, piso 10",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2870",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Cabrera, Dalia",
    d: "Hospital General de Valdoria, consultorio 139",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-8698",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Ríos, Ravi",
    d: "Policlínica Valdoria Norte, piso 2",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7716",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Abiodun, Carmen",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-4223",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Abiodun, Camila",
    d: "Clínica Monteazul, piso 1",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7024",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Mendoza Ito, Akosua",
    d: "Policlínica Valdoria Norte, piso 7",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2885",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Lindqvist, Mei Ling",
    d: "Clínica Mareaviva",
    p: "Serranova",
    c: "Nebliza",
    t: "555-7530",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Baptiste, Yaretzi",
    d: "Centro Médico Raíces, consultorio 590",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-1679",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Kamau, Zainab",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-4302",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Yilmaz, Javier",
    d: "Hospital General de Valdoria, piso 1",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-5124",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Mensah, Yerlan",
    d: "Clínica Monteazul, consultorio 715",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-4154",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Serrano, Oluwaseun",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-8749",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Fuentes, Ilan",
    d: "Centro Médico Raíces, consultorio 475",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2139",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Huanca, Yaretzi",
    d: "Policlínica Serranova Norte, consultorio 145",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-9324",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Diallo, Kai",
    d: "Clínica Monteazul, piso 6",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-0643",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Ruiz, Paz",
    d: "Torre Médica Manglar, piso 7",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-5991",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Moreno Ibáñez, Clara",
    d: "Torre Médica Manglar, piso 11",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3009",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Campos, Kenji",
    d: "Policlínica Valdoria Norte, piso 6",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3578",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Danso, Jordan",
    d: "Torre Médica Manglar, consultorio 461",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-3248",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Nkosi, Elif",
    d: "Policlínica Valdoria Norte, piso 2",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-0636",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Adeyemi, Ariel",
    d: "Torre Médica Manglar, consultorio 801",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-0066",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Tanaka, Pilar",
    d: "Torre Médica Manglar, consultorio 776",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2283",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Choque, Malik",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-8995",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Medina, Alex",
    d: "Centro Médico Raíces, consultorio 180",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9582",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Lozano, Diego",
    d: "Policlínica Valdoria Norte, piso 11",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-2946",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Matsuda, Kenji",
    d: "Policlínica Valdoria Norte, consultorio 245",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3564",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Valencia, Julián",
    d: "Clínica Aurelia",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-1992",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Gallardo, Yusuf",
    d: "Hospital General de Costa Lumbre, piso 12",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-7155",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Rahman, Aiyana",
    d: "Centro Médico Raíces, consultorio 684",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2973",
  },
  {
    e: "Ginecología - Obstetricia - Laparoscopia",
    n: "Nguyen, Sasha",
    d: "Hospital General de Valdoria, consultorio 299",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-8918",
  },
  {
    e: "Ginecología - Obstetricia - MaternoFetal",
    n: "Cárdenas, Tomás",
    d: "Centro Médico Luz de Valle",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "6555-0954",
  },
  {
    e: "Ginecología - Obstetricia - MaternoFetal",
    n: "Ben-David, Renata",
    d: "Hospital General de Valdoria, piso 1",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-5724",
  },
  {
    e: "Ginecología - Obstetricia - Oncológica",
    n: "Peralta, Ignacio",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3546",
  },
  {
    e: "Ginecología - Oncología",
    n: "Guerrero, Aiyana",
    d: "Clínica Monteazul, consultorio 788",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-1735",
  },
  {
    e: "Ginecología - Oncológica",
    n: "Watanabe, Esperanza",
    d: "Policlínica Valdoria Norte, piso 9",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5235",
  },
  {
    e: "Ginecología - Perinatología",
    n: "Solano, Rohan",
    d: "Policlínica Valdoria Norte, piso 12",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-5553",
  },
  {
    e: "Ginecología - Perinatología",
    n: "Ruiz, Pilar",
    d: "Torre Médica Manglar, consultorio 545",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-8249",
  },
  {
    e: "Ginelogía Obstetra",
    n: "Mwangi, Wei",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8983",
  },
  {
    e: "Hematología",
    n: "Ramírez, Emeka",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-8791",
  },
  {
    e: "Hematología",
    n: "Nakamura, Ilan",
    d: "Torre Médica Manglar, piso 5",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0586",
  },
  {
    e: "Hematología",
    n: "Ríos, Rohan",
    d: "Policlínica Valdoria Norte, consultorio 127",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-2645",
  },
  {
    e: "Hematología Pediátrica",
    n: "Aguirre, Elías",
    d: "Torre Médica Trébol",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "555-7817",
  },
  {
    e: "Hematología Pediátrica",
    n: "Medina, Anh",
    d: "Policlínica Valdoria Norte, piso 9",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5153",
  },
  {
    e: "Consultas - Laboratorios -Procedimientos",
    n: "Clínica Horizonte Vital Express",
    d: "Torre Médica Nubeluz, local 12",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6886",
  },
  {
    e: "Infectología",
    n: "Hwang, Zainab",
    d: "Centro Médico Raíces, consultorio 199",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4002",
  },
  {
    e: "Infectología - Med. Interna",
    n: "Méndez, Halima",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-3947",
  },
  {
    e: "Insumos Médicos",
    n: "Romero Takeda, Esteban",
    d: "Torre Médica Manglar, consultorio 627",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7591",
  },
  {
    e: "Integral Medical Care Clinic, sa.",
    n: "Pineda, Kenji",
    d: "Clínica Monteazul, consultorio 438",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7496",
  },
  {
    e: "Laboratorio",
    n: "Guerrero, Anh",
    d: "Hospital General de Costa Lumbre, piso 4",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "555-2271",
  },
  {
    e: "Laboratorio",
    n: "Rosenthal, Laila",
    d: "Policlínica Valdoria Norte, piso 1",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-5682",
  },
  {
    e: "Laboratorios",
    n: "Laboratorio Clínico Raíces",
    d: "Paseo Mareaviva, local 49",
    p: "Cumbrelinda",
    c: "Villa Cumbre",
    t: "555-9820",
  },
  {
    e: "Laboratorios al 100%, Med. General, Serv. A domicilio para laboratorios al 100%, Inyectables, Curaciones",
    n: "Clínica Luz de Valle",
    d: "Calle Luna Clara, local 19",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7029",
  },
  {
    e: "Laboratorios en general, Pruebas especiales, Serv. A domicilio",
    n: "Laboratorio Clínico Horizonte Vital",
    d: "Av. Central Sur, local 32",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2660",
  },
  {
    e: "Laboratorios en general, pruebas de Covid",
    n: "Laboratorio Clínico Orquídea",
    d: "Av. Central Sur, local 12",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-1218",
  },
  {
    e: "Laboratorios, Consulta Med. General, Especialista, Urgencias Menores, etc.",
    n: "Centro Médico Manglar",
    d: "Paseo Mareaviva, local 13",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "6555-7900",
  },
  {
    e: "Laboratorios, consultas, Rx, Ultrasonidos,Urgencias menores",
    n: "Clínica Faro Verde",
    d: "Calle 12 Norte, local 14",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-1117",
  },
  {
    e: "Med General - Evaluaciones Médicas",
    n: "Centro Médico Luz de Valle",
    d: "Av. del Faro, local 32",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "6555-2780",
  },
  {
    e: "Med Interna - Oncología Médica",
    n: "Escobar, Teodoro",
    d: "Torre Médica Manglar, piso 8",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3530",
  },
  {
    e: "Med. General, Consulta con Especialistas, Laboratorios, Sutura, Pap, Canalizacion",
    n: "Policlínica Horizonte Vital",
    d: "Av. Las Ceibas Altas, local 29",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3262",
  },
  {
    e: "Med. Interna, Gastroenterología, Endoscopia Digestiva",
    n: "Centro Médico Amanecer",
    d: "Paseo Mareaviva, local 10",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-0344",
  },
  {
    e: "Medicina General",
    n: "Baptiste, Yusuf",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-9834",
  },
  {
    e: "Medicina Interna",
    n: "Peralta, Itzel",
    d: "Policlínica Costa Norte",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "6555-3759",
  },
  {
    e: "Medicina Crítica - Intensivista",
    n: "Cohen, Ana Lucía",
    d: "Hospital General de Serranova",
    p: "Serranova",
    c: "Nebliza",
    t: "555-1022",
  },
  {
    e: "Medicina Crítica - Intensivista",
    n: "Hwang, Luz Marina",
    d: "Torre Médica Manglar, consultorio 253",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7522",
  },
  {
    e: "Medicina Crítica y Emergencias",
    n: "Mahmoud, Esperanza",
    d: "Centro Médico Raíces, consultorio 842",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5939",
  },
  {
    e: "Medicina Familiar",
    n: "Tran, Sasha",
    d: "Policlínica Valdoria Norte, consultorio 494",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2620",
  },
  {
    e: "Medicina Familiar",
    n: "Afolabi, Ngozi",
    d: "Torre Médica Manglar, consultorio 179",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0556",
  },
  {
    e: "Medicina Fisica - Rehabilitación",
    n: "Osei, Femi",
    d: "Hospital General de Valdoria, consultorio 483",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-6693",
  },
  {
    e: "Medicina Fisica - Rehabilitación",
    n: "Lozano, Wei",
    d: "Hospital General de Valdoria, consultorio 515",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3167",
  },
  {
    e: "Medicina Fisica - Rehabilitación",
    n: "Suzuki, Ilan",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6117",
  },
  {
    e: "Medicina General",
    n: "Balogun, Abena",
    d: "Hospital General de Valdoria, piso 11",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6797",
  },
  {
    e: "Medicina General",
    n: "Hwang, Gabriela",
    d: "Clínica Vitalia, consultorio 123",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "555-0660",
  },
  {
    e: "Medicina General",
    n: "Liu, Morgan",
    d: "Clínica Monteazul, consultorio 129",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-4970",
  },
  {
    e: "Medicina General",
    n: "Shah, Marisol",
    d: "Torre Médica Raíces, consultorio 372",
    p: "Vega Sonora",
    c: "Las Calandrias",
    t: "6555-8200",
  },
  {
    e: "Medicina General",
    n: "Lindqvist, Nayeli",
    d: "Policlínica Isla Norte, piso 1",
    p: "Isla Corviña",
    c: "Puerto Corviña",
    t: "",
  },
  {
    e: "Medicina General",
    n: "Ono, Robin",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-6810",
  },
  {
    e: "Medicina General",
    n: "Matsuda, Ngozi",
    d: "Centro Médico Ceiba Viva",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "555-7884",
  },
  {
    e: "Medicina General",
    n: "Rosenthal, Jun",
    d: "Centro Médico Raíces, consultorio 266",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7699",
  },
  {
    e: "Medicina General",
    n: "Nakamura, Esteban",
    d: "Hospital General de Costa Lumbre, piso 2",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "6555-2113",
  },
  {
    e: "Medicina Interna",
    n: "Petrov, Ayasha",
    d: "Hospital General de Montebrisa",
    p: "Montebrisa",
    c: "Brisalta",
    t: "6555-0540",
  },
  {
    e: "Medicina Interna",
    n: "Hayashi, Daniela",
    d: "Centro Médico Luz de Valle, piso 9",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "6555-9242",
  },
  {
    e: "Medicina Interna",
    n: "Serrano, Bruno",
    d: "Centro Médico Raíces, consultorio 663",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-0749",
  },
  {
    e: "Medicina Interna",
    n: "Kamau, Ximena",
    d: "Torre Médica Manglar, consultorio 275",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-8971",
  },
  {
    e: "Medicina Interna",
    n: "Aguirre, Kofi",
    d: "Centro Médico Horizonte Vital, consultorio 208",
    p: "Vega Sonora",
    c: "Las Calandrias",
    t: "6555-2208",
  },
  {
    e: "Medicina Interna - Alergología e Inmunología",
    n: "Ramírez, Zainab",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-9613",
  },
  {
    e: "Medicina Interna - Gastroenterología",
    n: "Rivera Solís, Kwame",
    d: "Policlínica Valdoria Norte, consultorio 233",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-6086",
  },
  {
    e: "Medicina Interna - Gastroenterología",
    n: "Romero Takeda, Camila",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-2417",
  },
  {
    e: "Medicina Interna - Gastroenterología",
    n: "Cuéllar, Tenzin",
    d: "Clínica Mareaviva, piso 1",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "555-9024",
  },
  {
    e: "Medicina Interna - Gastroenterología",
    n: "Ríos, Kofi",
    d: "Torre Médica Manglar, consultorio 634",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-5051",
  },
  {
    e: "Medicina Interna - Gastroenterología",
    n: "Rosenthal, Min-jun",
    d: "Torre Médica Monteazul",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "555-1652",
  },
  {
    e: "Medicina interna-Gastroenterologia",
    n: "Guerrero, Elif",
    d: "Torre Médica Manglar, consultorio 107",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-8881",
  },
  {
    e: "Medicina Interna - Gastroenterología - Endoscopía Digestiva",
    n: "Touré, Min-jun",
    d: "Clínica Mareaviva, consultorio 651",
    p: "Serranova",
    c: "Nebliza",
    t: "6555-9402",
  },
  {
    e: "Medicina Interna - Hematología-Transplante de médula ósea",
    n: "Park, Gael",
    d: "Policlínica Valdoria Norte, consultorio 130",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-0044",
  },
  {
    e: "Medicina Interna - Infectología",
    n: "Abdi, Malik",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-0996",
  },
  {
    e: "Medicina Interna - Medicina Critica Intensivista",
    n: "Nasser, Elías",
    d: "Hospital General de Valdoria, consultorio 118",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3379",
  },
  {
    e: "Medicina Interna - Medicina Crítica",
    n: "Mwangi, Amani",
    d: "Centro Médico Raíces, consultorio 890",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2707",
  },
  {
    e: "Medicina Interna - Nefrología",
    n: "Montoya, Inés",
    d: "Policlínica Valdoria Norte, consultorio 192",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3968",
  },
  {
    e: "Medicina Interna - Nefrología",
    n: "Kamau, Nayeli",
    d: "Clínica Monteazul, piso 11",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3187",
  },
  {
    e: "Medicina Interna - Nefrología",
    n: "Mbeki, Anh",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0359",
  },
  {
    e: "Medicina Interna - Neumología",
    n: "Ruiz, Ximena",
    d: "Hospital General de Valdoria, consultorio 135",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7130",
  },
  {
    e: "Medicina Interna - Neumología",
    n: "Pineda, Lucía",
    d: "Policlínica Serranova Norte, piso 5",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-7640",
  },
  {
    e: "Medicina Interna - Neumología",
    n: "Abebe, Arjun",
    d: "Policlínica Valdoria Norte, piso 7",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-8609",
  },
  {
    e: "Medicina Interna - Neumología",
    n: "Choque, Sakura",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-4388",
  },
  {
    e: "Medicina Interna - Neumología",
    n: "Lee, Rubí",
    d: "Policlínica Valdoria Norte, consultorio 297",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6400",
  },
  {
    e: "Medicina Interna - Oncología Médica",
    n: "Moreno Ibáñez, Gael",
    d: "Clínica Monteazul, piso 4",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-4369",
  },
  {
    e: "Medicina Interna - Radio Oncología",
    n: "Mensah, Abena",
    d: "Centro Médico Raíces, consultorio 884",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-2853",
  },
  {
    e: "Medicina Interna-Cardiología",
    n: "Guerrero, Lin",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-0769",
  },
  {
    e: "MedicinaInterna - Neumología",
    n: "Cabrera, Gael",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-1017",
  },
  {
    e: "MedicinaInterna - Neumología",
    n: "Paredes, Morgan",
    d: "Torre Médica Brisaclara, consultorio 704",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-4014",
  },
  {
    e: "MedicinaInterna - Neumología",
    n: "Ruiz, Túpac",
    d: "Hospital General de Valdoria, consultorio 379",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9009",
  },
  {
    e: "Nefrologia - Nefrologo Med. Interna",
    n: "Osei, Yerlan",
    d: "Hospital General de Valdoria, piso 6",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3356",
  },
  {
    e: "Nefrologia, Med. Interna",
    n: "Policlínica Kairós",
    d: "Calle Los Guayabos Azules, local 29",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3193",
  },
  {
    e: "Nefrología",
    n: "Touré, Abena",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-1474",
  },
  {
    e: "Nefrología",
    n: "Obi, Ana Lucía",
    d: "Torre Médica Manglar, consultorio 233",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-9405",
  },
  {
    e: "Neumología",
    n: "Bermúdez, Akosua",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-1248",
  },
  {
    e: "Neumología",
    n: "Odhiambo, Mariam",
    d: "Centro Médico Ceiba Viva, piso 4",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-4361",
  },
  {
    e: "Neumología",
    n: "Tuiasosopo, Itzel",
    d: "Policlínica Vega Norte, consultorio 451",
    p: "Vega Sonora",
    c: "Las Calandrias",
    t: "",
  },
  {
    e: "Neumología Pediátrica",
    n: "Kaur, Yaretzi",
    d: "Clínica Mareaviva, consultorio 537",
    p: "Serranova",
    c: "Nebliza",
    t: "555-0797",
  },
  {
    e: "Neurocirugia",
    n: "Aguirre, Ana Lucía",
    d: "Centro Médico Luz de Valle, piso 1",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "555-5372",
  },
  {
    e: "Neurocirugía",
    n: "Okafor, Ayasha",
    d: "Policlínica Valdoria Norte, consultorio 365",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0446",
  },
  {
    e: "Neurocirugía",
    n: "Touré, Itzel",
    d: "Policlínica Valdoria Norte, consultorio 308",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-5555",
  },
  {
    e: "Neurocirugía",
    n: "Park, Nayeli",
    d: "Clínica Monteazul, piso 5",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-4100",
  },
  {
    e: "Neurocirugía",
    n: "Esposito, Leilani",
    d: "Torre Médica Manglar, consultorio 131",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7921",
  },
  {
    e: "Neurocirugía",
    n: "Gupta, Ingrid",
    d: "Hospital General de Valdoria, piso 3",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-0823",
  },
  {
    e: "Neurocirugía",
    n: "Coloma, Paloma",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-9625",
  },
  {
    e: "Neurocirugía",
    n: "Nguyen, Daniela",
    d: "Hospital General de Costa Lumbre, piso 12",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-2406",
  },
  {
    e: "Neurocirugía",
    n: "Moreno Ibáñez, Adaeze",
    d: "Hospital General de Valdoria, piso 4",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-1400",
  },
  {
    e: "Neurocirugía",
    n: "Fuentes, Anh",
    d: "Hospital General de Valdoria, piso 7",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-7805",
  },
  {
    e: "Neurocirugía",
    n: "Huamán, Tomás",
    d: "Hospital General de Valdoria, consultorio 603",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1069",
  },
  {
    e: "Neurocirugía",
    n: "Gupta, Haruto",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-9520",
  },
  {
    e: "Neurocirugía",
    n: "Campos, Felipe",
    d: "Hospital General de Valdoria, piso 5",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-3595",
  },
  {
    e: "Neurocirugía",
    n: "Mensah, Elif",
    d: "Clínica Monteazul, consultorio 600",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-1632",
  },
  {
    e: "Neurocirugía",
    n: "Nasser, Zhen",
    d: "Policlínica Valdoria Norte, piso 11",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3422",
  },
  {
    e: "Neurocirugía",
    n: "Abdi, Tomás",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7017",
  },
  {
    e: "Neurocirugía",
    n: "Diallo, Taiwo",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3190",
  },
  {
    e: "Neurocirugía",
    n: "Bravo, Rocío",
    d: "Clínica Monteazul, consultorio 844",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4806",
  },
  {
    e: "Neurocirugía",
    n: "Tran, Santiago",
    d: "Torre Médica Manglar, piso 4",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-9510",
  },
  {
    e: "Neurocirugía",
    n: "Baptiste, Ezequiel",
    d: "Torre Médica Manglar, consultorio 580",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-5791",
  },
  {
    e: "Neurocirugía",
    n: "Okafor, Túpac",
    d: "Torre Médica Manglar, consultorio 577",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-5673",
  },
  {
    e: "Neurocirugía",
    n: "Lee, Amara",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2244",
  },
  {
    e: "Neurocirugía",
    n: "Navarro Tzul, Andrea",
    d: "Centro Médico Raíces, piso 11",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-4409",
  },
  {
    e: "Neurocirugía",
    n: "Villalobos, Marisol",
    d: "Torre Médica Manglar, piso 1",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-5473",
  },
  {
    e: "Neurocirugía",
    n: "Vargas, Yusuf",
    d: "Hospital General de Valdoria, consultorio 442",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3602",
  },
  {
    e: "Neurocirugía",
    n: "Abebe, Haruto",
    d: "Hospital General de Valdoria, consultorio 700",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3587",
  },
  {
    e: "Neurocirugía",
    n: "Gupta, Eun-ji",
    d: "Policlínica Valdoria Norte, consultorio 149",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5711",
  },
  {
    e: "Neurocirugía",
    n: "Fujita, René",
    d: "Policlínica Valdoria Norte, consultorio 343",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-6337",
  },
  {
    e: "Neurocirugía",
    n: "Petrov, Kwame",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7548",
  },
  {
    e: "Neurocirugía",
    n: "Arias, Rohan",
    d: "Centro Médico Raíces, consultorio 228",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-9176",
  },
  {
    e: "Neurocirugía",
    n: "Aguirre, Valentina",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-8666",
  },
  {
    e: "Neurocirugía",
    n: "Méndez, Ariel",
    d: "Clínica Monteazul, consultorio 863",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4753",
  },
  {
    e: "Neurocirugía",
    n: "Eze, Robin",
    d: "Torre Médica Manglar, consultorio 759",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8846",
  },
  {
    e: "Neurocirugía",
    n: "Lee, Pilar",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-8098",
  },
  {
    e: "Neurocirugía",
    n: "Yamamoto, Jordan",
    d: "Policlínica Valdoria Norte, consultorio 230",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-9238",
  },
  {
    e: "Neurocirugía",
    n: "Suzuki, Camila",
    d: "Hospital General de Valdoria, consultorio 254",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-8142",
  },
  {
    e: "Neurocirugía",
    n: "Zhang, Morgan",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-6273",
  },
  {
    e: "Neurocirugía",
    n: "Gallardo, Sasha",
    d: "Centro Médico Raíces, consultorio 145",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-7124",
  },
  {
    e: "Neurocirugía",
    n: "Huamán, Esperanza",
    d: "Clínica Aurelia, piso 7",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-7619",
  },
  {
    e: "Neurocirugía",
    n: "Banerjee, Sofía",
    d: "Hospital General de Valdoria, consultorio 103",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-8786",
  },
  {
    e: "Neurocirugía - Neurologia",
    n: "Abebe, Rubí",
    d: "Centro Médico Luz de Valle",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "555-9008",
  },
  {
    e: "Neurocirugía de adultos y niños - cirugia de columna - terapia de dolor en columna",
    n: "Park, Ignacio",
    d: "Centro Médico Raíces, piso 2",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-9425",
  },
  {
    e: "Neurocirujano",
    n: "Nwosu, Nayeli",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-3981",
  },
  {
    e: "Neurofisiología Clínica",
    n: "Oduya, Sakura",
    d: "Centro Médico Raíces, consultorio 705",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-4816",
  },
  {
    e: "Neurofisiología Clínica",
    n: "Hayashi, Kiri",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3181",
  },
  {
    e: "Neurofisiología Clínica",
    n: "Paredes, Kofi",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-2879",
  },
  {
    e: "Neurofisiología Clínica",
    n: "Touré, Amani",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3182",
  },
  {
    e: "Neurologo - Neurofisiología Clínica-Medicina Interna",
    n: "Acosta, Daniela",
    d: "Hospital General de Valdoria, consultorio 810",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-3942",
  },
  {
    e: "Neurología",
    n: "Liu, Zainab",
    d: "Torre Médica Monteazul, consultorio 478",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-5130",
  },
  {
    e: "Neurología",
    n: "Afolabi, Esperanza",
    d: "Clínica Monteazul, consultorio 315",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-7862",
  },
  {
    e: "Neurología - Electrodiagnóstico- Med. Interna",
    n: "Kaur, Marisol",
    d: "Policlínica Valdoria Norte, consultorio 209",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9209",
  },
  {
    e: "Oftalmología",
    n: "Iyer, Paz",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-1256",
  },
  {
    e: "Oftalmología",
    n: "Gupta, Halima",
    d: "Hospital General de Valdoria, consultorio 652",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6097",
  },
  {
    e: "Oftalmología",
    n: "Ben-David, Robin",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9906",
  },
  {
    e: "Oftalmología",
    n: "Gupta, Kalani",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-0892",
  },
  {
    e: "Oftalmología",
    n: "Achebe, Wanjiru",
    d: "Hospital General de Valdoria, piso 11",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-4500",
  },
  {
    e: "Oftalmología",
    n: "Nasser, Amara",
    d: "Hospital General de Valdoria, consultorio 454",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-4545",
  },
  {
    e: "Oftalmología",
    n: "Nakamura, Mei Ling",
    d: "Centro Médico Raíces, piso 11",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-5942",
  },
  {
    e: "Oftalmología",
    n: "Acosta, Tenzin",
    d: "Clínica Monteazul, consultorio 284",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1841",
  },
  {
    e: "Oftalmología",
    n: "Hayashi, Taiwo",
    d: "Centro Médico Raíces, consultorio 803",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-9058",
  },
  {
    e: "Oftalmología",
    n: "Escobar, Maya",
    d: "Policlínica Valdoria Norte, consultorio 260",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2712",
  },
  {
    e: "Oftalmología",
    n: "Paredes, Andrea",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-8234",
  },
  {
    e: "Oftalmología - Círugia de Catarata y Segmento Anterior",
    n: "Mamani, Kiri",
    d: "Hospital General de Valdoria, consultorio 594",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-7736",
  },
  {
    e: "Oftalmología - Glaucoma",
    n: "Romero Takeda, Elías",
    d: "Clínica Monteazul, consultorio 180",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2335",
  },
  {
    e: "Oftalmología - Retina y Vitreo",
    n: "Ramírez, Pilar",
    d: "Hospital General de Valdoria, piso 10",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-2465",
  },
  {
    e: "Oftalmología - estudios especiales - Consultas",
    n: "Centro Visual Alborada",
    d: "Vía Brisaclara, local 43",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-0638",
  },
  {
    e: "Oftalmología Pediátrica",
    n: "Kamau, Túpac",
    d: "Clínica Monteazul, consultorio 227",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6907",
  },
  {
    e: "Consulta Oftalmológica, Optometrista, Topografía, Paquimetria, Yag laser, etc",
    n: "Centro Visual Mirasol",
    d: "Torre Médica Nubeluz, local 19",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-4870",
  },
  {
    e: "Oftalmólogo - Retinologó",
    n: "Osei, Lucía",
    d: "Torre Médica Monteazul",
    p: "Serranova",
    c: "Villa Serranova",
    t: "555-0181",
  },
  {
    e: "Ortopeda",
    n: "Nakamura, Pilar",
    d: "Torre Médica Trébol, consultorio 237",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "6555-6437",
  },
  {
    e: "Ortopeda",
    n: "Yilmaz, Esteban",
    d: "Torre Médica Trébol",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "6555-0348",
  },
  {
    e: "Ortopeda",
    n: "Castillo Nández, Ayo",
    d: "Policlínica Llano Norte, piso 3",
    p: "Llano Dorado",
    c: "Trigalia",
    t: "555-3716",
  },
  {
    e: "Ortopeda",
    n: "Bermúdez, Elif",
    d: "Torre Médica Brisaclara, consultorio 276",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-3455",
  },
  {
    e: "Ortopeda",
    n: "Zhang, Teodoro",
    d: "Centro Médico Ceiba Viva",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-1572",
  },
  {
    e: "Ortopeda - Artroscopía",
    n: "Fuentes, Isabela",
    d: "Policlínica Valdoria Norte, consultorio 437",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5231",
  },
  {
    e: "Ortopeda - Artroscopía",
    n: "Mwangi, Yerlan",
    d: "Hospital General de Serranova",
    p: "Serranova",
    c: "Villa Serranova",
    t: "555-2559",
  },
  {
    e: "Ortopeda - Artroscopía",
    n: "Chen, Thiago",
    d: "Centro Médico Ceiba Viva, piso 11",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "555-0115",
  },
  {
    e: "Ortopeda - Cirugía Articular",
    n: "Danso, Jun",
    d: "Centro Médico Raíces, consultorio 709",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3643",
  },
  {
    e: "Ortopeda - Cirugía de Columna",
    n: "Cabrera, Inés",
    d: "Clínica Monteazul, consultorio 509",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-2624",
  },
  {
    e: "Ortopeda - Cirugía de Columna",
    n: "Nakamura, Ibrahim",
    d: "Hospital General de Valdoria, piso 7",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3920",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Lozano, Alex",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-2224",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Quispe, Aiyana",
    d: "Torre Médica Manglar, consultorio 189",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-1041",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Salazar, Morgan",
    d: "Policlínica Valdoria Norte, consultorio 345",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3421",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Diallo, Gael",
    d: "Policlínica Valdoria Norte, consultorio 614",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2663",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Méndez, Pilar",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-0679",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Kariuki, Hamza",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-8118",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Ono, Leilani",
    d: "Policlínica Valdoria Norte, consultorio 797",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-3972",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Ortiz Kahale, Sakura",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-4720",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Peralta, Pilar",
    d: "Policlínica Valdoria Norte, piso 9",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-0254",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Haddad, Akosua",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5483",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Lozano, Rafael",
    d: "Clínica Monteazul, piso 9",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-1267",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Haddad, Lin",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2756",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Chen, Esperanza",
    d: "Torre Médica Manglar, consultorio 652",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-9840",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Choque, Noa",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3592",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Romero Takeda, Gabriela",
    d: "Policlínica Valdoria Norte, consultorio 389",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-5938",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Watanabe, Lin",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3524",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Esposito, Thiago",
    d: "Hospital General de Valdoria, piso 6",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-2944",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Duarte, Jun",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-2119",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Castillo Nández, Hamza",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-2316",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Baptiste, Nikhil",
    d: "Torre Médica Manglar, consultorio 860",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-2153",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Gupta, Elías",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3588",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Tanaka, Kwame",
    d: "Centro Médico Raíces, consultorio 729",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5004",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Rahman, Yerlan",
    d: "Policlínica Valdoria Norte, consultorio 762",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-9565",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Osei, Omar",
    d: "Torre Médica Manglar, consultorio 807",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-2943",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Balogun, Yaretzi",
    d: "Clínica Lumen, consultorio 438",
    p: "Valdoria Poniente",
    c: "Arenaluz",
    t: "555-6847",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Obi, Elías",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-0069",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Méndez, Ibrahim",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-4522",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Arango, Inés",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-9095",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Mahmoud, Darius",
    d: "Hospital General de Valdoria, consultorio 608",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4659",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Hayashi, Adaeze",
    d: "Clínica Vitalia, piso 4",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "6555-4565",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Barahona, Darius",
    d: "Torre Médica Trébol",
    p: "Llano Dorado",
    c: "Santa Orvalia",
    t: "555-4354",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Mendoza Ito, Pilar",
    d: "Policlínica Valdoria Norte, consultorio 323",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-4554",
  },
  {
    e: "Ortopeda - Traumatología",
    n: "Touré, Kai",
    d: "Hospital General de Montebrisa",
    p: "Montebrisa",
    c: "Brisalta",
    t: "6555-2072",
  },
  {
    e: "Ortopeda - Traumatología - Artroscopia de rodilla y hombro",
    n: "Wu, Isabela",
    d: "Torre Médica Manglar, consultorio 143",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-0171",
  },
  {
    e: "Ortopeda - Traumatología - Ortopedia Oncologica",
    n: "Kowalski, Wanjiru",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-6331",
  },
  {
    e: "Ortopeda - Traumatología- terapia - Onda de choque - Drenaje Linfatico -Infiltracion - plasma- Fisioterapia Oncologica",
    n: "Centro de Rehabilitación Colibrí",
    d: "Av. del Faro, local 16",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-8734",
  },
  {
    e: "Ortopeda - Traumatología-Cirugía de trauma, pelivis y cadera",
    n: "Fernández Levi, Kwame",
    d: "Policlínica Valdoria Norte, piso 3",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-0920",
  },
  {
    e: "Ortopeda Pediátrica- Cirugía de la Mano",
    n: "Tanaka, Teodoro",
    d: "Policlínica Valdoria Norte, piso 9",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-9145",
  },
  {
    e: "Ortopeda Y Traumatologia -Cirugía de Columna",
    n: "Rahman, Luz Marina",
    d: "Torre Médica Manglar, piso 5",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5603",
  },
  {
    e: "Ortopeda y traumatología",
    n: "Abebe, Omar",
    d: "Centro Médico Raíces, consultorio 387",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5576",
  },
  {
    e: "Ortopeda y traumatología",
    n: "Montoya, Kofi",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-4032",
  },
  {
    e: "Ortopeda-Traumatólogia-Cirugía de hombro adultos y niños",
    n: "Petrov, Zainab",
    d: "Centro Médico Raíces, consultorio 794",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-0735",
  },
  {
    e: "Otorrinolaringologo",
    n: "Ndiaye, Ingrid",
    d: "Clínica Mareaviva, consultorio 288",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "6555-5634",
  },
  {
    e: "Otorrinolaringología",
    n: "Kealoha, Yaretzi",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-5726",
  },
  {
    e: "Otorrinolaringología",
    n: "Quintero, Rocío",
    d: "Policlínica Valdoria Norte, consultorio 891",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-3673",
  },
  {
    e: "Otorrinolaringología",
    n: "Choque, Paz",
    d: "Torre Médica Manglar, consultorio 583",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0616",
  },
  {
    e: "Otorrinolaringología",
    n: "Acosta, Hiroshi",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-3818",
  },
  {
    e: "Otorrinolaringología",
    n: "Yilmaz, Jun",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2623",
  },
  {
    e: "Otorrinolaringología",
    n: "Romero Takeda, Kenji",
    d: "Centro Médico Raíces, piso 9",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-4579",
  },
  {
    e: "Otorrinolaringología",
    n: "Montoya, Ilan",
    d: "Policlínica Valdoria Norte, consultorio 777",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-5507",
  },
  {
    e: "Otorrinolaringología",
    n: "Solano, Tenzin",
    d: "Centro Médico Raíces, consultorio 410",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-9889",
  },
  {
    e: "Otorrinolaringología",
    n: "Nkosi, Fatima",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0942",
  },
  {
    e: "Otorrinolaringología",
    n: "Sato, Ngozi",
    d: "Policlínica Isla Norte, consultorio 681",
    p: "Isla Corviña",
    c: "Puerto Corviña",
    t: "555-9680",
  },
  {
    e: "Otorrinolaringología - Pediátrica",
    n: "Sato, Luz Marina",
    d: "Policlínica Valdoria Norte, piso 3",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3135",
  },
  {
    e: "Patología",
    n: "Kowalski, Alex",
    d: "Hospital General de Valdoria, consultorio 546",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-4486",
  },
  {
    e: "Patología",
    n: "Esposito, Nayeli",
    d: "Torre Médica Brisaclara",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "",
  },
  {
    e: "Patología",
    n: "Hosseini, Amani",
    d: "Torre Médica Monteazul, piso 5",
    p: "Serranova",
    c: "Nebliza",
    t: "555-9057",
  },
  {
    e: "Patología",
    n: "Watanabe, Ilan",
    d: "Centro Médico Raíces, consultorio 415",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-3159",
  },
  {
    e: "Patología",
    n: "Montoya, Tenzin",
    d: "Torre Médica Manglar, piso 1",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-1207",
  },
  {
    e: "Patología",
    n: "Sato, Kiri",
    d: "Clínica Monteazul, piso 8",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-0750",
  },
  {
    e: "Patología",
    n: "Moreno Ibáñez, Esperanza",
    d: "Clínica Monteazul, consultorio 666",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3697",
  },
  {
    e: "Patología",
    n: "Clínica Mareaviva",
    d: "Calle Los Guayabos Azules, local 2",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-1472",
  },
  {
    e: "Patología",
    n: "Baptiste, Aylin",
    d: "Centro Médico Raíces, piso 2",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-0963",
  },
  {
    e: "Patología - Renal y Urológica",
    n: "Ruiz, Ibrahim",
    d: "Torre Médica Manglar, piso 2",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-2345",
  },
  {
    e: "Pediatra - Neonatología",
    n: "Pineda, Inés",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2179",
  },
  {
    e: "Pediatra Urgencióloga",
    n: "Mamani, Ilan",
    d: "Clínica Monteazul, consultorio 344",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2326",
  },
  {
    e: "Pediatría",
    n: "Osei, Aylin",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-8309",
  },
  {
    e: "Pediatría",
    n: "Solano, Ibrahim",
    d: "Centro Médico Raíces, piso 2",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-2922",
  },
  {
    e: "Pediatría",
    n: "Herrera Luna, Gael",
    d: "Clínica Monteazul, piso 6",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2844",
  },
  {
    e: "Pediatría",
    n: "Zhang, Lior",
    d: "Centro Médico Raíces, consultorio 231",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-6309",
  },
  {
    e: "Pediatría",
    n: "Peralta, Rafael",
    d: "Clínica Monteazul, piso 11",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3650",
  },
  {
    e: "Pediatría",
    n: "Vargas, Pilar",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-5929",
  },
  {
    e: "Pediatría",
    n: "Zhang, Ravi",
    d: "Clínica Monteazul, consultorio 823",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7292",
  },
  {
    e: "Pediatría",
    n: "Asante, Elías",
    d: "Hospital General de Costa Lumbre, piso 3",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "555-9033",
  },
  {
    e: "Pediatría",
    n: "Rivera Solís, Priya",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-3758",
  },
  {
    e: "Pediatría",
    n: "Lee, Chidi",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7889",
  },
  {
    e: "Pediatría",
    n: "Benítez, Tenzin",
    d: "Hospital General de Valdoria, consultorio 841",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-9388",
  },
  {
    e: "Pediatría",
    n: "Vargas, Eun-ji",
    d: "Centro Médico Raíces, consultorio 615",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-4653",
  },
  {
    e: "Pediatría - Endocrinología",
    n: "Mensah, Zhen",
    d: "Policlínica Serranova Norte",
    p: "Serranova",
    c: "Villa Serranova",
    t: "6555-0706",
  },
  {
    e: "Pediatría - General y Adolescentes",
    n: "Nakamura, Ingrid",
    d: "Centro Médico Raíces, consultorio 379",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-7046",
  },
  {
    e: "Pediatría - Hematólogo - Oncólogo",
    n: "Pineda, Akosua",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-8487",
  },
  {
    e: "Pediatría - Nefrólogo - Transplante Renal",
    n: "Escobar, Zainab",
    d: "Torre Médica Manglar, consultorio 157",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-6657",
  },
  {
    e: "Pediatría - Neonalogía",
    n: "Domínguez, Luz Marina",
    d: "Policlínica Valdoria Norte, consultorio 820",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-6096",
  },
  {
    e: "Pediatría - Neonatología",
    n: "Okafor, Clara",
    d: "Clínica Aurelia, consultorio 506",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-6863",
  },
  {
    e: "Pediatría - Neonatología",
    n: "Danso, Lior",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3281",
  },
  {
    e: "Pediatría - Neonatología",
    n: "Al-Sayed, Fatima",
    d: "Policlínica Valdoria Norte, piso 1",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-3015",
  },
  {
    e: "Pediatría - Neonatología",
    n: "Benítez, Leilani",
    d: "Clínica Monteazul, piso 3",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3820",
  },
  {
    e: "Pediatría - Neonatología",
    n: "Fuentes, Elías",
    d: "Centro Médico Raíces, consultorio 134",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5533",
  },
  {
    e: "Pediatría - Neonatología",
    n: "Aguirre, Paloma",
    d: "Torre Médica Manglar, piso 11",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5669",
  },
  {
    e: "Pediatría - Neonatología",
    n: "Herrera Luna, Nkechi",
    d: "Torre Médica Manglar, consultorio 398",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3452",
  },
  {
    e: "Pediatría - Neonatología",
    n: "Ixcoy, Kwame",
    d: "Clínica Monteazul, consultorio 363",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-6598",
  },
  {
    e: "Pediatría - Neumología",
    n: "Huanca, Sakura",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-2353",
  },
  {
    e: "Radio - Oncólogo",
    n: "Sharma, Tomás",
    d: "Clínica Monteazul, consultorio 327",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "",
  },
  {
    e: "Radio - Oncólogo",
    n: "Mamani, Yusuf",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7267",
  },
  {
    e: "Radiografia en general",
    n: "Centro de Imágenes Mareaviva",
    d: "Vía Brisaclara, local 31",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-3661",
  },
  {
    e: "Radiología Intervencionista",
    n: "Mendoza Ito, Yaretzi",
    d: "Hospital General de Valdoria, consultorio 531",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-7927",
  },
  {
    e: "Radiología Intervencionista - Terapia Endovascular",
    n: "Aguirre, Marisol",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7953",
  },
  {
    e: "Radiología, Imagen",
    n: "Rojas, Javier",
    d: "Hospital General de Costa Lumbre, piso 3",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "6555-4969",
  },
  {
    e: "Radiólogo",
    n: "Hayashi, Kwame",
    d: "Torre Médica Manglar, consultorio 792",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "",
  },
  {
    e: "Radiólogo",
    n: "Delgado, Clara",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5228",
  },
  {
    e: "Radiólogo",
    n: "Kowalski, Esperanza",
    d: "Hospital General de Valdoria, piso 6",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7094",
  },
  {
    e: "Radiólogo",
    n: "Sharma, Valentina",
    d: "Torre Médica Manglar, consultorio 330",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-7009",
  },
  {
    e: "Radiólogo",
    n: "Montoya, Andrea",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-7359",
  },
  {
    e: "Radiólogo - Intervencionista",
    n: "Oyelaran, Ravi",
    d: "Clínica Monteazul, consultorio 768",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-2093",
  },
  {
    e: "Resonancia Magnetica Simple, Contrastada, AngioResonancia Simple Conratada etc.",
    n: "Centro Médico Sanavida",
    d: "Calle Colibrí, local 22",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "555-0371",
  },
  {
    e: "Resonancia Magnetica Simple, Contrastada, AngioResonancia Simple Conratada etc.",
    n: "Centro Médico Nubeluz",
    d: "Vía Brisaclara, local 22",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "555-2703",
  },
  {
    e: "Retinólogo",
    n: "Hosseini, Xiomara",
    d: "Clínica Monteazul, consultorio 330",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-5882",
  },
  {
    e: "Servicios Hospitalarios - Consultas - Urgencias -Cirugía",
    n: "Hospital Ámbar",
    d: "Av. del Faro, local 8",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3103",
  },
  {
    e: "Terapias Fisicas - Fisioterapias",
    n: "Grupo Médico Sendero",
    d: "Calle Los Guayabos Azules, local 40",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6106",
  },
  {
    e: "Terapias Fisicas - Fisioterapias",
    n: "Centro de Rehabilitación Nubeluz",
    d: "Vía Alborada, local 35",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-6219",
  },
  {
    e: "Terapias Físicas - Manejo del Dolor -Fisioterapeutas",
    n: "Policlínica Cielo Abierto",
    d: "Av. Las Ceibas Altas, local 33",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-8912",
  },
  {
    e: "Tratamiento para el Dolor y Enfermedades en General *solo se cubre consulta* tratamientos descuentos del 20%",
    n: "Policlínica Orquídea",
    d: "Calle 12 Norte, local 10",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-7933",
  },
  {
    e: "Urgencias - Consultas - Laboratorios",
    n: "Castillo Nández, Isabela",
    d: "Centro Médico Raíces, piso 4",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8460",
  },
  {
    e: "Urgencias - Consultas - Procedimientos",
    n: "Baptiste, Pilar",
    d: "Torre Médica Manglar, consultorio 126",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-6212",
  },
  {
    e: "Urgencias - Consultas - Procedimientos",
    n: "Ortiz Kahale, Tenzin",
    d: "Policlínica Valdoria Norte, consultorio 535",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9514",
  },
  {
    e: "Urgencias Medicas, Laboratorios, Tomografia, Cat, Procedimientos, Mamografia, Ultrasonidos, Consutla con Med. General y Especialistas",
    n: "Laboratorio Clínico Sanavida",
    d: "Vía Alborada, local 46",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-6680",
  },
  {
    e: "Urgencias menores, laboratorios, consulta Medicina General y Especialistas etc.",
    n: "Centro Médico Vitalia",
    d: "Vía Brisaclara, local 24",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2316",
  },
  {
    e: "Urgencias menores, laboratorios, consultas,Electrocardiograma etc.",
    n: "Clínica Nubeluz",
    d: "Av. Central Sur, local 4",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-4223",
  },
  {
    e: "Urgencias, Consultas, Laboratorios, ultrasonidos,",
    n: "Centro Médico Alborada",
    d: "Paseo Mareaviva, local 11",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-6953",
  },
  {
    e: "Urgencias, Consultas, Ultrasonidos, Rx, Procedimientos",
    n: "Clínica Almendro Azul",
    d: "Vía Brisaclara, local 55",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-3768",
  },
  {
    e: "Urgencias, Hospitalización, Consulta, Rayos x, procedimientos, Laboratorios, Estudios Especiales",
    n: "Hospital Manglar",
    d: "Calle Los Guayabos Azules, local 3",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9363",
  },
  {
    e: "Urgencias, Hospitalización, Consulta, Rayos x, procedimientos, Laboratorios, Estudios Especiales",
    n: "Centro Médico Arcoíris",
    d: "Vía Alborada, local 41",
    p: "Serranova",
    c: "Villa Serranova",
    t: "555-0330",
  },
  {
    e: "Urgencias, laboratorios, Rx, Cirugías, Hospitalización,etc.",
    n: "Hospital Faro Verde",
    d: "Calle Colibrí, local 50",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-5588",
  },
  {
    e: "Urologia",
    n: "Tuiasosopo, Quetzal",
    d: "Policlínica Serranova Norte, consultorio 778",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "555-5314",
  },
  {
    e: "Urologo - Cirujano",
    n: "Nasser, Adaeze",
    d: "Policlínica Valdoria Norte, piso 9",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-5335",
  },
  {
    e: "Urología",
    n: "Chen, Valentina",
    d: "Policlínica Valdoria Norte, piso 5",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-9648",
  },
  {
    e: "Urología",
    n: "Petrov, Haruto",
    d: "Policlínica Valdoria Norte, consultorio 596",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-0962",
  },
  {
    e: "Urología",
    n: "Bravo, Rubí",
    d: "Centro Médico Raíces, piso 7",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-2062",
  },
  {
    e: "Urología",
    n: "Ortiz Kahale, Femi",
    d: "Policlínica Valdoria Norte, consultorio 452",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-9623",
  },
  {
    e: "Urología",
    n: "Abiodun, Ibrahim",
    d: "Torre Médica Manglar, consultorio 326",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-4614",
  },
  {
    e: "Urología",
    n: "Romero Takeda, Nkechi",
    d: "Centro Médico Raíces, consultorio 118",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-1210",
  },
  {
    e: "Urología",
    n: "Mahmoud, Ariel",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-9767",
  },
  {
    e: "Urología",
    n: "Tanaka, Inés",
    d: "Clínica Monteazul, consultorio 298",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-0680",
  },
  {
    e: "Urología",
    n: "Mamani, Halima",
    d: "Clínica Aurelia",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "555-5129",
  },
  {
    e: "Urología",
    n: "Kamau, Pilar",
    d: "Hospital General de Valdoria, piso 2",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-3100",
  },
  {
    e: "Urología",
    n: "Huamán, Chidi",
    d: "Centro Médico Ceiba Viva, consultorio 715",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "555-1706",
  },
  {
    e: "Urología",
    n: "Fernández Levi, Maya",
    d: "Policlínica Valdoria Norte, consultorio 353",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2396",
  },
  {
    e: "Urología",
    n: "Sharma, Amara",
    d: "Hospital General de Valdoria, consultorio 484",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-3920",
  },
  {
    e: "Urología",
    n: "Rosenthal, Bilal",
    d: "Clínica Monteazul, piso 3",
    p: "Valdoria",
    c: "Altocedro",
    t: "",
  },
  {
    e: "Urología",
    n: "Ruiz, Lin",
    d: "Clínica Monteazul, piso 9",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-0715",
  },
  {
    e: "Urología",
    n: "Asante, Ximena",
    d: "Hospital General de Serranova",
    p: "Serranova",
    c: "Nebliza",
    t: "6555-2590",
  },
  {
    e: "Urología",
    n: "Méndez, Noa",
    d: "Hospital General de Costa Lumbre, piso 5",
    p: "Costa Lumbre",
    c: "Marbrisa",
    t: "555-6119",
  },
  {
    e: "Urología",
    n: "Balogun, Darius",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-1751",
  },
  {
    e: "Urología",
    n: "Al-Sayed, Valentina",
    d: "Clínica Monteazul, piso 6",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-1918",
  },
  {
    e: "Urología",
    n: "Méndez, Camila",
    d: "Clínica Monteazul, piso 1",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-0773",
  },
  {
    e: "Urología",
    n: "Nwosu, René",
    d: "Policlínica Valdoria Norte",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-5980",
  },
  {
    e: "Urología",
    n: "Danso, Esteban",
    d: "Policlínica Valdoria Norte, piso 8",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-0032",
  },
  {
    e: "Urología",
    n: "Okafor, Nkechi",
    d: "Policlínica Valdoria Norte, piso 7",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-2007",
  },
  {
    e: "Urología",
    n: "Cabrera, Min-jun",
    d: "Centro Médico Horizonte Vital, consultorio 255",
    p: "Vega Sonora",
    c: "Las Calandrias",
    t: "555-7851",
  },
  {
    e: "Urología",
    n: "Choque, Esperanza",
    d: "Centro Médico Raíces, piso 7",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-8185",
  },
  {
    e: "Urología",
    n: "Lee, Femi",
    d: "Hospital General de Valdoria",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-8063",
  },
  {
    e: "Urología",
    n: "Hwang, René",
    d: "Clínica Monteazul, piso 12",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-5862",
  },
  {
    e: "Urología",
    n: "Mahmoud, Ximena",
    d: "Centro Médico Luz de Valle, piso 1",
    p: "Serranova",
    c: "Cumbrecampo",
    t: "555-7592",
  },
  {
    e: "Urología",
    n: "Montoya, Sasha",
    d: "Policlínica Valdoria Norte, consultorio 557",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-8450",
  },
  {
    e: "Urología",
    n: "Bermúdez, Yusuf",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-0914",
  },
  {
    e: "Urología",
    n: "Ixcoy, Wei",
    d: "Centro Médico Raíces, consultorio 214",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-2075",
  },
  {
    e: "Urología - Cirujano",
    n: "Molina, Quetzal",
    d: "Clínica Monteazul, consultorio 282",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-9667",
  },
  {
    e: "Urología - Laparascopia y Cirugía Robótica",
    n: "Zelaya, Chidi",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-3286",
  },
  {
    e: "Urología - Laparascopia y Transplante Renal",
    n: "Torres Akana, Sienna",
    d: "Torre Médica Manglar, consultorio 608",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-7851",
  },
  {
    e: "Urología - Laparascopia y Transplante Renal",
    n: "Asante, Paloma",
    d: "Clínica Monteazul",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-7972",
  },
  {
    e: "Urología - Laparascopia y Transplante Renal",
    n: "Asante, Amara",
    d: "Torre Médica Manglar",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-6485",
  },
  {
    e: "Urología - Uro-oncología",
    n: "Cárdenas, Jun",
    d: "Centro Médico Raíces, piso 10",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "555-1451",
  },
  {
    e: "Urología - Uroncología y mínima invasión",
    n: "Gupta, Taiwo",
    d: "Centro Médico Raíces",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-9259",
  },
  {
    e: "Urología - niños y adultos - trasplante renal -",
    n: "Mensah, Camila",
    d: "Clínica Monteazul, piso 8",
    p: "Valdoria",
    c: "Lomaclara",
    t: "6555-7171",
  },
  {
    e: "Anestesiología",
    n: "Coloma, Kiri",
    d: "Hospital General de Costa Lumbre, consultorio 864",
    p: "Costa Lumbre",
    c: "Puerto Lumbre",
    t: "6555-5127",
  },
  {
    e: "Cirugía General - Cirugia endocrina",
    n: "Aguirre, Ignacio",
    d: "Torre Médica Manglar, consultorio 405",
    p: "Valdoria",
    c: "Lomaclara",
    t: "555-5974",
  },
  {
    e: "Cirugía General y Laparoscopia - Robotica",
    n: "Policlínica Nubeluz",
    d: "Paseo Mareaviva, local 35",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-8988",
  },
  {
    e: "",
    n: "Centro Médico Sendero",
    d: "Calle Los Guayabos Azules, local 32",
    p: "Valdoria",
    c: "Altocedro",
    t: "",
  },
  {
    e: "Cirugia General - Cardiovascular",
    n: "Clínica Vitalia",
    d: "Av. Central Sur, local 27",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-5486",
  },
  {
    e: "",
    n: "Clínica Ámbar",
    d: "Calle Colibrí, local 13",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "",
  },
  {
    e: "Oftalmología - Cirujano",
    n: "Policlínica Colibrí",
    d: "Calle Los Guayabos Azules, local 14",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-4362",
  },
  {
    e: "Oftalmología - Cirugia de Cataratas",
    n: "Centro Médico Trébol",
    d: "Paseo Mareaviva, local 24",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "6555-6624",
  },
  {
    e: "Pediatría",
    n: "Chen, Camila",
    d: "Torre Médica Raíces",
    p: "Vega Sonora",
    c: "Las Calandrias",
    t: "6555-5508",
  },
  {
    e: "Anestesiología",
    n: "Bermúdez, Halima",
    d: "Hospital General de Valdoria, piso 1",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7137",
  },
  {
    e: "Cirugía General - cirugia cardiovascular",
    n: "Centro Médico Almendro Azul",
    d: "Av. del Faro, local 32",
    p: "Valdoria",
    c: "Altocedro",
    t: "555-4112",
  },
  {
    e: "Cirugía General - cirugia cardiovascular",
    n: "Centro Médico Corazón Abierto",
    d: "Calle 12 Norte, local 60",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-5133",
  },
  {
    e: "Cirugía General y Laparascopica",
    n: "Policlínica Sendero",
    d: "Paseo Mareaviva, local 5",
    p: "Valdoria",
    c: "Mirafuentes",
    t: "555-5851",
  },
  {
    e: "Cirugía General",
    n: "Policlínica Manglar",
    d: "Calle Colibrí, local 19",
    p: "Valdoria",
    c: "Ciudad Valdoria",
    t: "6555-9557",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Centro Médico Raíces",
    d: "Calle Colibrí, local 49",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7879",
  },
  {
    e: "Ginecología - Obstetricia",
    n: "Policlínica Faro Verde",
    d: "Calle Luna Clara, local 19",
    p: "Valdoria",
    c: "Altocedro",
    t: "6555-7132",
  },
];
function normProv(p) {
  const x = (p || "").toLowerCase();
  if (x.includes("bocas")) return "Bocas del Toro";
  if (x.includes("chiri") || x.includes("david")) return "Chiriquí";
  if (x.includes("coron")) return "Coclé";
  if (x.includes("coclé") || x.includes("cocle") || x.includes("penonom"))
    return "Coclé";
  if (x.includes("colon") || x.includes("colón")) return "Colón";
  if (x.includes("darién") || x.includes("darien")) return "Darién";
  if (x.includes("herre") || x.includes("chitr")) return "Herrera";
  if (x.includes("los santos") || x.includes("tablas")) return "Los Santos";
  if (x.includes("oeste") || x.includes("chorrera") || x.includes("chepo"))
    return "Panamá Oeste";
  if (x.includes("veraguas")) return "Veraguas";
  if (x.includes("panam")) return "Panamá";
  return p || "—";
}
RED.forEach((r) => {
  r.pN = normProv(r.p);
});
const RED_ESPECIALIDADES = [
  ...new Set(RED.map((r) => r.e).filter(Boolean)),
].sort();
const RED_PROVINCIAS = [...new Set(RED.map((r) => r.pN))].sort();

/* ================= CERTIFICACIÓN DE PRE-AUTORIZACIÓN (formato Dovela) ================= */
function generarCertPreauth(d) {
  // d = objeto con datos de la solicitud aprobada
  const hoy = new Date().toLocaleDateString("es-PA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const w = window.open("", "_blank");
  const css = `
    :root{color-scheme:light;--ink:#0F172A;--primary:#1E3A5F;--secondary:#1D4ED8;--brass:#3B82F6;--line:#CBD5E1;--tint:#F1F5F9;--ivory:#F8FAFC;--muted:#475569;--warn:#B45309;--warn-soft:#FEF3C7}
    body{font-family:"Bricolage Grotesque","Segoe UI",Arial,sans-serif;color:var(--ink);background:#fff;margin:0;padding:0}
    .cert{max-width:820px;margin:0 auto;padding:36px 44px}
    .cert-head{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--brass);padding-bottom:14px;margin-bottom:22px}
    .cert-head img{height:46px;width:auto;display:block}
    h1{font-family:"Fraunces",Georgia,serif;color:var(--primary);font-size:22px;font-weight:600;text-align:center;margin:12px 0 4px}
    h2{font-size:12px;color:var(--secondary);text-align:center;font-weight:700;margin-bottom:20px;text-transform:uppercase;letter-spacing:1.2px}
    table.d{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12.5px}
    table.d td{border:1px solid var(--line);padding:8px 10px;vertical-align:top}
    table.d td.lbl{background:var(--tint);color:var(--primary);font-weight:700;font-size:10.5px;text-transform:uppercase;letter-spacing:.4px;width:26%}
    .autoriz{background:var(--primary);color:var(--ivory);padding:10px 14px;font-weight:700;font-size:12.5px;letter-spacing:.8px;text-transform:uppercase;border-radius:6px;margin:16px 0 10px}
    .obs{background:var(--warn-soft);border-left:4px solid var(--warn);padding:10px 14px;font-size:12px;line-height:1.55;border-radius:4px;margin:12px 0}
    .firma{margin-top:36px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px}
    .firma .box{flex:1;text-align:center}
    .firma .box .l{border-top:1.5px solid var(--primary);padding-top:6px;font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px}
    .firma .box b{display:block;font-family:"Fraunces",Georgia,serif;font-size:15px;font-weight:600;color:var(--primary)}
    .foot{margin-top:28px;padding-top:12px;border-top:1px solid var(--line);font-size:10px;color:var(--muted);text-align:center;line-height:1.6}
    .print-btn{position:fixed;top:14px;right:14px;background:var(--primary);color:var(--ivory);border:none;padding:10px 18px;border-radius:999px;font:700 13px "Bricolage Grotesque",Arial,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(10,42,48,.2)}
    .print-btn:focus-visible{outline:3px solid var(--brass);outline-offset:3px}
    @media print{.print-btn{display:none}.cert{padding:20px 30px}body{background:#fff}}
  `;
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Certificación PA · ${d.num || ""} · Dovela Seguros</title>
    <link rel="stylesheet" href="public/css/dovela-tokens.css">
    <style>${css}</style></head><body>
    <button class="print-btn" onclick="window.print()">Imprimir / PDF</button>
    <div class="cert">
      <div class="cert-head">
        <img src="public/assets/brand/dovela-logo-horizontal.svg" width="150" height="46" alt="Dovela Seguros">
        <div style="text-align:right;font-size:11px;color:#334155">
          <div><b>N° Certificación:</b> ${d.num || "—"}</div>
          <div>Emitido: ${hoy}</div>
        </div>
      </div>
      <h1>Certificación de Pre-Autorización</h1>
      <h2>Hospitalizaciones, cirugías electivas y estudios especiales</h2>
      <table class="d">
        <tr><td class="lbl">Fecha</td><td>${d.fecha || hoy}</td>
            <td class="lbl">Nombre del paciente</td><td>${d.paciente || ""}</td>
            <td class="lbl">Cédula</td><td>${d.cedulaPac || d.cedula || ""}</td></tr>
        <tr><td class="lbl">Nombre del asegurado</td><td>${d.asegurado || ""}</td>
            <td class="lbl">Colectivo</td><td>${d.colectivo || "—"}</td>
            <td class="lbl">N° de póliza</td><td>${d.poliza || "—"}</td></tr>
        <tr><td class="lbl">Sexo del paciente</td><td>${d.sexo || ""}</td>
            <td class="lbl">Relación con el asegurado</td><td>${d.parentesco || "Titular"}</td>
            <td class="lbl">Edad</td><td>${d.edad || ""}</td></tr>
      </table>
      <div class="autoriz">Autorización para</div>
      <table class="d">
        <tr><td class="lbl">Hospital / Clínica</td><td colspan="5">${d.hospital || ""}</td></tr>
        <tr><td class="lbl">Hospitalización</td><td>${d.hospitalizacion || "NO"}</td>
            <td class="lbl">Estadía promedio</td><td>${d.estadia || "—"}</td>
            <td class="lbl">Habitación</td><td>${d.habitacion || "—"}</td></tr>
        <tr><td class="lbl">Diagnóstico(s)</td><td colspan="5">${d.diagnostico || ""}</td></tr>
        <tr><td class="lbl">Procedimientos</td><td colspan="4">${d.procedimientos || ""}</td>
            <td class="lbl">CPT</td></tr>
        ${(d.cptRows || []).map((r) => `<tr><td></td><td colspan="4">${r.desc}</td><td>${r.cpt || ""}</td></tr>`).join("")}
      </table>
      ${d.observaciones ? `<div class="obs"><b>Observaciones / Procedimientos especiales:</b><br>${d.observaciones}</div>` : ""}
      <table class="d" style="margin-top:14px">
        <tr><td class="lbl">Lugar de atención</td><td>${d.hospital || ""}</td>
            <td class="lbl">Teléfono</td><td>${d.telHosp || "—"}</td></tr>
        <tr><td class="lbl">Médico responsable</td><td>${d.medico || ""}</td>
            <td class="lbl">Especialidad</td><td>${d.especialidad || "—"}</td></tr>
        <tr><td class="lbl">Aprobado por</td><td>${d.aprobadoPor || "Equipo médico evaluador · Dovela Seguros"}</td>
            <td class="lbl">Certificación válida hasta</td><td>${d.validaHasta || ""}</td></tr>
      </table>
      <div class="firma">
        <div class="box"><b>Dovela Seguros</b><div class="l">Firma y sello autorizado</div></div>
      </div>
      <div class="foot">
        Documento electrónico generado por el Portal de Autogestión de Dovela Seguros.<br>
        Dovela Seguros es una entidad ficticia con fines demostrativos; este documento no constituye una autorización ni una cobertura real.
      </div>
    </div></body></html>`;
  w.document.write(html);
  w.document.close();
}

/* ================= RED MÉDICA (portal interno) ================= */
function pintarRed() {
  const q = sinAcentos((document.getElementById("ir-q").value || "").trim());
  const esp = document.getElementById("ir-esp").value;
  const prov = document.getElementById("ir-prov").value;
  let f = RED;
  if (esp) f = f.filter((r) => r.e === esp);
  if (prov) f = f.filter((r) => r.pN === prov);
  if (q)
    f = f.filter((r) =>
      sinAcentos(r.n + " " + r.d + " " + r.c + " " + r.e).includes(q),
    );
  const tb = document.getElementById("ir-body");
  const limit = 500;
  tb.innerHTML =
    f
      .slice(0, limit)
      .map(
        (r) =>
          `<tr class="fila"><td style="color:var(--text-primary);font-weight:600">${r.e || "—"}</td><td>${r.n || "—"}</td><td style="font-size:12px">${r.d || "—"}</td><td>${r.pN}</td><td>${r.c || "—"}</td><td class="mono">${r.t || "—"}</td></tr>`,
      )
      .join("") ||
    '<tr><td colspan="6" style="padding:20px;text-align:center;color:var(--pizarra)">Sin resultados.</td></tr>';
  document.getElementById("ir-count").textContent =
    `${Math.min(f.length, limit)} de ${f.length} resultados${f.length > limit ? " (afine su búsqueda)" : ""}.`;
}
function initRedInterno() {
  document.getElementById("red-total").textContent =
    RED.length.toLocaleString("es-PA");
  const se = document.getElementById("ir-esp"),
    sp = document.getElementById("ir-prov");
  se.insertAdjacentHTML(
    "beforeend",
    RED_ESPECIALIDADES.map((x) => `<option>${x}</option>`).join(""),
  );
  sp.insertAdjacentHTML(
    "beforeend",
    RED_PROVINCIAS.map((x) => `<option>${x}</option>`).join(""),
  );
  pintarRed();
}
function exportarRedCSV() {
  const rows = [
    ["Especialidad", "Nombre", "Direccion", "Provincia", "Ciudad", "Telefono"],
  ];
  RED.forEach((r) => rows.push([r.e, r.n, r.d, r.pN, r.c, r.t]));
  const csv = rows
    .map((r) =>
      r.map((v) => '"' + String(v || "").replace(/"/g, '""') + '"').join(","),
    )
    .join("\n");
  const b = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = "red_medica_dovela.csv";
  a.click();
  URL.revokeObjectURL(u);
  toast("CSV exportado");
}
// Hook para inicializar cuando se abre el tab
const _tabOrig = window.tab;
window.tab = function (t) {
  _tabOrig(t);
  if (t === "red" && !document.getElementById("ir-esp").dataset.ok) {
    initRedInterno();
    document.getElementById("ir-esp").dataset.ok = "1";
  }
};

/* ================= BOTÓN FLOTANTE: Certificación PA ================= */
(function () {
  const b = document.createElement("button");
  b.innerHTML = icono("documento") + " Generar certificación oficial";
  b.className = "btn btn-verde";
  b.style.cssText =
    "position:fixed;bottom:22px;right:22px;z-index:70;box-shadow:0 8px 24px rgba(0,0,0,.2);display:none";
  b.onclick = () => {
    // Toma datos del detalle PA actualmente abierto (si existe)
    const cont = document.getElementById("detalle-pa-body");
    const txt = (cont ? cont.innerText : "") || "";
    const get = (re) => {
      const m = txt.match(re);
      return m ? m[1].trim() : "";
    };
    const d = {
      num: get(/PA-\d{4}-\d+/) ? txt.match(/PA-\d{4}-\d+/)[0] : "PA-2026-XXX",
      paciente: get(/Paciente[:\s]+([^\n]+)/i),
      asegurado: get(/Asegurado[:\s]+([^\n]+)/i),
      cedula: get(/C[ée]dula[:\s]+([^\n]+)/i),
      poliza: get(/P[óo]liza[:\s]+([^\n]+)/i),
      hospital: get(/Hospital[^:]*[:\s]+([^\n]+)/i),
      medico: get(/M[ée]dico[^:]*[:\s]+([^\n]+)/i),
      diagnostico: get(/Diagn[óo]stico[^:]*[:\s]+([^\n]+)/i),
      procedimientos: get(/Procedimiento[^:]*[:\s]+([^\n]+)/i),
      hospitalizacion: "NO",
      validaHasta: new Date(Date.now() + 30 * 864e5).toLocaleDateString(
        "es-PA",
        { day: "numeric", month: "long", year: "numeric" },
      ),
      aprobadoPor:
        (document.getElementById("u-nombre")?.textContent || "Dovela Seguros") +
        " · Médico asesor",
      observaciones:
        "Autorización emitida por el equipo médico de Dovela Seguros. Las condiciones de reembolso fuera de la red dependen del plan del asegurado.",
    };
    generarCertPreauth(d);
  };
  document.body.appendChild(b);
  // Mostrar sólo cuando el detalle PA esté visible
  const obs = new MutationObserver(() => {
    const vis = !document
      .getElementById("tab-detalle-pa")
      .classList.contains("hidden");
    b.style.display = vis ? "inline-flex" : "none";
  });
  document.addEventListener("DOMContentLoaded", () => {
    const t = document.getElementById("tab-detalle-pa");
    if (t) obs.observe(t, { attributes: true, attributeFilter: ["class"] });
  });
})();

/* ================= ADMIN AVANZADO ================= */
function subtab(k) {
  document
    .querySelectorAll("#admin-subtabs .subtab")
    .forEach((b) => b.classList.toggle("on", b.dataset.sub === k));
  document
    .querySelectorAll(".sublit")
    .forEach((d) => d.classList.add("hidden"));
  document.getElementById("sub-" + k).classList.remove("hidden");
}
const AUDIT = [];
function audit(accion, ant, nuevo) {
  AUDIT.unshift({
    t: new Date().toLocaleString("es-PA"),
    u: sesion ? sesion.nombre : "—",
    a: accion,
    ant,
    nuevo,
  });
  if (document.getElementById("tbody-audit")) pintarAudit();
}
function pintarAudit() {
  const tb = document.getElementById("tbody-audit");
  if (!tb) return;
  tb.innerHTML =
    AUDIT.slice(0, 50)
      .map(
        (x) =>
          `<tr><td class="mono" style="font-size:11px">${x.t}</td><td>${x.u}</td><td>${x.a}</td><td style="color:var(--pizarra)">${x.ant || "—"}</td><td><b>${x.nuevo || "—"}</b></td></tr>`,
      )
      .join("") ||
    '<tr><td colspan="5" style="text-align:center;color:var(--pizarra);padding:18px">Sin cambios registrados.</td></tr>';
}

/* --- Roles --- */
const ROLES = {
  Admin: {
    modulos: [
      "dash",
      "bandeja",
      "detalle",
      "preauth",
      "detalle-pa",
      "provs",
      "detalle-prov",
      "admin",
      "administracion",
    ],
  },

  Ajustador: {
    modulos: [
      "dash",
      "bandeja",
      "detalle",
      "preauth",
      "detalle-pa",
      "provs",
      "detalle-prov",
    ],
  },

  Visualizador: {
    modulos: [
      "dash",
      "bandeja",
      "detalle",
      "preauth",
      "detalle-pa",
      "provs",
      "detalle-prov",
    ],
  },
};
function pintarRolesTable() {
  const tb = document.getElementById("tbody-roles");
  if (!tb) return;
  // Perfiles de acceso (PERMISOS): los mismos que se asignan a cada usuario.
  tb.innerHTML = Object.values(PERMISOS).map(
    (p) =>
      `<tr><td><b>${p.label}</b></td><td>${p.modulos.join(", ")}</td><td>${p.editReclamo ? "Sí" : "No"}</td><td>${p.verAdmin ? "Sí" : "No"}</td></tr>`,
  ).join("");
}

/* --- CMS del Portal Público: banners (tabla portal_banners) --- */
let BANNERS = [];
let bannerEditando = null; // id del banner en edición; null = banner nuevo
const DESTINOS_BANNER = {
  "#v-wizard": "Presentar un reclamo",
  "#v-claim-status": "Consultar estado de reclamo",
  "#pasos-title": "Cómo presentar un reclamo",
  "#sec-formularios": "Formularios",
  "#v-red": "Red Médica",
};
// Igual que la restricción de la columna portal_banners.url.
const URL_BANNER = /^(#[A-Za-z][A-Za-z0-9_-]*|https:\/\/[^\s"<>]+)$/;

const hoyPanama = () => GestionCalendario.localPanama(new Date()).slice(0, 10);
function sumarDias(fecha, dias) {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

// Estado visible en el portal público según activo y vigencia (hora de Panamá).
function estadoBanner(b) {
  if (!b.activo) return ["Inactivo", "b-gris"];
  const hoy = hoyPanama();
  if (b.desde > hoy) return ["Programado", "b-azul"];
  if (b.hasta < hoy) return ["Vencido", "b-ambar"];
  return ["Publicado", "b-verde"];
}

async function cargarBanners() {
  const token = PortalTableState.begin("tbody-banners", 6, "Cargando banners…");
  try {
    BANNERS = await BannersRepository.obtenerTodos();
  } catch (error) {
    PortalTableState.error("tbody-banners", token, 6,
      i18nT("No fue posible cargar los banners.") + " " + (error?.message || ""), cargarBanners);
    return;
  }
  PortalTableState.end("tbody-banners", token);
  pintarBanners();
}

function pintarBanners() {
  const tb = document.getElementById("tbody-banners");
  if (!tb || PortalTableState.blocked("tbody-banners")) return;
  if (!BANNERS.length) {
    PortalTableState.empty("tbody-banners", 6, "No hay banners. Cree el primero con «Nuevo banner».");
    return;
  }
  const ultimo = BANNERS.length - 1;
  tb.innerHTML = BANNERS.map((b, i) => {
    const [estado, clase] = estadoBanner(b);
    const destino = !b.url
      ? "<span>Sin botón</span>"
      : DESTINOS_BANNER[b.url]
        ? `<span>${DESTINOS_BANNER[b.url]}</span>`
        : `<span class="mono" style="font-size:11.5px;overflow-wrap:anywhere" data-i18n-ignore>${esc(b.url)}</span>`;
    return `<tr>
      <td><div class="cms-orden"><b>${i + 1}</b>
        <button class="btn btn-ghost btn-sm" onclick="moverBanner('${esc(b.id)}',-1)" ${i === 0 ? "disabled" : ""} aria-label="Subir" title="Subir">↑</button>
        <button class="btn btn-ghost btn-sm" onclick="moverBanner('${esc(b.id)}',1)" ${i === ultimo ? "disabled" : ""} aria-label="Bajar" title="Bajar">↓</button></div></td>
      <td><b data-i18n-ignore>${esc(b.titulo)}</b><div class="ayuda" style="margin:2px 0 0" data-i18n-ignore>${esc(b.texto)}</div>${idiomasBanner(b)}</td>
      <td style="font-size:12px;white-space:nowrap">${esc(b.desde)} → ${esc(b.hasta)}</td>
      <td style="font-size:12px">${b.boton ? `<b data-i18n-ignore>${esc(b.boton)}</b><br>` : ""}${destino}</td>
      <td><span class="badge ${clase}">${estado}</span></td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="abrirModalBanner('${esc(b.id)}')">Editar</button>
        <button class="btn btn-ghost btn-sm" onclick="toggleBanner('${esc(b.id)}')">${b.activo ? "Desactivar" : "Activar"}</button>
        <button class="btn btn-rojo btn-sm" onclick="borrarBanner('${esc(b.id)}')" aria-label="Eliminar" title="Eliminar"><span class=ico data-icon=borrar aria-hidden=true></span></button></td></tr>`;
  }).join("");
}

function agregarBanner() {
  abrirModalBanner(null);
}

function abrirModalBanner(id) {
  const b = BANNERS.find((x) => x.id === id);
  bannerEditando = b ? b.id : null;
  const hoy = hoyPanama();
  const datos = b || { titulo: "", texto: "", boton: "", url: "", desde: hoy, hasta: sumarDias(hoy, 30), activo: true };
  $("mb-titulo-modal").textContent = b ? "Editar banner" : "Nuevo banner";
  $("mb-titulo").value = datos.titulo;
  $("mb-texto").value = datos.texto;
  $("mb-boton").value = datos.boton;
  $("mb-destino").value = !datos.url ? "" : DESTINOS_BANNER[datos.url] ? datos.url : "externo";
  $("mb-url").value = $("mb-destino").value === "externo" ? datos.url : "";
  $("mb-desde").value = datos.desde;
  $("mb-hasta").value = datos.hasta;
  $("mb-activo").checked = !!datos.activo;
  cargarTraduccionesForm(b?.traducciones);
  mostrarErrorBanner("");
  cambiarDestinoBanner();
  $("modal-banner").classList.add("ver");
  $("mb-titulo").focus();
}

function cerrarModalBanner() {
  $("modal-banner").classList.remove("ver");
}

function mostrarErrorBanner(texto) {
  $("mb-error").textContent = texto ? i18nT(texto) : "";
  $("mb-error").hidden = !texto;
}

function cambiarDestinoBanner() {
  const destino = $("mb-destino").value;
  $("mb-url-campo").classList.toggle("hidden", destino !== "externo");
  $("mb-boton").disabled = !destino;
  if (destino && !$("mb-boton").value.trim() && DESTINOS_BANNER[destino]) {
    $("mb-boton").value = i18nT(DESTINOS_BANNER[destino]);
  }
  previsualizarBanner();
}

// Vista previa con el mismo contenido que verá el portal público.
function previsualizarBanner() {
  const titulo = $("mb-titulo").value.trim();
  const texto = $("mb-texto").value.trim();
  const boton = $("mb-destino").value ? $("mb-boton").value.trim() : "";
  $("mb-preview").innerHTML = `<div style="flex:1;min-width:200px">
      <p class="cms-preview-label">${esc(i18nT("NOVEDADES DOVELA"))}</p>
      <h4 data-i18n-ignore>${esc(titulo || i18nT("Título del banner"))}</h4>
      ${texto ? `<p data-i18n-ignore>${esc(texto)}</p>` : ""}
    </div>${boton ? `<span class="cms-preview-cta" data-i18n-ignore>${esc(boton)} ↗</span>` : ""}`;
}

// Lee y valida el formulario con las mismas reglas que la tabla portal_banners.
function leerFormBanner() {
  const titulo = $("mb-titulo").value.trim();
  const texto = $("mb-texto").value.trim();
  const destino = $("mb-destino").value;
  const url = destino === "externo" ? $("mb-url").value.trim() : destino;
  const boton = destino ? $("mb-boton").value.trim() : "";
  const desde = $("mb-desde").value;
  const hasta = $("mb-hasta").value;
  if (titulo.length < 3 || titulo.length > 90) return { error: "El título debe tener entre 3 y 90 caracteres." };
  if (texto.length > 220) return { error: "El texto admite hasta 220 caracteres." };
  if (destino === "externo" && !/^https:\/\//.test(url)) return { error: "Ingrese un enlace que empiece con https://" };
  if (url && !URL_BANNER.test(url)) return { error: "El enlace no es válido." };
  if (destino && !boton) return { error: "Escriba el texto del botón." };
  if (boton.length > 40) return { error: "El texto del botón admite hasta 40 caracteres." };
  if (!desde || !hasta) return { error: "Indique las fechas de vigencia." };
  if (hasta < desde) return { error: "La fecha final no puede ser anterior a la inicial." };
  return { datos: { titulo, texto, boton, url: boton ? url : "", desde, hasta, activo: $("mb-activo").checked } };
}

async function guardarBanner() {
  const { datos, error } = leerFormBanner();
  if (error) {
    mostrarErrorBanner(error);
    return;
  }
  mostrarErrorBanner("");
  const boton = $("mb-guardar");
  boton.disabled = true;
  // Antes de guardar se traducen los campos vacíos o desactualizados; si el servicio falla,
  // el banner se guarda igual y esos idiomas muestran el español en el portal público.
  let fallosTraduccion = 0;
  if (BannersRepository.conTraducciones && window.TraductorBanner) {
    fallosTraduccion = await traducirFormBanner(false);
    datos.traducciones = leerTraduccionesForm(datos);
  }
  try {
    if (bannerEditando) {
      const actualizado = await BannersRepository.actualizar(bannerEditando, datos, usuarioActual());
      BANNERS = BANNERS.map((b) => (b.id === actualizado.id ? actualizado : b));
      audit("Banner editado", "", actualizado.titulo);
    } else {
      const orden = BANNERS.reduce((max, b) => Math.max(max, b.orden || 0), 0) + 1;
      const creado = await BannersRepository.crear({ ...datos, orden }, usuarioActual());
      BANNERS.push(creado);
      audit("Banner creado", "—", creado.titulo);
    }
  } catch (e) {
    mostrarErrorBanner(i18nT("No fue posible guardar el banner.") + " " + (e?.message || ""));
    return;
  } finally {
    boton.disabled = false;
  }
  cerrarModalBanner();
  pintarBanners();
  if (!BannersRepository.conTraducciones) toast("Banner guardado sin traducciones: falta ejecutar la migración de traducciones en Supabase.");
  else if (fallosTraduccion) toast("Banner guardado. Algunas traducciones no se pudieron generar; esos idiomas mostrarán el texto en español.");
  else toast("Banner guardado");
}

/* --- CMS: traducciones automáticas de la novedad (interno/js/interno-traductor.js) ---
   Se guardan en portal_banners.traducciones: { en|fr|pt: { titulo, texto, boton }, origen: {…} }.
   `origen` es el español que se tradujo; si el español cambia, la traducción se renueva al guardar,
   salvo en los campos que el Admin editó a mano durante esta edición. */
const IDIOMAS_BANNER = ["en", "fr", "pt"];
const CAMPOS_BANNER = ["titulo", "texto", "boton"];
let origenTraduccion = {};
const campoTraduccion = (idioma, campo) => $(`mb-tr-${idioma}-${campo}`);

// Insignias EN · FR · PT en la tabla: resaltadas si el idioma tiene al menos el título traducido.
function idiomasBanner(b) {
  if (!BannersRepository.conTraducciones) return "";
  const tr = b.traducciones || {};
  return `<div class="cms-idiomas" data-i18n-ignore>${IDIOMAS_BANNER
    .map((idioma) => `<span${tr[idioma]?.titulo ? " data-ok" : ""} title="${idioma.toUpperCase()}">${idioma.toUpperCase()}</span>`).join("")}</div>`;
}

function cargarTraduccionesForm(traducciones) {
  const tr = traducciones && typeof traducciones === "object" ? traducciones : {};
  origenTraduccion = { ...(tr.origen || {}) };
  IDIOMAS_BANNER.forEach((idioma) => CAMPOS_BANNER.forEach((campo) => {
    const input = campoTraduccion(idioma, campo);
    input.value = tr[idioma]?.[campo] || "";
    delete input.dataset.manual;
  }));
  $("mb-trad").hidden = !BannersRepository.conTraducciones || !window.TraductorBanner;
  $("mb-trad").open = false;
  estadoTraduccion("");
  resumenTraduccion();
}

// Lo que el Admin escribe a mano en una traducción se respeta al guardar.
document.addEventListener("input", (event) => {
  const input = event.target.closest?.("[data-traduccion]");
  if (!input) return;
  input.dataset.manual = "1";
  resumenTraduccion();
});

function estadoTraduccion(texto, tono) {
  const estado = $("mb-trad-estado");
  estado.textContent = texto ? i18nT(texto) : "";
  if (tono) estado.dataset.tono = tono;
  else delete estado.dataset.tono;
}

function resumenTraduccion() {
  const completos = IDIOMAS_BANNER.filter((idioma) => campoTraduccion(idioma, "titulo").value.trim()).length;
  $("mb-trad-resumen").textContent = completos
    ? `${completos}/${IDIOMAS_BANNER.length}`
    : i18nT("Se generan al guardar");
}

// Español vigente del formulario (el botón solo cuenta si hay destino).
function espanolFormBanner() {
  return {
    titulo: $("mb-titulo").value.trim(),
    texto: $("mb-texto").value.trim(),
    boton: $("mb-destino").value ? $("mb-boton").value.trim() : "",
  };
}

// Traduce los campos pendientes. `forzar` (botón «Traducir automáticamente») renueva todos,
// incluso los editados a mano. Devuelve cuántos campos no se pudieron traducir.
async function traducirFormBanner(forzar) {
  const es = espanolFormBanner();
  const pendientes = {};
  IDIOMAS_BANNER.forEach((idioma) => CAMPOS_BANNER.forEach((campo) => {
    const input = campoTraduccion(idioma, campo);
    if (!es[campo]) { input.value = ""; return; }
    const desactualizado = origenTraduccion[campo] !== es[campo] && !input.dataset.manual;
    if (forzar || !input.value.trim() || desactualizado) (pendientes[idioma] ||= []).push(campo);
  }));
  const idiomas = Object.keys(pendientes);
  if (!idiomas.length) return 0;

  const boton = $("mb-traducir");
  boton.disabled = true;
  estadoTraduccion("Traduciendo…");
  let fallos = 0;
  try {
    const trabajos = idiomas.map((idioma) => {
      const campos = Object.fromEntries(pendientes[idioma].map((campo) => [campo, es[campo]]));
      return TraductorBanner.traducir(campos, [idioma]).then((r) => ({ idioma, ...r }));
    });
    const fallidos = new Set();
    (await Promise.all(trabajos)).forEach(({ idioma, resultado, errores }) => {
      pendientes[idioma].forEach((campo) => {
        const input = campoTraduccion(idioma, campo);
        const traducido = resultado[idioma]?.[campo];
        if (traducido) {
          input.value = traducido;
          delete input.dataset.manual;
        } else {
          // Sin traducción vigente: mejor el español que un texto viejo.
          if (origenTraduccion[campo] !== es[campo]) input.value = "";
          fallidos.add(campo);
        }
      });
      fallos += errores.length;
      errores.forEach((e) => console.warn("Traducción automática:", e.idioma, e.campo, e.mensaje));
    });
    // Un campo queda al día cuando ningún idioma falló al traducirlo.
    CAMPOS_BANNER.forEach((campo) => { if (!fallidos.has(campo)) origenTraduccion[campo] = es[campo]; });
  } finally {
    boton.disabled = false;
  }
  if (fallos) {
    $("mb-trad").open = true;
    estadoTraduccion("No fue posible traducir todo automáticamente. Puede completar los campos a mano o volver a intentarlo.", "error");
  } else {
    estadoTraduccion("Traducción automática lista: revísela antes de publicar.");
  }
  resumenTraduccion();
  return fallos;
}

function leerTraduccionesForm(datos) {
  const traducciones = { origen: {} };
  // Si los tres idiomas tienen texto (traducido o escrito a mano), el campo queda al día con el
  // español actual; así una edición manual no se sobrescribe en el próximo guardado.
  CAMPOS_BANNER.forEach((campo) => {
    const completo = datos[campo] && IDIOMAS_BANNER.every((idioma) => campoTraduccion(idioma, campo).value.trim());
    traducciones.origen[campo] = completo ? datos[campo] : origenTraduccion[campo] || "";
  });
  IDIOMAS_BANNER.forEach((idioma) => {
    const valores = {};
    CAMPOS_BANNER.forEach((campo) => {
      const limite = TraductorBanner.LIMITES[campo];
      const valor = datos[campo] ? campoTraduccion(idioma, campo).value.trim().slice(0, limite) : "";
      if (valor) valores[campo] = valor;
    });
    if (Object.keys(valores).length) traducciones[idioma] = valores;
  });
  return traducciones;
}

async function toggleBanner(id) {
  const b = BANNERS.find((x) => x.id === id);
  if (!b) return;
  try {
    const actualizado = await BannersRepository.actualizar(id, { activo: !b.activo }, usuarioActual());
    Object.assign(b, actualizado);
  } catch (e) {
    toast(i18nT("No fue posible guardar el banner.") + " " + (e?.message || ""));
    return;
  }
  audit("Banner " + (b.activo ? "activado" : "desactivado"), "", b.titulo);
  pintarBanners();
  toast(b.activo ? "Banner activado" : "Banner desactivado");
}

async function borrarBanner(id) {
  const b = BANNERS.find((x) => x.id === id);
  if (!b) return;
  if (!confirm(`${i18nT("¿Eliminar este banner?")} «${b.titulo}»\n${i18nT("Esta acción no se puede deshacer.")}`)) return;
  try {
    await BannersRepository.eliminar(id);
  } catch (e) {
    toast(i18nT("No fue posible eliminar el banner.") + " " + (e?.message || ""));
    return;
  }
  BANNERS = BANNERS.filter((x) => x.id !== id);
  audit("Banner eliminado", b.titulo, "—");
  pintarBanners();
  toast("Banner eliminado");
}

// Intercambia la posición con el vecino y guarda el orden 1..n de los que cambian.
async function moverBanner(id, paso) {
  const i = BANNERS.findIndex((x) => x.id === id);
  const j = i + paso;
  if (i < 0 || j < 0 || j >= BANNERS.length) return;
  const lista = BANNERS.slice();
  [lista[i], lista[j]] = [lista[j], lista[i]];
  const cambios = lista
    .map((b, k) => ({ b, orden: k + 1 }))
    .filter(({ b, orden }) => b.orden !== orden);
  try {
    await Promise.all(cambios.map(({ b, orden }) => BannersRepository.actualizar(b.id, { orden }, usuarioActual())));
  } catch (e) {
    toast(i18nT("No fue posible cambiar el orden.") + " " + (e?.message || ""));
    cargarBanners();
    return;
  }
  cambios.forEach(({ b, orden }) => { b.orden = orden; });
  BANNERS = lista;
  audit("Banner reordenado", "", lista[j].titulo);
  pintarBanners();
}

/* --- CMS: identidad del portal (portal_parametros 'identidad') --- */
const LOGO_ORIGINAL = LOGO_WH;
const TITULO_ORIGINAL = CONFIG.titulo;
const LOGO_TIPOS = ["image/png", "image/svg+xml", "image/webp", "image/jpeg"];
const LOGO_MAX_BYTES = 200 * 1024;
let IDENTIDAD = { titulo: TITULO_ORIGINAL, logo: null };

async function cargarIdentidad() {
  try {
    const p = await ParametrosRepository.obtener(["identidad"]);
    IDENTIDAD = { titulo: TITULO_ORIGINAL, logo: null, ...(p.identidad || {}) };
  } catch (error) {
    console.error("Error cargando la identidad del portal:", error);
  }
  aplicarIdentidad();
}

function aplicarIdentidad() {
  CONFIG.titulo = IDENTIDAD.titulo || TITULO_ORIGINAL;
  LOGO_WH = IDENTIDAD.logo || LOGO_ORIGINAL;
  $("logo-side").src = LOGO_WH;
  $("titulo-portal").textContent = CONFIG.titulo;
  $("cfg-logo-prev").src = LOGO_WH;
  $("cfg-logo-restaurar").disabled = !IDENTIDAD.logo;
  $("cfg-titulo").value = CONFIG.titulo;
}

async function guardarIdentidad(cambios, accion, mensaje) {
  const nueva = { ...IDENTIDAD, ...cambios };
  try {
    await ParametrosRepository.guardar("identidad", nueva, usuarioActual());
  } catch (error) {
    toast(i18nT("No fue posible guardar la identidad del portal.") + " " + (error?.message || ""));
    return false;
  }
  audit(accion, "", cambios.titulo || "—");
  IDENTIDAD = nueva;
  aplicarIdentidad();
  toast(mensaje);
  return true;
}

function cambiarLogo(input) {
  const f = input.files[0];
  input.value = "";
  if (!f) return;
  if (!LOGO_TIPOS.includes(f.type)) {
    toast("Formato no admitido. Use PNG, SVG, WebP o JPG.");
    return;
  }
  if (f.size > LOGO_MAX_BYTES) {
    toast("El logo supera los 200 KB. Optimice la imagen e inténtelo de nuevo.");
    return;
  }
  const lector = new FileReader();
  lector.onload = () => guardarIdentidad({ logo: lector.result }, "Logo del portal actualizado", "Logo actualizado en el portal");
  lector.readAsDataURL(f);
}

function restaurarLogo() {
  return guardarIdentidad({ logo: null }, "Logo del portal restaurado", "Logo original restaurado");
}

function guardarTituloPortal() {
  const titulo = $("cfg-titulo").value.trim();
  if (titulo.length < 3 || titulo.length > 60) {
    toast("El nombre del módulo debe tener entre 3 y 60 caracteres.");
    return;
  }
  if (titulo === IDENTIDAD.titulo) {
    toast("No hay cambios que guardar.");
    return;
  }
  return guardarIdentidad({ titulo }, "Nombre del módulo", "Nombre del módulo actualizado");
}

/* --- SLAs por proceso: interno/js/interno-sla.js --- */

/* --- Catálogos --- */
const CAT = {
  Especialidades: [
    "Medicina general",
    "Cardiología",
    "Pediatría",
    "Ginecología",
    "Oftalmología",
    "Traumatología",
  ],
  Diagnósticos: [
    "J06.9 Infección respiratoria",
    "I10 Hipertensión",
    "K80 Colelitiasis",
    "S82 Fractura tibia",
  ],
  "Estados de reclamo": [
    "Recibido",
    "En Proceso",
    "Pendiente de Información",
    "Pagado",
    "Rechazado",
  ],
  "Motivos de rechazo": [
    "Documentación incompleta",
    "Fuera de cobertura",
    "Preexistencia",
    "Tratamiento no cubierto",
  ],
  "Motivos de devolución": [
    "Faltan exámenes",
    "Falta orden médica",
    "Datos incompletos",
    "Falta receta",
  ],
  Hospitales: [
    "Hospital General de Valdoria",
    "Hospital Manglar",
    "Hospital Faro Verde",
    "Hospital Ámbar",
  ],
  Clínicas: [
    "Clínica Monteazul",
    "Clínica Mareaviva",
    "Centro Médico Brisaclara",
  ],
  Coberturas: [
    "Ambulatoria",
    "Hospitalización",
    "Maternidad",
    "Cirugía",
    "Medicamentos",
    "Diagnóstico",
  ],
};
function pintarCatSelect() {
  const s = document.getElementById("cat-sel");
  if (!s) return;
  s.innerHTML = Object.keys(CAT)
    .map((k) => `<option>${k}</option>`)
    .join("");
}
function pintarCat() {
  const s = document.getElementById("cat-sel");
  if (!s) return;
  const k = s.value;
  const tb = document.getElementById("tbody-cat");
  tb.innerHTML = (CAT[k] || [])
    .map(
      (v, i) =>
        `<tr><td>${v}</td><td><button class="btn btn-rojo btn-sm" onclick="CAT['${k}'].splice(${i},1);pintarCat();audit('Catálogo ${k}: eliminar','${v}','—')" aria-label="Eliminar" title="Eliminar"><span class=ico data-icon=borrar aria-hidden=true></span></button></td></tr>`,
    )
    .join("");
}
function agregarCat() {
  const s = document.getElementById("cat-sel").value;
  const v = document.getElementById("cat-nuevo").value.trim();
  if (!v) return;
  CAT[s].push(v);
  document.getElementById("cat-nuevo").value = "";
  audit("Catálogo " + s + ": agregar", "—", v);
  pintarCat();
}

/* --- Red médica admin --- */
let RED_VERSION = 1;
const RED_HIST = [];
function pintarRedAdmin() {
  const el = document.getElementById("red-count-admin");
  if (!el) return;
  el.textContent = RED.length;
  document.getElementById("red-version").textContent = RED_VERSION;
  const tb = document.getElementById("tbody-red-hist");
  tb.innerHTML =
    RED_HIST.slice(0, 20)
      .map(
        (h) =>
          `<tr><td>v${h.v}</td><td class="mono" style="font-size:11px">${h.t}</td><td>${h.u}</td><td>${h.a}</td></tr>`,
      )
      .join("") ||
    '<tr><td colspan="4" style="text-align:center;color:var(--pizarra);padding:16px">Sin cambios.</td></tr>';
}
function importarRed(input) {
  const f = input.files[0];
  if (!f) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const wb = XLSX.read(new Uint8Array(lector.result), { type: "array" });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      let ok = 0;
      data.forEach((r) => {
        const nombre = r.Nombre || r.nombre || r.Medico;
        if (!nombre) return;
        RED.push({
          e: r.Especialidad || r.especialidad || "—",
          n: nombre,
          d: r.Direccion || r.direccion || r.CentroMedico || "—",
          p: r.Provincia || r.provincia || "Valdoria",
          pN: normProv(r.Provincia || ""),
          c: r.Ciudad || r.ciudad || "—",
          t: r.Telefono || r.telefono || "",
        });
        ok++;
      });
      RED_VERSION++;
      RED_HIST.unshift({
        v: RED_VERSION,
        t: new Date().toLocaleString("es-PA"),
        u: sesion.nombre,
        a: "Importación masiva: " + ok + " registros",
      });
      audit("Red médica: importación", "", ok + " registros");
      pintarRedAdmin();
      toast(ok + " prestadores importados. Nueva versión v" + RED_VERSION);
    } catch (e) {
      toast("Error al leer el archivo: " + e.message);
    }
  };
  lector.readAsArrayBuffer(f);
  input.value = "";
}
function altaMedico() {
  const n = prompt(i18nT("Nombre completo del médico o prestador:"));
  if (!n) return;
  const e = prompt(i18nT("Especialidad:"));
  const p = prompt(i18nT("Provincia:"));
  const c = prompt(i18nT("Ciudad:"));
  const t = prompt(i18nT("Teléfono:"));
  RED.push({
    e: e || "—",
    n,
    d: "—",
    p: p || "Valdoria",
    pN: normProv(p || ""),
    c: c || "—",
    t: t || "",
  });
  RED_VERSION++;
  RED_HIST.unshift({
    v: RED_VERSION,
    t: new Date().toLocaleString("es-PA"),
    u: sesion.nombre,
    a: "Alta individual: " + n,
  });
  audit("Red médica: alta", "—", n);
  pintarRedAdmin();
  toast("Prestador agregado");
}

/* --- Plantillas --- */
const PLANTILLAS = {
  "Preautorización · Aprobación": {
    titulo: "Certificación de Pre-Autorización",
    body: "Estimado/a {nombre},\nInformamos que su solicitud N° {numero} de fecha {fecha} ha sido APROBADA por un monto de {monto}. Válida por 30 días.\n\nAtentamente,\nDovela Seguros",
  },
  "Preautorización · Rechazo": {
    titulo: "Comunicado de Declinación",
    body: "Estimado/a {nombre},\nLamentamos comunicar que su solicitud N° {numero} ha sido DECLINADA. Motivo: {motivo}.\n\nAtentamente,\nDovela Seguros",
  },
  "Preautorización · Solicitud de información": {
    titulo: "Solicitud de Información Adicional",
    body: "Estimado/a {nombre},\nPara continuar con el análisis de su solicitud N° {numero}, requerimos: {motivo}.\n\nAtentamente,\nDovela Seguros",
  },
  "Reclamos · Acuse de recibo": {
    titulo: "Confirmación de radicación",
    body: "Estimado/a {nombre},\nHemos recibido su reclamo N° {numero} el {fecha}. Estado actual: {estado}.\n\nAtentamente,\nDovela Seguros",
  },
  "Reclamos · Solicitud documental": {
    titulo: "Documentación pendiente",
    body: "Estimado/a {nombre},\nPara continuar con su reclamo N° {numero}, requerimos: {motivo}.",
  },
  "Reclamos · Resolución": {
    titulo: "Resolución de su reclamo",
    body: "Estimado/a {nombre},\nSu reclamo N° {numero} ha sido resuelto con estado {estado}. Monto: {monto}.",
  },
  "Proveedores · Aprobación": {
    titulo: "Aprobación de expediente",
    body: "Estimado/a {nombre},\nSu solicitud de afiliación N° {numero} ha sido aprobada. Bienvenido a la red Dovela.",
  },
  "Proveedores · Rechazo": {
    titulo: "Comunicado de rechazo",
    body: "Estimado/a {nombre},\nSu solicitud N° {numero} ha sido rechazada. Motivo: {motivo}.",
  },
  "Proveedores · Activación": {
    titulo: "Activación en la red",
    body: "Estimado/a {nombre},\nSu perfil ha sido activado en la Red Médica Dovela con fecha {fecha}.",
  },
};
function pintarPlantSelect() {
  const s = document.getElementById("plant-sel");
  if (!s) return;
  s.innerHTML = Object.keys(PLANTILLAS)
    .map((k) => `<option>${k}</option>`)
    .join("");
}
function pintarPlantilla() {
  const s = document.getElementById("plant-sel");
  if (!s) return;
  const p = PLANTILLAS[s.value];
  document.getElementById("plant-titulo").value = p.titulo;
  document.getElementById("plant-body").value = p.body;
}
function guardarPlantilla() {
  const s = document.getElementById("plant-sel").value;
  const t = document.getElementById("plant-titulo").value,
    b = document.getElementById("plant-body").value;
  audit("Plantilla actualizada: " + s, PLANTILLAS[s].titulo, t);
  PLANTILLAS[s] = { titulo: t, body: b };
  toast("Plantilla guardada");
}
function previsualizarPlantilla() {
  const s = document.getElementById("plant-sel").value;
  const p = PLANTILLAS[s];
  const w = window.open("", "_blank");
  const b = p.body
    .replace(/{nombre}/g, "Carlos Espinosa")
    .replace(/{numero}/g, "PA-2026-001")
    .replace(/{fecha}/g, HOY)
    .replace(/{estado}/g, "Autorizada")
    .replace(/{monto}/g, "US$ 842.50")
    .replace(/{motivo}/g, "documentación pendiente");
  w.document.write(
    `<title>${p.titulo}</title><body style="font-family:Bricolage Grotesque,Segoe UI,Arial;max-width:700px;margin:40px auto;padding:20px;color:#0F172A"><h2 style="color:#1E3A5F">${p.titulo}</h2><pre style="white-space:pre-wrap;font-family:inherit;font-size:14px">${b}</pre></body>`,
  );
}

/* --- Correos --- */
const MAILS = [
  {
    ev: "Reclamo recibido",
    dst: "Asegurado",
    pl: "Reclamos · Acuse de recibo",
    on: true,
  },
  {
    ev: "Reclamo pagado",
    dst: "Asegurado",
    pl: "Reclamos · Resolución",
    on: true,
  },
  {
    ev: "Preauth aprobada",
    dst: "Asegurado + Hospital",
    pl: "Preautorización · Aprobación",
    on: true,
  },
  {
    ev: "Preauth declinada",
    dst: "Asegurado",
    pl: "Preautorización · Rechazo",
    on: true,
  },
  {
    ev: "Preauth pendiente info",
    dst: "Asegurado",
    pl: "Preautorización · Solicitud de información",
    on: true,
  },
  {
    ev: "Proveedor aprobado",
    dst: "Proveedor",
    pl: "Proveedores · Aprobación",
    on: true,
  },
  { ev: "Alerta SLA vencido", dst: "Coordinador + Líder", pl: "—", on: true },
];
function pintarMail() {
  const tb = document.getElementById("tbody-mail");
  if (!tb) return;
  tb.innerHTML = MAILS.map(
    (m, i) => `<tr><td><b>${m.ev}</b></td><td>${m.dst}</td><td>${m.pl}</td>
    <td><label style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" style="width:auto" ${m.on ? "checked" : ""} onchange="MAILS[${i}].on=this.checked;audit('Correo ${m.ev}', '', this.checked?'ON':'OFF')"> ${m.on ? "ON" : "OFF"}</label></td></tr>`,
  ).join("");
}

/* --- Parámetros --- */
function pintarParam() {
  pintarParametrosOperativos();
}
function guardarParam() {
  audit("Parámetros actualizados", "", "");
  toast("Parámetros guardados");
}

/* --- separator --- */

/* ============ window.SC namespace v4 (portal interno) ============ */
window.SC = window.SC || {};
SC.USUARIOS_FIRMAS = SC.USUARIOS_FIRMAS || {}; // {email: dataURL}
SC.FORMS = SC.FORMS || {}; // {tipo: [{version, nombre, url, publicado, activo}]}

// ==== Rango de fechas para bandeja ====
SC.aplicarRango = function (rango) {
  const desde = $("fil-desde"),
    hasta = $("fil-hasta");
  if (!desde || !hasta) return;
  desde.classList.toggle("hidden", rango !== "personalizado");
  hasta.classList.toggle("hidden", rango !== "personalizado");
  // Fechas en hora de Panamá (YYYY-MM-DD), igual que la fecha de recepción.
  const hoy = GestionCalendario.localPanama(new Date()).slice(0, 10);
  const mesesAtras = (n) => {
    const [a, m, d] = hoy.split("-").map(Number);
    const f = new Date(Date.UTC(a, m - 1 - n, d));
    return f.toISOString().slice(0, 10);
  };
  const inicio = {
    mensual: hoy.slice(0, 8) + "01",
    trimestral: mesesAtras(3),
    semestral: mesesAtras(6),
    anual: mesesAtras(12),
  }[rango];
  if (inicio) {
    desde.value = inicio;
    hasta.value = hoy;
  } else if (rango === "") {
    desde.value = "";
    hasta.value = "";
  }
  if (typeof pintarBandeja === "function") pintarBandeja();
};

SC.filtroRango = function (fecha) {
  const d = $("fil-desde")?.value,
    h = $("fil-hasta")?.value;
  if (!d && !h) return true;
  if (d && fecha < d) return false;
  if (h && fecha > h) return false;
  return true;
};

// El rango de fechas lo aplica filtrarBandeja() (interno-bandeja.js) sobre los datos.

SC.descargarReporte = function () {
  const rows = Array.from(
    document.querySelectorAll("#tbody-bandeja tr:not([data-table-state])"),
  ).filter((tr) => tr.style.display !== "none");
  if (!rows.length) {
    toast("No hay filas para exportar.");
    return;
  }
  const headers = Array.from(
    document.querySelectorAll("#tab-bandeja thead th"),
  ).map((th) => th.textContent.trim());
  const data = [headers].concat(
    rows.map((tr) =>
      Array.from(tr.querySelectorAll("td")).map((td) => td.textContent.trim()),
    ),
  );
  if (typeof XLSX !== "undefined") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Reclamos");
    const rango = $("fil-rango")?.value || "todo";
    XLSX.writeFile(
      wb,
      `Reclamos_${rango}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  } else {
    const csv = data
      .map((r) =>
        r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Reclamos_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
  }
  toast("Reporte descargado.");
};

// ==== PAGOS MASIVOS ====
SC.abrirPagosMasivos = function () {
  const u = typeof USUARIO_ACTUAL !== "undefined" ? USUARIO_ACTUAL : null;
  const perfil = u?.perfil || "";
  if (
    !["admin", "coordinador", "supervisor", "contabilidad"].includes(perfil)
  ) {
    toast("Solo Contabilidad o Administradores pueden cargar pagos masivos.");
    return;
  }
  $("modal-pagos").classList.remove("hidden");
};
SC.cerrarPagosMasivos = function () {
  $("modal-pagos").classList.add("hidden");
};
SC._filasPagos = [];
SC.previewPagos = function () {
  const inp = $("pm-file");
  const f = inp.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = (e) => {
    const txt = e.target.result;
    const sep = txt.indexOf(";") > -1 && txt.indexOf(",") === -1 ? ";" : ",";
    const lines = txt.split(/\r?\n/).filter(Boolean);
    const head = lines[0].split(sep).map((s) => s.trim().toLowerCase());
    const rows = lines.slice(1).map((l) => l.split(sep));
    SC._filasPagos = rows.map((r) => {
      const o = {};
      head.forEach((h, i) => (o[h] = (r[i] || "").trim()));
      return o;
    });
    const req = ["radicado", "monto_pagado"];
    const faltan = req.filter((k) => !head.includes(k));
    const prev = $("pm-preview");
    if (faltan.length) {
      prev.innerHTML = `<div class="aviso-inline" style="background:rgba(214,69,69,.08);border-color:var(--rojo);color:var(--rojo)"><span class=ico data-icon=alerta aria-hidden=true></span> Faltan columnas obligatorias: ${faltan.join(", ")}. Estructura esperada: <code>radicado, monto_pagado, genelco, estado</code>.</div>`;
      SC._filasPagos = [];
      return;
    }
    prev.innerHTML = `<div class="aviso-inline"><span class=ico data-icon=ok aria-hidden=true></span> Archivo válido · ${SC._filasPagos.length} registros detectados.</div>
      <div style="max-height:220px;overflow:auto;border:1px solid var(--niebla);border-radius:8px">
        <table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${SC._filasPagos
          .slice(0, 10)
          .map(
            (o) =>
              `<tr>${head.map((h) => `<td>${o[h] || ""}</td>`).join("")}</tr>`,
          )
          .join("")}</tbody></table>
      </div>${SC._filasPagos.length > 10 ? `<p class="ayuda">Mostrando 10 de ${SC._filasPagos.length}</p>` : ""}`;
  };
  r.readAsText(f);
};
SC.procesarPagos = function () {
  if (!SC._filasPagos.length) {
    toast("Cargue un archivo válido primero.");
    return;
  }
  let ok = 0,
    err = 0,
    noEnc = 0;
  const lista = typeof reclamos !== "undefined" ? reclamos : [];
  SC._filasPagos.forEach((row) => {
    const rec = lista.find((r) => r.num === row.radicado);
    if (!rec) {
      noEnc++;
      return;
    }
    const monto = parseFloat(
      String(row.monto_pagado).replace(/[^0-9.\-]/g, ""),
    );
    if (isNaN(monto)) {
      err++;
      return;
    }
    rec.montoPagado = monto;
    if (row.genelco) rec.genelco = row.genelco;
    rec.estado = row.estado || "Pagado";
    rec.bit = rec.bit || [];
    rec.bit.push([
      "Pago aplicado por carga masiva · US$ " + monto.toFixed(2),
      typeof USUARIO_ACTUAL !== "undefined" ? USUARIO_ACTUAL.nombre : "Sistema",
      new Date().toISOString().slice(0, 10),
    ]);
    ok++;
  });
  $("pm-preview").innerHTML +=
    `<div class="aviso-inline" style="margin-top:12px"><b>Resultado:</b> <span class=ico data-icon=ok aria-hidden=true></span> ${ok} aplicados · <span class=ico data-icon=error aria-hidden=true></span> ${err} errores · <span class=ico data-icon=alerta aria-hidden=true></span> ${noEnc} no encontrados.</div>`;
  if (typeof pintarBandeja === "function") pintarBandeja();
  toast("Procesamiento completado: " + ok + " pagos aplicados.");
};

// ==== FIRMAS DIGITALES ====
SC.pintarFirmas = function () {
  const tb = $("tbody-firmas");
  if (!tb) return;
  const users = typeof USUARIOS !== "undefined" ? USUARIOS : [];
  tb.innerHTML = users
    .filter((u) => u.activo)
    .map((u) => {
      const key = u.email;
      const has = !!SC.USUARIOS_FIRMAS[key];
      return `<tr>
      <td><b>${u.nombre}</b><br><span class="ayuda">${u.email}</span></td>
      <td>${u.perfil}</td>
      <td>${has ? '<span class="badge b-verde"><span class=ico data-icon=firma aria-hidden=true></span> Cargada</span>' : '<span class="badge b-gris">Sin firma</span>'}</td>
      <td>
        <label class="btn btn-ghost btn-sm" style="margin:0">${has ? "Reemplazar" : "Cargar"}
          <input type="file" accept="image/*" style="display:none" onchange="SC.subirFirma('${key.replace(/'/g, "\\'")}', this)">
        </label>
        ${has ? `<button class="btn btn-ghost btn-sm" onclick="SC.borrarFirma('${key.replace(/'/g, "\\'")}')">Borrar</button>` : ""}
      </td></tr>`;
    })
    .join("");
};
SC.subirFirma = function (email, inp) {
  const f = inp.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = (e) => {
    SC.USUARIOS_FIRMAS[email] = e.target.result;
    SC.pintarFirmas();
    toast("Firma cargada para " + email);
  };
  r.readAsDataURL(f);
};
SC.borrarFirma = function (email) {
  delete SC.USUARIOS_FIRMAS[email];
  SC.pintarFirmas();
  toast("Firma eliminada.");
};
SC.firmaDe = function (email) {
  return SC.USUARIOS_FIRMAS[email] || null;
};

// ==== FORMULARIOS DINÁMICOS (admin) ====
SC.pintarFormularios = function () {
  const tb = $("tbody-forms");
  if (!tb) return;
  const filas = [];
  Object.entries(SC.FORMS).forEach(([tipo, versiones]) => {
    versiones.forEach((v) => filas.push({ tipo, ...v }));
  });
  if (!filas.length) {
    tb.innerHTML =
      '<tr><td colspan="6" class="ayuda">Aún no se ha publicado ningún formulario.</td></tr>';
    return;
  }
  tb.innerHTML = filas
    .map(
      (f) => `<tr>
    <td>${f.tipo}</td>
    <td><a href="${f.url}" target="_blank" style="color:var(--azul-osc);font-weight:700">${f.nombre}</a></td>
    <td>v${f.version}</td>
    <td>${f.publicado}</td>
    <td>${f.activo ? '<span class="badge b-verde">Vigente</span>' : '<span class="badge b-gris">Histórico</span>'}</td>
    <td><button class="btn btn-ghost btn-sm" onclick="SC.activarForm('${f.tipo}',${f.version})">${f.activo ? "Desactivar" : "Activar"}</button></td>
  </tr>`,
    )
    .join("");
};
SC.subirFormulario = function () {
  const tipo = $("forms-tipo").value;
  const inp = $("forms-file");
  const f = inp.files[0];
  if (!f) {
    toast("Seleccione un archivo.");
    return;
  }
  const r = new FileReader();
  r.onload = (e) => {
    const url = e.target.result;
    SC.FORMS[tipo] = SC.FORMS[tipo] || [];
    SC.FORMS[tipo].forEach((v) => (v.activo = false));
    const version = SC.FORMS[tipo].length + 1;
    SC.FORMS[tipo].push({
      version,
      nombre: f.name,
      url,
      publicado: new Date().toISOString().slice(0, 10),
      activo: true,
    });
    // Persistir para consumo del portal público
    const cfg = {};
    Object.entries(SC.FORMS).forEach(([t, vs]) => {
      const act = vs.find((v) => v.activo);
      if (act)
        cfg[t] = { nombre: act.nombre, version: act.version, url: act.url };
    });
    try {
      localStorage.setItem("SC.formsConfig", JSON.stringify(cfg));
    } catch (_) {}
    SC.pintarFormularios();
    toast("Formulario publicado (v" + version + ").");
  };
  r.readAsDataURL(f);
};
SC.activarForm = function (tipo, version) {
  const vs = SC.FORMS[tipo] || [];
  const target = vs.find((v) => v.version === version);
  if (!target) return;
  const willActivate = !target.activo;
  vs.forEach((v) => (v.activo = false));
  target.activo = willActivate;
  const cfg = {};
  Object.entries(SC.FORMS).forEach(([t, vs]) => {
    const act = vs.find((v) => v.activo);
    if (act)
      cfg[t] = { nombre: act.nombre, version: act.version, url: act.url };
  });
  try {
    localStorage.setItem("SC.formsConfig", JSON.stringify(cfg));
  } catch (_) {}
  SC.pintarFormularios();
};

// Extender subtab() para pintar los nuevos paneles
if (typeof subtab === "function") {
  const _subOrig = subtab;
  window.subtab = function (id) {
    _subOrig(id);
    if (id === "firmas") SC.pintarFirmas();
    if (id === "forms") SC.pintarFormularios();
  };
}

// ==== PREAUTORIZACIONES: número consecutivo readonly + firma automática ====
SC.siguientePA = function () {
  const arr = typeof preauths !== "undefined" ? preauths : [];
  let max = 0;
  arr.forEach((p) => {
    const m = /PA-\d{4}-(\d+)/.exec(p.num || "");
    if (m) max = Math.max(max, parseInt(m[1]));
  });
  const y = new Date().getFullYear();
  return "PA-" + y + "-" + String(max + 1).padStart(3, "0");
};
SC.decorarPAdetalle = function () {
  // Bloquear cualquier input de "N° de preautorización" si existe
  document.querySelectorAll("#detalle-pa-body input").forEach((inp) => {
    const lbl = inp.previousElementSibling?.textContent || "";
    if (/N[°º]|numero|preauto/i.test(lbl) && /PA-/.test(inp.value || ""))
      inp.readOnly = true;
  });
};

// Hook a pintarDetallePA si existe
if (typeof abrirDetallePA === "function") {
  const _o = abrirDetallePA;
  window.abrirDetallePA = function () {
    _o.apply(this, arguments);
    setTimeout(SC.decorarPAdetalle, 50);
  };
}

let ultimoTotal = 0;

async function actualizarBandeja() {
  try {
    const nuevos = await ReclamosRepository.obtenerTodos();

    if (ultimoTotal && nuevos.length > ultimoTotal) {
      toast("Nuevo reclamo recibido.");
    }

    ultimoTotal = nuevos.length;

    bandeja = nuevos;

    pintarBandeja();
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await restaurarSesion();
});

window.loginEquipo = loginEquipo;
window.logout = logout;
window.tab = tab;
