SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 9WwRCwwsfci0ImAWPuy3Nn2w3BRgFcBYjUjxAM0845NmeLMoqdmrHrKSbeNxOd8

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "name", "slug", "logo_url", "created_at") VALUES
	('9b15140b-c4af-4024-b457-e09922c5156a', 'Centro Psicol??gico Synkro | Velyon Mind Clinic', 'synkro-mind-clinic', NULL, '2026-09-24 23:57:37.251217+00');


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."patients" ("id", "organization_id", "first_name", "last_name", "email", "phone", "birth_date", "gender", "notes", "created_at", "status", "therapeutic_approach", "consultation_reason", "emergency_contact") VALUES
	('a1111111-1111-4111-8111-111111111111', '9b15140b-c4af-4024-b457-e09922c5156a', 'Camila', 'Valdivia Rosas', 'camila.valdivia@gmail.com', '+51 984 123 456', '1996-04-15', 'Femenino', 'Llega derivada por m??dico ocupacional. Presenta somatizaciones (tensi??n cervical, insomnio de conciliaci??n). Buenas redes de apoyo.', '2026-09-28 03:10:08.935104+00', 'activo', 'Cognitivo Conductual (TCC)', 'Trastorno de Ansiedad Generalizada y Burnout Laboral', 'Roberto Valdivia (Padre) - +51 999 444 333'),
	('a2222222-2222-4222-8222-222222222222', '9b15140b-c4af-4024-b457-e09922c5156a', 'Mateo', 'Rivas Morales', 'mateo.rivas.m@outlook.com', '+51 972 881 204', '1990-11-20', 'Masculino', 'P??rdida de progenitor hace 8 meses. Dificultad para retomar proyectos profesionales y anhedonia moderada.', '2026-09-28 03:10:08.935104+00', 'activo', 'Terapia de Aceptaci??n y Compromiso (ACT)', 'Episodio Depresivo Leve y Duelo no resuelto', 'Luc??a Rivas (Hermana) - +51 981 223 900'),
	('a3333333-3333-4333-8333-333333333333', '9b15140b-c4af-4024-b457-e09922c5156a', 'Valeria', 'G??mez & Gonzalo', 'valeria.gomez.t@gmail.com', '+51 945 612 870', '1993-08-05', 'Pareja', 'Relaci??n de 4 a??os, convivencia reciente. Patrones de escalada y retiro defensivo durante discusiones.', '2026-09-28 03:10:08.935104+00', 'activo', 'Terapia Sist??mica de Pareja', 'Conflictos de comunicaci??n y convivencia en pareja', 'Valeria G??mez - +51 945 612 870'),
	('a4444444-4444-4444-8444-444444444444', '9b15140b-c4af-4024-b457-e09922c5156a', 'Sebasti??n', 'Arana Silva', 'sebas.arana.s@gmail.com', '+51 913 774 219', '2003-02-18', 'Masculino', 'Estudiante universitario de 7mo ciclo. Exigencia familiar elevada, esquemas de autoexigencia y evitaci??n conductual.', '2026-09-28 03:10:08.935104+00', 'activo', 'Cognitivo Conductual (TCC)', 'Procrastinaci??n acad??mica, baja autoestima y miedo al fracaso', 'Claudia Silva (Madre) - +51 944 112 556'),
	('a5555555-5555-4555-8555-555555555555', '9b15140b-c4af-4024-b457-e09922c5156a', 'Luc??a', 'Paredes C??rdenas', 'lucia.paredes.c@empresa.pe', '+51 961 802 345', '1982-06-30', 'Femenino', 'Directiva corporativa. Expresa sensaci??n de vac??o tras independencia de sus hijos y cuidado simult??neo de madre mayor.', '2026-09-28 03:10:08.935104+00', 'activo', 'Humanista Existencial', 'Transici??n vital, nido vac??o y sobrecarga en cuidados familiares', 'Carlos Paredes (Esposo) - +51 962 109 432'),
	('a6666666-6666-4666-8666-666666666666', '9b15140b-c4af-4024-b457-e09922c5156a', 'Diego', 'Morales Becerra', 'diego.morales.b@gmail.com', '+51 928 440 193', '1998-09-12', 'Masculino', 'Primer episodio de p??nico en transporte p??blico hace 3 semanas. Hiperventilaci??n y miedo a morir o perder el control.', '2026-09-28 03:10:08.935104+00', 'evaluacion', 'Cognitivo Conductual (TCC)', 'Crisis de angustia y Trastorno de P??nico incipiente', 'Mariana Morales (Madre) - +51 920 771 884');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "full_name", "avatar_url", "role", "created_at", "updated_at") VALUES
	('17b4f40d-336d-44ef-a261-e6e633780deb', 'Lic. Alejandro Mendoza V.', NULL, 'owner', '2026-09-24 23:57:37.251217+00', '2026-09-24 23:57:37.251217+00');


