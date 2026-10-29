# SYNKRO BY VELYONSOFT — GUÍA MAESTRA DE PREPARACIÓN PARA LANZAMIENTO Y ESTABILIZACIÓN

> **Documento Técnico y Comercial Canónico**  
> **Producto:** Synkro — Plataforma SaaS de Gestión Clínica para Psicólogos y Centros de Salud Mental  
> **Compañía:** VelyonSoft (Perú)  
> **Versión:** 1.0.0-rc (Release Candidate)  
> **Fecha de Emisión:** 29 de Octubre de 2026  
> **Entorno de Validación:** Supabase Local (Docker) & Next.js 16 App Router  

---

## 1. RESUMEN EJECUTIVO

Synkro ha alcanzado el estado de **Release Candidate (RC)** tras completar las cuatro fases de desarrollo, auditoría y estabilización técnica. El sistema se encuentra probado rigurosamente, desacoplado y preparado para su transición controlada a producción sin riesgos para la integridad clínica de los pacientes ni para el modelo de negocio.

### Estado Global de Funcionalidades
- **100% Funcional y Verificado:**
  - Registro atómico multi-tenant de profesionales independientes y centros clínicos con generación de membresías, perfiles y suscripciones.
  - Motor comercial con prueba gratuita de 14 días, control automático de caducidad y política de continuidad clínica (lectura de históricos preservada, bloqueo estricto de escrituras).
  - Bóveda documental cifrada para hasta 15 MB por archivo con tipos MIME y extensiones validadas, sanitización anti path-traversal y generación de URLs firmadas temporales (15 minutos / 900s).
  - Desacoplamiento de notas clínicas en PostgreSQL: división física y criptográfica entre el resumen de sesión (`session_summary`) y las notas de contratransferencia/privadas (`session_private_notes`), inaccesibles para colegas de la misma clínica, asistentes y pacientes.
  - Portal del Paciente con vinculación de identidad criptográfica mediante token hex (256 bits) de un solo uso con caducidad de 7 días.
  - Consola Superadmin para VelyonSoft (`/admin`) con directorio comercial y métricas de facturación agregadas, con aislamiento absoluto de datos clínicos de salud (PHI) en cumplimiento de la Ley 29733 de Protección de Datos Personales.
  - Modo Demostración comercial (`/demo`) completamente aislado en memoria/localStorage, con operaciones de escritura bloqueadas y mensajes de conversión hacia la prueba de 14 días.
  - Tour guiado interactivo (`driver.js`) en el consultorio, no invasivo y relanzable desde Configuración.
  - Flujos completos de autenticación con recuperación (`/recuperar-contrasena`) y actualización segura de contraseñas (`/actualizar-contrasena`).
  - Landing pages públicas de alta conversión para `/psicologos` y `/centros-psicologicos` con Schema.org JSON-LD, `sitemap.ts`, `robots.ts` y especificación abierta `llms.txt`.
- **Riesgos Residuales Mitigados:**
  - Eliminado el riesgo de asignación accidental de pacientes por coincidencia de email plano.
  - Eliminado el acceso directo de superadmin a historias clínicas y documentos confidenciales.
  - Bloqueada la alteración no autorizada de fechas y planes de suscripción desde el cliente.

---

## 2. MATRIZ DE AUDITORÍA DE LOS 17 PUNTOS CLAVE

