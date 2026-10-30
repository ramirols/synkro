import { createClient } from "../apps/web/node_modules/@supabase/supabase-js/dist/index.mjs";
import fs from "fs";
import { execSync } from "child_process";

// Leer variables de apps/web/.env.local
const envContent = fs.readFileSync("apps/web/.env.local", "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey =
  envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error("❌ ERROR: No se encontró la anon key en apps/web/.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("=================================================================");
console.log("  SYNKRO — SUITE DE PRUEBAS DE SUSCRIPCIONES Y COMERCIAL (FASE 2)");
console.log("  URL Supabase:", supabaseUrl);
console.log("=================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = "") {
  if (condition) {
    console.log(`  ✅ [PASSED] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAILED] ${testName}`);
    if (detail) console.error(`     Detalle: ${detail}`);
    failed++;
  }
}

async function runPhase2Tests() {
  const ts = Date.now();
  const emailUser = `psicologo.fase2_${ts}@synkro.local`;
  const emailSuper = `superadmin.fase2_${ts}@synkro.local`;
  const password = "TestPassword123*!";

  let clientUser, clientSuper, userObj, superObj;
  let orgId, subId, profId;

  // --------------------------------------------------------------------------
  // TEST 1: Registro crea prueba de 14 días y persiste tipo de organización
  // --------------------------------------------------------------------------
  console.log("--- TEST 1: Registro funcional con prueba de 14 días y tipo de organización ---");
  const regUser = await supabase.auth.signUp({
    email: emailUser,
    password: password,
    options: {
      data: {
        full_name: "Dra. Sofía Alarcón",
        license_number: "C.Ps.P. 99881",
        clinic_name: "Instituto Neuropsicológico Lima",
        organization_type: "clinic",
      },
    },
  });

  assert(regUser.data.user && !regUser.error, "Usuario registrado en Auth", regUser.error?.message);
  userObj = regUser.data.user;

  clientUser = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  await clientUser.auth.signInWithPassword({ email: emailUser, password });

  // 1.1 Verificar organización y tipo
  const { data: memberData } = await clientUser
    .from("organization_members")
    .select("*, organizations(*)")
    .eq("user_id", userObj.id)
    .single();

  orgId = memberData?.organization_id;
  assert(
    memberData?.organizations?.organization_type === "clinic",
    "organization_type persistido correctamente como 'clinic' en public.organizations",
    JSON.stringify(memberData?.organizations)
  );

  // 1.2 Verificar suscripción en estado 'trialing' de 14 días exactos
  const { data: subData } = await clientUser
    .from("subscriptions")
    .select("*")
    .eq("organization_id", orgId)
    .single();

  subId = subData?.id;
  assert(
    subData && (subData.status === "trialing" || subData.status === "active") && (subData.plan === "starter" || subData.plan === "free"),
    "Suscripción creada en estado activo/trialing y plan 'free'/'starter'",
    JSON.stringify(subData)
  );

  const startMs = new Date(subData.trial_start_at).getTime();
  const endMs = new Date(subData.trial_end_at).getTime();
  const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
  assert(diffDays === 14, `Periodo de prueba calculado exactamente en 14 días (diff: ${diffDays} días)`);

  // 1.3 Verificar RPC get_org_subscription_details
  const { data: rpcDetails, error: rpcErr } = await clientUser.rpc("get_org_subscription_details", {
    p_org_id: orgId,
  });

  assert(
    rpcDetails && rpcDetails.days_remaining === 14 && rpcDetails.is_active === true,
    "RPC get_org_subscription_details retorna 14 días restantes y estado activo",
    rpcErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 2: Unicidad de Suscripción por Organización (Anti-Duplicidad)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 2: Unicidad de suscripción por organización ---");
  const { data: dupSub, error: dupErr } = await clientUser
    .from("subscriptions")
    .insert({
      organization_id: orgId,
      plan: "clinic",
      status: "active",
    })
    .select();

  assert(
    dupErr !== null,
    "PostgreSQL bloqueó la creación de una segunda suscripción para la misma organización (UNIQUE violation)",
    dupErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 3: Intento de auto-extensión o modificación del plan por el cliente
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: Bloqueo de manipulación de fechas/plan desde el cliente ---");
  const { data: fakeExtend, error: fakeExtErr } = await clientUser
    .from("subscriptions")
    .update({
      trial_end_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      plan: "clinic",
    })
    .eq("organization_id", orgId)
    .select();

  assert(
    !fakeExtend || fakeExtend.length === 0,
    "RLS bloqueó la extensión arbitraria de días o cambio de plan por usuario ordinario"
  );

  // --------------------------------------------------------------------------
  // TEST 4: Bloqueo de confirmación de pagos por usuario ordinario
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Bloqueo de confirmación de pagos por usuario ordinario ---");
  const { data: badConfirm, error: badConfirmErr } = await clientUser.rpc(
    "admin_confirm_subscription_payment",
    {
      p_organization_id: orgId,
      p_plan: "professional",
      p_period_months: 1,
      p_amount: 89,
      p_payment_method: "yape",
      p_reference_code: "FAKE-12345",
      p_notes: "Auto confirmación fraudulenta",
    }
  );

  assert(
    badConfirmErr !== null,
    "RPC rechazó confirmación de pago ejecutada por usuario ordinario (requiere superadmin)",
    badConfirmErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 5: Configuración de Superadmin y Confirmación Manual de Pago
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 5: Confirmación de pago y renovación legítima por Superadmin ---");
  // Registrar cuenta superadmin y elevar en PostgreSQL directamente
  const regSuper = await supabase.auth.signUp({
    email: emailSuper,
    password: password,
    options: { data: { full_name: "Administrador Central Velyon" } },
  });
  superObj = regSuper.data.user;

  // Promover a superadmin en PostgreSQL
  execSync(
    `docker exec -i supabase_db_Synkro psql -U postgres -d postgres -c "UPDATE public.profiles SET platform_role = 'superadmin' WHERE id = '${superObj.id}';"`
  );

  clientSuper = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  await clientSuper.auth.signInWithPassword({ email: emailSuper, password });

  // Ejecutar confirmación de pago legítima (Plan Professional, 3 meses, S/ 267 por Yape)
  const { data: paymentResult, error: payErr } = await clientSuper.rpc(
    "admin_confirm_subscription_payment",
    {
      p_organization_id: orgId,
      p_plan: "professional",
      p_period_months: 3,
      p_amount: 267,
      p_payment_method: "yape",
      p_reference_code: "YAPE-OP-849201",
      p_notes: "Pago verificado en app Yape al 997 676 432",
    }
  );

  assert(
    paymentResult && paymentResult.success === true,
    "Superadmin confirmó pago exitosamente y activó suscripción",
    payErr?.message
  );

  // Verificar suscripción actualizada a 'active' y plan 'professional'
  const { data: renewedSub } = await clientUser
    .from("subscriptions")
    .select("*")
    .eq("organization_id", orgId)
    .single();

  assert(
    renewedSub && renewedSub.status === "active" && renewedSub.plan === "professional",
    "Suscripción actualizada a status='active' y plan='professional'",
    JSON.stringify(renewedSub)
  );

  // Verificar que el pago quedó registrado en subscription_payments
  const { data: paymentsList } = await clientUser
    .from("subscription_payments")
    .select("*")
    .eq("organization_id", orgId);

  assert(
    paymentsList && paymentsList.length === 1 && paymentsList[0].amount === 267,
    "Pago registrado en el historial inmutable subscription_payments",
    JSON.stringify(paymentsList)
  );

  // --------------------------------------------------------------------------
  // TEST 6: Continuidad Clínica: Suscripción Vencida
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 6: Política de Continuidad Clínica (Suscripción Vencida) ---");
  // 6.1 Crear un paciente inicial mientras está activo
  const { data: pInit } = await clientUser
    .from("patients")
    .insert({
      organization_id: orgId,
      first_name: "Paciente",
      last_name: "Histórico Seguro",
      email: "paciente.historico@test.local",
    })
    .select()
    .single();
  const initPatientId = pInit?.id;
  assert(initPatientId, "Paciente clínico inicial creado con suscripción activa");

  // 6.2 Forzar vencimiento de la suscripción en PostgreSQL
  execSync(
    `docker exec -i supabase_db_Synkro psql -U postgres -d postgres -c "UPDATE public.subscriptions SET status = 'expired', current_period_end = now() - interval '2 days', trial_end_at = now() - interval '2 days' WHERE organization_id = '${orgId}';"`
  );

  // 6.3 Verificar que is_org_subscription_active retorna false
  const { data: isActiveFalse } = await clientUser.rpc("is_org_subscription_active", {
    p_org_id: orgId,
  });
  assert(isActiveFalse === false, "is_org_subscription_active detecta correctamente el vencimiento");

  // 6.4 Intentar crear NUEVO paciente con suscripción vencida (DEBE BLOQUEARSE)
  const { data: badPatient, error: badPatErr } = await clientUser
    .from("patients")
    .insert({
      organization_id: orgId,
      first_name: "Paciente",
      last_name: "Intento Vencido",
      email: "paciente.bloqueado@test.local",
    })
    .select();

  assert(
    badPatErr !== null && /suscrip|vencid/i.test(badPatErr.message),
    "PostgreSQL bloqueó inserción de nuevo paciente con suscripción vencida",
    badPatErr?.message
  );

  // 6.5 Intentar agendar NUEVA cita con suscripción vencida (DEBE BLOQUEARSE)
  const { data: profUser } = await clientUser
    .from("professionals")
    .select("id")
    .eq("organization_id", orgId)
    .single();

  const { data: badApp, error: badAppErr } = await clientUser
    .from("appointments")
    .insert({
      organization_id: orgId,
      patient_id: initPatientId,
      professional_id: profUser.id,
      appointment_date: "2026-11-20",
      start_time: "09:00:00",
    })
    .select();

  assert(
    badAppErr !== null,
    "PostgreSQL bloqueó creación de nueva cita médica con suscripción vencida",
    badAppErr?.message
  );

  // 6.6 CONTINUIDAD ASISTENCIAL: LECTURA DE EXPEDIENTES HISTÓRICOS (DEBE PERMITIRSE)
  const { data: readPatients, error: readPatErr } = await clientUser
    .from("patients")
    .select("id, first_name, last_name")
    .eq("organization_id", orgId);

  const canReadExisting = readPatients?.some((p) => p.id === initPatientId);
  assert(
    canReadExisting === true,
    "CONTINUIDAD CLÍNICA: Terapeuta puede consultar y exportar pacientes históricos en modo lectura"
  );

  // --------------------------------------------------------------------------
  // TEST 7: Restauración Inmediata tras Renovación
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 7: Restauración Inmediata de Operaciones tras Pago ---");
  // Superadmin renueva por 1 mes
  await clientSuper.rpc("admin_confirm_subscription_payment", {
    p_organization_id: orgId,
    p_plan: "professional",
    p_period_months: 1,
    p_amount: 89,
    p_payment_method: "yape",
    p_reference_code: "YAPE-RENOVACION-1122",
  });

  // Operación de escritura ahora debe permitirse
  const { data: restoredPatient, error: restoredErr } = await clientUser
    .from("patients")
    .insert({
      organization_id: orgId,
      first_name: "Paciente",
      last_name: "Post Renovación",
      email: "paciente.restaurado@test.local",
    })
    .select()
    .single();

  assert(
    restoredPatient && !restoredErr,
    "Operaciones clínicas restauradas inmediatamente tras registrar pago",
    restoredErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 8: Verificación de Límites Comerciales en PostgreSQL
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 8: Cumplimiento de Límites Comerciales de Plan ---");
  // En plan Professional, el límite de profesionales es 1. Intentar agregar un segundo profesional debe fallar.
  // Crear un segundo perfil de usuario para intentar vincularlo como segundo terapeuta
  const emailExtraProf = `extra.prof_${ts}@synkro.local`;
  const regExtra = await supabase.auth.signUp({
    email: emailExtraProf,
    password: password,
    options: { data: { full_name: "Lic. Terapeuta Secundario" } },
  });

  const { data: badProf, error: badProfErr } = await clientUser
    .from("professionals")
    .insert({
      organization_id: orgId,
      profile_id: regExtra.data.user.id,
      specialty: "Psicología Infantil",
      license_number: "C.Ps.P. 55555",
    })
    .select();

  assert(
    badProfErr !== null && /mite|titular|profesional/i.test(badProfErr.message),
    "PostgreSQL bloqueó adición de segundo profesional en Plan Professional (requiere Plan Clínica)",
    badProfErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 9: Directorio Administrativo y Aislamiento de /admin
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 9: Directorio Administrativo & Aislamiento de Consola ---");
  // Usuario ordinario no puede listar el directorio global
  const { data: badList, error: badListErr } = await clientUser.rpc("admin_list_organizations");
  assert(
    badListErr !== null,
    "Usuario ordinario bloqueado de admin_list_organizations",
    badListErr?.message
  );

  // Superadmin obtiene lista con la organización registrada
  const { data: goodList, error: goodListErr } = await clientSuper.rpc("admin_list_organizations");
  const foundOurOrg = goodList?.some((o) => o.id === orgId);
  assert(
    foundOurOrg === true,
    "Superadmin obtiene directorio global completo con métricas comerciales",
    goodListErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 10: Aislamiento del Modo Demo
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 10: Verificación de Aislamiento del Modo Demo ---");
  const demoCode = fs.readFileSync("apps/web/lib/demo/clinical-data.ts", "utf8");
  const demoStorageCode = fs.readFileSync("apps/web/lib/demo/demo-storage.ts", "utf8");
  const isIsolated =
    !demoCode.includes("from '@supabase") &&
    !demoCode.includes("from \"@/lib/supabase\"") &&
    !demoStorageCode.includes("from '@supabase");

  assert(
    isIsolated,
    "DemoClinicalDataService y DemoStorage operan 100% aislados en memoria/localStorage",
    "Sin peticiones de red a Supabase"
  );

  // --------------------------------------------------------------------------
  // RESUMEN
  // --------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`  RESULTADO FASE 2: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error("❌ Error no controlado en suite Fase 2:", err);
  process.exit(1);
});