--
-- Data for Name: professionals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."professionals" ("id", "organization_id", "profile_id", "specialty", "license_number", "bio", "created_at") VALUES
	('b46dc185-655a-4a23-8f1e-d26b5c988696', '9b15140b-c4af-4024-b457-e09922c5156a', '17b4f40d-336d-44ef-a261-e6e633780deb', 'Psicolog??a Cl??nica y Terapia Cognitivo Conductual (TCC)', 'C.Ps.P. 28419', 'Especialista en trastornos de ansiedad, gesti??n del estr??s laboral y regulaci??n emocional con m??s de 8 a??os de experiencia cl??nica.', '2026-09-28 03:10:08.935104+00');


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."appointments" ("id", "organization_id", "patient_id", "professional_id", "appointment_date", "start_time", "end_time", "status", "created_at", "modality", "meeting_link", "notes") VALUES
	('b1111111-1111-4111-8111-111111111111', '9b15140b-c4af-4024-b457-e09922c5156a', 'a1111111-1111-4111-8111-111111111111', 'b46dc185-655a-4a23-8f1e-d26b5c988696', '2026-09-28', '09:00:00', '10:00:00', 'scheduled', '2026-09-28 03:10:08.935104+00', 'presencial', NULL, 'Sesi??n 5: Evaluaci??n de registro de pensamientos autom??ticos'),
	('b2222222-2222-4222-8222-222222222222', '9b15140b-c4af-4024-b457-e09922c5156a', 'a2222222-2222-4222-8222-222222222222', 'b46dc185-655a-4a23-8f1e-d26b5c988696', '2026-09-28', '11:00:00', '12:00:00', 'scheduled', '2026-09-28 03:10:08.935104+00', 'virtual', 'https://meet.google.com/syn-kro-vely', 'Sesi??n 4: Ejercicio de defusi??n cognitiva y valores vitales'),
	('b3333333-3333-4333-8333-333333333333', '9b15140b-c4af-4024-b457-e09922c5156a', 'a3333333-3333-4333-8333-333333333333', 'b46dc185-655a-4a23-8f1e-d26b5c988696', '2026-09-29', '17:00:00', '18:15:00', 'scheduled', '2026-09-28 03:10:08.935104+00', 'presencial', NULL, 'Sesi??n 3: Reglas de comunicaci??n asertiva y tiempo fuera'),
	('b4444444-4444-4444-8444-444444444444', '9b15140b-c4af-4024-b457-e09922c5156a', 'a4444444-4444-4444-8444-444444444444', 'b46dc185-655a-4a23-8f1e-d26b5c988696', '2026-09-30', '15:00:00', '16:00:00', 'scheduled', '2026-09-28 03:10:08.935104+00', 'virtual', 'https://meet.google.com/syn-kro-educ', 'Sesi??n 2: An??lisis funcional de la conducta de postergaci??n'),
	('b5555555-5555-4555-8555-555555555555', '9b15140b-c4af-4024-b457-e09922c5156a', 'a5555555-5555-4555-8555-555555555555', 'b46dc185-655a-4a23-8f1e-d26b5c988696', '2026-10-01', '10:30:00', '11:30:00', 'scheduled', '2026-09-28 03:10:08.935104+00', 'presencial', NULL, 'Sesi??n 6: Proyecto de sentido y autocuidado'),
	('b6666666-6666-4666-8666-666666666666', '9b15140b-c4af-4024-b457-e09922c5156a', 'a1111111-1111-4111-8111-111111111111', 'b46dc185-655a-4a23-8f1e-d26b5c988696', '2026-09-21', '09:00:00', '10:00:00', 'completed', '2026-09-28 03:10:08.935104+00', 'presencial', NULL, 'Sesi??n 4: Psicoeducaci??n sobre el ciclo del p??nico y activaci??n fisiol??gica'),
	('b7777777-7777-4777-8777-777777777777', '9b15140b-c4af-4024-b457-e09922c5156a', 'a2222222-2222-4222-8222-222222222222', 'b46dc185-655a-4a23-8f1e-d26b5c988696', '2026-09-20', '11:00:00', '12:00:00', 'completed', '2026-09-28 03:10:08.935104+00', 'virtual', 'https://meet.google.com/syn-kro-vely', 'Sesi??n 3: Trabajo de duelo y aceptaci??n del dolor sin sufrimiento secundario'),
	('b8888888-8888-4888-8888-888888888888', '9b15140b-c4af-4024-b457-e09922c5156a', 'a6666666-6666-4666-8666-666666666666', 'b46dc185-655a-4a23-8f1e-d26b5c988696', '2026-09-26', '18:00:00', '19:00:00', 'completed', '2026-09-28 03:10:08.935104+00', 'presencial', NULL, 'Sesi??n 1: Entrevista inicial, anamnesis y encuadre terap??utico');


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organization_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organization_members" ("id", "organization_id", "user_id", "role", "created_at") VALUES
	('b732f3c0-f8c5-458b-b0ee-b86e6a8451e5', '9b15140b-c4af-4024-b457-e09922c5156a', '17b4f40d-336d-44ef-a261-e6e633780deb', 'owner', '2026-09-24 23:57:37.251217+00');