| # | Área Auditada | Estado | Evidencia en Código / BD | Riesgo Residual & Mitigación |
|---|---|---|---|---|
| **1** | **Seguridad Multi-Tenant y RLS** | **Aprobado** | Políticas RLS en `public.patients`, `public.appointments`, `public.patient_files`, `public.session_private_notes`. Funciones `is_member_of()`, `has_role_in_org()`. | **Nulo.** No es posible consultar ni mutar registros de otra organización bajo ninguna condición. |
| **2** | **Modelo de Roles y Permisos** | **Aprobado** | Triggers `trg_protect_profile_roles` y `trg_prevent_privilege_escalation`. Roles: `owner`, `admin`, `psychologist`, `assistant`, `patient`. | **Nulo.** `platform_role` y `role` están bloqueados contra escalada por metadatos o SQL injection cliente. |
| **3** | **Registro de Profesionales** | **Aprobado** | Trigger `handle_new_user_registration` en `auth.users`. Creación de organización, membresía, profesional y suscripción `trialing` en una sola transacción. | **Nulo.** Si falla cualquier paso, la transacción efectúa rollback completo. |
| **4** | **Motor de Suscripciones & 14 Días** | **Aprobado** | `public.subscriptions`, trigger `trg_set_trial_period_on_insert` (`now() + interval '14 days'`). Restricción `subscriptions_organization_id_key` (1:1). | **Bajo.** Renovación manual administrada por VelyonSoft vía Yape y transferencia BCP. |
| **5** | **Política de Continuidad Clínica** | **Aprobado** | Trigger `check_subscription_write_permission` en `patients`, `appointments`, `sessions`, `patient_files`. Función `is_org_subscription_active()`. | **Nulo.** En suscripción vencida, la lectura y exportación están 100% garantizadas; la escritura queda bloqueada. |
| **6** | **Consola Superadmin VelyonSoft** | **Aprobado** | Ruta protegida `/admin`, layout con verificación de rol, RPC `admin_list_organizations`, RPC `admin_record_subscription_payment`. | **Nulo.** Se revocó el acceso SELECT a historias y notas clínicas de pacientes. |
| **7** | **Demo Comercial Aislada** | **Aprobado** | `DemoClinicalDataService`, `demo-storage.ts`, ruta `/demo`. Operaciones de escritura deshabilitadas con error orientador a `/registrarse`. | **Nulo.** Cero peticiones de red hacia Supabase; no se tocan datos reales. |
| **8** | **Expediente de Pacientes** | **Aprobado** | `public.patients`, vista `paciente-detail-view.tsx`, estados clínicos (`activo`, `evaluacion`, `alta`). | **Nulo.** Aislamiento por organización garantizado. |
| **9** | **Agenda y Citas** | **Aprobado** | `public.appointments`, restricciones `appointments_modality_check`, `appointments_status_check`. Trigger `validate_appointment_tenant_integrity`. | **Nulo.** Validación de que paciente, profesional y organización pertenezcan al mismo tenant. |
| **10** | **Notas de Sesión & Privacidad** | **Aprobado** | `public.sessions`, `public.session_private_notes`. Trigger `trg_handle_session_private_notes_split`. `sessions.private_notes` forzado a NULL. | **Nulo.** Solo el autor autenticado (`author_id = auth.uid()`) puede descifrar o leer la nota privada. |
| **11** | **Bóveda de Archivos Clínicos** | **Aprobado** | `public.patient_files`, bucket `patient-files` (privado). Validación de extensiones (`.pdf`, `.png`, `.jpg`, `.webp`, `.docx`) y tamaño (15 MB). | **Nulo.** URLs firmadas con TTL de 900s (15 min) previa verificación de autorización en PostgreSQL. |
| **12** | **Portal del Paciente** | **Aprobado** | Token de activación SHA-256 (64 hex / 256 bits), RPC `create_patient_portal_invitation`, RPC `accept_patient_portal_invitation`, RPC `revoke_patient_portal_access`. | **Nulo.** Paciente solo accede tras validación criptográfica y aceptación explícita con su propia cuenta. |
| **13** | **Recuperación de Contraseñas** | **Aprobado** | `/recuperar-contrasena` (`resetPasswordForEmail`) y `/actualizar-contrasena` (`updateUser({ password })`). | **Nulo.** Flujo seguro gestionado con tokens efímeros de Supabase Auth. |
| **14** | **Tour Guiado Interactivo** | **Aprobado** | `driver.js`, `apps/web/components/software/guided-tour.tsx`, persistencia en `localStorage`, relanzable desde `/configuracion`. | **Nulo.** No bloquea flujos de trabajo; el usuario puede cerrarlo en cualquier momento. |
| **15** | **Páginas Públicas & SEO** | **Aprobado** | `/psicologos`, `/centros-psicologicos`, `sitemap.ts`, `robots.ts`, `llms.txt`, Schema.org JSON-LD (`MedicalBusiness`, `SoftwareApplication`). | **Nulo.** Rutas públicas indexables y rutas de consultorio restringidas por `robots.ts`. |
| **16** | **Canales de Pago Transparentes** | **Aprobado** | Pasarelas ficticias eliminadas. Canales oficiales explícitos: Yape (`997 676 432`), transferencia BCP y confirmación vía WhatsApp. | **Nulo.** Transparencia comercial absoluta; sin reclamos por cobros fantasmas. |
| **17** | **Suite de Pruebas Automatizadas** | **Aprobado** | 4 suites integrales (`test-phase1.mjs`, `test-phase2.mjs`, `test-phase3.mjs`, `test-stabilization.mjs`). **82/82 pruebas aprobadas (100%).** | **Nulo.** Verificación determinista ejecutable en cualquier clon local. |

---

## 3. DECISIONES DE ARQUITECTURA Y SEGURIDAD ADOPTADAS

