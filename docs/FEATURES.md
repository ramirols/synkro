# SYNKRO — Inventario de Módulos, Rutas y Matriz de Funcionalidades

> **Documento de Auditoría Funcional**  
> **Producto:** Synkro (VelyonSoft)  
> **Fecha de Auditoría:** Octubre 2026

---

## 1. Inventario General de Rutas de la Aplicación

A partir del escaneo del sistema de archivos en [`apps/web/app/`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/):

| Grupo / Prefijo | Ruta Relativa | Archivo de Página | Tipo | Acceso / Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **Landing** | `/` | `app/(Inicio)/page.tsx` | Servidor / Cliente | Landing page comercial con vista previa interactiva. |
| **Landing** | `/funciones` | `app/(Inicio)/funciones/page.tsx` | Servidor | Catálogo de herramientas clínicas y notas SOAP. |
| **Landing** | `/precios` | `app/(Inicio)/precios/page.tsx` | Servidor | Planes (Starter, Professional, Clínica) y enlaces a WhatsApp. |
| **Landing** | `/seguridad` | `app/(Inicio)/seguridad/page.tsx` | Servidor | Declaración de cumplimiento de privacidad y Ley C.Ps.P. |
| **Auth** | `/iniciar-sesion` | `app/(auth)/iniciar-sesion/page.tsx` | Cliente | Login con correo/contraseña y acceso a Demo 1-Click. |
| **Auth** | `/registrarse` | `app/(auth)/registrarse/page.tsx` | Cliente | Registro de psicólogo titular y clínica en Supabase Auth. |
| **Software** | `/dashboard` | `app/(software)/dashboard/page.tsx` | Cliente | Panel de control principal con KPIs y accesos directos. |
| **Software** | `/pacientes` | `app/(software)/pacientes/page.tsx` | Cliente | Directorio y registro de pacientes. |
| **Software** | `/pacientes/[id]` | `app/(software)/pacientes/[id]/page.tsx` | Cliente | Expediente clínico individual con historial, citas y notas. |
| **Software** | `/agenda` | `app/(software)/agenda/page.tsx` | Cliente | Calendario semanal tipo horario, filtros de modalidad y citas. |
| **Software** | `/sesiones` | `app/(software)/sesiones/page.tsx` | Cliente | Registro y consulta de sesiones clínicas y notas privadas. |
| **Software** | `/documentos` | `app/(software)/documentos/page.tsx` | Cliente | Bóveda documental de pruebas psicométricas y consentimientos. |
| **Software** | `/profesionales` | `app/(software)/profesionales/page.tsx` | Cliente | Gestión de equipo, boxes de atención y derivaciones. |
| **Software** | `/reportes` | `app/(software)/reportes/page.tsx` | Cliente | Métricas de adherencia terapéutica y horas clínicas. |
| **Software** | `/configuracion` | `app/(software)/configuracion/page.tsx` | Cliente | Perfil profesional, datos de consultorio y consola de migración. |
| **Admin** | `/admin` | `app/admin/page.tsx` | Cliente | Consola Master Admin para VelyonSoft (superadmin). |
| **Demo** | `/demo` | `app/demo/page.tsx` | Cliente | Dashboard idéntico operando 100% sobre `localStorage`. |
| **Demo** | `/demo/agenda` | `app/demo/agenda/page.tsx` | Cliente | Agenda aislada para pruebas de demostración. |
| **Demo** | `/demo/pacientes` | `app/demo/pacientes/page.tsx` | Cliente | Lista de pacientes demo interactiva. |
| **Demo** | `/demo/pacientes/[id]`| `app/demo/pacientes/[id]/page.tsx` | Cliente | Expediente clínico demo con notas de contratransferencia. |
| **Demo** | `/demo/sesiones` | `app/demo/sesiones/page.tsx` | Cliente | Registro de sesiones sobre almacenamiento local. |
| **Demo** | `/demo/documentos` | `app/demo/documentos/page.tsx` | Cliente | Bóveda documental simulada. |
| **Demo** | `/demo/profesionales`| `app/demo/profesionales/page.tsx` | Cliente | Gestión de consultorios simulada. |
| **Demo** | `/demo/reportes` | `app/demo/reportes/page.tsx` | Cliente | Reportes analíticos con datos demo. |
| **Demo** | `/demo/configuracion`| `app/demo/configuracion/page.tsx` | Cliente | Configuración de perfil demo. |
| **Portal Paciente**| `/portal-paciente` | `app/portal-paciente/page.tsx` | Cliente | Interfaz del paciente para ver citas, tareas y documentos. |

