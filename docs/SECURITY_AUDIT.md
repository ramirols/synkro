# SYNKRO — Auditoría de Seguridad, Privacidad y Calidad

> **Auditoría Técnica de Seguridad en Salud Mental**  
> **Producto:** Synkro (VelyonSoft)  
> **Fecha de Auditoría:** Octubre 2026

---

## 1. Resumen Ejecutivo de Seguridad

Synkro maneja información médica de alta sensibilidad (historias clínicas psicológicas, notas de evolución confidenciales, motivos de consulta y evaluaciones psicométricas). El cumplimiento del secreto profesional y de la normativa de protección de datos (Ley N° 29733 de Protección de Datos Personales en Perú y la Ley N° 28369 del Trabajo del Psicólogo) requiere un rigor excepcional.

**Veredicto General:**
- **Puntos Fuertes:** La arquitectura de base de datos en PostgreSQL cuenta con un diseño de **Row Level Security (RLS)** robusto que utiliza funciones `SECURITY DEFINER` libres de recursión infinita para aislar los inquilinos (`organizations`). Las notas de sesión excluyen explícitamente a roles administrativos (`assistant`) y a pacientes.
- **Puntos Críticos:** La capa web (Next.js) depende al 100% de verificaciones del lado del cliente (`useEffect`). No existe un middleware de servidor que valide tokens JWT ni cookies HttpOnly; la sesión reside en `localStorage`, lo que expone los tokens a ataques de Cross-Site Scripting (XSS).

---

## 2. Matriz Consolidada de Hallazgos de Seguridad

| ID | Hallazgo | Nivel de Riesgo | Prioridad | Archivo / Componente Afectado |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Protección de rutas privadas ejecutada exclusivamente en el cliente (sin Next.js Middleware) | **Alto** | Inmediata | `apps/web/app/(software)/layout.tsx`, `app/admin/page.tsx` |
| **SEC-02** | Asignación por defecto de rol `'owner'` ante perfiles no encontrados o errores de red | **Alto** | Alta | `apps/web/lib/auth-context.tsx` (L63-69, L72-78) |
| **SEC-03** | Tokens de sesión almacenados en `localStorage` (vulnerable a XSS) por falta de `@supabase/ssr` | **Medio-Alto** | Alta | `apps/web/lib/supabase.ts`, `apps/web/lib/auth-context.tsx` |
| **SEC-04** | Enrutamiento administrativo basado en el texto del correo (`email.includes("admin")`) | **Medio** | Media | `apps/web/app/(auth)/iniciar-sesion/page.tsx` (L40-44) |
| **SEC-05** | Fallback de URL y Anon Key a valores placeholder en producción | **Bajo** | Media | `apps/web/lib/supabase.ts` (L17-20) |
| **SEC-06** | Inexistencia de suites de pruebas automatizadas de seguridad y regresión | **Medio** | Media | Raíz del proyecto / `apps/web` |
| **SEC-07** | Bóveda documental almacena registros en base de datos sin validar archivos reales en Storage | **Informativo / Calidad** | Baja | `apps/web/components/software/documentos-view.tsx` |

---

## 3. Detalle de los Hallazgos

---

### SEC-01: Protección de Rutas Ejecutada Exclusivamente en el Cliente

- **Nivel de Riesgo:** **Alto**
- **Impacto Potencial:** Exposición temporal de código y estructura visual en el navegador antes de que el script de redirección se complete. Si bien los datos sensibles están protegidos en la base de datos por RLS, la interfaz de administración o software privado se renderiza brevemente en el cliente sin autenticación validada por el servidor.
- **Evidencia en Código:**
  En [`apps/web/app/(software)/layout.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/(software)/layout.tsx) (L18-26):
  ```typescript
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/iniciar-sesion");
      } else if (user.role === "patient") {
        router.push("/portal-paciente");
      }
    }
  }, [user, loading, router]);
  ```
  No existe archivo `middleware.ts` en la raíz de `apps/web/`.
- **Recomendación de Mitigación:**
  1. Instalar `@supabase/ssr` en `apps/web`.
  2. Implementar `middleware.ts` en la raíz de `apps/web/` para inspeccionar la sesión en cookies seguras HttpOnly antes de servir cualquier página privada.
  3. Redirigir en el servidor (código HTTP 307/308) a `/iniciar-sesion`.

---

### SEC-02: Asignación por Defecto de Rol `'owner'` ante Fallos de Perfil

- **Nivel de Riesgo:** **Alto**
- **Impacto Potencial:** Escalada de privilegios a nivel de frontend. Si un usuario autenticado no cuenta aún con un registro en la tabla `profiles` (o si ocurre un timeout de red al consultar PostgREST), el código del frontend le asigna inmediatamente `role: "owner"`.
- **Evidencia en Código:**
  En [`apps/web/lib/auth-context.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/auth-context.tsx) (L61-69 y L70-78):
  ```typescript
  } else {
    // Usuario autenticado pero sin registro en profiles aún
    setUser({
      id: authUserId,
      email: email,
      full_name: email.split("@")[0],
      role: "owner", // <-- Fallback a owner
    });
  }
  ```