### 3.1 Identidad y Activación del Portal de Pacientes
- **Problema previo:** El portal vinculaba pacientes por coincidencia de cadena de texto de correo (`email.ilike(userEmail)`), lo que exponía a colisiones accidentales si un tercero creaba una cuenta con el correo de un paciente antes de que existiera invitación formal.
- **Solución implementada:** Modelo de vinculación con token criptográfico de un solo uso (`portal_invitation_token`) de 256 bits generado en PostgreSQL mediante `extensions.gen_random_bytes(32)`. El paciente debe iniciar sesión y aceptar el token mediante la RPC `accept_patient_portal_invitation`. La base de datos asocia explícitamente `patients.user_id = auth.uid()` y marca `portal_status = 'active'`. Las políticas RLS exigen ambas condiciones.

### 3.2 Aislamiento Clínico del Rol Superadmin (Ley 29733)
- **Problema previo:** Las políticas RLS de `patients`, `patient_files` y `storage.objects` otorgaban permiso de lectura a `is_superadmin()`, exponiendo diagnósticos de salud mental y archivos íntimos a los administradores de la plataforma.
- **Solución implementada:** Se removió `is_superadmin()` de las políticas SELECT de tablas clínicas directas. El superadmin ahora interactúa exclusivamente con funciones administrativas (`admin_list_organizations`, `admin_record_subscription_payment`) que agregan métricas de facturación, uso de almacenamiento y estado de licencias sin revelar nombres de pacientes, notas clínicas ni archivos.

### 3.3 Reducción de TTL en URLs Firmadas de Storage
- **Problema previo:** Las URLs firmadas para descarga de documentos clínicos se generaban con 3600 segundos (1 hora) de validez.
- **Solución implementada:** Reducción a 900 segundos (15 minutos) y verificación previa obligatoria en la base de datos (`patient_files`) antes de invocar la API de Storage.

### 3.4 Desacoplamiento de Servicios Clínicos (`IClinicalDataService`)
- Tanto el entorno de producción (`ProductionClinicalDataService`) como la demo aislada (`DemoClinicalDataService`) implementan estrictamente la misma interfaz TypeScript, garantizando que el código de la interfaz de usuario no requiera bifurcaciones condicionales `if (demo)` invasivas.

---

## 4. PROTOCOLO DE VERIFICACIÓN LOCAL PASO A PASO

Para que cualquier ingeniero o auditor verifique el sistema completo en su máquina local:

### Requisitos Previos
1. Docker Desktop en ejecución.
2. Contenedor de base de datos local `supabase_db_Synkro` activo (puerto 54322) o Supabase CLI (`supabase start`).
3. Node.js v20+ o v22+ y pnpm instalados.

### Paso 1: Ejecutar la Suite Completa de Pruebas
Ejecutar en la raíz del repositorio:
```powershell
node scripts/test-phase1.mjs
node scripts/test-phase2.mjs
node scripts/test-phase3.mjs
node scripts/test-stabilization.mjs
```
**Criterio de Aceptación:** Las 82 pruebas deben reportar `[PASSED]` con 0 fallos.

### Paso 2: Verificación de Compilación de Next.js
Ejecutar:
```powershell
pnpm --filter web build
```
**Criterio de Aceptación:** Todas las rutas (públicas, dinámicas, estáticas y autenticadas) deben compilar con 0 errores de TypeScript y 0 errores de linting.

### Paso 3: Flujo Manual de Verificación Clínica
1. Iniciar el servidor web: `pnpm --filter web dev`.
2. Abrir `http://localhost:3000` y comprobar la navegación hacia `/psicologos`, `/centros-psicologicos` y `/precios`.
3. Ingresar a `/demo`: verificar que todos los datos se cargan, que las notas privadas se muestran/ocultan correctamente y que intentar crear un paciente o cita muestra el mensaje de modo solo lectura.
4. Ingresar a `/registrarse`: registrar un terapeuta con clínica nueva. Verificar que se redirige al `/dashboard` con suscripción de 14 días.
5. Iniciar el tour guiado interactivo desde la barra superior o desde `/configuracion`.
6. En un paciente, hacer clic en "Generar Invitación" en la tarjeta de Portal del Paciente. Copiar el enlace generado (`/portal-paciente/activar?token=...`).
7. En una ventana de incógnito, abrir el enlace, iniciar sesión con la cuenta del paciente y verificar que se vincula el expediente y se visualizan sus citas y archivos compartidos.

---

## 5. CHECKLIST TÉCNICO PREVIO AL DESPLIEGUE A PRODUCCIÓN

Antes de ejecutar cualquier despliegue a Vercel, Supabase Cloud u otro proveedor de hosting, completar esta lista de verificación:

