"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Patient } from "@/lib/types/clinical";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Filter,
  X,
  Brain,
  Shield,
  AlertCircle,
} from "lucide-react";

export default function PacientesView() {
  const { service, basePath, isDemo } = useClinicalData();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [approachFilter, setApproachFilter] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("Femenino");
  const [therapeuticApproach, setTherapeuticApproach] = useState(
    "Cognitivo Conductual (TCC)"
  );
  const [consultationReason, setConsultationReason] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [notes, setNotes] = useState("");

  const loadPatients = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await service.getPatients();
      setPatients(data || []);
    } catch (err: any) {
      console.error("Error fetching patients:", err);
      setErrorMsg(err.message || "Error al cargar los pacientes.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [service]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Nombre y apellido son obligatorios");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      await service.createPatient({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        birth_date: birthDate || null,
        gender: gender || null,
        therapeutic_approach: therapeuticApproach,
        consultation_reason: consultationReason.trim() || null,
        emergency_contact: emergencyContact.trim() || null,
        notes: notes.trim() || null,
        status: "activo",
      });

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setBirthDate("");
      setConsultationReason("");
      setEmergencyContact("");
      setNotes("");
      setIsModalOpen(false);
      await loadPatients();
    } catch (err: any) {
      console.error("Error creating patient:", err);
      setErrorMsg(err.message || "Error al registrar paciente.");
    } finally {
      setSaving(false);
    }
  };

  // Filter logic
  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.consultation_reason &&
        p.consultation_reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "todos" ? true : p.status === statusFilter;

    const matchesApproach =
      approachFilter === "todos"
        ? true
        : p.therapeutic_approach === approachFilter;

    return matchesSearch && matchesStatus && matchesApproach;
  });

  return (
    <div className="space-y-8">
      {/* Error alert */}
      {errorMsg && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Directorio de Pacientes
            </h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
              {patients.length} {patients.length === 1 ? "expediente" : "expedientes"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Expedientes clínicos digitales protegidos bajo secreto profesional.
          </p>
        </div>

        <button
          onClick={() => {
            if (isDemo) {
              notifyDemoWriteBlocked("Crear Nuevo Paciente");
              return;
            }
            setErrorMsg("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>+ Nuevo Paciente</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o motivo de consulta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter size={14} />
            <span>Filtros:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activo">Activos</option>
            <option value="evaluacion">En Evaluación</option>
            <option value="alta">Alta Terapéutica</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <select
            value={approachFilter}
            onChange={(e) => setApproachFilter(e.target.value)}
            className="h-10 rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 max-w-[200px] truncate"
          >
            <option value="todos">Todos los Enfoques</option>
            <option value="Cognitivo Conductual (TCC)">TCC</option>
            <option value="Terapia de Aceptación y Compromiso (ACT)">
              ACT
            </option>
            <option value="Terapia Sistémica de Pareja">Sistémica</option>
            <option value="Humanista Existencial">Humanista</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Motivo Principal & Enfoque</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    Cargando expediente de pacientes...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No se encontraron pacientes que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/30 group">
                    <td className="px-6 py-4">
                      <Link
                        href={`${basePath}/pacientes/${p.id}`}
                        className="flex items-center gap-3 group-hover:text-primary transition-colors"
                      >
                        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary font-bold text-primary text-xs shrink-0">
                          {p.first_name?.[0] || "P"}
                          {p.last_name?.[0] || ""}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors block text-sm">
                            {p.first_name} {p.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {p.gender || "Paciente"} • {p.birth_date || "Fecha no esp."}
                          </span>
                        </div>
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {p.phone ? (
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Phone size={12} className="text-primary shrink-0" />
                            <span>{p.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic block">Sin teléfono</span>
                        )}
                        {p.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="shrink-0 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{p.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic block">Sin correo</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs space-y-1">
                        <p className="text-xs font-medium text-foreground line-clamp-1" title={p.consultation_reason || "Consulta general"}>
                          {p.consultation_reason || "Consulta psicológica general"}
                        </p>
                        <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {p.therapeutic_approach || "TCC"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          p.status === "activo"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : p.status === "evaluacion"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : p.status === "alta"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.status === "activo"
                          ? "Activo"
                          : p.status === "evaluacion"
                          ? "En Evaluación"
                          : p.status === "alta"
                          ? "Alta Terapéutica"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`${basePath}/pacientes/${p.id}`}
                          className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-colors shadow-2xs"
                        >
                          Expediente
                        </Link>
                        <Link
                          href={`${basePath}/agenda?patient_id=${p.id}`}
                          className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          Cita
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo Paciente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border bg-card p-6 sm:p-8 shadow-xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Ficha de Admisión / Nuevo Paciente
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isDemo
                    ? "Los datos se guardarán localmente para la demostración."
                    : "Ingresa los datos para abrir el expediente clínico en Supabase."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Camila"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Valdivia Rosas"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="paciente@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+51 984 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Género / Identidad
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="No binario">No binario</option>
                    <option value="Pareja">Pareja</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Enfoque Terapéutico
                  </label>
                  <select
                    value={therapeuticApproach}
                    onChange={(e) => setTherapeuticApproach(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 truncate"
                  >
                    <option value="Cognitivo Conductual (TCC)">TCC</option>
                    <option value="Terapia de Aceptación y Compromiso (ACT)">
                      ACT
                    </option>
                    <option value="Terapia Sistémica de Pareja">Sistémica</option>
                    <option value="Humanista Existencial">Humanista</option>
                    <option value="Psicoanálisis Relacional">
                      Psicoanálisis
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Motivo de Consulta Principal
                </label>
                <input
                  type="text"
                  placeholder="Ej. Trastorno de Ansiedad Generalizada, crisis de pánico o dificultades laborales..."
                  value={consultationReason}
                  onChange={(e) => setConsultationReason(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Contacto de Emergencia
                </label>
                <input
                  type="text"
                  placeholder="Ej. Roberto Valdivia (Padre) - +51 999 444 333"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Observaciones Clínicas Iniciales (Privadas)
                </label>
                <textarea
                  rows={3}
                  placeholder="Antecedentes médicos, derivaciones o aspectos relevantes del encuadre..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Guardando..." : "Guardar y Abrir Expediente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
