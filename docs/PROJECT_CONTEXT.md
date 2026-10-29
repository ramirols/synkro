# SYNKRO — Contexto General del Proyecto y Guía Arquitectónica

> **Documento Maestro para Asistentes de IA y Desarrolladores**  
> **Producto:** Synkro (por VelyonSoft)  
> **Propósito:** Plataforma integral de gestión clínica y administrativa orientada a psicólogos independientes y centros de salud mental en Perú y Latinoamérica.  
> **Fecha de Auditoría:** Octubre 2026  
> **Estado de Producción:** Fase piloto / Transición a despliegue Cloud con aislamiento demo en cliente.

---

## 1. Visión General del Producto

Synkro es un software como servicio (SaaS) concebido para digitalizar y simplificar la gestión clínica y administrativa de profesionales de la salud mental (psicoterapeutas individuales, centros clínicos y consultorios multidisciplinarios). Su propuesta de valor se enfoca en el cumplimiento ético del secreto profesional (conforme a las directrices del Colegio de Psicólogos del Perú - C.Ps.P. y la Ley N° 28369), la reducción de fricción operativa en citas y sesiones, y la preservación de notas clínicas privadas mediante una doble capa documental.

El sistema contempla dos entornos de ejecución claramente diferenciados en el código:
1. **Modo Producción (`/dashboard`, `/pacientes`, `/agenda`, etc.):** Conectado directamente a PostgreSQL a través de Supabase, requiriendo autenticación por JWT y control de acceso multi-inquilino mediante Row Level Security (RLS).
2. **Modo Demostración (`/demo`, `/demo/*`):** Completamente aislado del backend, operando en memoria y `localStorage` del navegador sin persistir datos en la base de datos real.

---

## 2. Stack Tecnológico Real Verificado

A partir de la inspección directa de los archivos de configuración (`package.json`, `pnpm-workspace.yaml`, `supabase/config.toml` y dependencias instaladas), el stack exacto está compuesto por:

| Capa | Tecnología / Paquete | Versión Verificada | Observaciones |
| :--- | :--- | :--- | :--- |
| **Framework Web** | Next.js (App Router) | `16.3.6` | Modo Turbopack configurado en desarrollo; `next.config.ts` incluye rewrite de `/software/:path*` a `/:path*`. |
| **Librería UI** | React / React DOM | `19.2.8` | React 19 con componentes de cliente (`"use client"`) dominantes en el área privada. |
| **Lenguaje** | TypeScript | `^5` (5.x) | Modo estricto habilitado (`"strict": true` en `tsconfig.json`). |
| **Estilos** | Tailwind CSS 4 | `^4` (`@tailwindcss/postcss`) | Sin `tailwind.config.js` tradicional; integración vía `@tailwindcss/postcss` y CSS en `app/globals.css`. |
| **Componentes UI** | Shadcn UI / `@base-ui/react` | `@base-ui/react ^1.8.0` | Íconos de `lucide-react ^1.47.0`, animaciones con `motion ^13.4.2` y transiciones con `next-view-transitions ^0.3.5`. |
| **Gestor de Paquetes** | pnpm | Monorepo (`pnpm-workspace.yaml`) | Workspace en raíz que gestiona `apps/*` y `packages/*`. `packageManager: pnpm@10.28.0` / lockfile pnpm v9/10. |
| **Backend & DB** | Supabase (PostgreSQL 17) | CLI v2.x / `@supabase/supabase-js ^2.117.2` | Base de datos relacional con RLS, Auth GoTrue, Storage S3 y Studio local vía Docker. |
| **Validación & Formularios** | Zod + React Hook Form | `zod ^4.6.5`, `react-hook-form ^7.88.0` | Esquemas de validación de entradas. |
| **Fechas** | Date-fns | `^4.4.0` | Formateo y utilitarios temporales en agenda y citas. |

---

## 3. Estructura Real del Monorepo

