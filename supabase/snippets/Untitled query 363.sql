-- UUID
create extension if not exists "uuid-ossp";

-- búsqueda avanzada
create extension if not exists pg_trgm;

-- Perfil del usuario
create table public.profiles (

    id uuid primary key references auth.users(id)
    on delete cascade,

    full_name text,

    avatar_url text,

    role text default 'owner'
    check(
        role in (
            'owner',
            'psychologist',
            'assistant',
            'patient'
        )
    ),

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

-- Organizaciones (clínicas)
create table public.organizations (

    id uuid primary key default uuid_generate_v4(),

    name text not null,

    slug text unique not null,

    logo_url text,

    created_at timestamptz default now()

);

-- Miembros de la organización (relación de usuarios con las clínicas)
create table public.organization_members (

    id uuid primary key default uuid_generate_v4(),

    organization_id uuid
    references public.organizations(id)
    on delete cascade,

    user_id uuid
    references public.profiles(id)
    on delete cascade,


    role text not null
    check(
        role in(
            'owner',
            'psychologist',
            'assistant'
        )
    ),

    created_at timestamptz default now(),


    unique(
        organization_id,
        user_id
    )

);

-- Pacientes (tabla central)
create table public.patients (

    id uuid primary key default uuid_generate_v4(),


    organization_id uuid
    references public.organizations(id)
    on delete cascade,


    first_name text not null,

    last_name text not null,


    email text,

    phone text,


    birth_date date,


    gender text,


    notes text,


    created_at timestamptz default now()

);

-- Profesionales (Aunque el usuario sea psicólogo, necesitamos una entidad propia)
create table public.professionals (

    id uuid primary key default uuid_generate_v4(),

    organization_id uuid
    references public.organizations(id)
    on delete cascade,


    profile_id uuid
    references public.profiles(id)
    on delete cascade,


    specialty text,


    license_number text,


    bio text,


    created_at timestamptz default now()

);

-- Agenda (módulos principales)
create table public.appointments (

    id uuid primary key default uuid_generate_v4(),


    organization_id uuid
    references public.organizations(id)
    on delete cascade,


    patient_id uuid
    references public.patients(id)
    on delete cascade,


    professional_id uuid
    references public.professionals(id)
    on delete cascade,


    appointment_date date not null,


    start_time time not null,


    end_time time,


    status text default 'scheduled'
    check(
        status in(
            'scheduled',
            'completed',
            'cancelled',
            'no_show'
        )
    ),


    created_at timestamptz default now()

);

-- Sesiones psicológicas (Parte sencible, se separán resúmenes visibles y notas privadas)
create table public.sessions (

    id uuid primary key default uuid_generate_v4(),


    patient_id uuid
    references public.patients(id)
    on delete cascade,


    professional_id uuid
    references public.professionals(id)
    on delete cascade,


    appointment_id uuid
    references public.appointments(id)
    on delete set null,


    session_summary text,


    private_notes text,


    created_at timestamptz default now()

);

-- Archivos (subida de documentos, evaluaciones, informes)
create table public.patient_files (

    id uuid primary key default uuid_generate_v4(),


    patient_id uuid
    references public.patients(id)
    on delete cascade,


    file_name text,


    storage_path text,


    file_type text,


    created_at timestamptz default now()

);

-- Suscripciones (los planes que se realizarán para el cobro)
create table public.subscriptions (

    id uuid primary key default uuid_generate_v4(),


    organization_id uuid
    references public.organizations(id)
    on delete cascade,


    plan text default 'starter'
    check(
        plan in(
            'starter',
            'professional',
            'clinic'
        )
    ),


    status text default 'active',


    created_at timestamptz default now()

);

-- Auditoria (importante en sector salud)
create table public.audit_logs (

    id uuid primary key default uuid_generate_v4(),


    user_id uuid
    references public.profiles(id),


    action text,


    table_name text,


    record_id uuid,


    created_at timestamptz default now()

);

-- Creación de índices para velocidad
create index patients_search_idx
on public.patients
using gin(
(first_name || ' ' || last_name)
gin_trgm_ops
);


create index appointments_date_idx
on public.appointments(
appointment_date
);


create index sessions_patient_idx
on public.sessions(
patient_id
);

-- Activación de Row Level Security para las tablas
alter table public.profiles enable row level security;

alter table public.organizations enable row level security;

alter table public.organization_members enable row level security;

alter table public.patients enable row level security;

alter table public.professionals enable row level security;

alter table public.appointments enable row level security;

alter table public.sessions enable row level security;

alter table public.patient_files enable row level security;

alter table public.subscriptions enable row level security;

alter table public.audit_logs enable row level security;

-- Reglas para las vistas
-- profiles:
create policy "Usuarios pueden ver su perfil"
on public.profiles
for select
using (
auth.uid() = id
);

create policy "Usuarios pueden actualizar su perfil"
on public.profiles
for update
using (
auth.uid() = id
);

-- organizaciones
create policy "Ver organizaciones propias"
on public.organizations
for select
using (

exists (

select 1
from public.organization_members om

where om.organization_id = organizations.id

and om.user_id = auth.uid()

)

);

-- pacientes
create policy "Ver pacientes de mi organización"
on public.patients
for select
using (

exists (

select 1
from public.organization_members om

where om.organization_id = patients.organization_id

and om.user_id = auth.uid()

)

);

-- insersión de los pacientes
create policy "Crear pacientes"
on public.patients
for insert
with check (

exists (

select 1
from public.organization_members om

where om.organization_id = patients.organization_id

and om.user_id = auth.uid()

)

);

-- función (trigger) para que la tabla (profiles) no esté vacía
create or replace function public.handle_new_user()

returns trigger

language plpgsql

security definer

set search_path = public

as $$

begin

insert into public.profiles
(
    id,
    full_name,
    role
)

values
(
    new.id,
    coalesce(
        new.raw_user_meta_data->>'full_name',
        'Nuevo usuario'
    ),
    'owner'
);


return new;

end;

$$;

-- trigger
create trigger on_auth_user_created

after insert on auth.users

for each row

execute procedure public.handle_new_user();


-- Creación de organizaciones en automático (function)
create or replace function public.create_default_workspace()

returns trigger

language plpgsql

security definer

set search_path = public

as $$

declare

new_org uuid;

begin


insert into public.organizations
(
    name,
    slug
)

values
(
    coalesce(new.full_name,'Nueva') || ' Psicología',

    lower(
        replace(
            coalesce(new.full_name,'nueva'),
            ' ',
            '-'
        )
    )

)

returning id into new_org;



insert into public.organization_members
(
    organization_id,
    user_id,
    role
)

values
(
    new_org,
    new.id,
    'owner'
);



insert into public.subscriptions
(
    organization_id,
    plan
)

values
(
    new_org,
    'starter'
);



return new;

end;

$$;

-- trigger
create trigger create_workspace_after_profile

after insert on public.profiles

for each row

execute procedure public.create_default_workspace();

-- Creación del storage (configuracion de los documentos, necesitaremos buckets)
insert into storage.buckets
(
id,
name,
public
)

values

(
'avatars',
'avatars',
true
);


insert into storage.buckets
(
id,
name,
public
)

values

(
'patient-files',
'patient-files',
false
);

-- Completar las demás reglas para las vistas
-- organizacion (miembros)
create policy "Usuarios ven sus membresias"

on public.organization_members

for select

using (

user_id = auth.uid()

);

-- profesionales
create policy "Ver profesionales de mi organización"

on public.professionals

for select

using (

exists (

select 1

from public.organization_members om

where om.organization_id = professionals.organization_id

and om.user_id = auth.uid()

)

);

-- Citas
create policy "Ver citas de mi organización"

on public.appointments

for select

using (

exists (

select 1

from public.organization_members om

where om.organization_id = appointments.organization_id

and om.user_id = auth.uid()

)

);

-- insertar
create policy "Crear citas"

on public.appointments

for insert

with check (

exists (

select 1

from public.organization_members om

where om.organization_id = appointments.organization_id

and om.user_id = auth.uid()

)

);

-- sesiones (información clínica)
create policy "Ver sesiones asignadas"

on public.sessions

for select

using (

exists (

select 1

from public.professionals p

where p.id = sessions.professional_id

and p.profile_id = auth.uid()

)

);

-- archivos de los pacientes
create policy "Ver archivos de pacientes"

on public.patient_files

for select

using (

exists (

select 1

from public.patients p

join public.organization_members om

on om.organization_id = p.organization_id

where p.id = patient_files.patient_id

and om.user_id = auth.uid()

)

);

-- suscripciones (solo propietarios)
create policy "Ver suscripciones"

on public.subscriptions

for select

using (

exists (

select 1

from public.organization_members om

where om.organization_id = subscriptions.organization_id

and om.user_id = auth.uid()

and om.role='owner'

)

);

-- verificacion
select * from public.profiles;

select * from public.organizations;