-- ==============================================================================
-- SYNKRO — MIGRACIÓN INCREMENTAL: INVITACIONES ÁGILES AL PORTAL DEL PACIENTE
-- Permite a los psicólogos generar enlaces de invitación sin que el paciente tenga
-- una cuenta previa registrada ni correo obligatorio en la ficha inicial.
-- El paciente activa su cuenta directamente desde el enlace recibido.
-- ==============================================================================

-- 1. Actualizar create_patient_portal_invitation para permitir generar tokens
-- incluso si la ficha clínica inicial aún no tiene correo registrado
CREATE OR REPLACE FUNCTION public.create_patient_portal_invitation(p_patient_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
declare
  v_patient record;
  v_token text;
begin
  if auth.uid() is null then
    raise exception 'Sesión requerida: Debes estar autenticado para invitar pacientes.';
  end if;

  select * into v_patient from public.patients where id = p_patient_id;
  if not found then
    raise exception 'Paciente no encontrado.';
  end if;

  -- Verificar que el usuario tenga rol clínico o administrativo en la organización
  if not public.has_role_in_org(v_patient.organization_id, ARRAY['owner', 'psychologist', 'admin']) then
    raise exception 'Operación no permitida: Solo el personal clínico o administrativo puede generar invitaciones al portal.';
  end if;

  -- Generar token aleatorio criptográfico (64 caracteres hex / 256 bits)
  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  update public.patients
  set portal_invitation_token = v_token,
      portal_invitation_sent_at = now(),
      portal_status = 'invited'
  where id = p_patient_id;

  -- Registrar en log de auditoría
  insert into public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) values (
    auth.uid(),
    'PORTAL_INVITATION_CREATED',
    'patients',
    p_patient_id,
    jsonb_build_object(
      'patient_id', p_patient_id,
      'email', v_patient.email,
      'organization_id', v_patient.organization_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'patient_id', p_patient_id,
    'email', v_patient.email,
    'token', v_token,
    'expires_at', now() + interval '7 days'
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.create_patient_portal_invitation(uuid) TO authenticated;

-- 2. Actualizar accept_patient_portal_invitation para vincular la cuenta del paciente
-- y asociar su correo autenticado automáticamente si no existía, o verificar coincidencia si ya existía
CREATE OR REPLACE FUNCTION public.accept_patient_portal_invitation(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
declare
  v_patient record;
  v_auth_email text;
  v_caller_uid uuid;
begin
  v_caller_uid := auth.uid();
  if v_caller_uid is null then
    raise exception 'Debes iniciar sesión con tu cuenta de paciente para aceptar la invitación.';
  end if;

  v_auth_email := lower(public.get_auth_email());
  if v_auth_email is null then
    raise exception 'No se pudo verificar el correo electrónico de tu cuenta autenticada.';
  end if;

  -- Buscar paciente con el token provisto
  select * into v_patient
  from public.patients
  where portal_invitation_token = p_token
    and portal_status = 'invited';

  if not found then
    raise exception 'Enlace de invitación inválido, ya utilizado o caducado.';
  end if;

  -- Validar vigencia (máximo 7 días)
  if v_patient.portal_invitation_sent_at < now() - interval '7 days' then
    raise exception 'La invitación ha expirado. Solicita a tu consultorio un nuevo enlace de acceso.';
  end if;

  -- Si el paciente ya tenía correo registrado por el psicólogo, validar coincidencia estricta
  if v_patient.email is not null and length(trim(v_patient.email)) > 0 then
    if lower(trim(v_patient.email)) <> v_auth_email then
      raise exception 'El correo de tu cuenta activa (%s) no coincide con el correo invitado (%s).', v_auth_email, v_patient.email;
    end if;
  else
    -- Si la ficha clínica inicial no tenía correo, se asigna el correo autenticado
    update public.patients
    set email = v_auth_email
    where id = v_patient.id;
  end if;

  -- Validar que el usuario no esté ya vinculado a otro paciente en esta misma clínica
  if exists (
    select 1 from public.patients
    where organization_id = v_patient.organization_id
      and user_id = v_caller_uid
      and id <> v_patient.id
  ) then
    raise exception 'Tu cuenta ya se encuentra vinculada a otro expediente en este centro clínico.';
  end if;

  -- Validar que una cuenta con rol profesional o administrativo en esta clínica no se auto-vincule como paciente
  if exists (
    select 1 from public.organization_members
    where organization_id = v_patient.organization_id
      and user_id = v_caller_uid
      and role in ('owner', 'admin', 'psychologist', 'superadmin')
  ) then
    raise exception 'Una cuenta con perfil profesional o administrativo no puede ser vinculada como paciente en la misma clínica.';
  end if;

  -- Vincular formalmente la cuenta de Auth con el paciente clínico
  update public.patients
  set user_id = v_caller_uid,
      portal_status = 'active',
      portal_invitation_token = null,
      portal_invitation_accepted_at = now()
  where id = v_patient.id;

  -- Establecer contexto seguro en la transacción y actualizar perfil
  PERFORM set_config('synkro.portal_activation_in_progress', 'true', true);

  -- Asegurar que el usuario tenga el rol de 'patient' en profiles
  update public.profiles
  set role = 'patient'
  where id = v_caller_uid;

  -- Asegurar que exista membresía del paciente en la organización
  insert into public.organization_members (organization_id, user_id, role)
  values (v_patient.organization_id, v_caller_uid, 'patient')
  on conflict (organization_id, user_id)
  do update set role = 'patient';

  -- Registrar en auditoría
  insert into public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) values (
    v_caller_uid,
    'PORTAL_INVITATION_ACCEPTED',
    'patients',
    v_patient.id,
    jsonb_build_object(
      'patient_id', v_patient.id,
      'user_id', v_caller_uid,
      'email', v_auth_email,
      'organization_id', v_patient.organization_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'patient_id', v_patient.id,
    'organization_id', v_patient.organization_id,
    'email', v_auth_email
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.accept_patient_portal_invitation(text) TO authenticated;