- **Recomendación de Mitigación:**
  Asignar el rol mínimo restrictivo (`"patient"` o `null`) y bloquear la navegación hacia el entorno clínico hasta que el perfil esté debidamente verificado e indexado en la base de datos.

---

### SEC-03: Almacenamiento de Sesión en `localStorage` (Riesgo XSS)

- **Nivel de Riesgo:** **Medio-Alto**
- **Impacto Potencial:** El cliente de `@supabase/supabase-js` configurado con `persistSession: true` en el navegador almacena el JWT y el refresh token en `window.localStorage`. Cualquier vulnerabilidad XSS introducida mediante una dependencia de terceros o inyección de contenido permitiría a un atacante sustraer el token y realizar consultas a la API de Supabase en nombre del terapeuta.
- **Evidencia en Código:**
  En [`apps/web/lib/supabase.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/supabase.ts) (L17-25):
  ```typescript
  export const supabase = createClient(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseKey || "placeholder-anon-key",
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
  ```
- **Recomendación de Mitigación:**
  Configurar el almacenamiento de sesiones mediante cookies HttpOnly utilizando el paquete oficial `@supabase/ssr`.

---

### SEC-04: Enrutamiento Administrativo Basado en Subcadena de Correo Electrónico

- **Nivel de Riesgo:** **Medio**
- **Impacto Potencial:** Si un usuario común se registra con un correo que contiene la palabra "admin" (ej. `pedro.administrador@gmail.com`), la lógica del formulario de inicio de sesión lo redirige a la consola `/admin` en lugar de enviarlo a su `/dashboard`. Aunque la página `/admin` valida el rol en su `useEffect`, la redirección inicial produce una experiencia inconsistente y una validación de seguridad débil en el cliente.
- **Evidencia en Código:**
  En [`apps/web/app/(auth)/iniciar-sesion/page.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/(auth)/iniciar-sesion/page.tsx) (L40-44):
  ```typescript
  // Check role if admin
  if (email.toLowerCase().includes("admin")) {
    router.push("/admin");
  } else {
    router.push("/dashboard");
  }
  ```
- **Recomendación de Mitigación:**
  Evaluar el rol verificado (`user.role === 'superadmin' || user.role === 'admin'`) recuperado de `profiles` en lugar de inspeccionar la cadena del correo electrónico.

---

### SEC-05: Fallback de Conexión a Valores Placeholder

- **Nivel de Riesgo:** **Bajo**
- **Impacto Potencial:** Si faltan las variables de entorno en producción, el cliente inicializa una conexión hacia `https://placeholder-project.supabase.co` en lugar de fallar de manera controlada y descriptiva. Esto fue introducido para evitar caídas en el paso de compilación (`next build`), pero puede enmascarar errores de configuración en tiempo de ejecución.
- **Evidencia en Código:**
  En [`apps/web/lib/supabase.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/supabase.ts) (L17-20).
- **Recomendación de Mitigación:**
  Restringir el uso de placeholders exclusivamente a entornos donde `process.env.NODE_ENV === 'test'` o durante el proceso estático de compilación sin conexión a red.

---

### SEC-06: Inexistencia de Pruebas Automatizadas

- **Nivel de Riesgo:** **Medio**
- **Impacto Potencial:** Riesgo elevado de regresiones en las políticas de seguridad RLS y en los cálculos clínicos. No hay pruebas unitarias ni de integración que certifiquen que un usuario del Centro A no pueda leer pacientes del Centro B.
- **Recomendación de Mitigación:**
  Incorporar una suite de pruebas de RLS utilizando `pgTAP` o tests de integración con Vitest / Playwright que validen los escenarios de autorización multi-inquilino.

---

## 4. Auditoría de Políticas RLS y Secreto Profesional

Se revisó minuciosamente el archivo canónico de migraciones [`supabase/migrations/20261003000000_initial_schema.sql`](file:///c:/Users/User/Desktop/Synkro/supabase/migrations/20261003000000_initial_schema.sql):

1. **Aislamiento Multi-Tenant:** **Correcto**. Todas las consultas a `patients`, `appointments`, `sessions` y `patient_files` están filtradas por la función `is_member_of(organization_id)`.
2. **Secreto Profesional en Sesiones:** **Correcto a nivel de DB**. La política `sessions_select_policy` exige explícitamente:
   ```sql
   public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'superadmin'])
   ```
   Esto asegura que usuarios con roles de menor privilegio (`assistant`, `patient`) no puedan consultar notas clínicas a través de la API, aun cuando manipulen las peticiones HTTP del navegador.
3. **Storage RLS:** **Correcto a nivel de SQL**. Las políticas sobre `storage.objects` para el bucket `patient-files` validan la pertenencia del paciente a la organización del usuario autenticado. Sin embargo, como se documentó, el frontend no invoca el API de subida a Storage.