---

## 2. Detalle de Módulos Operativos

### 2.1 Módulo de Autenticación (`(auth)`)
- **Archivos:** `app/(auth)/iniciar-sesion/page.tsx`, `app/(auth)/registrarse/page.tsx`, `lib/auth-context.tsx`.
- **Acciones:**
  - Login mediante `supabase.auth.signInWithPassword`.
  - Registro de nuevo psicólogo mediante `supabase.auth.signUp`, enviando metadata (`full_name`, `license_number`, `clinic_name`, `role: 'owner'`).
  - Acceso inmediato al entorno `/demo` sin credenciales.
  - Cierre de sesión y limpieza de estado.
- **Tablas Implicadas:** `auth.users`, `public.profiles`, `public.organizations`, `public.organization_members`, `public.subscriptions`.
- **Estado:** **Implementado y funcional**, con un bloqueo detectado en la creación subsecuente de citas debido a la falta del registro en `professionals`.

### 2.2 Módulo de Pacientes (`(software)/pacientes` y `[id]`)
- **Archivos:** `components/software/pacientes-view.tsx`, `components/software/paciente-detail-view.tsx`.
- **Acciones:**
  - Listar pacientes con filtro de búsqueda por nombre/apellido, enfoque terapéutico (TCC, ACT, Sistémica, Psicoanálisis) y estado (`activo`, `inactivo`, `alta`, `evaluacion`).
  - Crear nuevo paciente con validación de obligatoriedad (nombre y apellido).
  - Ver expediente integral: datos demográficos, motivo de consulta, contacto de emergencia, citas históricas y sesiones clínicas asociadas.
  - Ocultar/mostrar notas privadas de evolución mediante toggle de privacidad.
- **Tablas Implicadas:** `public.patients`, `public.sessions`, `public.appointments`, `public.patient_files`.
- **Servicios:** `ProductionClinicalDataService.getPatients`, `createPatient`, `getPatientById`.
- **Estado:** **Implementado y funcional**. En la vista de detalle se identificó que descarga todas las sesiones y citas del centro y filtra en cliente.

### 2.3 Módulo de Agenda y Citas (`(software)/agenda`)
- **Archivos:** `components/software/agenda-view.tsx`.
- **Acciones:**
  - Visualización en cuadrícula de 7 días (Lunes a Domingo) o lista lineal.
  - Navegación entre semanas (`weekOffset`).
  - Filtrado por estado (`scheduled`, `completed`, `cancelled`) y modalidad (`presencial`, `virtual`).
  - Agendamiento de nueva cita: asignación de paciente, fecha, hora, modalidad y enlace de telepsicología (Google Meet).
  - Marcado rápido de estado (completar cita o cancelar).
  - Apertura directa de Google Meet o redirección hacia `/sesiones?patient_id=...&appointment_id=...` para redactar la nota clínica post-sesión.
- **Tablas Implicadas:** `public.appointments`, `public.patients`, `public.professionals`.
- **Servicios:** `ProductionClinicalDataService.getAppointments`, `createAppointment`, `updateAppointmentStatus`.
- **Estado:** **Implementado y funcional** (requiere que el usuario tenga un registro vinculado en `professionals`).

