-- ==============================================================================
-- SYNKRO — MIGRACIÓN INCREMENTAL FASE 2: MOTOR DE SUSCRIPCIONES Y LÍMITES COMERCIALES
-- Archivo: 20261028220000_phase2_subscriptions_and_commercial.sql
-- ==============================================================================

-- 1. TIPO DE ORGANIZACIÓN EN public.organizations
-- Permite distinguir entre psicólogo independiente y clínica/empresa multiprofesional
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS organization_type text DEFAULT 'independent'
  CHECK (organization_type IN ('independent', 'clinic'));

-- 1.1 AUDIT LOGS: Soporte de diferencias de auditoría comercial (old_data y new_data)
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS old_data jsonb,
  ADD COLUMN IF NOT EXISTS new_data jsonb;

-- 2. AMPLIACIÓN DEL MODELO public.subscriptions
-- 2.1 Añadir columnas comerciales
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_start_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS trial_end_at timestamptz DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_payment_date timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS confirmed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2.2 Inicialización segura de registros históricos preservando la continuidad clínica
-- Si la organización fue creada dentro de los últimos 14 días, se formaliza su periodo de prueba ('trialing').
-- Si fue creada hace más de 14 días y ya estaba 'active', SE PRESERVA en estado 'active' para no interrumpir
-- la operación clínica de consultorios preexistentes, documentando en notas la necesidad de revisión comercial manual.
UPDATE public.subscriptions
SET
  trial_start_at = coalesce(created_at, now()),
  trial_end_at = coalesce(created_at, now()) + interval '14 days',
  status = CASE
    WHEN coalesce(created_at, now()) + interval '14 days' > now() THEN 'trialing'
    ELSE status -- Preserva 'active' (u otro estado preexistente legítimo)
  END,
  notes = CASE
    WHEN coalesce(created_at, now()) + interval '14 days' <= now() AND status = 'active' THEN
      coalesce(nullif(notes, ''), 'Organización preexistente a Fase 2: estado activo preservado para continuidad asistencial. Requiere regularización de periodo de pago.')
    ELSE notes
  END
WHERE status = 'active' AND current_period_end IS NULL;

-- 2.3 Restricción de estados y métodos de pago
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('trialing', 'active', 'past_due', 'expired', 'cancelled'));

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_payment_method_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('yape', 'transferencia', 'plin', 'tarjeta', 'manual', 'cortesia'));

