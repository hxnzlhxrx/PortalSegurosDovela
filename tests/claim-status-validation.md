# Consultar estado de reclamo — validación V3.1.3

## Arquitectura y límite de seguridad

El flujo público genera `SGP-YYDDD-NNNN-S` (`S` = `M`, `D` o `V`) en `public-app.js`, inserta `num` y `estado: Recibido` en `public.reclamos` mediante `ReclamosRepository.crear`, y el portal interno actualiza `estado` y `actualizado_en`. El seguimiento anterior de `v-track` usa datos de demostración en memoria y queda separado de la nueva vista. La vista llama `consultar_reclamo(p_num, p_identidad)` —la función efectivamente desplegada en la base— y proyecta solo `estado` y `actualizado_en`; no consulta `select('*')` para presentar resultados.

La verificación de identidad usa la cédula o pasaporte del asegurado, no el correo. `consultar_reclamo` normaliza ambos parámetros (`trim` y mayúsculas/minúsculas) y devuelve conjunto vacío cuando la identidad no coincide. La función devuelve además `nombre`, `poliza`, `linea`, `producto`, `monto`, `genelco` y `motivo_estado`; `ReclamosRepository.consultarEstado` los descarta deliberadamente para no exponerlos en el portal público.

El borrador `supabase/consultar-estado-reclamo.sql` (variante por correo) nunca se activó y revoca `EXECUTE`; no corresponde al contrato en uso. Quedan pendientes de verificación el RLS/privilegios de `reclamos` y el límite de intentos contra enumeración en el servidor.

## Evidencia local

| Comprobación | Estado | Procedencia | Evidencia |
| --- | --- | --- | --- |
| Sintaxis JS y pruebas de campos, estados, doble envío, proyección de datos y limpieza al salir | PASS | DIRECT / PROXY para respuestas de backend | `Run-ClaimStatus.ps1`; `claim-status.cjs` usa mocks controlados |
| Tarjeta, navegación, vacío, fallo de servicio y regresiones de las otras dos tarjetas | PASS | DIRECT | Brave con servidor local, sesión nueva |
| Home y formulario: 320, 360, 390, 414, 480, 600, 768, 1024, 1280, 1440, 1600, 1920, 2560, 3440 px | PASS | EMULATED | Viewport de Brave; sin overflow horizontal; tarjetas limitadas a ~417 px en wide |
| DPR 2 a 390 px | PASS | EMULATED | CDP: `devicePixelRatio=2`, sin overflow |
| Teclado, foco visible y CTA | PASS | DIRECT | AX de Brave, foco del título y campos; outline calculado 3 px |
| Touch targets del formulario | PASS | EMULATED | Rectángulos DOM: acciones 48 px, volver 44 px |
| Movimiento reducido | PASS | EMULATED | CDP `prefers-reduced-motion: reduce`: animación none, transición 0 s |
| Código real persistido → estado real | PASS | DIRECT | `consultar_reclamo` sobre registros reales: `SGP-26266-0001-D` → `Recibido`, `SGP-26287-0016-M` → `Rechazado`; identidad incorrecta y código inexistente → sin resultado |
| Proyección de campos contra la base real | PASS | DIRECT | La respuesta real incluye `nombre`/`poliza`/`monto`; el repositorio entrega solo `estado` y `actualizado_en` |
| Lectura del portal interno (bandeja, archivados, reservas, documentos) | PASS | DIRECT | `interno-repository.js` sobre Supabase real: 8 reclamos activos, 0 archivados, 398 reservas, 4 documentos |
| Rate limit de intentos en servidor | BLOCKED | STATIC | Sin gate anti-enumeración desplegado |
| RLS y privilegios de Supabase | BLOCKED | STATIC | El rol publicable permite `SELECT`, `INSERT` y `UPDATE` directos sobre `reclamos`/`reserva`; requiere revisión de políticas |
| Zoom nativo del navegador y escalado de texto | NOT_RUN | — | El atajo de zoom no alteró el viewport en esta sesión |
| Escalado físico del SO, dispositivo táctil real y lector de pantalla nativo | NOT_RUN | — | Dispositivos/AT no disponibles |
| Traza de rendimiento y CLS | NOT_RUN | — | Sin instrumentación de laboratorio en esta validación |
