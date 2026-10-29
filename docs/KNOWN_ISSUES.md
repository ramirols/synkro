# SYNKRO — Errores Conocidos, Deuda Técnica y Funcionalidades Incompletas

> **Registro de Incidencias Confirmadas y Deuda Técnica**  
> **Producto:** Synkro (VelyonSoft)  
> **Fecha de Auditoría:** Octubre 2026

---

## 1. Errores Críticos Confirmados en Código

### ISSUE-01: Bloqueo en la Creación de Citas y Sesiones para Usuarios Nuevos

- **Severidad:** **Crítica (Bloqueante)**
- **Estado:** Confirmado mediante trazabilidad de código.
- **Causa Raíz:**  
  1. Cuando un terapeuta se registra mediante [`apps/web/app/(auth)/registrarse/page.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/(auth)/registrarse/page.tsx), Supabase Auth inserta un usuario en `auth.users`.
  2. El trigger `handle_new_user` crea el registro en `public.profiles`.
  3. El trigger `create_default_workspace` en [`supabase/migrations/20261003000000_initial_schema.sql`](file:///c:/Users/User/Desktop/Synkro/supabase/migrations/20261003000000_initial_schema.sql) (L215-228) crea la organización en `public.organizations`, asigna la membresía en `public.organization_members` e inserta en `public.subscriptions`.  
     **Sin embargo, omite insertar el registro correspondiente en la tabla `public.professionals`.**
  4. En [`apps/web/lib/supabase/clinical-data.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/supabase/clinical-data.ts) (L36-47), la función auxiliar `getActiveContext()` realiza:
     ```typescript
     const { data: prof } = await supabase
       .from("professionals")
       .select("id")
       .eq("profile_id", user.id)
       .limit(1)
       .single();
     ```
  5. Al no existir la fila, `context.professionalId` resulta `null`.
  6. En consecuencia, al ejecutar `createAppointment` o `createSession`, el servicio lanza de forma invariable la excepción:
     ```typescript
     throw new Error("Tu cuenta de usuario no está registrada como profesional clínico activo en la base de datos.");
     ```
- **Corrección Recomendada:**  
  Modificar la función SQL `public.create_default_workspace()` para incluir una inserción en `public.professionals` vinculando `organization_id` y `profile_id: new.id`:
  ```sql
  INSERT INTO public.professionals (organization_id, profile_id, specialty, license_number, bio)
  VALUES (new_org, new.id, new.specialty, new.license_number, new.bio);
  ```

---

## 2. Funcionalidades Incompletas

### ISSUE-02: Bóveda Documental no Transfiere Archivos a Supabase Storage

- **Severidad:** **Alta**
- **Evidencia:**  
  En [`apps/web/components/software/documentos-view.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/components/software/documentos-view.tsx) (L117-124), el manejador `handleCreateDocument` genera una ruta simulada (`patient-files/...`) y llama a `service.createFile()`. En [`apps/web/lib/supabase/clinical-data.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/supabase/clinical-data.ts) (L261-276), `createFile` solo hace un `insert` en la tabla relacional `patient_files`.
- **Impacto:**  
  Los archivos seleccionados por el terapeuta nunca se transfieren a los servidores S3 de Supabase Storage. La visualización de PDFs en el visor y las acciones de descarga son simulaciones visuales con datos ficticios.
- **Corrección Recomendada:**  
  Invocar `supabase.storage.from("patient-files").upload(path, file)` previo a la inserción en la tabla `patient_files`.

---

### ISSUE-03: Módulos con Datos 100% Simulados en la Aplicación Privada

A pesar de existir en el software operativo bajo `(software)`, los siguientes módulos operan con datos estáticos en memoria:

1. **Clínica & Equipo Multidisciplinario ([`profesionales-view.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/components/software/profesionales-view.tsx)):**
   - El equipo de 4 psicólogos, el sistema de derivaciones de casos, el control de disponibilidad de boxes físicos y la Cámara Gesell están almacenados en variables locales del componente (`useState`). No interactúan con las tablas `professionals` ni `organization_members`.
2. **Consola Master Admin ([`app/admin/page.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/admin/page.tsx)):**
   - El listado de clínicas clientes, ingresos mensuales y cantidad de pacientes es un array estático (`clientClinics`).
