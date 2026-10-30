import { createClient } from "../apps/web/node_modules/@supabase/supabase-js/dist/index.mjs";
import fs from "fs";

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
console.log("  SYNKRO — SUITE DE PRUEBAS DE SEGURIDAD Y REGISTRO (FASE 1)");
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

async function runTests() {
  const ts = Date.now();
  const email1 = `terapeuta.test1_${ts}@synkro.local`;
  const email2 = `terapeuta.test2_${ts}@synkro.local`;
  const emailHacker = `hacker.meta_${ts}@synkro.local`;
  const password = "TestPassword123*!";

  let client1, client2, user1, user2;
  let org1Id, org2Id, prof1Id, prof2Id, pat1Id, pat2Id;

  // --------------------------------------------------------------------------
  // TEST 1: Registro de nuevo psicólogo y creación atómica de workspace
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 1: Registro funcional y creación atómica de workspace ---");
  const reg1 = await supabase.auth.signUp({
    email: email1,
    password: password,
    options: {
      data: {
        full_name: "Lic. Carlos Valdivia",
        license_number: "C.Ps.P. 12345",
        clinic_name: "Centro Psicológico Miraflores",
      },
    },
  });

  assert(reg1.data.user && !reg1.error, "Usuario 1 registrado en Supabase Auth", reg1.error?.message);
  user1 = reg1.data.user;

  // Crear cliente autenticado como Usuario 1
  client1 = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  const login1 = await client1.auth.signInWithPassword({ email: email1, password });
  assert(login1.data.session, "Inicio de sesión de Usuario 1 exitoso");

  // 1.1 Verificar Profile
  const { data: profile1, error: p1Err } = await client1
    .from("profiles")
    .select("*")
    .eq("id", user1.id)
    .single();
  assert(
    profile1 && profile1.platform_role === "user" && profile1.role === "owner",
    "Perfil creado con platform_role='user' y role='owner'",
    JSON.stringify(profile1)
  );
  assert(profile1.license_number === "C.Ps.P. 12345", "license_number copiado correctamente en profiles");

  // 1.2 Verificar Organization & OrganizationMember
  const { data: member1, error: m1Err } = await client1
    .from("organization_members")
    .select("*, organizations(*)")
    .eq("user_id", user1.id)
    .single();
  assert(
    member1 && member1.role === "owner" && member1.organizations?.name === "Centro Psicológico Miraflores",
    "Organización y membresía creada con rol 'owner'",
    JSON.stringify(member1)
  );
  org1Id = member1?.organization_id;

  // 1.3 Verificar Professionals (CORRECCIÓN CRÍTICA DE ISSUE-01)
  const { data: prof1, error: pr1Err } = await client1
    .from("professionals")
    .select("*")
    .eq("profile_id", user1.id)
    .eq("organization_id", org1Id)
    .single();
  assert(
    prof1 && prof1.organization_id === org1Id,
    "Registro en public.professionals creado automáticamente para el titular",
    JSON.stringify(prof1)
  );
  prof1Id = prof1?.id;

  // 1.4 Verificar Subscriptions
  const { data: sub1 } = await client1
    .from("subscriptions")
    .select("*")
    .eq("organization_id", org1Id)
    .single();
  assert(
    sub1 && (sub1.plan === "starter" || sub1.plan === "free") && (sub1.status === "trialing" || sub1.status === "active"),
    "Suscripción inicializada correctamente (free/starter)",
    JSON.stringify(sub1)
  );

  // --------------------------------------------------------------------------
  // TEST 2: Intento de auto-escalada a superadmin en registro (Metadata injection)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 2: Intento de escalada vía raw_user_meta_data en registro ---");
  const regHacker = await supabase.auth.signUp({
    email: emailHacker,
    password: password,
    options: {
      data: {
        full_name: "Atacante Inyección",
        role: "superadmin",
        platform_role: "superadmin",
      },
    },
  });
  assert(regHacker.data.user, "Usuario hacker registrado");

  const clientHacker = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  await clientHacker.auth.signInWithPassword({ email: emailHacker, password });

  const { data: hackerProfile } = await clientHacker
    .from("profiles")
    .select("role, platform_role")
    .eq("id", regHacker.data.user.id)
    .single();

  assert(
    hackerProfile?.platform_role === "user" && hackerProfile?.role === "owner",
    "Inyección ignorada: platform_role se forzó a 'user'",
    JSON.stringify(hackerProfile)
  );

  // --------------------------------------------------------------------------
  // TEST 3: Intento de auto-escalada modificando su propio perfil vía UPDATE
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: Intento de auto-escalada mediante UPDATE directo en profiles ---");
  const { data: updateData, error: updateErr } = await clientHacker
    .from("profiles")
    .update({ platform_role: "superadmin" })
    .eq("id", regHacker.data.user.id)
    .select();

  assert(
    updateErr !== null,
    "PostgreSQL bloqueó la modificación no autorizada de platform_role",
    updateErr?.message
  );

  const { data: updateRoleData, error: updateRoleErr } = await clientHacker
    .from("profiles")
    .update({ role: "superadmin" })
    .eq("id", regHacker.data.user.id)
    .select();

  assert(
    updateRoleErr !== null,
    "PostgreSQL bloqueó la modificación no autorizada de role en profiles",
    updateRoleErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 4: Aislamiento Multi-Tenant entre Organizaciones (Pacientes)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Aislamiento Multi-Tenant de Pacientes entre Clínicas ---");
  // Registrar Usuario 2 en Clínica 2
  await supabase.auth.signUp({
    email: email2,
    password: password,
    options: {
      data: {
        full_name: "Dra. Lucía Mendoza",
        clinic_name: "Clínica San Isidro",
      },
    },
  });
  client2 = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const login2 = await client2.auth.signInWithPassword({ email: email2, password });
  user2 = login2.data.user;

  const { data: member2 } = await client2
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user2.id)
    .single();
  org2Id = member2.organization_id;

  const { data: prof2 } = await client2
    .from("professionals")
    .select("id")
    .eq("profile_id", user2.id)
    .single();
  prof2Id = prof2.id;

  // Usuario 1 crea Paciente 1 en Clínica 1
  const { data: p1Created, error: p1CreateErr } = await client1
    .from("patients")
    .insert({
      organization_id: org1Id,
      first_name: "Paciente",
      last_name: "Uno (Clínica 1)",
      email: "paciente1@test.local",
    })
    .select()
    .single();
  pat1Id = p1Created?.id;
  assert(pat1Id, "Paciente 1 creado en Clínica 1", p1CreateErr ? `${p1CreateErr.message} (${p1CreateErr.details || p1CreateErr.hint})` : "");

  // Usuario 2 crea Paciente 2 en Clínica 2
  const { data: p2Created, error: p2CreateErr } = await client2
    .from("patients")
    .insert({
      organization_id: org2Id,
      first_name: "Paciente",
      last_name: "Dos (Clínica 2)",
      email: "paciente2@test.local",
    })
    .select()
    .single();
  pat2Id = p2Created?.id;
  assert(pat2Id, "Paciente 2 creado en Clínica 2", p2CreateErr ? `${p2CreateErr.message} (${p2CreateErr.details || p2CreateErr.hint})` : "");

  // Usuario 1 consulta lista de pacientes (NO debe ver a Paciente 2)
  const { data: u1Patients } = await client1.from("patients").select("id, first_name");
  const u1SeesP2 = u1Patients?.some((p) => p.id === pat2Id);
  assert(!u1SeesP2, "Aislamiento SELECT: Usuario 1 NO puede ver pacientes de Clínica 2");

  // Usuario 2 consulta lista de pacientes (NO debe ver a Paciente 1)
  const { data: u2Patients } = await client2.from("patients").select("id, first_name");
  const u2SeesP1 = u2Patients?.some((p) => p.id === pat1Id);
  assert(!u2SeesP1, "Aislamiento SELECT: Usuario 2 NO puede ver pacientes de Clínica 1");

  // Usuario 2 intenta actualizar Paciente 1 (de Clínica 1)
  const { data: u2UpdateP1 } = await client2
    .from("patients")
    .update({ first_name: "Hacked by Org 2" })
    .eq("id", pat1Id)
    .select();
  assert(
    !u2UpdateP1 || u2UpdateP1.length === 0,
    "Aislamiento UPDATE: Usuario 2 NO puede modificar pacientes de Clínica 1"
  );

  // --------------------------------------------------------------------------
  // TEST 5: Integridad Relacional en Citas (Inyección Cross-Tenant)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 5: Prevención de Asociación Cruzada en Citas (Cross-Tenant) ---");
  // Usuario 1 intenta agendar una cita en Clínica 1 vinculando al Paciente 2 (de Clínica 2)
  const { data: badApp, error: badAppErr } = await client1
    .from("appointments")
    .insert({
      organization_id: org1Id,
      patient_id: pat2Id, // PACIENTE DE CLÍNICA 2!
      professional_id: prof1Id,
      appointment_date: "2026-11-15",
      start_time: "10:00:00",
    })
    .select();

  assert(
    badAppErr !== null,
    "Trigger bloqueó inserción de cita con paciente de otra organización",
    badAppErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 6: Creación Legítima de Cita para Profesional Autorizado
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 6: Creación legítima de cita en clínica autorizada ---");
  const { data: goodApp, error: goodAppErr } = await client1
    .from("appointments")
    .insert({
      organization_id: org1Id,
      patient_id: pat1Id,
      professional_id: prof1Id,
      appointment_date: "2026-11-15",
      start_time: "10:00:00",
      status: "scheduled",
    })
    .select()
    .single();

  assert(
    goodApp && goodApp.status === "scheduled" && !goodAppErr,
    "Cita legítima creada exitosamente para profesional en su consultorio",
    goodAppErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 7: Intento de auto-upgrade no autorizado en Subscriptions
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 7: Bloqueo de auto-upgrade no autorizado en Subscriptions ---");
  const { data: subUpgrade, error: subUpErr } = await client1
    .from("subscriptions")
    .update({ plan: "clinic" })
    .eq("organization_id", org1Id)
    .select();

  assert(
    !subUpgrade || subUpgrade.length === 0,
    "RLS bloqueó la modificación no autorizada del plan de suscripción por el cliente"
  );

  // --------------------------------------------------------------------------
  // TEST 8: Intento de falsificación de autor en Audit Logs
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 8: Bloqueo de suplantación en Audit Logs ---");
  const { data: badAudit, error: badAuditErr } = await client1
    .from("audit_logs")
    .insert({
      user_id: user2.id, // INTENTO DE SUPLANTAR AL USUARIO 2!
      action: "FAKE_DELETE",
      table_name: "patients",
    })
    .select();

  assert(
    badAuditErr !== null,
    "RLS bloqueó la inserción en audit_logs con user_id falso",
    badAuditErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 9: Verificación de Integridad Relacional en Sesiones
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 9: Integridad Relacional en Sesiones Clínicas ---");
  // Intentar crear sesión para Paciente 1 pero con Profesional 2 (de Clínica 2)
  const { data: badSess, error: badSessErr } = await client1
    .from("sessions")
    .insert({
      patient_id: pat1Id,
      professional_id: prof2Id, // PROFESIONAL DE CLÍNICA 2!
      session_summary: "Sesión cruzada fraudulenta",
    })
    .select();

  assert(
    badSessErr !== null,
    "Trigger bloqueó sesión que intentaba vincular profesional de otra clínica",
    badSessErr?.message
  );

  // --------------------------------------------------------------------------
  // TEST 10: Verificación de Aislamiento del Modo Demo
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 10: Verificación de Aislamiento del Modo Demo ---");
  const demoCode = fs.readFileSync("apps/web/lib/demo/clinical-data.ts", "utf8");
  const hasSupabaseImport = demoCode.includes("from \"@/lib/supabase\"") || demoCode.includes("from '@supabase");
  assert(
    !hasSupabaseImport,
    "DemoClinicalDataService opera sin imports ni dependencias del cliente Supabase",
    "Aislamiento 100% en memoria/localStorage garantizado"
  );

  // --------------------------------------------------------------------------
  // RESUMEN
  // --------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`  RESULTADO: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("❌ Error no controlado en la suite de pruebas:", err);
  process.exit(1);
});