### 2.4 Módulo de Sesiones Clínicas (`(software)/sesiones`)
- **Archivos:** `components/software/sesiones-view.tsx`.
- **Acciones:**
  - Redacción de evolución de sesión con doble capa: resumen clínico formal (`session_summary`) y notas confidenciales del terapeuta (`private_notes`).
  - Calificación de estado emocional (escala de 1 a 10).
  - Asignación de tareas terapéuticas intersesión (`homework`).
  - Vinculación opcional con `appointment_id`, lo que automáticamente marca la cita previa como `"completed"`.
  - Filtro por paciente seleccionado.
- **Tablas Implicadas:** `public.sessions`, `public.patients`, `public.appointments`.
- **Servicios:** `ProductionClinicalDataService.getSessions`, `createSession`.
- **Estado:** **Implementado y funcional**.

### 2.5 Módulo de Documentos y Bóveda (`(software)/documentos`)
- **Archivos:** `components/software/documentos-view.tsx`.
- **Acciones:**
  - Registro de documentos clínicos asignados a un paciente.
  - Categorización (`Evaluación Psicométrica`, `Consentimiento Informado`, `Informe Clínico`, `Material Psicoeducativo`).
  - Filtros y visor modal de documento con fecha y hash simulado.
  - Subida de archivos mediante drag and drop o selector de archivos.
- **Tablas Implicadas:** `public.patient_files`, `public.patients`.
- **Servicios:** `ProductionClinicalDataService.getFiles`, `createFile`.
- **Estado:** **Parcialmente implementado**. La metadata se persiste correctamente en PostgreSQL, pero no se transfieren los bytes al bucket S3 de Supabase Storage. La visualización y descarga son simuladas.

### 2.6 Módulo de Clínica & Equipo Multidisciplinario (`(software)/profesionales`)
- **Archivos:** `components/software/profesionales-view.tsx`.
- **Acciones:**
  - Pestañas de: Equipo de terapeutas, Derivaciones internas de pacientes, Gestión de boxes físicos y Supervisión clínica (Cámara Gesell).
  - Creación de derivaciones internas entre especialistas.
- **Tablas Implicadas:** En base de datos existen `professionals` y `organization_members`.
- **Estado:** **Solo interfaz o datos simulados**. La vista maneja terapeutas, boxes y derivaciones mediante estado local en memoria (`useState`). No realiza consultas a `professionals` ni `organization_members`.

### 2.7 Módulo de Reportes y Analítica (`(software)/reportes`)
- **Archivos:** `components/software/reportes-view.tsx`.
- **Acciones:**
  - Muestra tarjetas de KPIs: Tasa de asistencia, Horas de sesión impartidas, Retención de pacientes.
  - Gráficos de distribución de motivos de consulta y horas pico.
- **Tablas Implicadas:** Consulta `getDashboardSummary()` (conteos básicos).
- **Estado:** **Parcialmente implementado / Datos mayoritariamente simulados**. Los conteos totales son reales, pero las tasas porcentuales, horas y gráficos tienen fórmulas fijas hardcodeadas.

### 2.8 Módulo de Configuración (`(software)/configuracion`)
- **Archivos:** `components/software/configuracion-view.tsx`.
- **Acciones:**
  - Actualización del perfil profesional (`profiles` y `professionals`): nombre, colegiatura, especialidad, biografía, dirección de consultorio y link de Google Meet.
  - Visualización del nombre y slug de la clínica (`organizations`).
  - Pestaña de administración con scripts SQL y comandos de migración a Supabase Cloud.
- **Tablas Implicadas:** `public.profiles`, `public.professionals`, `public.organizations`.
- **Estado:** **Implementado y funcional**.