```text
Synkro/
├── .git/                               # Control de versiones Git
├── apps/
│   └── web/                            # Aplicación principal Next.js 16 (App Router)
│       ├── .env.local                  # Variables de entorno locales (NO versionar)
│       ├── AGENTS.md                   # Instrucciones auto-generadas por Next dev
│       ├── CLAUDE.md                   # Puntero a AGENTS.md
│       ├── components.json             # Configuración del CLI de Shadcn UI (base-nova)
│       ├── eslint.config.mjs           # Reglas ESLint (Core Web Vitals + TypeScript)
│       ├── next.config.ts              # Configuración de Turbopack y URL rewrites
│       ├── package.json                # Dependencias específicas de la app web
│       ├── postcss.config.mjs          # Plugin @tailwindcss/postcss
│       ├── tsconfig.json               # Configuración TypeScript (alias @/* -> ./*)
│       ├── app/                        # Rutas y páginas de Next.js
│       │   ├── (auth)/                 # Rutas de autenticación (iniciar-sesion, registrarse)
│       │   ├── (Inicio)/               # Landing page y marketing público (SEO, precios, seguridad)
│       │   ├── (software)/             # Software clínico en producción (dashboard, agenda, pacientes...)
│       │   ├── admin/                  # Consola de administración central para Velyon
│       │   ├── demo/                   # Entorno interactivo aislado (100% localStorage)
│       │   ├── portal-paciente/        # Espacio del paciente (vista preliminar de tareas y citas)
│       │   ├── globals.css             # Directivas Tailwind 4 y variables CSS
│       │   └── layout.tsx              # Root Layout global (AuthProvider + ViewTransitions)
│       ├── components/                 # Componentes React
│       │   ├── dashboard/              # Tarjetas heredadas (huérfanas/sin importar)
│       │   ├── inicio/                 # Header, footer y widgets de landing pública
│       │   ├── patients/               # Tablas heredadas (huérfanas/sin importar)
│       │   ├── software/               # Vistas maestras reutilizables (dashboard, agenda, pacientes, etc.)
│       │   └── ui/                     # Primitivas Shadcn UI / Base UI
│       ├── hooks/                      # Custom hooks (use-mobile.ts)
│       └── lib/                        # Lógica de datos, adaptadores y contextos
│           ├── auth-context.tsx        # Contexto de autenticación cliente con Supabase Auth
│           ├── clinical-context.tsx    # Proveedor de servicio clínico (Demo vs Producción)
│           ├── clinical-data.ts        # Re-export retrocompatible
│           ├── supabase.ts             # Instancia singleton del cliente de Supabase
│           ├── utils.ts                # Utilidades de clases (cn de clsx + twMerge)
│           ├── demo/                   # Motor de almacenamiento mock (demo-storage.ts)
│           ├── supabase/               # Implementación real conectada a Postgres (clinical-data.ts)
│           └── types/                  # Definiciones TypeScript de entidades clínicas
├── supabase/
│   ├── config.toml                     # Configuración de servicios locales (API 54321, DB 54322, Studio 54323)
│   ├── seed.sql                        # Script de inicialización (reservado para catálogos limpios)
│   ├── migrations/                     # Migraciones canónicas de base de datos
│   │   └── 20261003000000_initial_schema.sql  # Esquema canónico único completo
│   ├── archive/                        # Respaldo de esquemas históricos y scripts de migración Cloud
│   │   ├── 20261001210000_initial_schema.sql
│   │   ├── backup_synkro_cloud_ready.sql
│   │   ├── backup_synkro_data.sql
│   │   ├── demo_rls.sql
│   │   ├── fix_recursion_rls.sql
│   │   └── roles_and_users.sql
│   └── snippets/                       # Snippets SQL vacíos
├── package.json                        # Scripts raíz del monorepo
├── pnpm-lock.yaml                      # Lockfile global de dependencias
├── pnpm-workspace.yaml                 # Definición de workspaces
└── .gitignore                          # Reglas de exclusión Git
```

---

## 4. Arquitectura de Datos y Abstracción del Servicio

Synkro utiliza el patrón **Service / Adapter** soportado por React Context para permitir que las mismas interfaces visuales operen indistintamente contra datos simulados o contra Supabase PostgreSQL sin duplicar código de presentación:

```
                            ┌───────────────────────────────────┐
                            │      Vistas de Presentación       │
                            │   (Agenda, Pacientes, Sesiones)   │
                            └─────────────────┬─────────────────┘
                                              │ useClinicalData()
                                              ▼
                            ┌───────────────────────────────────┐
                            │     ClinicalDataProvider (lib)    │
                            │  Evalúa modo: "demo" | "production"│
                            └─────────┬───────────────┬─────────┘
                                      │               │
                 Si mode === "demo"   │               │ Si mode === "production"
                                      ▼               ▼
           ┌────────────────────────────┐   ┌───────────────────────────────┐
           │   DemoClinicalDataService  │   │ ProductionClinicalDataService │
           │   (lib/demo/clinical-data) │   │ (lib/supabase/clinical-data)  │
           └──────────────┬─────────────┘   └───────────────┬───────────────┘
                          │                                 │
                          ▼                                 ▼
           ┌────────────────────────────┐   ┌───────────────────────────────┐
           │        DemoStorage         │   │       supabase client         │
           │       (localStorage)       │   │     (@supabase/supabase-js)   │
           └────────────────────────────┘   └───────────────┬───────────────┘
                                                            │ REST / PostgREST
                                                            ▼
                                            ┌───────────────────────────────┐
                                            │      Supabase PostgreSQL      │
                                            │    (Row Level Security RLS)   │
                                            └───────────────────────────────┘
```