3. **Portal del Paciente ([`app/portal-paciente/page.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/portal-paciente/page.tsx)):**
   - Aunque importa `supabase`, los documentos firmados, la próxima cita y el registro de estado de ánimo diario son puramente demostrativos y no persisten en la base de datos.
4. **Métricas y Reportes ([`reportes-view.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/components/software/reportes-view.tsx)):**
   - Solo los conteos brutos provienen de la base de datos; la tasa de asistencia (`88%` / `92%`), retención (`94%`) y horas estimadas (`sesiones * 4`) provienen de fórmulas fijas en el cliente.

---

## 3. Deuda Técnica y Componentes Huérfanos

### ISSUE-04: Componentes Huérfanos en el Árbol de Código

Los siguientes componentes existen en el repositorio pero **no son importados ni utilizados** por ninguna página o vista activa:

| Archivo Huérfano | Ruta | Observación |
| :--- | :--- | :--- |
| `activity-card.tsx` | `apps/web/components/dashboard/activity-card.tsx` | Componente de tarjeta de actividad antiguo. |
| `appointment-card.tsx` | `apps/web/components/dashboard/appointment-card.tsx` | Tarjeta de cita heredada. |
| `metric-card.tsx` | `apps/web/components/dashboard/metric-card.tsx` | Tarjeta de métricas con formato CSS espaciado antiguo. |
| `patient-table.tsx` | `apps/web/components/patients/patient-table.tsx` | Tabla de pacientes anterior a la creación de `pacientes-view.tsx`. |
| `mobile-sidebar.tsx` | `apps/web/components/software/mobile-sidebar.tsx` | Sidebar móvil no integrado en `SoftwareLayout`. |

- **Recomendación:** Eliminar o archivar estos archivos para evitar confusiones y reducir la superficie de mantenimiento.

---

### ISSUE-05: Descarga Ineficiente de Colecciones en el Detalle del Paciente

- **Archivo:** [`apps/web/components/software/paciente-detail-view.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/components/software/paciente-detail-view.tsx) (L46-54).
- **Problema:**  
  Para visualizar el expediente de un paciente, la vista ejecuta:
  ```typescript
  const [allSessions, allAppointments, allFiles] = await Promise.all([
    service.getSessions(),
    service.getAppointments(),
    service.getFiles(),
  ]);

  setSessions(allSessions.filter((s) => s.patient_id === id));
  setAppointments(allAppointments.filter((a) => a.patient_id === id));
  setFiles(allFiles.filter((f) => f.patient_id === id));
  ```
- **Impacto:**  
  En consultorios con cientos de citas y notas de sesión, cada apertura de un expediente descargará miles de registros por red para luego descartar la gran mayoría en memoria.
- **Recomendación:**  
  Crear endpoints o métodos parametrizados en `ProductionClinicalDataService` (ej. `supabase.from("sessions").select("*").eq("patient_id", id)`).

---

## 4. Inconsistencias de Configuración

### ISSUE-06: Nomenclatura no Estándar de la Llave Anónima de Supabase

- **Archivo:** [`apps/web/lib/supabase.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/supabase.ts) (L5).
- **Problema:**  
  El código busca `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.  
  La convención estándar de la CLI de Supabase y las integraciones oficiales (ej. Vercel + Supabase) generan la variable `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Recomendación:**  
  Permitir ambas opciones con fallback:
  ```typescript
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  ```

---

## 5. Ausencia de Pruebas Automatizadas

### ISSUE-07: Cero Cobertura de Pruebas Unitarias, de Integración o de RLS

- **Estado:** Confirmado. No existe ningún archivo de test (`*.test.ts`, `*.spec.ts`) ni scripts en `package.json`.
- **Riesgo:** Alta probabilidad de introducir regresiones de seguridad en políticas RLS multi-inquilino o fallas lógicas en el cálculo de semanas de la agenda.