### 5.1 Base de Datos & Supabase Cloud
- [ ] Crear el proyecto en Supabase Cloud en la región más cercana (ej. `sa-east-1` São Paulo para Perú y Sudamérica).
- [ ] Aplicar las 5 migraciones en orden secuencial estricto:
  1. `20261003000000_initial_schema.sql`
  2. `20261028210000_phase1_security_and_registration.sql`
  3. `20261028220000_phase2_subscriptions_and_commercial.sql`
  4. `20261028230000_phase3_clinical_security_vault.sql`
  5. `20261028240000_phase4_stabilization_and_hardening.sql`
- [ ] Verificar que el bucket `patient-files` esté creado con `public = false`.
- [ ] Configurar el correo del primer superadmin de VelyonSoft ejecutando:
  ```sql
  UPDATE public.profiles SET platform_role = 'superadmin' WHERE id = '<AUTH_USER_UUID>';
  ```

### 5.2 Variables de Entorno de Producción
Configurar en Vercel o el entorno de producción:
- `NEXT_PUBLIC_SUPABASE_URL`: URL oficial del proyecto Supabase Cloud (`https://<project-ref>.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Llave pública anónima de producción.
- `SUPABASE_SERVICE_ROLE_KEY`: Llave administrativa secreta (solo en variables de entorno del servidor / webhook, **nunca** con prefijo `NEXT_PUBLIC_`).
- `NEXT_PUBLIC_APP_URL`: Dominio oficial de producción (`https://synkro.velyonsoft.com`).

### 5.3 Seguridad de Servidor y Cabeceras HTTP
- [ ] Configurar cabeceras de seguridad en `next.config.ts`:
  - `Content-Security-Policy` (CSP) limitando conexiones a Supabase y Google Meet.
  - `X-Frame-Options: DENY` (evita clickjacking en expedientes clínicos).
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy: camera=(self), microphone=(self), geolocation=()`.
- [ ] Activar SSL/TLS forzado (HTTPS estricto con HSTS).

---

## 6. RECOMENDACIONES COMERCIALES Y ROADMAP ESTRATÉGICO

### Corto Plazo (0 - 3 meses de lanzamiento)
1. **Atención y Activación Humanizada por WhatsApp:**
   - La integración con Yape (`997 676 432`) y transferencias BCP con verificación manual en `/admin` es óptima para la fase de tracción inicial en Perú, reduciendo la fricción y generando confianza con psicólogos que desconfían de cobros automáticos recurrentes.
2. **Onboarding Guiado Asistido:**
   - Aprovechar el tour interactivo implementado con `driver.js` y ofrecer una sesión de 15 minutos de inducción por videollamada para directores de centros psicológicos.
3. **Plantillas de Informes Psicológicos:**
   - Incorporar en la Bóveda plantillas descargables de Consentimiento Informado, Acuerdo de Encuadre Terapéutico y Registro de Sesión según los lineamientos del Colegio de Psicólogos del Perú (C.Ps.P.).

### Mediano Plazo (3 - 6 meses)
1. **Pasarela de Pago Recurrente Automatizada:**
   - Integrar Mercado Pago, Culqi o Stripe para cobros recurrentes con tarjeta de crédito una vez que el volumen de suscriptores supere las 50 clínicas activas, conservando siempre la opción de Yape y transferencia para el mercado peruano.
2. **Sincronización Bidireccional con Google Calendar / Outlook:**
   - Permitir a los terapeutas sincronizar sus citas clínicas de Synkro con su calendario personal sin exponer los datos sensibles de los pacientes.
3. **Portal del Paciente v2:**
   - Permitir al paciente registrar autorregistros de estado de ánimo diarios y confirmación de asistencia con recordatorios automatizados.

---

## 7. INVENTARIO DE ARCHIVOS MODIFICADOS Y CREADOS EN LA FASE FINAL

### Migraciones de Base de Datos
- `supabase/migrations/20261028240000_phase4_stabilization_and_hardening.sql`: Endurecimiento de RLS, tokens de activación criptográfica, desvinculación de superadmin de consultas SELECT clínicas directas.

### Servicios Clínicos y Tipos
- `apps/web/lib/types/clinical.ts`: Extensiones de campos de invitación e identidad en paciente e interfaz `IClinicalDataService`.
- `apps/web/lib/supabase/clinical-data.ts`: Implementación de RPCs de invitación, aceptación y revocación de portal; validación estricta de tipos MIME y extensiones de archivo; reducción de TTL de signed URLs a 900s.
- `apps/web/lib/demo/clinical-data.ts`: Deshabilitación de operaciones de escritura en modo demo con mensajes orientadores a `/registrarse`.

### Componentes y Vistas
- `apps/web/components/software/paciente-detail-view.tsx`: Tarjeta interactiva de gestión de invitaciones y revocación de acceso al Portal del Paciente.
- `apps/web/components/software/demo-banner.tsx`: Actualización de textos comerciales y llamada a la acción hacia la prueba de 14 días.
- `apps/web/components/software/demo-readonly-modal.tsx`: Modal interactivo emergente ante intentos de escritura en la demo (`synkro-demo-write-blocked`), interceptando directamente las acciones de creación y evitando formularios vacíos.
- `apps/web/components/software/suscripcion-view.tsx`: Componente unificado para la gestión de suscripciones tanto en producción como en demo (`/suscripcion` y `/demo/suscripcion`).
- `apps/web/components/inicio/public-header.tsx`: Cabecera pública moderna y equilibrada con selectores desplegables ("Soluciones", "Plataforma"), íconos vectoriales en cada opción, distinción clara entre "Ingresar" y "Prueba Gratis (14 días)" con Tooltip de shadcn, y menú móvil optimizado.
- `apps/web/components/software/agenda-view.tsx`: Agenda clínica semanal con boxes y telepsicología sin emojis, usando iconos oficiales Lucide (`<Building2 />`, `<Video />`, `<Lightbulb />`).
- `apps/web/app/demo/layout.tsx`: Disposición de banner de demo alineada con el panel de contenido principal (`lg:ml-72`), eliminando la superposición de la barra lateral fija.
- `apps/web/components/software/sidebar.tsx`: Identificadores de paso para el tour guiado interactivo.
- `apps/web/components/software/topbar.tsx`: Integración del botón de lanzamiento del tour guiado.
- `apps/web/components/software/configuracion-view.tsx`: Botón para relanzar el tour guiado desde la configuración.
- `apps/web/components/software/guided-tour.tsx`: Implementación del tour guiado con `driver.js`.

### Tipografía y Estilo Global
- `@fontsource-variable/manrope`: Tipografía corporativa oficial Manrope Variable integrada en `app/layout.tsx` y `app/globals.css`.
- **Eradicación Total de Emojis:** 100% de los emojis sustituidos por iconografía profesional de `lucide-react`.

### Rutas y Páginas
- `apps/web/app/(software)/suscripcion/page.tsx`: Vista de suscripción clínica activa con histórico de pagos y opciones de renovación Yape/BCP.
- `apps/web/app/demo/suscripcion/page.tsx`: Vista de suscripción en entorno demo aislada (resuelve el error 404).
- `apps/web/app/portal-paciente/page.tsx`: Filtrado estricto por `user_id = auth.uid() AND portal_status = 'active'`, banner informativo para cuentas no vinculadas y TTL de 900s en documentos.
- `apps/web/app/portal-paciente/activar/page.tsx`: Flujo completo de activación y vinculación de tokens de invitación al portal.
- `apps/web/app/(auth)/iniciar-sesion/page.tsx`: Enlace "¿Olvidaste tu contraseña?".
- `apps/web/app/(auth)/recuperar-contrasena/page.tsx`: Envío de correos de recuperación de contraseña vía Supabase Auth.
- `apps/web/app/(auth)/actualizar-contrasena/page.tsx`: Actualización segura de contraseña para usuarios con token.
- `apps/web/app/(auth)/registrarse/page.tsx`: Manejo de estados de confirmación de email y redirección clara.
- `apps/web/app/(Inicio)/psicologos/page.tsx`: Landing de captación para psicólogos independientes con Schema.org JSON-LD.
- `apps/web/app/(Inicio)/centros-psicologicos/page.tsx`: Landing de captación para clínicas con Schema.org JSON-LD.
- `apps/web/app/sitemap.ts`: Mapa del sitio XML dinámico de Next.js.
- `apps/web/app/robots.ts`: Reglas de indexación para buscadores.
- `apps/web/public/llms.txt`: Resumen arquitectural y comercial para motores de IA.

### Suites de Pruebas
- `scripts/test-phase1.mjs`: 22 pruebas de seguridad y registro multi-tenant.
- `scripts/test-phase2.mjs`: 21 pruebas de motor de suscripciones y límites comerciales.
- `scripts/test-phase3.mjs`: 24 pruebas de bóveda documental y secreto profesional.
- `scripts/test-stabilization.mjs`: 15 pruebas de tokens de invitación, revocación y aislamiento de superadmin.
- **Total:** 82 pruebas aprobadas al 100%.