--
-- Data for Name: patient_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."patient_files" ("id", "patient_id", "file_name", "storage_path", "file_type", "created_at", "category", "file_size") VALUES
	('231f2200-3da6-4158-b390-0637a9c9d06b', 'a1111111-1111-4111-8111-111111111111', 'Consentimiento_Informado_Terapia_Camila_Valdivia.pdf', 'patient-files/a1111111-1111-4111-8111-111111111111/consentimiento.pdf', 'application/pdf', '2026-09-28 03:10:08.935104+00', 'Consentimiento Informado', '420 KB'),
	('6f5c1ccd-4edf-4945-83c8-a00cebec6533', 'a1111111-1111-4111-8111-111111111111', 'Inventario_Ansiedad_Beck_BAI_Camila_Valdivia.pdf', 'patient-files/a1111111-1111-4111-8111-111111111111/bai_evaluacion.pdf', 'application/pdf', '2026-09-28 03:10:08.935104+00', 'Evaluaci??n Psicom??trica', '890 KB'),
	('15f8678a-cd61-46a7-a3f0-95102ca26271', 'a2222222-2222-4222-8222-222222222222', 'Escala_Depresion_BDI_II_Mateo_Rivas.pdf', 'patient-files/a2222222-2222-4222-8222-222222222222/bdi_ii.pdf', 'application/pdf', '2026-09-28 03:10:08.935104+00', 'Evaluaci??n Psicom??trica', '760 KB'),
	('18617c8f-f1f0-4592-b89c-1137fdbede2d', 'a6666666-6666-4666-8666-666666666666', 'Informe_Psicologico_Inicial_Diego_Morales.pdf', 'patient-files/a6666666-6666-4666-8666-666666666666/informe_inicial.pdf', 'application/pdf', '2026-09-28 03:10:08.935104+00', 'Informe Cl??nico', '1.4 MB');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sessions" ("id", "patient_id", "professional_id", "appointment_id", "session_summary", "private_notes", "created_at", "session_number", "emotional_score", "homework") VALUES
	('c7f7e0ee-185e-48dd-8a31-8757ca9b5f3a', 'a1111111-1111-4111-8111-111111111111', 'b46dc185-655a-4a23-8f1e-d26b5c988696', 'b6666666-6666-4666-8666-666666666666', 'EVOLUCI??N CL??NICA:
Se revisa el autorregistro de activaci??n fisiol??gica. La paciente reporta 2 episodios de taquicardia durante la semana, logrando aplicar la t??cnica de respiraci??n diafragm??tica 4-7-8 con descenso en la escala subjetiva de malestar (SUDS) de 8/10 a 4/10. Se profundiza en la distorsi??n cognitiva de catastrofismo relacionada al rendimiento laboral.

PLAN DE TRABAJO:
Continuar con reestructuraci??n cognitiva y exposici??n interoceptiva gradual.', 'NOTAS PRIVADAS (CONFIDENCIAL PSIC??LOGO):
Notable rigidez defensiva vinculada a expectativas paternas no exteriorizadas. En el relato menciona que "no puede permitirse fallar porque en casa siempre fue la fuerte". Explorar en siguientes sesiones el apego ansioso y el rol de salvadora que ha adoptado en el entorno laboral. Sin ideaci??n autol??tica.', '2026-09-21 03:10:08.935104+00', 4, 6, 'Completar autorregistro de 4 columnas (Situaci??n, Emoci??n, Pensamiento Autom??tico, Respuesta Racional) ante momentos de sobrecarga.'),
	('bf9c54ea-2a14-4003-98ef-ee875777f6a4', 'a2222222-2222-4222-8222-222222222222', 'b46dc185-655a-4a23-8f1e-d26b5c988696', 'b7777777-7777-4777-8777-777777777777', 'EVOLUCI??N CL??NICA:
Abordaje del proceso de duelo. El paciente logra verbalizar por primera vez la sensaci??n de soledad sin interrumpir el llanto cat??rtico. Se trabaja la diferencia entre el dolor natural de la p??rdida y la culpa autoprovocada. Conexi??n con valores de gratitud y legado familiar.

PLAN DE TRABAJO:
Activaci??n conductual de bajo impacto (caminatas matutinas) y escritura terap??utica dirigida.', 'NOTAS PRIVADAS (CONFIDENCIAL PSIC??LOGO):
Riesgo de aislamiento social si deja el trabajo remoto. Ha descuidado h??bitos de alimentaci??n (salta el almuerzo). Mantener monitoreo cercano de sintomatolog??a depresiva. Se nota buena alianza terap??utica, apertura emocional sincera.', '2026-09-20 03:10:08.935104+00', 3, 5, 'Escribir una carta no enviada a su padre expresando lo no dicho antes de su partida.'),
	('400d56da-1466-43d0-b27f-60ced69ef87e', 'a6666666-6666-4666-8666-666666666666', 'b46dc185-655a-4a23-8f1e-d26b5c988696', 'b8888888-8888-4888-8888-888888888888', 'EVOLUCI??N CL??NICA:
Primera sesi??n de evaluaci??n. Se realiza motivo de consulta, encuadre terap??utico, firma de consentimiento informado y aplicaci??n de inventario de ansiedad de Beck (BAI) arrojando puntaje de 31 (ansiedad severa). Se brinda psicoeducaci??n clara sobre qu?? es una crisis de p??nico y por qu?? no produce da??o card??aco ni p??rdida de la cordura.

PLAN DE TRABAJO:
Desmitificar el ataque de p??nico y entrenamiento en respiraci??n de emergencia.', 'NOTAS PRIVADAS (CONFIDENCIAL PSIC??LOGO):
El paciente acude acompa??ado de su madre quien muestra sobreprotecci??n excesiva (intentaba responder por ??l). Se solicit?? espacio individual para favorecer la autonom??a. Paciente hipervigilante a sensaciones corporales (pulso, sudoraci??n). Muy receptivo a la explicaci??n biol??gica del SNS.', '2026-09-26 03:10:08.935104+00', 1, 4, 'Lectura del tr??ptico informativo "Comprendiendo la respuesta de lucha o huida". Registro de frecuencia de chequeo de pulso.');


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."subscriptions" ("id", "organization_id", "plan", "status", "created_at") VALUES
	('bc3ea69a-9582-4d71-ac9f-3888983aaa70', '9b15140b-c4af-4024-b457-e09922c5156a', 'professional', 'active', '2026-09-24 23:57:37.251217+00');


--
-- PostgreSQL database dump complete
--

-- \unrestrict 9WwRCwwsfci0ImAWPuy3Nn2w3BRgFcBYjUjxAM0845NmeLMoqdmrHrKSbeNxOd8

RESET ALL;