-- 2.4 Unicidad de suscripción por organización (Evita duplicaciones por concurrencia)
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_organization_id_key;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_organization_id_key UNIQUE (organization_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status_trial ON public.subscriptions(status, trial_end_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- 3. TABLA HISTÓRICA DE PAGOS Y RENOVACIONES COMERCIALES
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL CHECK (amount >= 0),
    currency text NOT NULL DEFAULT 'PEN',
    plan text NOT NULL CHECK (plan IN ('starter', 'professional', 'clinic')),
    period_months integer NOT NULL DEFAULT 1 CHECK (period_months IN (1, 3, 6, 12)),
    payment_method text NOT NULL CHECK (payment_method IN ('yape', 'transferencia', 'plin', 'tarjeta', 'manual', 'cortesia')),
    reference_code text,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    confirmed_by uuid NOT NULL REFERENCES auth.users(id),
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_org ON public.subscription_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_sub ON public.subscription_payments(subscription_id);

-- RLS en subscription_payments
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscription_payments_select_policy" ON public.subscription_payments;
CREATE POLICY "subscription_payments_select_policy" ON public.subscription_payments
  FOR SELECT USING (
    public.is_member_of(organization_id)
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "subscription_payments_insert_policy" ON public.subscription_payments;
CREATE POLICY "subscription_payments_insert_policy" ON public.subscription_payments
  FOR INSERT WITH CHECK (
    public.is_superadmin()
  );

DROP POLICY IF EXISTS "subscription_payments_update_policy" ON public.subscription_payments;
CREATE POLICY "subscription_payments_update_policy" ON public.subscription_payments
  FOR UPDATE USING (
    public.is_superadmin()
  );

DROP POLICY IF EXISTS "subscription_payments_delete_policy" ON public.subscription_payments;
CREATE POLICY "subscription_payments_delete_policy" ON public.subscription_payments
  FOR DELETE USING (
    public.is_superadmin()
  );

-- Ajuste de RLS en subscriptions: Permitir al superadmin leer todas las suscripciones
DROP POLICY IF EXISTS "subscriptions_select_policy" ON public.subscriptions;
CREATE POLICY "subscriptions_select_policy" ON public.subscriptions
  FOR SELECT USING (
    public.is_member_of(organization_id)
    OR public.is_superadmin()
  );

-- Ajuste de RLS en organizations y organization_members para superadmin
DROP POLICY IF EXISTS "organizations_select_policy" ON public.organizations;
CREATE POLICY "organizations_select_policy" ON public.organizations
  FOR SELECT USING (
    public.is_member_of(id)
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "organization_members_select_policy" ON public.organization_members;
CREATE POLICY "organization_members_select_policy" ON public.organization_members
  FOR SELECT USING (
    public.is_member_of(organization_id)
    OR auth.uid() = user_id
    OR public.is_superadmin()
  );

-- 3.1 RPC PRIVADA: LISTADO GLOBAL DE ORGANIZACIONES PARA CONSOLA SUPERADMIN
CREATE OR REPLACE FUNCTION public.admin_list_organizations()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
declare
  result jsonb;
begin
  if not public.is_superadmin() then
    raise exception 'Operación no autorizada: Solo el superadministrador puede acceder a la lista global de organizaciones.';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'slug', o.slug,
      'organization_type', coalesce(o.organization_type, 'independent'),
      'created_at', o.created_at,
      'owner_name', coalesce(p.full_name, 'Titular'),
      'owner_email', coalesce(u.email, 'Sin correo'),
      'license_number', p.license_number,
      'plan', coalesce(s.plan, 'starter'),
      'status', coalesce(s.status, 'trialing'),
      'trial_start_at', s.trial_start_at,
      'trial_end_at', s.trial_end_at,
      'current_period_start', s.current_period_start,
      'current_period_end', s.current_period_end,
      'last_payment_date', s.last_payment_date,
      'payment_method', s.payment_method,
      'patient_count', (select count(*) from public.patients where organization_id = o.id),
      'professional_count', (select count(*) from public.professionals where organization_id = o.id)
    )
    order by o.created_at desc
  ) into result
  from public.organizations o
  left join public.subscriptions s on s.organization_id = o.id
  left join public.organization_members om on om.organization_id = o.id and om.role = 'owner'
  left join public.profiles p on p.id = om.user_id
  left join auth.users u on u.id = om.user_id;

  return coalesce(result, '[]'::jsonb);
end;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_organizations() TO authenticated;

-- 4. ACTUALIZACIÓN DEL TRIGGER DE REGISTRO AUTOMÁTICO (PRUEBA DE 14 DÍAS Y TIPO DE ORGANIZACIÓN)
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  new_org uuid;
  base_name text;
  clean_slug text;
  final_slug text;
  suffix text;
  user_meta jsonb;
  meta_clinic_name text;
  meta_org_type text;
begin
  -- Si el usuario ya posee una membresía organizativa previa, no duplicar espacio
  if exists (
    select 1 from public.organization_members where user_id = new.id
  ) then
    return new;
  end if;

  -- Extraer metadata del usuario de forma segura desde auth.users
  select raw_user_meta_data into user_meta from auth.users where id = new.id;
  meta_clinic_name := trim(user_meta->>'clinic_name');
  meta_org_type := trim(user_meta->>'organization_type');

  if meta_org_type not in ('independent', 'clinic') then
    meta_org_type := 'independent';
  end if;

  base_name := coalesce(nullif(meta_clinic_name, ''), nullif(trim(new.full_name), ''), 'Mi Consulta');
  
  -- Sanitizar nombre para slug alfanumérico seguro
  clean_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  clean_slug := trim(both '-' from clean_slug);
  if clean_slug = '' then
    clean_slug := 'clinica';
  end if;

  suffix := substr(replace(new.id::text, '-', ''), 1, 8);
  final_slug := clean_slug || '-' || suffix;

  -- 1. Insertar Organización con tipo
  insert into public.organizations (name, slug, organization_type)
  values (
    case 
      when meta_clinic_name is not null and meta_clinic_name <> '' then meta_clinic_name
      when meta_org_type = 'clinic' then base_name || ' | Centro Psicológico'
      else base_name || ' | Consulta Privada'
    end,
    final_slug,
    meta_org_type
  )
  returning id into new_org;

  -- 2. Insertar Membresía como Propietario (owner)
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org, new.id, 'owner');

  -- 3. Crear Registro en public.professionals para el titular
  insert into public.professionals (
    organization_id,
    profile_id,
    specialty,
    license_number
  )
  values (
    new_org,
    new.id,
    coalesce(nullif(trim(new.specialty), ''), 'Psicología Clínica'),
    new.license_number
  );

  -- 4. Inicializar suscripción en PRUEBA GRATUITA de exactamente 14 días
  insert into public.subscriptions (
    organization_id,
    plan,
    status,
    trial_start_at,
    trial_end_at,
    created_at,
    updated_at
  )
  values (
    new_org,
    'starter',
    'trialing',
    now(),
    now() + interval '14 days',
    now(),
    now()
  )
  on conflict (organization_id) do nothing;

  return new;
end;
$$;

-- 5. FUNCIÓN CENTRAL DE AUTORIZACIÓN: is_org_subscription_active()
CREATE OR REPLACE FUNCTION public.is_org_subscription_active(p_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  sub record;
begin
  if p_org_id is null then
    return false;
  end if;

  select status, trial_end_at, current_period_end into sub
  from public.subscriptions
  where organization_id = p_org_id;

  if not found then
    return false;
  end if;

  -- 1. Suscripción activa contratada
  if sub.status = 'active' then
    if sub.current_period_end is null or sub.current_period_end >= now() then
      return true;
    end if;
    return false;
  end if;

  -- 2. Periodo de prueba de 14 días
  if sub.status = 'trialing' then
    if sub.trial_end_at >= now() then
      return true;
    end if;
    return false;
  end if;

  -- 3. Periodo de gracia (past_due): 3 días de tolerancia para regularizar pago
  if sub.status = 'past_due' then
    if sub.current_period_end is not null and sub.current_period_end + interval '3 days' >= now() then
      return true;
    end if;
    return false;
  end if;

  -- 4. Estados 'expired' o 'cancelled' no permiten operaciones de escritura
  return false;
end;
$$;

GRANT EXECUTE ON FUNCTION public.is_org_subscription_active(uuid) TO authenticated, anon;

-- 6. FUNCIÓN RPC: get_org_subscription_details()
CREATE OR REPLACE FUNCTION public.get_org_subscription_details(p_org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  sub record;
  org record;
  p_count integer;
  prof_count integer;
  eff_status text;
  days_rem integer;
  target_date timestamptz;
begin
  if p_org_id is null then
    return null;
  end if;

  -- Verificar que el invocador sea miembro de la org o superadmin
  if not (public.is_member_of(p_org_id) or public.is_superadmin()) then
    raise exception 'Operación no autorizada: No tienes acceso a los datos comerciales de esta organización.';
  end if;

  select * into org from public.organizations where id = p_org_id;
  select * into sub from public.subscriptions where organization_id = p_org_id;

  if not found then
    return null;
  end if;

  select count(*) into p_count from public.patients where organization_id = p_org_id;
  select count(*) into prof_count from public.professionals where organization_id = p_org_id;

  -- Determinar estado efectivo y fecha objetivo
  if sub.status = 'active' then
    target_date := sub.current_period_end;
    if target_date is not null and target_date < now() then
      eff_status := 'past_due';
    else
      eff_status := 'active';
    end if;
  elsif sub.status = 'trialing' then
    target_date := sub.trial_end_at;
    if target_date < now() then
      eff_status := 'expired';
    else
      eff_status := 'trialing';
    end if;
  else
    eff_status := sub.status;
    target_date := coalesce(sub.current_period_end, sub.trial_end_at);
  end if;

  if target_date is not null and target_date > now() then
    days_rem := ceil(extract(epoch from (target_date - now())) / 86400.0)::integer;
  else
    days_rem := 0;
  end if;

  return jsonb_build_object(
    'id', sub.id,
    'organization_id', sub.organization_id,
    'organization_name', org.name,
    'organization_type', coalesce(org.organization_type, 'independent'),
    'plan', sub.plan,
    'status', sub.status,
    'effective_status', eff_status,
    'trial_start_at', sub.trial_start_at,
    'trial_end_at', sub.trial_end_at,
    'current_period_start', sub.current_period_start,
    'current_period_end', sub.current_period_end,
    'cancel_at_period_end', sub.cancel_at_period_end,
    'last_payment_date', sub.last_payment_date,
    'payment_method', sub.payment_method,
    'days_remaining', days_rem,
    'is_active', public.is_org_subscription_active(p_org_id),
    'patient_count', p_count,
    'professional_count', prof_count
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.get_org_subscription_details(uuid) TO authenticated, anon;

-- 7. CONTINUIDAD CLÍNICA Y CONTROL DE ESCRITURA EN BASE DE DATOS
-- Las suscripciones vencidas bloquean altas y modificaciones, pero PERMITEN lecturas y exportaciones
CREATE OR REPLACE FUNCTION public.check_subscription_write_permission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_org_id uuid;
begin
  -- Superadmin siempre puede intervenir técnicamente si fuera necesario
  if public.is_superadmin() then
    return new;
  end if;

  -- Obtener organization_id según la tabla afectada
  if TG_TABLE_NAME = 'sessions' then
    select organization_id into v_org_id from public.patients where id = new.patient_id;
  else
    v_org_id := new.organization_id;
  end if;

  if v_org_id is not null and not public.is_org_subscription_active(v_org_id) then
    raise exception 'Operación restringida: La suscripción de la clínica se encuentra vencida o inactiva. Para continuar registrando o modificando datos clínicos, renueva tu plan en /suscripcion.';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_check_sub_write_patients ON public.patients;
CREATE TRIGGER trg_check_sub_write_patients
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscription_write_permission();

DROP TRIGGER IF EXISTS trg_check_sub_write_appointments ON public.appointments;
CREATE TRIGGER trg_check_sub_write_appointments
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscription_write_permission();

DROP TRIGGER IF EXISTS trg_check_sub_write_sessions ON public.sessions;
CREATE TRIGGER trg_check_sub_write_sessions
  BEFORE INSERT OR UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscription_write_permission();

DROP TRIGGER IF EXISTS trg_check_sub_write_patient_files ON public.patient_files;
CREATE TRIGGER trg_check_sub_write_patient_files
  BEFORE INSERT OR UPDATE ON public.patient_files
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscription_write_permission();

-- 8. APLICACIÓN DE LÍMITES COMERCIALES EN POSTGRESQL
-- 8.1 Límite de pacientes según el plan
CREATE OR REPLACE FUNCTION public.enforce_plan_patient_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_plan text;
  v_current_count integer;
begin
  if public.is_superadmin() then
    return new;
  end if;

  select plan into v_plan from public.subscriptions where organization_id = new.organization_id;

  -- El Plan Starter permite hasta 20 pacientes activos
  if v_plan = 'starter' then
    select count(*) into v_current_count
    from public.patients
    where organization_id = new.organization_id;

    if v_current_count >= 20 then
      raise exception 'Límite alcanzado: El Plan Starter permite hasta 20 pacientes activos. Para registrar más pacientes, actualiza al Plan Professional en /suscripcion.';
    end if;
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_enforce_plan_patient_limit ON public.patients;
CREATE TRIGGER trg_enforce_plan_patient_limit
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_patient_limit();

-- 8.2 Límite de profesionales según el plan
CREATE OR REPLACE FUNCTION public.enforce_plan_professional_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_plan text;
  v_current_count integer;
begin
  if public.is_superadmin() then
    return new;
  end if;

  select plan into v_plan from public.subscriptions where organization_id = new.organization_id;

  -- Starter y Professional: 1 único profesional
  if v_plan in ('starter', 'professional') then
    select count(*) into v_current_count
    from public.professionals
    where organization_id = new.organization_id;

    if v_current_count >= 1 then
      raise exception 'Límite alcanzado: Los planes Starter y Professional permiten 1 único profesional titular. Para sumar más terapeutas a tu equipo, actualiza al Plan Clínica en /suscripcion.';
    end if;
  -- Clinic: Hasta 10 profesionales
  elsif v_plan = 'clinic' then
    select count(*) into v_current_count
    from public.professionals
    where organization_id = new.organization_id;

    if v_current_count >= 10 then
      raise exception 'Límite alcanzado: El Plan Clínica incluye hasta 10 profesionales activos. Contáctanos por WhatsApp para ampliar la capacidad de tu centro.';
    end if;
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_enforce_plan_professional_limit ON public.professionals;
CREATE TRIGGER trg_enforce_plan_professional_limit
  BEFORE INSERT ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_professional_limit();

-- 9. RPC PRIVADA PARA SUPERADMIN: CONFIRMACIÓN TRANSACCIONAL DE PAGOS
CREATE OR REPLACE FUNCTION public.admin_confirm_subscription_payment(
  p_organization_id uuid,
  p_plan text,
  p_period_months integer,
  p_amount numeric,
  p_payment_method text,
  p_reference_code text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_sub record;
  v_start timestamptz;
  v_end timestamptz;
  v_payment_id uuid;
begin
  -- Exclusivo para superadministrador
  if not public.is_superadmin() then
    raise exception 'Operación no autorizada: Solo un superadministrador puede confirmar pagos y renovar suscripciones.';
  end if;

  if p_plan not in ('starter', 'professional', 'clinic') then
    raise exception 'Plan no válido: Debe ser starter, professional o clinic.';
  end if;

  if p_period_months not in (1, 3, 6, 12) then
    raise exception 'Periodo no válido: Debe ser 1, 3, 6 o 12 meses.';
  end if;

  if p_amount < 0 then
    raise exception 'El monto no puede ser negativo.';
  end if;

  select * into v_sub from public.subscriptions where organization_id = p_organization_id;
  if not found then
    raise exception 'No se encontró la suscripción para la organización indicada.';
  end if;

  -- Calcular periodo: si la suscripción activa aún no vence, extender desde su fecha de vencimiento; si ya venció o era prueba, empezar hoy
  if v_sub.status = 'active' and v_sub.current_period_end is not null and v_sub.current_period_end > now() then
    v_start := v_sub.current_period_end;
  else
    v_start := now();
  end if;

  v_end := v_start + (p_period_months || ' months')::interval;

  -- 1. Registrar pago en historial comercial inmutable
  insert into public.subscription_payments (
    organization_id,
    subscription_id,
    amount,
    currency,
    plan,
    period_months,
    payment_method,
    reference_code,
    period_start,
    period_end,
    confirmed_by,
    notes
  ) values (
    p_organization_id,
    v_sub.id,
    p_amount,
    'PEN',
    p_plan,
    p_period_months,
    p_payment_method,
    p_reference_code,
    v_start,
    v_end,
    auth.uid(),
    p_notes
  )
  returning id into v_payment_id;

  -- 2. Actualizar suscripción
  update public.subscriptions
  set
    plan = p_plan,
    status = 'active',
    current_period_start = v_start,
    current_period_end = v_end,
    last_payment_date = now(),
    payment_method = p_payment_method,
    confirmed_by = auth.uid(),
    notes = p_notes,
    updated_at = now()
  where id = v_sub.id;

  -- 3. Registrar en audit_logs
  insert into public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    'CONFIRM_PAYMENT',
    'subscriptions',
    v_sub.id,
    jsonb_build_object(
      'old_plan', v_sub.plan,
      'old_status', v_sub.status,
      'old_end', v_sub.current_period_end
    ),
    jsonb_build_object(
      'new_plan', p_plan,
      'new_status', 'active',
      'new_end', v_end,
      'payment_id', v_payment_id,
      'amount', p_amount,
      'method', p_payment_method,
      'period_months', p_period_months
    )
  );

  return jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'plan', p_plan,
    'status', 'active',
    'period_start', v_start,
    'period_end', v_end
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.admin_confirm_subscription_payment(uuid, text, integer, numeric, text, text, text) TO authenticated;

-- 10. RPC PRIVADA PARA SUPERADMIN: AJUSTE DE ESTADO/PLAN/FECHA
CREATE OR REPLACE FUNCTION public.admin_update_subscription(
  p_organization_id uuid,
  p_plan text,
  p_status text,
  p_extend_days integer DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_sub record;
  v_new_end timestamptz;
begin
  if not public.is_superadmin() then
    raise exception 'Operación no autorizada: Solo un superadministrador puede modificar suscripciones.';
  end if;

  if p_plan not in ('starter', 'professional', 'clinic') then
    raise exception 'Plan inválido.';
  end if;

  if p_status not in ('trialing', 'active', 'past_due', 'expired', 'cancelled') then
    raise exception 'Estado inválido.';
  end if;

  select * into v_sub from public.subscriptions where organization_id = p_organization_id;
  if not found then
    raise exception 'Suscripción no encontrada.';
  end if;

  v_new_end := v_sub.current_period_end;
  if p_extend_days is not null and p_extend_days > 0 then
    v_new_end := greatest(now(), coalesce(v_new_end, now())) + (p_extend_days || ' days')::interval;
  end if;

  update public.subscriptions
  set
    plan = p_plan,
    status = p_status,
    current_period_end = case when p_extend_days is not null then v_new_end else current_period_end end,
    notes = coalesce(p_notes, notes),
    updated_at = now()
  where id = v_sub.id;

  -- Registrar en audit_logs
  insert into public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    'MANUAL_SUBSCRIPTION_UPDATE',
    'subscriptions',
    v_sub.id,
    jsonb_build_object('old_plan', v_sub.plan, 'old_status', v_sub.status),
    jsonb_build_object('new_plan', p_plan, 'new_status', p_status, 'notes', p_notes)
  );

  return jsonb_build_object(
    'success', true,
    'plan', p_plan,
    'status', p_status,
    'current_period_end', v_new_end
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_subscription(uuid, text, text, integer, text) TO authenticated;
