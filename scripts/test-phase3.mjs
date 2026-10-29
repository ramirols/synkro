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
console.log("  SYNKRO — SUITE DE PRUEBAS DE BÓVEDA Y SEGURIDAD CLÍNICA (FASE 3)");
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

async function runPhase3Tests() {
  const ts = Date.now();
  const emailPsychoA = `psicologo.a_${ts}@synkro.local`;
  const emailPsychoB = `psicologo.b_${ts}@synkro.local`;
  const emailAssistant = `asistente_${ts}@synkro.local`;
  const emailPatient = `paciente.portal_${ts}@synkro.local`;
  const emailPsychoOther = `psicologo.otro_${ts}@synkro.local`;
  const password = "TestPassword123*!";

  let clientA, clientB, clientAssistant, clientPatient, clientOther;
  let userA, userB, userAssistant, userPatient, userOther;
  let orgId, profAId, profBId, patientId, sessionId;

  // --------------------------------------------------------------------------
  // SETUP: Registrar Terapeuta A (Owner) en Clínica 1
  // --------------------------------------------------------------------------
  console.log("--- SETUP: Registro de profesionales, pacientes y roles en Clínica 1 ---");
  const regA = await supabase.auth.signUp({
    email: emailPsychoA,
    password: password,
    options: {
      data: {
        full_name: "Lic. Andrea Morales (Terapeuta Titular)",
        license_number: "C.Ps.P. 31201",
        clinic_name: "Clínica Psicológica del Sur",
        organization_type: "clinic",
      },
    },
  });
  assert(regA.data.user?.id, "Terapeuta A registrado exitosamente");
  userA = regA.data.user;

  clientA = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await clientA.auth.signInWithPassword({ email: emailPsychoA, password });

  // Obtener orgId y profAId
  const { data: memA } = await clientA
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userA.id)
    .single();
  orgId = memA.organization_id;

  const { data: profA } = await clientA
    .from("professionals")
    .select("id")
    .eq("profile_id", userA.id)
    .single();
  profAId = profA.id;

  // Registrar Terapeuta B (Colega en la MISMA clínica)
  const regB = await supabase.auth.signUp({
    email: emailPsychoB,
    password: password,
    options: {
      data: {
        full_name: "Lic. Bernardo Castillo (Terapeuta Colega)",
        license_number: "C.Ps.P. 31202",
      },
    },
  });
  userB = regB.data.user;
  clientB = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await clientB.auth.signInWithPassword({ email: emailPsychoB, password });

  // Vincular Terapeuta B como psicólogo en la misma organización (mediante SQL seguro)
  runSql(`INSERT INTO public.organization_members (organization_id, user_id, role) VALUES ('${orgId}', '${userB.id}', 'psychologist') ON CONFLICT DO NOTHING;`);
  runSql(`INSERT INTO public.professionals (organization_id, profile_id, specialty, license_number) VALUES ('${orgId}', '${userB.id}', 'TCC', 'C.Ps.P. 31202') ON CONFLICT DO NOTHING;`);
  const profBIdQuery = runSql(`SELECT id FROM public.professionals WHERE profile_id = '${userB.id}' AND organization_id = '${orgId}';`);
  profBId = profBIdQuery;

  // Registrar Asistente en la misma clínica
  const regAss = await supabase.auth.signUp({
    email: emailAssistant,
    password: password,
    options: { data: { full_name: "Valeria Gómez (Recepción y Asistencia)" } },
  });
  userAssistant = regAss.data.user;
  clientAssistant = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await clientAssistant.auth.signInWithPassword({ email: emailAssistant, password });
  runSql(`INSERT INTO public.organization_members (organization_id, user_id, role) VALUES ('${orgId}', '${userAssistant.id}', 'assistant') ON CONFLICT DO NOTHING;`);

  // Registrar Paciente en la misma clínica
  const regPat = await supabase.auth.signUp({
    email: emailPatient,
    password: password,
    options: { data: { full_name: "Camila Valdivia (Paciente)" } },
  });
  userPatient = regPat.data.user;
  clientPatient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await clientPatient.auth.signInWithPassword({ email: emailPatient, password });

  const regOther = await supabase.auth.signUp({
    email: emailPsychoOther,
    password: password,
    options: {
      data: {
        full_name: "Lic. Diana Montes (Otra Clínica)",
        license_number: "C.Ps.P. 31203",
        clinic_name: "Consultorio Independiente San Isidro",
      },
    },
  });
  userOther = regOther.data.user;
  clientOther = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await clientOther.auth.signInWithPassword({ email: emailPsychoOther, password });

  // Crear registro clínico de paciente para Camila en Clínica 1
  const { data: createdPat, error: patErr } = await clientA
    .from("patients")
    .insert({
      organization_id: orgId,
      first_name: "Camila",
      last_name: "Valdivia",
      email: emailPatient,
      phone: "+51 987 654 321",
      therapeutic_approach: "Cognitivo Conductual",
    })
    .select()
    .single();

  assert(!patErr && createdPat?.id, "Expediente del paciente registrado en la clínica");
  patientId = createdPat.id;

  // Vincular explícitamente al paciente con su cuenta activa verificada
  runSql(`UPDATE public.patients SET user_id = '${userPatient.id}', portal_status = 'active' WHERE id = '${patientId}';`);

  // --------------------------------------------------------------------------
  // TEST 1: Registro de sesión con campos SOAP y notas privadas protegidas
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 1: Registro de sesión con formato SOAP y desacoplamiento de notas privadas ---");
  const secretNoteText = "NOTA CONFIDENCIAL TERAPEUTA A: Hipótesis de contratransferencia y dinámica familiar sensible.";
  const { data: createdSess, error: sessErr } = await clientA
    .from("sessions")
    .insert({
      patient_id: patientId,
      professional_id: profAId,
      session_number: 1,
      emotional_score: 7,
      session_summary: "Sesión 1: Establecimiento de encuadre psicoterapéutico y formulación clínica TCC.",
      soap_subjective: "Paciente reporta síntomas de activación autonómica ante demandas de su jefatura.",
      soap_objective: "Contacto visual sostenido, postura relajada, colaboradora durante la entrevista.",
      soap_assessment: "Sintomatología compatible con trastorno de adaptación con ansiedad reactiva.",
      soap_plan: "Autorregistro ABC de pensamientos automáticos y técnica de respiración diafragmática.",
      private_notes: secretNoteText,
    })
    .select()
    .single();

  if (sessErr) {
    console.error("DEBUG sessErr:", sessErr);
  }
  assert(!sessErr && createdSess?.id, "Sesión clínica creada exitosamente con campos SOAP", sessErr?.message);
  sessionId = createdSess.id;

  // Verificar que en public.sessions la columna private_notes se limpió por el trigger
  const rawSessionRow = runSql(`SELECT private_notes FROM public.sessions WHERE id = '${sessionId}';`);
  assert(rawSessionRow === "", "Trigger sanitizó public.sessions.private_notes (queda NULL en la tabla principal)");

  // --------------------------------------------------------------------------
  // TEST 2: Aislamiento estricto de session_private_notes por autor (RLS)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 2: Aislamiento estricto de notas privadas (author_id = auth.uid()) ---");

  // 1. Terapeuta A (autor legítimo) consulta su nota privada
  const { data: notesA, error: errNotesA } = await clientA
    .from("session_private_notes")
    .select("content")
    .eq("session_id", sessionId);

  assert(
    !errNotesA && notesA?.length === 1 && notesA[0].content === secretNoteText,
    "Terapeuta A puede leer su propia nota privada de contratransferencia"
  );

  // 2. Terapeuta B (colega psicólogo en la MISMA clínica) intenta consultar la nota privada
  const { data: notesB } = await clientB
    .from("session_private_notes")
    .select("content")
    .eq("session_id", sessionId);

  assert(
    notesB?.length === 0,
    "RLS BLOQUEÓ a Terapeuta B: un colega psicólogo de la misma clínica NO puede ver la nota privada del autor"
  );

  // 3. Asistente / Recepción de la misma clínica intenta consultar la nota privada
  const { data: notesAss } = await clientAssistant
    .from("session_private_notes")
    .select("content")
    .eq("session_id", sessionId);

  assert(
    notesAss?.length === 0,
    "RLS BLOQUEÓ a Recepción/Asistente: personal administrativo no puede leer notas privadas"
  );

  // 4. Paciente intenta consultar la nota privada de su terapeuta
  const { data: notesPat } = await clientPatient
    .from("session_private_notes")
    .select("content")
    .eq("session_id", sessionId);

  assert(
    notesPat?.length === 0,
    "RLS BLOQUEÓ al Paciente: el paciente NO tiene acceso a notas privadas de reflexión clínica"
  );

  // 5. Usuario externo (otra clínica) intenta consultar la nota privada
  const { data: notesOther } = await clientOther
    .from("session_private_notes")
    .select("content")
    .eq("session_id", sessionId);

  assert(
    notesOther?.length === 0,
    "RLS BLOQUEÓ a usuario de otra clínica (aislamiento multi-tenant absoluto)"
  );

  // --------------------------------------------------------------------------
  // TEST 3: Protección del registro de auditoría (sin texto clínico plano)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: Protección de Audit Logs (secreto profesional) ---");
  const auditDetails = runSql(
    `SELECT new_data::text FROM public.audit_logs WHERE table_name = 'session_private_notes' AND record_id = (SELECT id FROM public.session_private_notes WHERE session_id = '${sessionId}') LIMIT 1;`
  );

  assert(
    auditDetails.includes("SECRETO_PROFESIONAL_CONTENIDO_PROTEGIDO"),
    "Trigger de auditoría marcó el evento como protegido por secreto profesional"
  );
  assert(
    !auditDetails.includes(secretNoteText),
    "Audit Logs NUNCA expone el texto clínico plano de la nota privada confidencial"
  );

  // --------------------------------------------------------------------------
  // TEST 4: Bóveda Documental (patient_files) y Compartición Granular
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Bóveda Documental (patient_files) y compartición granular con paciente ---");

  // Terapeuta A sube documento INTERNO (no compartido con el paciente)
  const { data: internalFile, error: intErr } = await clientA
    .from("patient_files")
    .insert({
      organization_id: orgId,
      patient_id: patientId,
      file_name: "Evaluacion_Psicometrica_Interna_STAI.pdf",
      storage_path: `${patientId}/eval_stai.pdf`,
      file_type: "application/pdf",
      file_category: "evaluation",
      category: "Evaluación Psicométrica",
      file_size: "1.2 MB",
      shared_with_patient: false,
    })
    .select()
    .single();

  assert(!intErr && internalFile?.id, "Archivo clínico interno registrado en la bóveda");

  // Terapeuta A sube documento COMPARTIDO con el paciente
  const { data: sharedFile, error: shErr } = await clientA
    .from("patient_files")
    .insert({
      organization_id: orgId,
      patient_id: patientId,
      file_name: "Consentimiento_Informado_Firmado.pdf",
      storage_path: `${patientId}/consentimiento_firmado.pdf`,
      file_type: "application/pdf",
      file_category: "consent",
      category: "Consentimiento Informado",
      file_size: "820 KB",
      shared_with_patient: true,
    })
    .select()
    .single();

  assert(!shErr && sharedFile?.id, "Consentimiento informado compartido registrado en la bóveda");

  // 1. Staff (Terapeuta B) puede ver ambos archivos clínicos del paciente
  const { data: staffFiles } = await clientB
    .from("patient_files")
    .select("id, file_name, shared_with_patient")
    .eq("patient_id", patientId);

  assert(
    staffFiles?.length === 2,
    "El equipo clínico autorizado de la organización puede auditar todos los archivos del paciente"
  );

  // 2. Paciente consulta la bóveda de documentos
  const { data: patientFiles } = await clientPatient
    .from("patient_files")
    .select("id, file_name, shared_with_patient");

  const seesShared = patientFiles?.some((f) => f.id === sharedFile.id);
  const seesInternal = patientFiles?.some((f) => f.id === internalFile.id);

  assert(
    seesShared && !seesInternal && patientFiles?.length === 1,
    "Paciente ve EXCLUSIVAMENTE los documentos marcados como compartidos (shared_with_patient = true)"
  );

  // 3. Paciente intenta registrar un archivo clínico en la bóveda
  const { error: patUploadErr } = await clientPatient
    .from("patient_files")
    .insert({
      organization_id: orgId,
      patient_id: patientId,
      file_name: "Documento_No_Autorizado.pdf",
      storage_path: `${patientId}/hacked.pdf`,
      file_category: "other",
      shared_with_patient: true,
    });

  assert(
    patUploadErr !== null,
    "RLS BLOQUEÓ intento del paciente de insertar archivos directamente sin rol clínico"
  );

  // 4. Usuario de OTRA clínica intenta ver archivos de este paciente
  const { data: otherFiles } = await clientOther
    .from("patient_files")
    .select("id")
    .eq("patient_id", patientId);

  assert(
    otherFiles?.length === 0,
    "RLS bloqueó acceso a archivos de la bóveda para usuarios de otras organizaciones"
  );

  // --------------------------------------------------------------------------
  // TEST 5: URLs firmadas y Storage en bucket 'patient-files'
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 5: Generación de URLs firmadas en Supabase Storage ---");
  const testStoragePath = `${patientId}/test_signed_url.pdf`;

  // Subir un blob pequeño de prueba a storage como usuario clínico
  const fileContent = Buffer.from("%PDF-1.4 test document content for synkro vault");
  const { error: uploadErr } = await clientA.storage
    .from("patient-files")
    .upload(testStoragePath, fileContent, {
      contentType: "application/pdf",
      upsert: true,
    });

  assert(!uploadErr, "Archivo de prueba subido exitosamente al bucket privado 'patient-files'");

  // Generar Signed URL con expiración de 3600 segundos (1 hora)
  const { data: signedData, error: signedErr } = await clientA.storage
    .from("patient-files")
    .createSignedUrl(testStoragePath, 3600);

  assert(
    !signedErr && signedData?.signedUrl && signedData.signedUrl.includes("token="),
    "URL firmada temporal generada exitosamente con token criptográfico de expiración"
  );

  // Limpiar archivo de prueba de storage
  await clientA.storage.from("patient-files").remove([testStoragePath]);

  // --------------------------------------------------------------------------
  // TEST 6: Portal del Paciente - Citas con Aislamiento
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 6: Acceso seguro del paciente a sus citas (Portal del Paciente) ---");

  // Crear cita para Camila en Clínica 1
  const { data: createdApp, error: appErr } = await clientA
    .from("appointments")
    .insert({
      organization_id: orgId,
      patient_id: patientId,
      professional_id: profAId,
      appointment_date: "2026-11-15",
      start_time: "10:00:00",
      status: "scheduled",
      modality: "virtual",
      notes: "Sesión 2: Revisión de autorregistro cognitivo",
    })
    .select()
    .single();

  assert(!appErr && createdApp?.id, "Cita agendada para el paciente");

  // Paciente consulta sus citas
  const { data: patAppointments } = await clientPatient
    .from("appointments")
    .select("id, appointment_date, start_time, notes");

  assert(
    patAppointments?.length === 1 && patAppointments[0].id === createdApp.id,
    "Paciente puede visualizar su propia cita programada en su portal"
  );

  // Paciente de otra clínica o usuario no relacionado no ve esta cita
  const { data: otherAppointments } = await clientOther
    .from("appointments")
    .select("id")
    .eq("id", createdApp.id);

  assert(
    otherAppointments?.length === 0,
    "RLS bloqueó a usuarios ajenos de visualizar citas privadas del paciente"
  );

  // --------------------------------------------------------------------------
  // TEST 7: Aislamiento del Modo Demo
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 7: Verificación de Aislamiento del Modo Demo (DemoClinicalDataService) ---");
  const demoCode = fs.readFileSync("apps/web/lib/demo/clinical-data.ts", "utf8");
  assert(
    !demoCode.includes("from '@/lib/supabase'") && !demoCode.includes('from "@/lib/supabase"'),
    "DemoClinicalDataService no tiene dependencias de cliente Supabase de red"
  );

  const demoStorageCode = fs.readFileSync("apps/web/lib/demo/demo-storage.ts", "utf8");
  assert(
    demoStorageCode.includes("soap_subjective") && demoStorageCode.includes("shared_with_patient"),
    "Almacenamiento de demostración soporta formato SOAP y banderas de compartición clínica"
  );

  // --------------------------------------------------------------------------
  // RESUMEN FINAL
  // --------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`  RESULTADO FASE 3: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests().catch((err) => {
  console.error("FATAL ERROR EN PRUEBAS DE FASE 3:", err);
  process.exit(1);
});