### 2.9 Consola Master Admin (`/admin`)
- **Archivos:** `app/admin/page.tsx`.
- **Acciones:**
  - Panel exclusivo para `superadmin` / `admin`.
  - Muestra listado de consultorios clientes, planes suscritos y estado.
  - Guía paso a paso para migrar la base de datos a Supabase Cloud con snippets SQL.
- **Estado:** **Solo interfaz o datos simulados**. El listado de clínicas clientes es un array estático en el código; la verificación de rol es en el cliente.

### 2.10 Portal del Paciente (`/portal-paciente`)
- **Archivos:** `app/portal-paciente/page.tsx`.
- **Acciones:**
  - Panel para pacientes con visualización de próxima cita, link de Google Meet, tareas asignadas y registro de estado de ánimo diario.
  - Visor de documentos compartidos y consentimiento informado.
- **Estado:** **Solo interfaz o datos simulados**. Los datos mostrados no se consultan desde Supabase ni se persisten los registros de ánimo en la base de datos.

---

## 3. Matriz de Estado de Funcionalidades

| Módulo / Funcionalidad | Estado de Implementación | Evidencia en Código | Observaciones y Bloqueos |
| :--- | :--- | :--- | :--- |
| **Autenticación (Login/Sign Up)** | **Implementada y funcional** | `auth-context.tsx`, `iniciar-sesion/page.tsx`, `registrarse/page.tsx` | Supabase Auth nativo. Falta vincular registro a `professionals`. |
| **Aislamiento Modo Demo** | **Implementada y funcional** | `demo-storage.ts`, `demo/clinical-data.ts`, `app/demo/*` | 100% aislado en `localStorage`, reseteable con 1 clic. |
| **Gestión de Pacientes (CRUD)** | **Implementada y funcional** | `pacientes-view.tsx`, `lib/supabase/clinical-data.ts` | Conectado a Postgres con RLS; búsqueda GIN trigram. |
| **Expediente Clínico Individual** | **Implementada y funcional** | `paciente-detail-view.tsx` | Muestra citas, sesiones y notas privadas con toggle. |
| **Agenda Semanal y Citas** | **Implementada y funcional** | `agenda-view.tsx`, `lib/supabase/clinical-data.ts` | Vista cuadrícula 7 días, filtros y cambio de estado. |
| **Notas de Evolución SOAP / Sesiones** | **Implementada y funcional** | `sesiones-view.tsx`, `lib/supabase/clinical-data.ts` | Doble capa de notas, puntaje emocional y completado de citas. |
| **Bóveda de Documentos Clínicos** | **Parcialmente implementada** | `documentos-view.tsx`, `lib/supabase/clinical-data.ts` | Metadatos se guardan en Postgres; **no sube archivos a Storage S3**. |
| **Configuración de Perfil** | **Implementada y funcional** | `configuracion-view.tsx` | Actualiza `profiles` y `professionals` en Supabase. |
| **Reportes y Analítica** | **Parcialmente implementada** | `reportes-view.tsx` | Conteos de entidades reales; porcentajes y gráficos simulados. |
| **Gestión de Boxes y Derivaciones** | **Solo interfaz o datos simulados** | `profesionales-view.tsx` | Interfaz completa con tabs pero datos locales en `useState`. |
| **Consola Master Admin Velyon** | **Solo interfaz o datos simulados** | `admin/page.tsx` | Lista de clientes hardcodeada; guía Cloud funcional. |
| **Portal del Paciente** | **Solo interfaz o datos simulados** | `portal-paciente/page.tsx` | Interfaz interactiva completa pero sin persistencia en backend. |
| **Pagos y Pasarela (Yape / Tarjetas)** | **Referenciada, pero no implementada** | `precios/page.tsx`, `registrarse/page.tsx` | Redirecciona a WhatsApp con mensaje preconfigurado (conciliación manual). |
| **Pruebas Automatizadas (Unit/E2E)** | **No implementada** | Ausencia de suites en repo | No existen archivos `.test.ts`, `.spec.ts` ni scripts de prueba. |

