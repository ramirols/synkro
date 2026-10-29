# SYNKRO — Flujo de Desarrollo Local y Despliegue con Supabase

> **Guía Operativa y Flujo de Trabajo Técnico**  
> **Producto:** Synkro (VelyonSoft)  
> **Fecha de Auditoría:** Octubre 2026

---

## 1. Requisitos de Infraestructura y Entorno

Para operar y desarrollar en Synkro se requiere el siguiente software instalado en la máquina anfitriona:

1. **Node.js:** Versión 20.x o superior (recomendado LTS v20 o v22).
2. **pnpm:** Versión 10.x (especificado en `package.json`: `pnpm@10.28.0`).
3. **Docker Desktop:** Activo y corriendo (imprescindible para el stack local de Supabase).
4. **Supabase CLI:** Versión 2.x o superior (`supabase`).

---

## 2. Comandos Reales Verificados en el Repositorio

### 2.1 En la Raíz del Monorepo (`package.json`)

| Comando | Definición en `package.json` | Propósito |
| :--- | :--- | :--- |
| `pnpm run dev` | `supabase start && pnpm --filter web dev` | Inicia contenedores Docker de Supabase y arranca Next.js en `http://localhost:3000`. |
| `pnpm run supabase:start` | `supabase start` | Levanta únicamente los servicios Docker de Supabase. |
| `pnpm run down` | `supabase stop` | Detiene los contenedores locales de Supabase. |
| `pnpm run build` | `pnpm --filter web build` | Compila la aplicación web para producción. |
| `pnpm run lint` | `pnpm --filter web lint` | Ejecuta el análisis estático de ESLint en `apps/web`. |

### 2.2 En el Workspace de la Aplicación Web (`apps/web/package.json`)

| Comando | Definición en `package.json` | Propósito |
| :--- | :--- | :--- |
| `pnpm --filter web dev` | `next dev` | Inicia el servidor de desarrollo de Next.js (con Turbopack). |
| `pnpm --filter web build` | `next build` | Genera la compilación de producción de Next.js. |
| `pnpm --filter web start` | `next start` | Inicia el servidor Node.js de producción. |
| `pnpm --filter web lint` | `eslint` | Ejecuta ESLint con la configuración de `eslint.config.mjs`. |

---

## 3. Configuración del Entorno Local

### 3.1 Puertos y Servicios de Supabase Local

