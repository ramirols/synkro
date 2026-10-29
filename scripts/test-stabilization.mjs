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
console.log("  SYNKRO — SUITE DE ESTABILIZACIÓN Y ENDURECIMIENTO (FASE 4)");
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

function runSql(sql) {
  const cleanSql = sql.replace(/"/g, '\\"');
  return execSync(`docker exec supabase_db_Synkro psql -U postgres -d postgres -t -A -c "${cleanSql}"`, {
    encoding: "utf8",
  }).trim();
}

async function runStabilizationTests() {
  const ts = Date.now();
  const emailTherapist = `terapeuta.f4_${ts}@synkro.local`;
  const emailPatient = `paciente.f4_${ts}@synkro.local`;
  const emailAttacker = `atacante.f4_${ts}@synkro.local`;
  const password = "TestPassword123*!";

  let clientTherapist, clientPatient, clientAttacker;
  let userTherapist, userPatient, userAttacker;
  let orgId, patientId;

  // --------------------------------------------------------------------------
  // SETUP: Registrar Terapeuta Titular
  // --------------------------------------------------------------------------
  console.log("--- SETUP: Registro de terapeuta y paciente ---");
  const regTherapist = await supabase.auth.signUp({
    email: emailTherapist,
    password: password,
    options: {
      data: {
        full_name: "Lic. Martín Sotomayor",
        license_number: "C.Ps.P. 44521",
        clinic_name: "Clínica Psicológica del Rímac",
        organization_type: "independent",
      },
    },
  });

  if (regTherapist.error) {
    console.error("Fallo al registrar terapeuta:", regTherapist.error);
    process.exit(1);
  }
  userTherapist = regTherapist.data.user;

  // Cliente autenticado como Terapeuta
  const authTherapist = await supabase.auth.signInWithPassword({
    email: emailTherapist,
    password: password,
  });
  clientTherapist = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${authTherapist.data.session.access_token}` },
    },
  });

  // Obtener org_id
  const orgRes = await clientTherapist
    .from("organization_members")
    .select("organization_id")
    .limit(1)
    .single();
  orgId = orgRes.data.organization_id;

  // Registrar un paciente para el terapeuta
  const patRes = await clientTherapist
    .from("patients")
    .insert([
      {
        organization_id: orgId,
        first_name: "Gonzalo",
        last_name: "Barreto",
        email: emailPatient,
        phone: "+51 988 123 456",
        therapeutic_approach: "TCC",
        consultation_reason: "Trastorno de ansiedad generalizada",
      },
    ])
    .select()
    .single();

  if (patRes.error) {
    console.error("Fallo al insertar paciente:", patRes.error);
    process.exit(1);
  }
  patientId = patRes.data.id;

  // Registrar un documento compartido y uno privado para el paciente
  const fileShared = await clientTherapist.from("patient_files").insert([
    {
      organization_id: orgId,
      patient_id: patientId,
      file_name: "Guia_Desensibilizacion.pdf",
      storage_path: `${patientId}/guia.pdf`,
      file_type: "application/pdf",
      shared_with_patient: true,
      file_category: "other",
    },
  ]);

  const filePrivate = await clientTherapist.from("patient_files").insert([
    {
      organization_id: orgId,
      patient_id: patientId,
      file_name: "Informe_Pericial_Confidencial.pdf",
      storage_path: `${patientId}/peritaje.pdf`,
      file_type: "application/pdf",
      shared_with_patient: false,
      file_category: "report",
    },
  ]);

  // Obtener profesional asociado al terapeuta
  const profRes = await clientTherapist
    .from("professionals")
    .select("id")
    .limit(1)
    .single();

  if (profRes.error || !profRes.data) {
    console.error("Fallo al obtener profesional:", profRes.error);
    process.exit(1);
  }
  const profId = profRes.data.id;

  // Programar una cita para el paciente
  const appInsert = await clientTherapist.from("appointments").insert([
    {
      organization_id: orgId,
      patient_id: patientId,
      professional_id: profId,
      appointment_date: "2026-11-05",
      start_time: "15:00",
      status: "scheduled",
      modality: "virtual",
      meeting_link: "https://meet.google.com/syn-kro-test",
    },
  ]);

  if (appInsert.error) {
    console.error("Fallo al insertar cita:", appInsert.error);
    process.exit(1);
  }

  // Registrar cuenta del paciente
  const regPatient = await supabase.auth.signUp({
    email: emailPatient,
    password: password,
    options: {
      data: { full_name: "Gonzalo Barreto", role: "patient" },
    },
  });
  userPatient = regPatient.data.user;

  const authPatient = await supabase.auth.signInWithPassword({
    email: emailPatient,
    password: password,
  });
  clientPatient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${authPatient.data.session.access_token}` },
    },
  });

  // Registrar atacante / tercero
  const regAttacker = await supabase.auth.signUp({
    email: emailAttacker,
    password: password,
    options: {
      data: { full_name: "Usuario Externo", role: "patient" },
    },
  });
  userAttacker = regAttacker.data.user;

  const authAttacker = await supabase.auth.signInWithPassword({
    email: emailAttacker,
    password: password,
  });
  clientAttacker = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${authAttacker.data.session.access_token}` },
    },
  });

  console.log("\n=================================================================");
  console.log("  BLOQUE 1: INVITACIÓN CRIPTOGRÁFICA AL PORTAL DEL PACIENTE");
  console.log("=================================================================");

  // 1. Paciente no vinculado inicialmente no puede ver el registro
  const unlinkedCheck = await clientPatient.from("patients").select("*");
  assert(
    unlinkedCheck.data?.length === 0,
    "1. Paciente sin invitación aceptada NO puede ver expedientes bajo RLS",
    `Filas devueltas: ${unlinkedCheck.data?.length}`
  );

  // 2. Terapeuta genera token de invitación
  const invRes = await clientTherapist.rpc("create_patient_portal_invitation", {
    p_patient_id: patientId,
  });

  assert(
    !invRes.error && invRes.data?.token && invRes.data.token.length === 64,
    "2. Terapeuta genera token de invitación seguro (SHA-256 de 64 caracteres hex)",
    `Token: ${invRes.data?.token}`
  );

  const token = invRes.data?.token;

  // 3. Verificar estado en base de datos: portal_status = 'invited'
  const patStatusCheck = runSql(
    `SELECT portal_status FROM public.patients WHERE id = '${patientId}'`
  );
  assert(
    patStatusCheck === "invited",
    "3. Registro del paciente pasa a estado 'invited' con timestamp de envío",
    `Estado BD: ${patStatusCheck}`
  );

  // 4. Usuario atacante con token válido pero con correo erróneo NO puede activar
  const attackerAccept = await clientAttacker.rpc("accept_patient_portal_invitation", {
    p_token: token,
  });
  assert(
    attackerAccept.error !== null,
    "4. Cuenta con correo diferente no puede reclamar el token de invitación",
    attackerAccept.error?.message
  );

  // 5. Paciente legítimo acepta la invitación con el token
  const patientAccept = await clientPatient.rpc("accept_patient_portal_invitation", {
    p_token: token,
  });

  assert(
    !patientAccept.error && patientAccept.data?.patient_id === patientId,
    "5. Paciente legítimo acepta la invitación y vincula su user_id exitosamente",
    patientAccept.error?.message
  );

  // 6. Verificar que el token se limpió y el estado es 'active'
  const patActiveCheck = runSql(
    `SELECT portal_status, portal_invitation_token IS NULL as token_cleared FROM public.patients WHERE id = '${patientId}'`
  );
  assert(
    patActiveCheck.includes("active|t"),
    "6. Token criptográfico es invalidado (NULL) tras uso y portal_status = 'active'",
    `BD: ${patActiveCheck}`
  );

  // 7. Ataque de repetición (replay attack) debe ser rechazado
  const replayAccept = await clientPatient.rpc("accept_patient_portal_invitation", {
    p_token: token,
  });
  assert(
    replayAccept.error !== null,
    "7. Ataque de reutilización del mismo token es rechazado con error",
    replayAccept.error?.message
  );

  console.log("\n=================================================================");
  console.log("  BLOQUE 2: ACCESO RIGUROSO DE PACIENTE BAJO RLS ENDURECIDO");
  console.log("=================================================================");

  // 8. Paciente ahora ve EXCLUSIVAMENTE su propio expediente
  const patientSelf = await clientPatient.from("patients").select("id, first_name, last_name, therapeutic_approach");
  assert(
    patientSelf.data?.length === 1 && patientSelf.data[0].id === patientId,
    "8. Paciente activo ve su propio expediente clínico bajo RLS",
    `Expediente ID: ${patientSelf.data?.[0]?.id}`
  );

  // 9. Paciente ve citas programadas asociadas a su id
  const patientApps = await clientPatient.from("appointments").select("id, appointment_date, modality, meeting_link");
  assert(
    patientApps.data?.length === 1 && patientApps.data[0].meeting_link !== null,
    "9. Paciente ve sus citas y enlaces de videollamada asignados",
    `Citas devueltas: ${patientApps.data?.length}`
  );

  // 10. Paciente ve SOLO archivos clínicos compartidos
  const patientFiles = await clientPatient.from("patient_files").select("id, file_name, shared_with_patient");
  const hasUnshared = patientFiles.data?.some((f) => f.shared_with_patient === false);
  assert(
    patientFiles.data?.length === 1 && !hasUnshared && patientFiles.data[0].file_name === "Guia_Desensibilizacion.pdf",
    "10. Paciente ve ÚNICAMENTE documentos con shared_with_patient=true (peritaje privado oculto)",
    `Archivos devueltos: ${patientFiles.data?.length}`
  );

  console.log("\n=================================================================");
  console.log("  BLOQUE 3: REVOCACIÓN DE ACCESO Y AISLAMIENTO DE SUPERADMIN");
  console.log("=================================================================");

  // 11. Terapeuta revoca acceso al portal
  const revokeRes = await clientTherapist.rpc("revoke_patient_portal_access", {
    p_patient_id: patientId,
  });
  assert(
    !revokeRes.error,
    "11. Terapeuta revoca acceso al portal clínico satisfactoriamente",
    revokeRes.error?.message
  );

  // 12. Paciente revocado ya no puede consultar el expediente
  const patientRevokedCheck = await clientPatient.from("patients").select("*");
  assert(
    patientRevokedCheck.data?.length === 0,
    "12. Paciente con acceso revocado queda inmediatamente bloqueado de consultar pacientes por RLS",
    `Filas devueltas tras revocación: ${patientRevokedCheck.data?.length}`
  );

  // 13. Superadmin NO tiene acceso a historias de pacientes por SELECT directo
  // Crear cliente superadmin simulado
  const superEmail = `superadmin.f4_${ts}@synkro.local`;
  const regSuper = await supabase.auth.signUp({
    email: superEmail,
    password: password,
  });
  runSql(`UPDATE public.profiles SET platform_role = 'superadmin' WHERE id = '${regSuper.data.user.id}'`);

  const authSuper = await supabase.auth.signInWithPassword({
    email: superEmail,
    password: password,
  });
  const clientSuper = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${authSuper.data.session.access_token}` },
    },
  });

  const superPatients = await clientSuper.from("patients").select("id, first_name");
  assert(
    superPatients.data?.length === 0,
    "13. Superadmin NO puede leer historias de pacientes directamente vía SELECT (aislamiento PHI Ley 29733)",
    `Filas devueltas a superadmin: ${superPatients.data?.length}`
  );

  const superFiles = await clientSuper.from("patient_files").select("id, file_name");
  assert(
    superFiles.data?.length === 0,
    "14. Superadmin NO puede leer documentos de pacientes vía SELECT (blindaje de bóveda clínica)",
    `Archivos devueltos a superadmin: ${superFiles.data?.length}`
  );

  // 15. Superadmin conserva acceso a métricas comerciales vía admin_list_organizations
  const superOrgs = await clientSuper.rpc("admin_list_organizations");
  assert(
    !superOrgs.error && Array.isArray(superOrgs.data) && superOrgs.data.length > 0,
    "15. Superadmin conserva acceso a métricas de facturación y organizaciones vía RPC autorizada",
    `Organizaciones devueltas: ${superOrgs.data?.length}`
  );

  console.log("\n=================================================================");
  console.log("  RESUMEN DE PRUEBAS DE ESTABILIZACIÓN Y SEGURIDAD:");
  console.log(`  Total: ${passed + failed} | Aprobadas: ${passed} | Fallidas: ${failed}`);
  console.log("=================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStabilizationTests().catch((err) => {
  console.error("Error fatal en suite de estabilización:", err);
  process.exit(1);
});
