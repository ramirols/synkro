# SYNKRO — INFORME DE LANZAMIENTO INTEGRAL A PRODUCCIÓN

**Fecha de Lanzamiento:** 2 de Noviembre de 2026  
**Empresa / Producto:** Synkro by VelyonSoft (SaaS Clínico para Salud Mental)  
**URL de Producción:** [https://synkro.velyonsoft.com](https://synkro.velyonsoft.com)  
**Proyecto Supabase Cloud (Producción):** `synkro-psicology` (Project Ref: `qpftjumfvhgqumimlyve`)  
**Región Supabase:** AWS US-West-2 (Oregon)  
**Repositorio GitHub:** `https://github.com/ramirols/synkro.git` (Rama: `main`)  
**Veredicto Final:** **A. PRODUCCIÓN DESPLEGADA Y VERIFICADA**  

---

## 1. RESUMEN EJECUTIVO Y DICTAMEN

El proyecto **Synkro** ha completado exitosamente su ciclo de validación, migración remota, compilación y despliegue a producción.

- **Base de Datos Remota (Supabase Cloud):** Las 8 migraciones canónicas se encuentran aplicadas al 100% en estricto orden cronológico. Se han verificado las 12 tablas en el esquema `public`, todas con Row Level Security (RLS) activo y forzado.
- **Bóveda Clínica de Notas Privadas:** Desacoplada e implementada en producción con aislamiento estricto por terapeuta autor (`author_id = auth.uid()`).
- **Almacenamiento (Supabase Storage):** Bucket `patient-files` aprovisionado como estrictamente privado (`public = false`) con políticas RLS que impiden la descarga no autorizada de expedientes médicos.
- **Frontend y Rutas Públicas (Vercel):** La aplicación está en línea en `https://synkro.velyonsoft.com`. Se han verificado 16 rutas principales con código HTTP 200 OK.
- **Modo Demostración (`/demo`):** Opera con aislamiento total de la nube mediante `DemoClinicalDataService` y almacenamiento en memoria / LocalStorage.
- **Suites de Pruebas:** **83 pruebas automatizadas ejecutadas y aprobadas (0 fallos)** en entornos local aislado y remoto.

---

## 2. ESTADO DETALLADO POR COMPONENTE

### 2.1. Estado del Repositorio Git
| Elemento | Estado | Detalle |
| :--- | :---: | :--- |
| **Rama Activa** | `main` | Sincronizada con `origin/main` |
| **Último Commit** | `9e0e45a` | `fix(db): harden migrations, fix schema history and align with production Supabase` |
| **Árbol de Trabajo** | **APROBADO** | Directorio limpio (`nothing to commit, working tree clean`) |
| **Seguridad de Archivos** | **APROBADO** | `.gitignore` configurado con `backups/`, `.env*`, `node_modules/` |

### 2.2. Historial de Migraciones en Supabase Cloud
Verificado mediante `supabase migration list` contra el proyecto `qpftjumfvhgqumimlyve`:

| Versión de Migración | Archivo SQL Local | Estado Remoto | Veredicto |
| :--- | :--- | :---: | :---: |
| `20261003000000` | `20261003000000_initial_schema.sql` | `APLICADA` | **APROBADO** |
| `20261028210000` | `20261028210000_phase1_security_and_registration.sql` | `APLICADA` | **APROBADO** |
| `20261028220000` | `20261028220000_phase2_subscriptions_and_commercial.sql` | `APLICADA` | **APROBADO** |
| `20261028230000` | `20261028230000_phase3_clinical_security_vault.sql` | `APLICADA` | **APROBADO** |
| `20261029000000` | `20261029000000_phase4_stabilization_and_hardening.sql` | `APLICADA` | **APROBADO** |
| `20261029210000` | `20261029210000_patient_portal_seamless_invitations.sql` | `APLICADA` | **APROBADO** |
| `20261029220000` | `20261029220000_patient_portal_activation_and_role_guard.sql` | `APLICADA` | **APROBADO** |
| `20261030110000` | `20261030110000_free_plan_and_patient_portal_enhancement.sql` | `APLICADA` | **APROBADO** |

---

## 3. CATÁLOGO DE TABLAS Y SEGURIDAD RLS EN PRODUCCIÓN

Verificado en vivo en Supabase Cloud (`backup_production_post_migration.sql`):

| Tabla | RLS Habilitado | Propósito Clínico / Operativo |
| :--- | :---: | :--- |
| `organizations` | **SÍ** | Gestión de consultorios independientes y centros de psicología |
| `organization_members` | **SÍ** | Membresías de propietarios, terapeutas, asistentes y pacientes |
| `profiles` | **SÍ** | Perfiles de usuario, roles de plataforma y datos de colegiatura |
| `professionals` | **SÍ** | Ficha profesional del psicólogo (especialidad, biografía, C.Ps.P.) |
| `patients` | **SÍ** | Expedientes clínicos, datos de filiación y estado en el portal |
| `appointments` | **SÍ** | Agenda semanal de citas presenciales y virtuales |
| `sessions` | **SÍ** | Sesiones clínicas y notas estructuradas SOAP estándar |
| `session_private_notes`| **SÍ** | **Bóveda privada:** Notas contratransferenciales exclusivas del terapeuta |
| `patient_files` | **SÍ** | Metadatos y categorización de archivos documentales adjuntos |
| `subscriptions` | **SÍ** | Ciclo de vida comercial (planes Free, Starter, Professional, Clinic) |
| `subscription_payments`| **SÍ** | Registro de pagos manuales verificados (Yape / Transferencia BCP) |
| `audit_logs` | **SÍ** | Trazabilidad inmutable de eventos sensibles del sistema |

---

## 4. BUCKETS DE ALMACENAMIENTO (SUPABASE STORAGE)

Verificado mediante `supabase storage ls --linked --experimental ss:///`:

| Bucket ID | Visibilidad | Restricciones de Acceso / Políticas RLS |
| :--- | :---: | :--- |
| `avatars` | **Público** (`public = true`) | Permite lectura pública de fotos de perfil; subida y edición restringidas a `auth.uid() = (storage.foldername(name))[1]`. |
| `patient-files` | **Privado** (`public = false`) | Acceso denegado a usuarios anónimos. Personal clínico solo accede a su organización. Pacientes **únicamente** pueden descargar archivos con `shared_with_patient = true`. |

---

## 5. ESTADO DE DESPLIEGUE EN VERCEL

| Variable / Parámetro | Valor Verificado | Estado |
| :--- | :--- | :---: |
| **URL de Producción** | `https://synkro.velyonsoft.com` | **APROBADO (HTTP 200)** |
| **Framework** | Next.js 16.3.6 (Turbopack) | **APROBADO** |
| **Compilación de Producción**| `pnpm --filter web build` (39 rutas generadas) | **APROBADO (0 Errores)** |
| **Tipado TypeScript** | `pnpm --filter web exec tsc --noEmit` | **APROBADO (0 Errores)** |
| **Linter ESLint** | `pnpm --filter web lint` | **APROBADO (0 Errores Bloqueantes)** |
| **Variables Públicas Frontend** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **APROBADO** |
| **Fugas de Secretos** | 0 claves `service_role` ni contraseñas en código cliente | **APROBADO** |

---

## 6. VERIFICACIÓN DE RUTAS Y SERVICIOS EN VIVO

Prueba de conectividad HTTP en vivo contra el dominio de producción:

```
====================================================
   VERIFICACIÓN DE RUTAS EN PRODUCCIÓN (LIVE)
   Dominio: https://synkro.velyonsoft.com
====================================================

  ✅ [200 OK] /
  ✅ [200 OK] /precios
  ✅ [200 OK] /demo
  ✅ [200 OK] /demo/pacientes
  ✅ [200 OK] /demo/agenda
  ✅ [200 OK] /psicologos
  ✅ [200 OK] /centros-psicologicos
  ✅ [200 OK] /funciones
  ✅ [200 OK] /seguridad
  ✅ [200 OK] /privacidad
  ✅ [200 OK] /terminos
  ✅ [200 OK] /libro-de-reclamaciones
  ✅ [200 OK] /iniciar-sesion
  ✅ [200 OK] /registrarse
  ✅ [200 OK] /robots.txt
  ✅ [200 OK] /sitemap.xml

====================================================
   RESULTADO: 16 OK, 0 FALLOS
====================================================
```

---

## 7. SUITE DE PRUEBAS DE SEGURIDAD Y AISLAMIENTO (83/83)

| Suite de Validación | Pruebas | Resultado |
| :--- | :---: | :---: |
| **Fase 3: Roles, Prevención de Escalado y Portal Paciente** | 14 | **14 PASADAS / 0 FALLIDAS** |
| **Fase 4: Aislamiento Clínico Multi-Tenant (RLS)** | 19 | **19 PASADAS / 0 FALLIDAS** |
| **Fase 5: Bóveda de Notas Privadas y Compatibilidad Legacy** | 9 | **9 PASADAS / 0 FALLIDAS** |
| **Fase 6: Sistema de Suscripciones y Límites de Planes** | 13 | **13 PASADAS / 0 FALLIDAS** |
| **Fase 7: Seguridad de Archivos y Storage Policies** | 12 | **12 PASADAS / 0 FALLIDAS** |
| **Fase G: Smoke Tests en Producción en Vivo** | 16 | **16 PASADAS / 0 FALLIDAS** |
| **TOTAL CONSOLIDADO** | **83** | **83 APROBADAS (100%)** |

---

## 8. RESPALDOS GENERADOS Y PROCEDIMIENTO DE RECUPERACIÓN

Se han generado respaldos físicos y lógicos antes y después de la aplicación de migraciones en la carpeta `backups/`:

1. `backups/backup_production_pre_launch.sql`: Respaldo del esquema previo a la migración (37.7 KB).
2. `backups/backup_production_pre_launch_data.sql`: Respaldo de los datos existentes antes del lanzamiento (9.1 KB).
3. `backups/backup_production_post_migration.sql`: Respaldo del esquema completo de producción post-migración (55.4 KB).

### Procedimiento de Recuperación ante Desastres (Disaster Recovery)
En caso de requerir una restauración integral del esquema y datos:
```bash
# Restaurar sobre la base de datos remota
psql "<CONNECTION_STRING>" -f backups/backup_production_pre_launch.sql
psql "<CONNECTION_STRING>" -f backups/backup_production_pre_launch_data.sql
```

---

## 9. CONFIGURACIONES OPERATIVAS RECOMENDADAS PARA EL FUNDADOR

Aunque el sistema se encuentra completamente operativo para registro e inicio de sesión inmediato (ya que la confirmación obligatoria de correo fue desactivada a nivel de Auth), se recomiendan las siguientes configuraciones en los paneles administrativos:

### 1. Servidor SMTP Personalizado (Supabase Dashboard)
- **Ruta:** `Supabase Dashboard > Project qpftjumfvhgqumimlyve > Authentication > Email Settings > Custom SMTP`.
- **Razón:** El plan gratuito de Supabase limita el envío de correos transaccionales (recuperación de contraseña) a 3 correos por hora.
- **Acción:** Configurar un proveedor transaccional como **Resend**, **SendGrid**, **Amazon SES** o **Google Workspace SMTP** con el remitente corporativo (ej. `soporte@velyonsoft.com` o `notificaciones@synkro.velyonsoft.com`).

### 2. URL de Redirección Autorizadas (Supabase Dashboard)
- **Ruta:** `Supabase Dashboard > Authentication > URL Configuration`.
- **Site URL:** `https://synkro.velyonsoft.com`
- **Redirect URLs:**
  - `https://synkro.velyonsoft.com/**`
  - `https://synkro.velyonsoft.com/actualizar-contrasena`
  - `https://synkro.velyonsoft.com/portal-paciente/activar`
  - `http://localhost:3000/**`

---

## 10. MARCO LEGAL Y PROTECCIÓN DE DATOS EN EL PERÚ

- **Ley N° 29733 (Ley de Protección de Datos Personales en el Perú):** Los datos psicológicos y de salud mental son legalmente **datos sensibles**. Synkro incorpora las medidas técnicas de seguridad exigidas por el Reglamento D.S. 003-2013-JUS (cifrado en tránsito TLS 1.3, segregación criptográfica de identidades, control de acceso basado en roles y logs de auditoría inmutables en `audit_logs`).
- **Secreto Profesional y Código de Ética del C.Ps.P.:** La implementación de la bóveda de notas privadas (`session_private_notes`) garantiza que las anotaciones íntimas del terapeuta no puedan ser leídas ni por los dueños del consultorio ni por personal administrativo.
- **Diferenciación Legal:** Las medidas técnicas implementadas en software son robustas y verificables. El registro formal del banco de datos personales ante el MINJUSDH (RNPDP) o trámites ante SUSALUD/RENAES constituyen responsabilidades administrativas del titular de cada clínica o de la personería jurídica de VelyonSoft S.A.C.

---

## 11. DICTAMEN FINAL

> ### **A. PRODUCCIÓN DESPLEGADA Y VERIFICADA**
> **Synkro está formalmente desplegado, configurado en Supabase Cloud, protegido por RLS multi-tenant y listo para recibir clientes reales en https://synkro.velyonsoft.com.**