La interfaz unificada está formalizada en [`apps/web/lib/types/clinical.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/types/clinical.ts) mediante el contrato `IClinicalDataService`.

---

## 5. Autenticación y Autorización

- **Mecanismo:** Supabase Auth gestionado del lado del cliente vía `supabase.auth.signInWithPassword`, `supabase.auth.signUp` y `supabase.auth.onAuthStateChange`.
- **Almacenamiento de Sesión:** `localStorage` nativo gestionado por `@supabase/supabase-js`.
- **Protección de Rutas:** Se realiza **exclusivamente en el navegador** a través de un `useEffect` en [`apps/web/app/(software)/layout.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/(software)/layout.tsx) y [`apps/web/app/admin/page.tsx`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/admin/page.tsx). No existe `middleware.ts` en Next.js.
- **Roles Definidos en Base de Datos:**
  - `superadmin`: Administrador global de VelyonSoft con acceso a todas las organizaciones y panel central.
  - `admin`: Administrador de clínica o centro psicológico.
  - `owner`: Psicólogo titular creador de la organización/consultorio.
  - `psychologist`: Terapeuta colegiado adscrito a una clínica.
  - `assistant`: Personal de recepción/secretaría (sin acceso a notas SOAP confidenciales).
  - `patient`: Paciente con acceso limitado al portal.

---

## 6. Variables de Entorno Requeridas

Las variables deben residir en `apps/web/.env.local` (para desarrollo local) y en las variables de entorno de la plataforma de hosting (e.g., Vercel, Supabase Cloud):

| Variable | Propósito | Dónde se consume | Verificación en Código |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de la API del proyecto Supabase (local o cloud) | `apps/web/lib/supabase.ts` | Si falta, emite advertencia en consola y usa placeholder para no romper el build. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Llave anónima pública (`anon key`) de Supabase | `apps/web/lib/supabase.ts` | **Nota:** El código lee `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Si el entorno usa la nomenclatura estándar `NEXT_PUBLIC_SUPABASE_ANON_KEY`, se debe mapear o ajustar. |

> [!CAUTION]
> Nunca expongas la clave `service_role` de Supabase en variables con prefijo `NEXT_PUBLIC_`. En el repositorio actual no se utiliza la clave `service_role` en el frontend, lo cual es correcto.

---

## 7. Reglas de Negocio Verificadas en el Código

1. **Creación Automática de Organización:** Al registrarse un nuevo usuario mediante `auth.users`, el trigger SQL `create_default_workspace` genera automáticamente una fila en `organizations` y asocia al usuario en `organization_members` con rol `owner`.
2. **Doble Capa en Sesiones Clínicas:** La tabla `sessions` contiene dos campos principales de texto: `session_summary` (resumen clínico formal) y `private_notes` (notas confidenciales de contratransferencia). Las políticas RLS restringen la lectura de ambos campos a roles terapéuticos (`owner`, `psychologist`, `admin`, `superadmin`), excluyendo a `assistant` y `patient`.
3. **Cierre Automático de Citas:** Al crear una sesión clínica vinculada a un `appointment_id`, el método `ProductionClinicalDataService.createSession` actualiza el estado de dicha cita a `"completed"`.
4. **Independencia del Modo Demo:** Todas las operaciones realizadas bajo `/demo` no tocan la red ni la base de datos; los identificadores generados llevan el prefijo `pat-`, `app-`, `sess-`, `file-` y la organización fija `org-demo-001`.

---

## 8. Convenciones de Desarrollo para Agentes y Desarrolladores

Para preservar la integridad del software al implementar cambios futuros:
- **No mezclar modos:** Toda nueva funcionalidad clínica debe respetar la interfaz `IClinicalDataService` e implementarse tanto en `DemoClinicalDataService` como en `ProductionClinicalDataService`.
- **Rutas y vistas desacopladas:** Las páginas bajo `app/(software)/` y `app/demo/` deben seguir siendo contenedores ligeros que instancian las vistas correspondientes ubicadas en `components/software/*-view.tsx`.
- **Consistencia de Alias:** Usar `@/*` para importar desde la raíz de `apps/web/` (`@/lib/...`, `@/components/...`).
- **No modificar migraciones ya aplicadas:** Cualquier cambio en la base de datos debe redactarse como una nueva migración incremental en `supabase/migrations/` con timestamp secuencial.
- **Protección de datos sensibles:** No loguear notas SOAP, identificadores de pacientes ni diagnósticos en la consola del navegador o en logs de servidor.
- **Comandos de ejecución:** Utilizar siempre `pnpm` desde la raíz para correr scripts delegados (`pnpm --filter web dev`, `pnpm --filter web build`).

