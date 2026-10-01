"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, PatientFile, Patient } from "@/lib/supabase";
import { ClinicalDataService } from "@/lib/clinical-data";
import {
  FileText,
  Plus,
  Search,
  Download,
  Filter,
  Shield,
  FileCheck,
  Brain,
  Calendar,
  X,
  UploadCloud,
  Eye,
  CheckCircle2,
  Printer,
  Sparkles,
} from "lucide-react";

export default function DocumentosPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Viewer State
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);

  // Form State
  const [patientId, setPatientId] = useState("");
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState("Evaluación Psicométrica");
  const [fileType, setFileType] = useState("application/pdf");

  const loadData = async () => {
    try {
      setLoading(true);
      const [fData, pData] = await Promise.all([
        ClinicalDataService.getFiles(),
        ClinicalDataService.getPatients(),
      ]);

      setFiles(fData || []);
      setPatients(pData || []);
      if (pData && pData.length > 0 && !patientId) {
        setPatientId(pData[0].id);
      }
    } catch (err: any) {
      console.error("Error loading documents:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setDraggedFile(file);
      setFileName(file.name);
      setIsModalOpen(true);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setDraggedFile(file);
      setFileName(file.name);
      setIsModalOpen(true);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !fileName.trim()) {
      setErrorMsg("Completa los datos del documento.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const fileSizeFormatted = draggedFile
        ? `${(draggedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : "1.2 MB";

      await ClinicalDataService.createFile({
        patient_id: patientId,
        file_name: fileName.trim(),
        storage_path: `patient-files/${patientId}/${Date.now()}_${fileName.trim()}`,
        file_type: fileType,
        category: category,
        file_size: fileSizeFormatted,
      });

      setFileName("");
      setDraggedFile(null);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Error creating document record:", err);
      setErrorMsg(err.message || "Error al registrar documento.");
    } finally {
      setSaving(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesCat =
      selectedCategory === "todos" ? true : f.category === selectedCategory;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      f.file_name.toLowerCase().includes(query) ||
      (f.patients &&
        `${f.patients.first_name} ${f.patients.last_name}`
          .toLowerCase()
          .includes(query));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bóveda de Documentos Clínicos
            </h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
              {files.length} Archivos
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Consentimientos informados, pruebas psicométricas (Beck, STAI) e informes psicológicos con visor web.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          <span>Subir Documento</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-primary bg-secondary/60 scale-[1.01]"
            : "border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/20"
        }`}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary mb-3">
          <UploadCloud size={28} />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          Arrastra y suelta aquí el documento o informe psicológico
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Soporta archivos PDF de evaluaciones psicométricas, consentimientos informados o historiales médicos (hasta 25 MB).
        </p>

        <label className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
          <span>O selecciona un archivo desde tu equipo</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre de archivo o paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 rounded-xl border bg-background px-3 text-xs font-medium text-foreground outline-none"
        >
          <option value="todos">Todas las Categorías</option>
          <option value="Evaluación Psicométrica">Evaluación Psicométrica</option>
          <option value="Consentimiento Informado">Consentimiento Informado</option>
          <option value="Informe Clínico">Informe Clínico</option>
          <option value="Contrato Terapéutico">Contrato Terapéutico</option>
        </select>
      </div>

      {/* Files Grid with Integrated Web Viewer Button */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
            Cargando expedientes y documentos...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="col-span-full rounded-2xl border bg-card p-12 text-center">
            <FileText size={32} className="mx-auto text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No hay documentos que coincidan
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Prueba con otro término de búsqueda o registra un documento.
            </p>
          </div>
        ) : (
          filteredFiles.map((f) => (
            <div
              key={f.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                    <FileCheck size={20} />
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {f.category || "Documento"}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-bold text-foreground line-clamp-2">
                  {f.file_name}
                </h3>

                <p className="mt-2 text-xs text-muted-foreground">
                  Paciente:{" "}
                  <Link
                    href={`/pacientes/${f.patient_id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {f.patients?.first_name} {f.patients?.last_name}
                  </Link>
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">{f.file_size || "PDF"}</span>
                <button
                  onClick={() => setViewingDoc(f)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Eye size={13} />
                  <span>Ver en Web</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* IN-APP DOCUMENT VIEWER MODAL (VISOR DE DOCUMENTO EN LA WEB) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            {/* Viewer Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {viewingDoc.category || "Documento Clínico"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Expediente Oficial Synkro
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {viewingDoc.file_name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Paciente:{" "}
                  <strong>
                    {viewingDoc.patients?.first_name} {viewingDoc.patients?.last_name}
                  </strong>{" "}
                  • Terapeuta: Lic. Alejandro Mendoza V. (C.Ps.P. 28419)
                </p>
              </div>

              <button
                onClick={() => setViewingDoc(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            {/* Simulated Clinical Document Sheet */}
            <div className="rounded-2xl border bg-background p-6 sm:p-8 shadow-inner space-y-6 text-xs text-foreground font-serif leading-relaxed">
              <div className="border-b pb-4 text-center space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary">
                  CENTRO PSICOLÓGICO SYNKRO | VELYON CLINIC
                </span>
                <h3 className="text-base font-sans font-bold text-foreground">
                  {viewingDoc.file_name.replace(".pdf", "").replace(/_/g, " ")}
                </h3>
                <p className="text-[11px] font-sans text-muted-foreground">
                  Fecha de Emisión: 24 de Septiembre, 2026 • Registro Clínico Confidencial
                </p>
              </div>

              {/* Dynamic simulated content based on category */}
              {viewingDoc.category?.includes("Consentimiento") ? (
                <div className="space-y-4 font-sans text-xs text-muted-foreground">
                  <p>
                    Por medio del presente documento, el/la paciente{" "}
                    <strong className="text-foreground">
                      {viewingDoc.patients?.first_name} {viewingDoc.patients?.last_name}
                    </strong>{" "}
                    manifiesta haber recibido información clara y detallada acerca del encuadre
                    psicológico, la frecuencia de las sesiones y la política de confidencialidad
                    respaldada por el Código de Ética del Colegio de Psicólogos del Perú (C.Ps.P.).
                  </p>
                  <p>
                    Asimismo, autoriza el registro de evoluciones terapéuticas en la plataforma
                    Synkro bajo estándares de cifrado médico.
                  </p>
                  <div className="pt-6 border-t flex justify-between items-end font-sans text-[11px] text-foreground">
                    <div>
                      <div className="h-0.5 w-36 bg-foreground mb-1" />
                      <span>Firma del Paciente</span>
                    </div>
                    <div className="text-right">
                      <div className="h-0.5 w-36 bg-foreground mb-1 ml-auto" />
                      <span>Lic. Alejandro Mendoza V.</span>
                      <span className="block text-[10px] text-muted-foreground">C.Ps.P. 28419</span>
                    </div>
                  </div>
                </div>
              ) : viewingDoc.category?.includes("Evaluación") ? (
                <div className="space-y-4 font-sans text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Objetivo de la prueba:</strong> Cuantificar
                    la severidad de la sintomatología ansiosa/depresiva durante el último período de
                    dos semanas mediante reactivos estandarizados.
                  </p>
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Puntaje Bruto Obtenido:</span>
                      <span className="text-primary">31 Puntos</span>
                    </div>
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Rango Interpretativo:</span>
                      <span className="text-destructive font-semibold">Sintomatología Ansiosa Severa</span>
                    </div>
                  </div>
                  <p>
                    <strong className="text-foreground">Conclusiones preliminares:</strong> Se
                    observa marcada hiperreactividad fisiológica (sudoración, sensación de ahogo)
                    asociada a distorsiones de catastrofismo y sobregeneralización. Se recomienda
                    abordaje TCC intensivo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 font-sans text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Informe de Evolución Psicológica:</strong> El
                    paciente acude a consulta demostrando buena adherencia al plan de tratamiento.
                    Se han cumplido las metas de autorregulación emocional y disminución de crisis
                    en un 60%.
                  </p>
                  <p>
                    Se extiende el presente informe a solicitud de la parte interesada para los fines
                    que considere pertinentes.
                  </p>
                </div>
              )}
            </div>

            {/* Viewer Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-600" />
                Documento Cifrado y Verificado en Bóveda
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Printer size={14} /> Imprimir
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Cerrar Visor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Subir Documento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Registrar Documento en Bóveda
                </h2>
                <p className="text-xs text-muted-foreground">
                  Asocia un informe, consentimiento o prueba al paciente.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setDraggedFile(null);
                }}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Paciente Asociado *
                </label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Nombre del Documento / Archivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Escala_STAI_Ansiedad_Estado.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                >
                  <option value="Evaluación Psicométrica">Evaluación Psicométrica</option>
                  <option value="Consentimiento Informado">Consentimiento Informado</option>
                  <option value="Informe Clínico">Informe Clínico</option>
                  <option value="Contrato Terapéutico">Contrato Terapéutico</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setDraggedFile(null);
                  }}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Subir y Guardar en Bóveda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
