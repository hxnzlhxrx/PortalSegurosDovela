# Dovela Seguros · Portal de Autogestión

Plataforma web de **Dovela Seguros** compuesta por dos aplicaciones que comparten base de datos y sistema de diseño:

- **Portal público** (`index.html`): autogestión para asegurados, corredores, hospitales y proveedores médicos.
- **Portal interno** (`interno.html`): back-office del equipo para gestionar reclamos, reservas, pre-autorizaciones, proveedores y la configuración del propio portal.

> Dovela Seguros es una entidad ficticia. Nombres, productos, red médica y datos de ejemplo tienen fines demostrativos.

---

## Índice

1. [Portal público](#portal-público)
2. [Portal interno](#portal-interno)
3. [Especificaciones técnicas](#especificaciones-técnicas)
4. [Modelo de datos (Supabase)](#modelo-de-datos-supabase)
5. [Seguridad](#seguridad)
6. [Estructura del repositorio](#estructura-del-repositorio)
7. [Puesta en marcha](#puesta-en-marcha)
8. [Pruebas](#pruebas)
9. [Convenciones](#convenciones)

---

## Portal público

### Página de inicio

- **Hero** con accesos directos a las acciones principales.
- **Banner dinámico de novedades**: lo publica el equipo desde el portal interno y aparece según su estado activo y sus fechas de vigencia, calculadas en hora de Panamá.
- **Servicios**: tarjetas de acceso a presentar reclamo, consultar estado, pre-autorización, registro de proveedores y red médica.
- **Seguimiento desde el celular**: explica cómo usar el código QR del comprobante para consultar el reclamo.
- **Coordinación y emergencias médicas**: datos de contacto de la línea de asistencia.
- **Formularios descargables**: el *Formulario de Reclamos de Gastos Médicos* y el *Formulario de Pre-Autorización de Beneficios* se generan en PDF en el navegador. Se pueden descargar o abrir en una pestaña nueva.
- **Cómo funciona**: resumen en tres pasos (completar formulario, cargar documentos, recibir radicado).

### Presentación de reclamos (asistente por pasos)

Un *stepper* guía al usuario y valida cada paso antes de avanzar.

1. **Perfil de quien presenta**
   - *Asegurado / Titular*: el titular, un familiar o un beneficiario.
   - *Corredor de seguros*: presenta en nombre del asegurado.
   - *Hospital / Clínica*: facturación directa del proveedor.

   El perfil determina qué campos y documentos se piden. Por ejemplo, el monto facturado y el hospital o la corredora que presenta.
2. **Línea de negocio y producto**
   - *Salud Individual*: Arco Esencial, Arco Preferente, Arco Integral 3 y 4, Arco Kids, Arco Kids Plus, Arco Global 1 y 2.
   - *Colectivo Salud*.
   - *Accidentes Personales*: AP Regular y AP Escolar.
   - Todas las líneas incluyen la opción "No estoy seguro" para no bloquear al usuario.
   - La línea *Vida* está definida en el catálogo, pero desactivada en la interfaz.
3. **Tipo de servicio**: Médico (`M`), Dental (`D`) u Óptico (`V`). El código del servicio forma parte del radicado.
4. **Datos del asegurado y del evento**: nombre, cédula o pasaporte, número de póliza o certificado, teléfono, correo, fecha de atención, monto facturado en USD, proveedor donde se atendió y descripción del evento.
5. **Documentos**: la lista depende de la combinación línea + perfil. Cada documento indica si es obligatorio, si admite varios archivos y su tamaño máximo (10 o 20 MB). Ejemplos:
   - Asegurado, Salud Individual: formulario firmado, facturas y recibos, informe o receta médica, resultados de laboratorio (opcional).
   - Hospital: factura hospitalaria detallada, informe médico o epicrisis, sección C del formulario, pre-autorización (si aplica), identificación del paciente.
   - Accidentes Personales: además pide el informe de atención o el reporte de coordinación (SEMM) y el informe del accidente.

   La carga funciona en web, iOS y Android, con vista de la lista de archivos y opción de quitarlos.
6. **Revisión**: resumen completo antes de enviar.
7. **Envío**:
   - Se reserva un consecutivo y se genera el radicado.
   - Se inserta el reclamo y se suben los documentos a Supabase Storage.
   - Una barra de progreso muestra el avance.
   - Hay protección contra envíos duplicados y reintentos automáticos ante errores de red o errores HTTP transitorios.

### Radicado de reclamo

Formato: `SGP-AADDD-NNNN-S`

| Segmento | Significado |
| --- | --- |
| `AA` | Año (dos dígitos) |
| `DDD` | Día juliano del año |
| `NNNN` | Consecutivo reservado |
| `S` | Servicio: `M` médico, `D` dental, `V` óptico |

Ejemplo: `SGP-26301-0007-M`. El portal interno extrae la fecha de recepción del propio radicado.

### Comprobante de recepción (PDF)

- Se genera en el cliente con jsPDF. Incluye la tarjeta principal con radicado, fecha y hora, línea, producto, asegurado, monto y la lista de documentos recibidos.
- Lleva un **código QR de seguimiento** que abre el portal con la consulta de estado ya cargada.
- Usa la paleta de marca en una versión apta para impresión y se descarga en el idioma activo del portal.

### Pre-autorización médica

- Formulario con los datos del asegurado y del procedimiento.
- Documentos: formulario de pre-autorización firmado, orden médica e informe del médico tratante.
- Las solicitudes usan el prefijo `PA-AAAA-NNN`.

### Consulta del estado de un reclamo

- Pide el radicado y la cédula o pasaporte del asegurado.
- El formato se valida en el cliente antes de consultar.
- La consulta se hace mediante la función RPC `consultar_reclamo`, que solo devuelve datos si el radicado y la identidad coinciden.
- Muestra el estado actual, el historial de estados y el comentario que el equipo marca como visible para el asegurado.
- Se puede abrir directamente desde un enlace o QR con el radicado en la URL. Tras abrirse, el parámetro se retira para que recargar o compartir la URL no repita la consulta.
- Estados del ciclo de vida: *Recibido*, *En Proceso*, *Pendiente de Información*, *Pagado*, *Rechazado*.

### Registro de nuevos proveedores

- Solicitud de afiliación a la red médica con datos del proveedor y especialidad.
- Documentos base: aviso de operación, idoneidad o registro sanitario, cédula o RUC, certificación bancaria, diploma de especialidad y tarifario. Si se declara una subespecialidad, también se pide su diploma.

### Red Médica Dovela

Directorio de prestadores (clínicas, laboratorios y especialistas) con búsqueda por nombre y filtros por especialidad y provincia. Los datos son ficticios.

### Experiencia de usuario

- **Tema claro y oscuro**:
  - Respeta la preferencia del sistema y guarda la elección del usuario.
  - El interruptor se puede pulsar o arrastrar, con una animación de asentamiento.
  - Los logos se cambian automáticamente según el tema.
- **Multi-idioma** (español, inglés, francés y portugués):
  - El idioma se detecta por la configuración del navegador y la zona horaria. En móvil también puede detectarse por ubicación, si el usuario lo permite.
  - Un diálogo recomienda el idioma, y la elección se recuerda.
  - Un observador del DOM traduce también el contenido que se añade dinámicamente.
- **Recorrido guiado ("Cómo funciona")**: modal paso a paso con miniaturas y anotaciones de trazo a mano.
- **Preloader de marca**: no bloquea el foco ni la interacción y se retira solo aunque las transiciones estén desactivadas.
- **Navegación fija** con menú móvil.
- **Accesibilidad**:
  - Landmarks y `aria-live` en los mensajes de estado.
  - Foco gestionado en los cambios de vista.
  - Validación visible por campo.
  - Soporte de `prefers-reduced-motion`.
- **Diseño adaptable** desde 320 px hasta escritorio ancho.

---

## Portal interno

### Acceso y sesión

- Inicio de sesión con **Supabase Auth** (correo y contraseña).
- Cada cuenta se vincula a un perfil en `portal_usuarios`, que define su nombre, su rol y si está activa.

### Roles y permisos

| Rol | Módulos | Puede editar |
| --- | --- | --- |
| Administrador IT | Todos, incluida la administración | Reclamos, reservas y PA; pagos masivos; crear PA; aprobar proveedores |
| Gerencia | Tablero, bandeja, reservas, PA, proveedores, red | Solo lectura; ve la configuración |
| Líder (supervisión) | Tablero, bandeja, reservas, PA, proveedores, red | Reclamos, reservas y PA; pagos masivos; crear PA; aprobar proveedores |
| Coordinación | Tablero, bandeja, reservas, PA, proveedores, red | Reclamos, reservas y PA; pagos masivos; crear PA |
| Reclamos | Tablero, bandeja, reservas, PA, red | Reclamos, reservas y PA; crear PA |
| Contabilidad | Tablero, bandeja, reservas | Reclamos y reservas; pagos masivos |
| Atención al Cliente | Tablero, bandeja, reservas, PA, red | Solo lectura |
| Ventas | Tablero, red | Solo lectura |

Los permisos se aplican en dos niveles: la interfaz oculta lo que el rol no puede usar, y la base de datos valida cada operación mediante RLS y funciones (`portal_es_personal`, `portal_puede_gestionar`, `portal_es_admin`).

### Bandeja de reclamos

- Listado de todos los reclamos recibidos desde el portal público.
- Filtros por estado, línea, producto, persona asignada, semáforo SLA y rango de fechas de recepción.
- Búsqueda libre.
- Semáforo de SLA en cada fila.
- Vista de reclamos archivados.
- Importación masiva desde CSV o Excel (`.xlsx`).
- Estados de carga, vacío y error en las tablas, con opción de reintentar.

### Detalle y gestión del reclamo

- Datos completos del reclamo y acceso a los documentos cargados por el asegurado.
- **Gestión**:
  - Cambio de estado.
  - Monto pagado y monto aplicado a deducible. La base de datos no permite montos negativos.
  - Comentario visible para el asegurado, que aparece en la consulta pública.
- **Asignación** del reclamo a un miembro del equipo. Un *trigger* valida que el destinatario sea personal activo.
- **Observaciones internas** con capturas adjuntas: hasta 6 imágenes PNG, JPEG, WebP o GIF de máximo 5 MB cada una.
- **Historial de gestión**: registra los cambios del sistema y las observaciones. Solo admite añadir entradas; no se pueden editar ni borrar.
- **Fecha de cierre** (`cerrado_en`): la registra la base de datos automáticamente al pasar a *Pagado* o *Rechazado*.

### Reservas

- Bandeja con número, asegurado, línea, producto, póliza, monto, fecha de recepción, estado y SLA.
- Detalle con gestión de estado, observaciones y archivado.
- **Importación masiva** desde CSV o Excel:
  - Normaliza encabezados, fechas y montos.
  - Valida cada fila y detecta registros que ya existen.
  - Muestra una vista previa antes de confirmar.
- Plantilla de importación descargable.
- **Reportes** exportables a Excel.

### Tablero

- Gráficas de reclamos por estado, por línea de negocio y por producto.
- Comparación entre monto reclamado y monto pagado.
- Alertas de gestión por SLA.

### SLA por proceso

- Reglas configurables por proceso (reclamos y reservas) en días hábiles, días calendario u horas.
- Umbral de aviso configurable; por defecto, al 80 % del plazo.
- Estados del semáforo: *En plazo*, *Por vencer*, *Vencido*, *Cumplido*, *Incumplido*, *Cerrado*, *Programado* y *Sin SLA*.
- **Cálculo del plazo**:
  - Empieza en la recepción. Si el reclamo llegó durante un *Freeze*, empieza al inicio de la tramitación.
  - Usa la hora de Panamá (UTC−5) y descuenta los feriados configurados.
  - Termina en la fecha de cierre registrada por la base de datos.

### Freeze operativo

Periodos en los que la operación se congela. Las solicitudes recibidas en un Freeze quedan *Programadas* y su SLA empieza al terminar el periodo.

### Pre-autorizaciones

- Bandeja y detalle de solicitudes PA, con creación manual según el rol.
- Generación de la **certificación de pre-autorización** en PDF con formato Dovela.
- Botón flotante de acceso rápido.

### Proveedores y Red Médica

- Revisión y aprobación de solicitudes de afiliación según el rol.
- Consulta y gestión de la red de prestadores.

### Configuración del portal (Administración)

- **Usuarios del equipo**: crear, editar, activar o desactivar cuentas y asignar roles. Un *trigger* impide que un administrador se quite a sí mismo ese rol.
- **Roles y permisos**: matriz de consulta.
- **Banner dinámico del portal público**: título, texto, botón con enlace, fechas de vigencia, estado activo y vista previa.
- **Identidad del portal**: parámetros públicos de marca.
- **SLA por proceso**, **feriados** y **periodos de Freeze**.
- **Catálogos del sistema**, **gestión de la red médica**, **plantillas de documentos**, **correos automáticos** y **parámetros operativos**.
- **Auditoría de configuración**, **firmas digitales por usuario** y **formularios dinámicos** (PDF u otros).

### Experiencia de usuario interna

- Tema claro y oscuro, compartido con el portal público.
- **Modo lectura**: paleta con menos luz azul y menos brillo, disponible en ambos temas y que se recuerda entre sesiones.
- Multi-idioma con un diccionario propio del portal interno.
- Recorrido guiado ("Cómo funciona") con ejemplos de bandeja y SLA.

---

## Especificaciones técnicas

### Arquitectura

- **Frontend estático**: HTML, CSS y JavaScript sin frameworks ni compilación. Los scripts se cargan en orden desde cada HTML y se comunican mediante objetos globales (`window.*`).
- **Backend como servicio**: Supabase aporta PostgreSQL con Row Level Security, Auth, Storage y funciones RPC.
- **Patrón repositorio**: el acceso a datos está aislado de la interfaz.
  - Público: `public-repository.js` y `public-storageRepository.js`.
  - Interno: `interno-repository.js` con `ReclamosRepository`, `ReservasRepository`, `ParametrosRepository`, `AuthRepository`, `UsuariosRepository` y `BannersRepository`.
- **Generación de documentos en el cliente**: los PDF (formularios, comprobantes y certificaciones) y los Excel se generan en el navegador, sin servidor intermedio.
- **Compatibilidad de catálogo**: `legacy-products.js` traduce al catálogo vigente los nombres de producto guardados antes del cambio de catálogo, sin reescribir los registros históricos.

### Dependencias externas (CDN)

| Librería | Versión | Uso |
| --- | --- | --- |
| `@supabase/supabase-js` | 2.x | Cliente de base de datos, Auth y Storage |
| jsPDF | 2.5.1 | Generación de PDF |
| jspdf-autotable | 3.8.2 | Tablas en PDF |
| html2canvas | 1.4.1 | Captura de HTML para PDF |
| qrcode-generator | 1.4.4 | QR de seguimiento en el comprobante |
| SheetJS (xlsx) | 0.18.5 | Importación y exportación de Excel |

### Sistema de diseño

- **Tokens** (`dovela-tokens.css`): color, tipografía, espaciado, radios y sombras.
- **Temas**:
  - `theme.css`: claro y oscuro.
  - `pulsepoint-theme.css`: paleta de marca.
  - `m3-expressive.css`: componentes de estilo Material 3 Expressive.
  - `featured-glow.css`: tarjetas destacadas.
- **Tipografía autoalojada en WOFF2**, con subconjuntos `latin` y `latin-ext`, bajo licencia SIL Open Font License 1.1:
  - Fraunces: títulos.
  - Bricolage Grotesque: texto e interfaz.
  - Caveat: anotaciones del recorrido guiado.
- **Marca** (`public/assets/brand/`): logos horizontal, apilado y símbolo en versiones clara, oscura y monocromática (SVG), favicon (SVG + ICO), `apple-touch-icon` e ícono de 512 px para Open Graph.

### Internacionalización

- Motor propio en `public/js/i18n.js`. Idiomas soportados: `es`, `en`, `fr` y `pt`.
- Traduce los nodos de texto y los atributos (`placeholder`, `aria-label`, `title`, etc.) y vigila el DOM para traducir el contenido nuevo.
- La preferencia se guarda en `localStorage`. Si el almacenamiento no está disponible, el idioma funciona igual durante la visita.

### Compatibilidad

- Navegadores modernos: Chrome, Edge, Firefox y Safari.
- Carga de archivos verificada en web, iOS y Android.

---

## Modelo de datos (Supabase)

### Tablas

| Tabla | Descripción |
| --- | --- |
| `reclamos` | Reclamos presentados: radicado, datos del asegurado y del evento, estado, montos, asignación y fecha de cierre |
| `reclamos_documentos` | Metadatos de los documentos cargados en cada reclamo |
| `reclamos_historial` | Bitácora de gestión (solo inserción) |
| `reserva` | Reservas gestionadas en el portal interno |
| `portal_usuarios` | Perfiles del personal vinculados a `auth.users`, con rol y estado activo |
| `portal_parametros` | Configuración clave-valor: SLA, feriados, periodos de Freeze e identidad pública |
| `portal_banners` | Banners dinámicos del portal público |

### Storage

- Bucket `reclamos`: documentos de los reclamos y capturas de las observaciones (`observaciones/<reclamo>/<uuid>.<ext>`).

### Funciones y triggers

| Objeto | Propósito |
| --- | --- |
| `consultar_reclamo(p_num, p_identidad)` | Consulta pública del estado; exige que el radicado y la identidad coincidan |
| `portal_es_personal()`, `portal_es_admin()`, `portal_puede_gestionar()` | Comprobaciones de rol usadas en las políticas RLS |
| `portal_nombre_actual()` | Nombre del usuario autenticado para el historial |
| `portal_vincular_cuenta_nueva` / `portal_vincular_perfil_nuevo` | Vinculan automáticamente la cuenta de Auth con su perfil |
| `portal_proteger_propio_admin` | Impide que un administrador se quite su propio rol |
| `portal_validar_asignacion` | Valida que el asignado sea personal activo |
| `portal_registrar_cierre` | Registra `cerrado_en` al cerrar un reclamo o una reserva |

---

## Seguridad

- El frontend usa solo la **clave publicable** de Supabase (`sb_publishable_...`). La clave `service_role` y cualquier clave secreta nunca deben incluirse en el repositorio ni en el cliente.
- Las operaciones del personal están protegidas con RLS según el rol. El historial de gestión no se puede editar ni borrar.
- La consulta pública pasa por una función `security definer` que valida el formato del radicado y exige la identidad del asegurado. No se concede `SELECT` directo sobre los reclamos.
- Todo el contenido dinámico se escapa antes de insertarlo en el DOM.
- Las capturas adjuntas se validan por tipo MIME y tamaño antes de subirlas.
- **Pendiente**: proteger el envío público con Cloudflare Turnstile (el punto de integración ya está preparado) y limitar los intentos de consulta.

---

## Estructura del repositorio

```
.
├── index.html                      Portal público
├── interno.html                    Portal interno
├── public/
│   ├── assets/
│   │   ├── brand/                  Logos, favicon e íconos
│   │   └── fonts/                  Fuentes WOFF2 y licencias OFL
│   ├── css/
│   │   ├── dovela-tokens.css       Tokens de diseño
│   │   ├── public-styles.css       Estilos del portal público
│   │   ├── theme.css               Tema claro y oscuro
│   │   ├── pulsepoint-theme.css    Paleta de marca
│   │   ├── m3-expressive.css       Componentes Material 3 Expressive
│   │   ├── featured-glow.css       Tarjetas destacadas
│   │   ├── preloader.css           Preloader de marca
│   │   └── tour.css                Recorrido guiado
│   └── js/
│       ├── public-app.js           Lógica del portal público y asistente de reclamos
│       ├── public-repository.js    Acceso a reclamos
│       ├── public-storageRepository.js  Subida de documentos
│       ├── public-supabase.js      Cliente de Supabase
│       ├── dovela-forms.js         Formularios PDF descargables
│       ├── dovela-logo-pdf.js      Logo para PDF
│       ├── download-guard.js       Control de descargas
│       ├── i18n.js                 Motor y diccionario de idiomas
│       ├── theme.js                Tema claro y oscuro
│       ├── tour.js                 Recorrido guiado
│       ├── preloader.js            Preloader
│       ├── iconos.js               Íconos de línea
│       └── legacy-products.js      Compatibilidad del catálogo de productos
├── interno/
│   ├── css/
│   │   ├── interno-styles.css      Estilos del portal interno
│   │   └── interno-lectura.css     Paleta del modo lectura
│   └── js/
│       ├── interno-app.js          Sesión, roles, tablero, PA, proveedores, red y administración
│       ├── interno-bandeja.js      Bandeja de reclamos
│       ├── interno-gestion.js      Gestión, asignación, observaciones, historial y calendario operativo
│       ├── interno-reservas.js     Reservas, importación y reportes
│       ├── interno-sla.js          Motor de SLA
│       ├── interno-repository.js   Repositorios de datos
│       ├── interno-supabase.js     Cliente de Supabase
│       ├── interno-i18n.js         Diccionario del portal interno
│       ├── interno-lectura.js      Modo lectura
│       ├── interno-tour.js         Recorrido guiado
│       └── table-loading.js        Estados de carga de las tablas
└── tests/                          Pruebas automatizadas
```

---

## Puesta en marcha

### Requisitos

- Un servidor estático cualquiera.
- Node.js 18 o superior, solo para las pruebas.
- Un proyecto de Supabase, si se quiere usar una base de datos propia.

### Ejecución local

```bash
git clone https://github.com/hxnzlhxrx/PortalSegurosDovela.git
cd PortalSegurosDovela

npx serve .
# o
python -m http.server 4173
```

Después abre `http://localhost:<puerto>/index.html` (portal público) o `http://localhost:<puerto>/interno.html` (portal interno). También funciona la extensión Live Server de VS Code.

### Usar un proyecto de Supabase propio

1. Crea el proyecto y el bucket de Storage `reclamos`, con las tablas, funciones y políticas descritas en [Modelo de datos](#modelo-de-datos-supabase).
2. Sustituye `SUPABASE_URL` y la clave publicable en:
   - `public/js/public-supabase.js`
   - `interno/js/interno-supabase.js`
3. Crea el primer usuario en Supabase Auth y asígnale el rol `admin` en `portal_usuarios`.

### Despliegue

Al ser un sitio estático, se puede publicar en GitHub Pages, Cloudflare Pages, Netlify, Vercel o cualquier CDN, sin paso de compilación.

---

## Pruebas

Las pruebas usan Node.js. Las que trabajan sobre el navegador lanzan Microsoft Edge en modo headless mediante el protocolo DevTools y necesitan el portal servido localmente, por defecto en `http://127.0.0.1:4173`.

| Prueba | Qué verifica |
| --- | --- |
| `tests/claim-status.cjs` | Validación y flujo de la consulta de estado |
| `tests/i18n.cjs` | Diccionarios y cambio de idioma |
| `tests/i18n-browser-audit.cjs` | Auditoría de traducción en el navegador |
| `tests/theme.cjs` | Tema claro y oscuro en varios anchos de pantalla |
| `tests/localized-downloads.cjs` | Descargas de PDF en cada idioma |
| `tests/receipt-download.cjs` | Generación del comprobante de recepción |
| `tests/sticky-navigation.cjs` | Navegación fija y botón de volver arriba |
| `tests/wizard-mobile-interactions.cjs` | Interacciones del asistente en móvil |
| `tests/devtag.cjs` | Enlace del desarrollador en el pie de página y su efecto hover |

```bash
node tests/claim-status.cjs
node tests/theme.cjs [directorio-de-salida]
```

En Windows, `tests/Run-ClaimStatus.ps1` comprueba la sintaxis de los scripts públicos y ejecuta la prueba de consulta de estado. `tests/claim-status-validation.md` documenta la matriz de validación.

---

## Convenciones

- Código, comentarios e interfaz en español.
- Montos del asegurado en USD (`US$`).

---

## Licencia

Distribuido bajo la licencia [GNU General Public License v3.0](LICENSE).

---

## Autor

Hansel Hernández · `</gishikoDev_>` · 2026
