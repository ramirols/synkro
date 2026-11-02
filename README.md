# Synkro by VelyonSoft — Clinical SaaS for Mental Health

<div align="center">

![Synkro Platform](https://synkro.velyonsoft.com/og-image.png)

**Plataforma Integral de Gestión Clínica, Historias Digitales y Notas SOAP para Psicólogos y Centros de Salud Mental en el Perú y Latinoamérica.**

[![Status](https://img.shields.io/badge/Status-Release%20Candidate%20(RC)-emerald.svg)](https://synkro.velyonsoft.com)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015%20%2B%20RLS-3ecf8e.svg)](https://supabase.com/)
[![Test Suite](https://img.shields.io/badge/Tests-82%2F82%20Passing%20(100%25)-brightgreen.svg)](#suite-de-pruebas-automatizadas)
[![Legal Compliance](https://img.shields.io/badge/Compliance-Ley%2028369%20%7C%20Ley%2029733%20%7C%20INDECOPI-purple.svg)](#marco-legal-y-cumplimiento-normativo)

[Sitio Web Oficial](https://synkro.velyonsoft.com) • [Demo Interactiva](https://synkro.velyonsoft.com/demo) • [Precios & Yape](https://synkro.velyonsoft.com/precios) • [Soporte WhatsApp](https://wa.me/51997676432)

</div>

---

## 📋 Tabla de Contenidos

1. [Visión del Proyecto](#-visión-del-proyecto)
2. [Arquitectura Tecnológica](#-arquitectura-tecnológica)
3. [Seguridad y Aislamiento Multi-Tenant (RLS)](#-seguridad-y-aislamiento-multi-tenant-rls)
4. [Módulos y Funcionalidades del Software](#-módulos-y-funcionalidades-del-software)
5. [Modelo Comercial y Planes (2026)](#-modelo-comercial-y-planes-2026)
6. [Marco Legal y Normativa Peruana](#-marco-legal-y-normativa-peruana)
7. [Estructura del Proyecto](#-estructura-del-proyecto)
8. [Guía de Instalación y Ejecución Local](#-guía-de-instalación-y-ejecución-local)
9. [Suite de Pruebas Automatizadas (82/82)](#-suite-de-pruebas-automatizadas-8282)
10. [Optimización SEO y Soporte LLMs](#-optimización-seo-y-soporte-llms)
11. [Créditos y Licencia](#-créditos-y-licencia)

---

## 🎯 Visión del Proyecto

**Synkro** es una solución de software como servicio (SaaS) concebida y desarrollada por **VelyonSoft S.A.C.** para responder a los desafíos reales de la práctica psicológica moderna en el Perú y la región latinoamericana.

A diferencia de los sistemas hospitalarios genéricos y burocráticos, Synkro está diseñado exclusivamente para el flujo de trabajo de la salud mental:
- **Respeto absoluto al secreto profesional:** Doble capa de notas clínicas donde las reflexiones privadas y de contratransferencia nunca son visibles para terceros.
- **Autonomía técnica y clínica:** Diseñado según los códigos éticos del Colegio de Psicólogos del Perú (C.Ps.P.).
- **Accesibilidad y transparencia comercial:** Sin cargos sorpresa ni cobros automáticos en tarjetas extranjeras. Activación 100% transparente en soles peruanos (PEN) mediante Yape y Transferencia Bancaria BCP.
- **Continuidad asistencial:** Si una cuenta no renueva su suscripción, jamás pierde el acceso a sus expedientes históricos; la custodia médica del paciente está garantizada de por vida.

---

## 🏗 Arquitectura Tecnológica

El proyecto está estructurado como un monorepo administrado con **pnpm workspaces**:

```
Synkro/
├── apps/
│   └── web/                   # Aplicación Next.js 16 (App Router + Turbopack)
├── supabase/                  # Migraciones SQL, esquemas relacionales y seed data
├── scripts/                   # Suites de tests automatizados (Fases 1, 2, 3 y 4)
├── docs/                      # Documentación arquitectónica y guías de lanzamiento
├── public/                    # Manifiestos, robots, sitemap y llms.txt
└── README.md                  # Especificación maestra del proyecto
```

### Stack de Componentes

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js 16](https://nextjs.org/) (Turbopack) | App Router, Server Components y Rendering híbrido de alto rendimiento. |
| **Biblioteca UI** | [React 19](https://react.dev/) | React Compiler, Hooks modernos y Server Actions. |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) | Tipado estricto en modelos de datos, servicios y componentes. |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com/) | Sistema de diseño de última generación con CSS nativo y tokens de color. |
| **Componentes UI** | [shadcn/ui](https://ui.shadcn.com/) | Primitivos accesibles con Radix UI (Dialogs, Tooltips, Selects, Sidebar, Sonner). |
| **Base de Datos** | [PostgreSQL 15](https://www.postgresql.org/) | RDBMS relacional con soporte nativo de extensiones (`uuid-ossp`, `pgcrypto`). |
| **Backend & Auth** | [Supabase](https://supabase.com/) | Motor de autenticación, Row Level Security (RLS) y almacenamiento cifrado. |
| **Tipografía** | Manrope Variable | Fuente moderna, legible y optimizada para lectura de expedientes médicos. |
| **Iconografía** | [Lucide React](https://lucide.dev/) | Iconografía minimalista y consistente (sin emojis ni fuentes decorativas). |

### Capa de Abstracción de Datos (`IClinicalDataService`)

Synkro implementa el patrón de inversión de dependencias a través de la interfaz canónica `IClinicalDataService` ([`clinical-data-service.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/services/clinical-data-service.ts)):

1. **`DemoClinicalDataService`:** Servicio en memoria completamente desacoplado de la base de datos. Permite ejecutar la demostración comercial interactiva en `/demo` con pacientes simulados, notas SOAP y horario semanal sin requerir credenciales de Supabase.
2. **`ProductionClinicalDataService`:** Servicio transaccional conectado a Supabase Cloud / Local. Ejecuta consultas seguras filtradas automáticamente por el contexto de usuario autenticado y sus políticas RLS.

---

## 🔒 Seguridad y Aislamiento Multi-Tenant (RLS)

La seguridad clínica de Synkro no depende únicamente de validaciones en frontend, sino de **políticas criptográficas e inmutables de Row Level Security (RLS)** a nivel de motor de PostgreSQL.

```mermaid
graph TD
    User([Usuario / Psicólogo Autenticado]) -->|JWT con auth.uid| SupabaseAuth[Supabase Auth]
    SupabaseAuth --> PostgreSQLEngine[(PostgreSQL 15 Engine)]
    
    subgraph RLS_Isolation [Aislamiento Estricto por RLS]
        PostgreSQLEngine -->|clinic_id / tenant| T_Clinics[clinics & clinical_profiles]
        PostgreSQLEngine -->|tenant / professional_id| T_Patients[patients & appointments]
        PostgreSQLEngine -->|session_id & clinic_id| T_Notes[session_notes - SOAP Oficial]
        PostgreSQLEngine -->|author_id = auth.uid ONLY| T_PrivateNotes[session_private_notes - Bóveda Privada]
    end

    SuperAdmin([Superadministrador /admin]) -->|RLS Agregado| MetricsView[Métricas Comerciales & Suscripciones]
    MetricsView -.->|ACCESO DENEGADO (Ley 29733)| T_Patients
```

### Reglas Clave de Seguridad

1. **Aislamiento Multi-Tenant Estricto:** Cada registro de paciente, cita y consulta pertenece a un `clinic_id`. Un psicólogo o clínica jamás puede leer ni modificar expedientes pertenecientes a otro centro.
2. **Bóveda de Notas Privadas (Secreto Profesional Ley N° 28369):**
   - Las notas privadas de contratransferencia se almacenan en una tabla independiente (`session_private_notes`).
   - La política de PostgreSQL restringe la lectura y escritura exclusivamente al autor: `author_id = auth.uid()`.
   - **Resultado:** Ni el director de la clínica, ni los recepcionistas, ni los superadministradores pueden consultar las reflexiones íntimas del terapeuta.
3. **Custodia Criptográfica del Portal del Paciente:** El acceso a la vista pública de citas para pacientes se realiza mediante tokens criptográficos efímeros (SHA-256) generados por el terapeuta, sin requerir contraseñas vulnerables.
4. **Bóveda Psicométrica con URLs Firmadas:** Los archivos de pruebas (PDF, diagnósticos) se resguardan en un bucket privado de Supabase Storage. Se generan URLs temporales firmadas que expiran automáticamente en 15 minutos.

---

## 💻 Módulos y Funcionalidades del Software

### 1. Directorio de Pacientes y Fichas Clínicas
- Registro ágil de pacientes con motivo de consulta, contacto de emergencia y modalidad preferida.
- Ficha clínica integral (anamnesis, antecedentes médicos, consentimiento informado y diagnósticos).
- Generación instantánea de enlace seguro para el Portal del Paciente.

### 2. Horario Semanal y Agenda Visual
- Matriz interactiva de Lunes a Domingo de 08:00 a 20:00 con intervalos de 30 y 60 minutos.
- Soporte para doble modalidad:
  - **Presencial:** Asignación automática de consultorios físicos (Boxes de atención).
  - **Virtual / Telepsicología:** Generación e integración directa de enlaces de Google Meet.
- Estados de cita clínicos: *Programada*, *Confirmada*, *Completada*, *Cancelada* y *No Asistió*.

### 3. Notas Clínicas Estructuradas SOAP
- **S (Subjetivo):** Motivo de consulta referido, estado de ánimo y vivencias del paciente.
- **O (Objetivo):** Observación conductual, afecto congruente, lenguaje y nivel de atención.
- **A (Análisis):** Hipótesis de trabajo y progreso terapéutico.
- **P (Plan):** Acuerdos, tareas para la semana y fecha de la siguiente cita.
- **Plantillas basadas en evidencia:** Formularios preconfigurados para *Terapia Cognitivo-Conductual (TCC)*, *Terapia de Aceptación y Compromiso (ACT)* y *Psicoeducación Inicial*.

### 4. Bóveda Psicométrica de Archivos
- Carga de inventarios psicológicos (Beck BAI, Beck BDI-II, STAI, informes de derivación).
- Previsualizador in-app de documentos sin necesidad de descargar archivos a terminales locales públicos.
- Descarga segura mediante URLs firmadas con expiración criptográfica.

### 5. Portal Seguro del Paciente
- Interfaz limpia, optimizada para dispositivos móviles.
- El paciente consulta la fecha, hora y modalidad de sus próximas sesiones.
- Acceso directo al botón de Google Meet para sesiones virtuales.
- Consulta de documentos y tareas compartidas expresamente por el terapeuta.

### 6. Módulo de Centro Psicológico & Equipos
- Configuración de centros y clínicas con múltiples psicólogos (hasta 10 profesionales).
- Asignación y control de disponibilidad de Boxes de atención física para evitar sobreocupación.
- **Triage y Derivación Interna:** Flujo protocolizado para derivar pacientes entre psicólogos del equipo con resumen clínico confidencial (Clinical Handover).

### 7. Consola de Gobernanza Superadmin (`/admin`)
- Panel de control de salud comercial de la plataforma: número de centros, psicólogos registrados y distribución de suscripciones.
- Aprobación y activación administrativa de planes tras verificación de comprobantes Yape/BCP.
- **Blindaje Ético:** La consola no tiene acceso a nombres de pacientes, motivos de consulta ni historias clínicas (cumplimiento de Ley N° 29733 de Datos Personales).

---

## 💳 Modelo Comercial y Planes (2026)

Synkro ofrece una estructura comercial honesta, en moneda local (Soles peruanos - PEN), sin letras chicas ni suscripciones ocultas:

| Característica | Plan Gratuito | Plan Starter | Plan Professional | Clínica / Empresa |
| :--- | :---: | :---: | :---: | :---: |
| **Precio Mensual** | **S/ 0** | **S/ 49** | **S/ 89** | **S/ 189** |
| **Dirigido a** | Inicio / Exploración | Independiente | Práctica Consolidada | Clínicas & Centros |
| **Límite de Pacientes** | Hasta 5 activos | Hasta 20 activos | **Ilimitados** | **Ilimitados** |
| **Profesionales Titulares** | 1 psicólogo | 1 psicólogo | 1 psicólogo | **Hasta 10 psicólogos** |
| **Agenda & Horario Visual** | ✅ Incluido | ✅ Incluido | ✅ Incluido | ✅ Incluido |
| **Notas SOAP Estructuradas** | Básica | Estándar | Con Plantillas TCC/ACT | Con Plantillas TCC/ACT |
| **Doble Capa de Notas Privadas** | ❌ | ❌ | ✅ Incluido | ✅ Incluido |
| **Bóveda de Archivos y Tests** | ❌ | ❌ | ✅ Con Visor In-App | ✅ Con Visor In-App |
| **Boxes & Consultorios Físicos** | ❌ | ❌ | ❌ | ✅ Hasta 5 Boxes |
| **Derivaciones & Triage Interno** | ❌ | ❌ | ❌ | ✅ Flujo Formal |
| **Portal del Paciente** | ✅ Incluido | ✅ Incluido | ✅ Incluido | ✅ Incluido |
| **Canal de Activación** | Registro directo | Yape / Transferencia | Yape / Transferencia | Yape / Factura |

### Activación Transparente y Sin Tarjetas
- **Yape Comercial:** Número verificado **+51 997 676 432** a nombre de *VelyonSoft*.
- **Transferencia Bancaria:** Banco de Crédito del Perú (BCP).
- **Activación Administrativa:** El profesional remite la constancia por WhatsApp y el equipo activa el plan en minutos.

---

## ⚖️ Marco Legal y Normativa Peruana

Synkro ha sido desarrollado en estricto cumplimiento del marco jurídico de la República del Perú:

1. **Ley N° 28369 — Ley del Trabajo del Psicólogo:**
   - Reconoce la autonomía del profesional de la salud mental y la inviolabilidad del secreto profesional.
   - Las notas privadas de hipótesis y contratransferencia se encuentran aisladas a nivel de base de datos.
2. **Ley N° 29733 — Ley de Protección de Datos Personales:**
   - Tratamiento de datos sensibles de salud conforme a directivas de seguridad digital.
   - Respaldo a los derechos **ARCO** (Acceso, Rectificación, Cancelación y Oposición) a través del canal formal `soporte@velyonsoft.com`.
3. **Ley N° 29571 — Código de Protección y Defensa del Consumidor & D.S. N° 011-2011-PCM:**
   - Plataforma con **Libro de Reclamaciones Virtual** interactivo en [`/libro-de-reclamaciones`](https://synkro.velyonsoft.com/libro-de-reclamaciones).
   - Generación de código correlativo legal (`LRV-YYYY-XXXXX`) y compromiso de respuesta formal en un plazo máximo de **15 días hábiles**.

---

## 📁 Estructura del Proyecto

```
Synkro/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (Inicio)/                  # Páginas públicas de marketing y marco legal
│       │   │   ├── page.tsx               # Portada principal / Landing page
│       │   │   ├── funciones/page.tsx     # Demostración detallada de funciones
│       │   │   ├── precios/page.tsx       # Planes comerciales y pasarela Yape/BCP
│       │   │   ├── seguridad/page.tsx     # Cumplimiento C.Ps.P. y privacidad
│       │   │   ├── privacidad/page.tsx    # Política de Privacidad (Ley 29733)
│       │   │   ├── terminos/page.tsx      # Términos y Condiciones contractuales
│       │   │   └── libro-de-reclamaciones/# Libro de Reclamaciones Virtual (INDECOPI)
│       │   ├── (auth)/                    # Autenticación (Login, Registro, Password)
│       │   ├── (dashboard)/               # Software SaaS clínico autenticado
│       │   │   ├── dashboard/page.tsx     # Resumen clínico y métricas de práctica
│       │   │   ├── agenda/page.tsx        # Horario semanal visual interactivo
│       │   │   ├── pacientes/page.tsx     # Expedientes e historias digitales
│       │   │   ├── sesiones/page.tsx      # Registro de sesiones y notas SOAP
│       │   │   ├── boveda/page.tsx        # Bóveda psicométrica de archivos
│       │   │   ├── clinica/page.tsx       # Gestión de psicólogos del centro y boxes
│       │   │   └── perfil/page.tsx        # Perfil del psicólogo, clínica y plan
│       │   ├── demo/                      # Demo interactiva sin autenticación
│       │   ├── portal/paciente/[token]/   # Portal público seguro del paciente
│       │   ├── admin/                     # Consola superadmin de gobierno
│       │   ├── robots.ts                  # Configuración de rastreo para crawlers y bots
│       │   └── sitemap.ts                 # Mapa del sitio dinámico
│       ├── components/
│       │   ├── inicio/                    # Header y Footer públicos
│       │   ├── ui/                        # Primitivos shadcn/ui estilizados
│       │   └── app-sidebar.tsx            # Navegación del software con permisos por rol
│       ├── lib/
│       │   ├── services/                  # IClinicalDataService (Demo vs Supabase)
│       │   └── supabase/                  # Clientes de Supabase (browser y server)
│       └── public/
│           ├── llms.txt                   # Manifiesto conciso para motores LLM
│           └── llms-full.txt              # Especificación técnica exhaustiva para agentes
├── supabase/
│   ├── migrations/                        # Migraciones SQL de esquema, RLS y triggers
│   └── seed.sql                           # Datos semilla para pruebas locales
├── scripts/
│   ├── test-phase1.mjs                    # Tests de Registro, Auth y Aislamiento RLS
│   ├── test-phase2.mjs                    # Tests de Planes, Yape y Continuidad Asistencial
│   ├── test-phase3.mjs                    # Tests de Bóveda y Notas Privadas Aisladas
│   └── test-stabilization.mjs             # Tests de Portal de Paciente y Casos de Borde
└── docs/
    └── LAUNCH_PREPARATION_GUIDE.md        # Matriz de auditoría previa a lanzamiento
```

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 20 LTS o superior)
- [pnpm](https://pnpm.io/) (versión 9 o superior)
- [Docker Desktop](https://www.docker.com/) (para ejecutar Supabase localmente)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Paso 1: Clonar e Instalar Dependencias
```bash
git clone https://github.com/velyonsoft/synkro.git
cd synkro
pnpm install
```

### Paso 2: Iniciar Base de Datos Local de Supabase
```bash
npx supabase start
```
Esto levantará los contenedores de PostgreSQL 15, Auth, Storage y REST API en `http://127.0.0.1:54321`.

### Paso 3: Aplicar Migraciones y Seed
```bash
npx supabase db reset
```

### Paso 4: Configurar Variables de Entorno
Crea o verifica el archivo `apps/web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase-status
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-de-supabase-status
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Paso 5: Iniciar el Servidor de Desarrollo
```bash
pnpm --filter web dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Suite de Pruebas Automatizadas (82/82)

El proyecto cuenta con un arnés de pruebas automatizadas que valida la integridad de cada fase del desarrollo contra el contenedor local de PostgreSQL:

```bash
# Ejecutar todas las suites de validación
node scripts/test-phase1.mjs
node scripts/test-phase2.mjs
node scripts/test-phase3.mjs
node scripts/test-stabilization.mjs
```

### Resumen de Pruebas

| Suite | Archivo | Pruebas | Estado | Aspectos Auditados |
| :--- | :--- | :---: | :---: | :--- |
| **Fase 1** | `test-phase1.mjs` | **22 / 22** | ✅ Aprobado | Creación de cuentas, perfil clínico, aislamiento multi-tenant y creación de pacientes. |
| **Fase 2** | `test-phase2.mjs` | **21 / 21** | ✅ Aprobado | Límites de pacientes por plan (Free 5, Starter 20, Pro ∞), activación Yape y continuidad de lectura. |
| **Fase 3** | `test-phase3.mjs` | **24 / 24** | ✅ Aprobado | Aislamiento estricto de notas privadas (`author_id`), generación de URLs firmadas de bóveda. |
| **Fase 4** | `test-stabilization.mjs` | **15 / 15** | ✅ Aprobado | Tokens de portal del paciente, derivaciones éticas, control de boxes y RLS de superadmin. |
| **Total** | | **82 / 82** | **100%** | **Listo para Producción (Release Candidate)** |

---

## 🔍 Optimización SEO y Soporte LLMs

Synkro incorpora las mejores prácticas para indexación tradicional (Google, Bing) e indexación semántica para modelos de lenguaje:

- **[`llms.txt`](file:///c:/Users/User/Desktop/Synkro/apps/web/public/llms.txt):** Especificación condensada en lenguaje natural para agentes de inteligencia artificial y buscadores generativos.
- **[`llms-full.txt`](file:///c:/Users/User/Desktop/Synkro/apps/web/public/llms-full.txt):** Documentación técnica completa con modelos de datos, arquitectura de seguridad y catálogo de endpoints.
- **[`robots.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/robots.ts):** Directivas específicas permitiendo a Googlebot y bots de IA (`GPTBot`, `ClaudeBot`, `PerplexityBot`) indexar contenidos públicos y bloqueando rutas clínicas sensibles (`/dashboard`, `/pacientes`, `/sesiones`).
- **[`sitemap.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/app/sitemap.ts):** Generador de mapa del sitio con prioridades y frecuencias de actualización estructuradas.

---

## 👥 Créditos y Licencia

- **Diseño & Desarrollo:** [VelyonSoft S.A.C.](https://www.velyonsoft.com) — Soluciones de Software e Innovación Médica.
- **Contacto Comercial & Soporte:** WhatsApp [+51 997 676 432](https://wa.me/51997676432) • `soporte@velyonsoft.com`
- **Ubicación:** Lima, Perú.
- **Licencia:** Software Propietario. Todos los derechos reservados © 2026 VelyonSoft S.A.C.