Definidos en [`supabase/config.toml`](file:///c:/Users/User/Desktop/Synkro/supabase/config.toml):

| Servicio | Puerto Local | URL / Endpoint |
| :--- | :--- | :--- |
| **API REST / PostgREST** | `54321` | `http://127.0.0.1:54321` |
| **Base de Datos PostgreSQL** | `54322` | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| **Supabase Studio (Dashboard Local)** | `54323` | `http://127.0.0.1:54323` |
| **Inbucket (Servidor de correos de prueba)** | `54324` | `http://127.0.0.1:54324` |
| **Shadow DB (Para cálculo de diffs)** | `54320` | Uso interno de la CLI de Supabase |

### 3.2 Configuración de Variables de Entorno

Crear el archivo `apps/web/.env.local` con las credenciales que imprime el comando `supabase start`:

```env
# URL de la API de Supabase local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# Llave anónima pública local (anon key generada por la CLI de Supabase)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
```

> [!NOTE]
> Observa que el cliente [`apps/web/lib/supabase.ts`](file:///c:/Users/User/Desktop/Synkro/apps/web/lib/supabase.ts) lee la variable `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Si en producción tu proveedor entrega `NEXT_PUBLIC_SUPABASE_ANON_KEY`, debes agregar ambas o actualizar la referencia en el código.

---

## 4. Flujo de Trabajo con Migraciones de Base de Datos

El ciclo de desarrollo recomendado para cambios en el esquema es:

```mermaid
flowchart LR
    A["1. Modificar DB local<br/>(Studio o SQL)"] --> B["2. Generar Diff<br/>(supabase db diff)"]
    B --> C["3. Crear Migración<br/>(supabase/migrations)"]
    C --> D["4. Probar en Local<br/>(supabase db reset)"]
    D --> E["5. Commit a Git<br/>(Control de versiones)"]
    E --> F["6. Despliegue Cloud<br/>(supabase db push)"]
```

### Paso a Paso Operativo:

1. **Iniciar Supabase Local:**
   ```bash
   pnpm run supabase:start
   ```
2. **Aplicar o verificar migraciones pendientes:**
   ```bash
   supabase migration list
   ```
3. **Realizar cambios en el esquema local:**  
   Se pueden probar cambios en Supabase Studio (`http://127.0.0.1:54323`) o mediante clientes SQL como DBeaver / psql.
4. **Extraer el diff hacia un nuevo archivo de migración:**
   ```bash
   supabase db diff -f nombre_del_cambio
   ```
   Esto creará un archivo con marca de tiempo en `supabase/migrations/<timestamp>_nombre_del_cambio.sql`.
5. **Comprobar la migración desde cero (Prueba de integridad):**
   ```bash
   supabase db reset
   ```
   *Efecto:* Reinicia la base de datos local, aplica todas las migraciones en orden cronológico y ejecuta `supabase/seed.sql`.

---

## 5. Procedimientos de Backup y Recuperación

### 5.1 Estado Actual en el Repositorio
En la carpeta [`supabase/archive/`](file:///c:/Users/User/Desktop/Synkro/supabase/archive/) existen respaldos y scripts históricos:
- `backup_synkro_cloud_ready.sql`: Volcado completo de esquema preparado para la nube.
- `backup_synkro_data.sql`: Volcado de datos de prueba/demo.
- `roles_and_users.sql`: Script de creación manual de usuarios de prueba para admin, psicólogo y paciente.

### 5.2 Procedimiento de Respaldo Recomendado (Propuesta Operativa)

Para realizar copias de seguridad de la base de datos de producción antes de aplicar cambios estructurales:

1. **Backup del Esquema y Datos Remotos (CLI):**
   ```bash
   supabase db dump --project-ref <PROJECT_ID> -f backup_$(date +%Y%m%d).sql
   ```
2. **Backup solo de datos:**
   ```bash
   supabase db dump --project-ref <PROJECT_ID> --data-only -f backup_data_$(date +%Y%m%d).sql
   ```
3. **Restauración en caso de fallo:**
   ```bash
   psql -h aws-0-<region>.pooler.supabase.com -U postgres.<PROJECT_ID> -d postgres -f backup_<fecha>.sql
   ```

---

## 6. Lista de Verificación (Checklist) para Promoción a Producción

### Verificaciones Previas al Despliegue:
- [ ] Todas las nuevas tablas y columnas están respaldadas por una migración formal en `supabase/migrations/`.
- [ ] Las políticas RLS están habilitadas en cada tabla nueva y probadas contra los roles correspondientes.
- [ ] La compilación estática (`pnpm run build`) finaliza exitosamente sin errores de TypeScript ni de bundler.
- [ ] Las variables de entorno de producción (`NEXT_PUBLIC_SUPABASE_URL` y la clave anónima) están configuradas en la plataforma de alojamiento (ej. Vercel).
- [ ] No existen credenciales ni claves privadas hardcodeadas en los archivos del repositorio.

### Verificaciones Posteriores al Despliegue:
- [ ] Acceder a `/iniciar-sesion` y verificar autenticación contra Supabase Auth en la nube.
- [ ] Crear un paciente de prueba y verificar que se inserte con el `organization_id` correcto del usuario.
- [ ] Intentar consultar datos desde una cuenta de otra organización para certificar el aislamiento multi-inquilino de RLS.
- [ ] Comprobar que las rutas `/demo` y `/demo/*` sigan funcionando de forma autónoma sin impactar la base de datos de producción.

