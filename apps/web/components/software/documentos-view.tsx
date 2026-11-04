"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PatientFile, Patient } from "@/lib/types/clinical";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { documentSchema, validateForm } from "@/lib/validations";
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
  Lock,
  Share2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_FILTER_OPTIONS: Record<string, string> = {
  todos: "Todas las Categorías",
  evaluation: "Evaluación Psicométrica",
  consent: "Consentimiento Informado",
  report: "Informe Clínico",
  prescription: "Receta / Indicaciones",
  other: "Otro Documento",
};

const CATEGORY_MAP: Record<string, { label: string; key: "evaluation" | "consent" | "report" | "prescription" | "other" }> = {
  "Evaluación Psicométrica": { label: "Evaluación Psicométrica", key: "evaluation" },
  "Consentimiento Informado": { label: "Consentimiento Informado", key: "consent" },
  "Informe Clínico": { label: "Informe Clínico", key: "report" },
  "Receta / Indicaciones": { label: "Receta / Indicaciones", key: "prescription" },
  "Otro Documento": { label: "Otro Documento", key: "other" },
};

export default function DocumentosView() {
  const { service, basePath, isDemo } = useClinicalData();
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Viewer State
  const [viewingDoc, setViewingDoc] = useState<PatientFile | null>(null);
  const [signedUrlLoading, setSignedUrlLoading] = useState(false);
  const [signedUrlError, setSignedUrlError] = useState("");

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);

  // Form State
  const [patientId, setPatientId] = useState("");
  const [fileName, setFileName] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("Evaluación Psicométrica");
  const [sharedWithPatient, setSharedWithPatient] = useState(false);
  const [fileType, setFileType] = useState("application/pdf");

  const loadData = async () => {
    try {
      setLoading(true);
      const [fData, pData] = await Promise.all([
        service.getFiles(),
        service.getPatients(),
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
    if (isDemo) {
      notifyDemoWriteBlocked("Subir Documento Clínico a la Bóveda");
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setDraggedFile(file);
      setFileName(file.name);
      setFileType(file.type || "application/pdf");
      setIsModalOpen(true);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemo) {
      notifyDemoWriteBlocked("Subir Documento Clínico a la Bóveda");
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setDraggedFile(file);
      setFileName(file.name);
      setFileType(file.type || "application/pdf");
      setIsModalOpen(true);
    }
  };

  const handleOpenDocViewer = async (doc: PatientFile) => {
    setViewingDoc(doc);
    setSignedUrlError("");

    if (service.getFileSignedUrl && doc.storage_path) {
      try {
        setSignedUrlLoading(true);
        const url = await service.getFileSignedUrl(doc.storage_path);
        setViewingDoc({ ...doc, signed_url: url });
      } catch (err: any) {
        console.warn("No se pudo generar signed URL para visor directo:", err.message);
        setSignedUrlError("Documento con almacenamiento simulado o protegido.");
      } finally {
        setSignedUrlLoading(false);
      }
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(documentSchema, {
      patientId,
      fileName,
      category: categoryLabel,
      sharedWithPatient,
    });

    if (!validation.success) {
      setFieldErrors(validation.errors);
      setErrorMsg(validation.firstError);
      toast.error(validation.firstError);
      return;
    }

    setFieldErrors({});

    try {
      setSaving(true);
      setErrorMsg("");

      const categoryObj = CATEGORY_MAP[validation.data.category] || {
        label: "Otro Documento",
        key: "other",
      };

      if (draggedFile && service.uploadFile) {
        // Subida real a Supabase Storage con políticas de privacidad
        await service.uploadFile(
          draggedFile,
          validation.data.patientId,
          categoryObj.key,
          validation.data.sharedWithPatient
        );
      } else {
        // Registro de metadatos o demo
        const fileSizeFormatted = draggedFile
          ? `${(draggedFile.size / (1024 * 1024)).toFixed(1)} MB`
          : "1.2 MB";

        await service.createFile({
          patient_id: validation.data.patientId,
          file_name: validation.data.fileName,
          storage_path: `patient-files/${validation.data.patientId}/${Date.now()}_${validation.data.fileName}`,
          file_type: fileType,
          category: categoryObj.label,
          file_category: categoryObj.key,
          file_size: fileSizeFormatted,
          shared_with_patient: validation.data.sharedWithPatient,
        });
      }

      setFileName("");
      setDraggedFile(null);
      setSharedWithPatient(false);
      setIsModalOpen(false);
      toast.success("Documento subido a la bóveda exitosamente.");
      await loadData();
    } catch (err: any) {
      console.error("Error creating document record:", err);
      const msg = getFriendlyErrorMessage(err, "Error al registrar documento.");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesCat =
      selectedCategory === "todos"
        ? true
        : f.file_category === selectedCategory || f.category === selectedCategory;

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
              Bóveda Documental Clínica
            </h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
              {files.length} Archivos
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Almacenamiento privado para consentimientos informados, pruebas psicométricas y reportes con URLs firmadas (1h de vigencia).
          </p>
        </div>

        <button
          onClick={() => {
            if (isDemo) {
              notifyDemoWriteBlocked("Subir Documento Clínico a la Bóveda");
              return;
            }
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
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
          Archivos PDF, imágenes o documentos Word de evaluaciones psicométricas y consentimientos (hasta 15 MB).
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

        <Select
          items={CATEGORY_FILTER_OPTIONS}
          value={selectedCategory}
          onValueChange={(val) => val && setSelectedCategory(val)}
        >
          <SelectTrigger className="h-10 min-w-44 rounded-xl border bg-background px-3 text-xs font-medium text-foreground">
            <SelectValue placeholder="Todas las Categorías" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_FILTER_OPTIONS).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Files Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
            Cargando expedientes y documentos de la bóveda...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="col-span-full rounded-2xl border bg-card p-12 text-center">
            <FileText size={32} className="mx-auto text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No hay documentos que coincidan
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Prueba con otro término de búsqueda o sube un documento.
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
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {f.category || f.file_category || "Documento"}
                    </span>
                    {f.shared_with_patient ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Compartido
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Lock size={10} /> Solo Clínica
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-4 text-sm font-bold text-foreground line-clamp-2">
                  {f.file_name}
                </h3>

                <p className="mt-2 text-xs text-muted-foreground">
                  Paciente:{" "}
                  <Link
                    href={`${basePath}/pacientes/${f.patient_id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {f.patients?.first_name} {f.patients?.last_name}
                  </Link>
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">{f.file_size || "1.2 MB"}</span>
                <button
                  onClick={() => handleOpenDocViewer(f)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Eye size={13} />
                  <span>Ver en Bóveda</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL VISOR DE DOCUMENTO EN BÓVEDA CON URL FIRMADA */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            {/* Viewer Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {viewingDoc.category || viewingDoc.file_category || "Documento Clínico"}
                  </span>
                  {viewingDoc.shared_with_patient ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Visible para el paciente
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Lock size={12} /> Confidencial (Uso interno)
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {viewingDoc.file_name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Paciente:{" "}
                  <strong>
                    {viewingDoc.patients?.first_name} {viewingDoc.patients?.last_name}
                  </strong>{" "}
                  • Tamaño: {viewingDoc.file_size || "1.2 MB"}
                </p>
              </div>

              <button
                onClick={() => setViewingDoc(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Details / Signed Link Bar */}
            {viewingDoc.signed_url && (
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-secondary/30 p-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <Shield size={14} /> Enlace Cifrado Temporal Generado (Válido por 1 hora)
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Acceso autenticado y firmado contra Supabase Storage.
                  </span>
                </div>
                <a
                  href={viewingDoc.signed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-bold text-primary-foreground hover:opacity-90 shadow-xs"
                >
                  <ExternalLink size={13} />
                  <span>Abrir Archivo Original</span>
                </a>
              </div>
            )}

            {/* Simulated Clinical Document Sheet */}
            <div className="rounded-2xl border bg-background p-6 sm:p-8 shadow-inner space-y-6 text-xs text-foreground font-serif leading-relaxed">
              <div className="border-b pb-4 text-center space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary">
                  CENTRO PSICOLÓGICO SYNKRO | BÓVEDA CLÍNICA SEGURA
                </span>
                <h3 className="text-base font-sans font-bold text-foreground">
                  {viewingDoc.file_name.replace(".pdf", "").replace(/_/g, " ")}
                </h3>
                <p className="text-[11px] font-sans text-muted-foreground">
                  Fecha de Registro:{" "}
                  {new Date(viewingDoc.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Dynamic simulated content */}
              <div className="space-y-3 font-sans text-xs text-muted-foreground">
                <p>
                  <strong>Ruta en Bóveda:</strong>{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    {viewingDoc.storage_path}
                  </code>
                </p>
                <p>
                  <strong>Estado de Compartición:</strong>{" "}
                  {viewingDoc.shared_with_patient
                    ? "Disponible para descarga por el paciente en el portal web."
                    : "Acceso exclusivo para el equipo terapéutico autorizado de la organización."}
                </p>
                <div className="rounded-xl border bg-muted/20 p-4 text-[11px] space-y-1">
                  <div className="font-bold text-foreground">Garantía de Privacidad HIPAA / GDPR:</div>
                  <p>
                    Los archivos en esta bóveda se almacenan en un bucket privado protegido por políticas de seguridad RLS a nivel de base de datos. Ningún usuario externo puede acceder al documento sin una URL firmada generada con credenciales autorizadas.
                  </p>
                </div>
              </div>
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
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 sm:p-8 shadow-xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Registrar Documento en Bóveda
                </h2>
                <p className="text-xs text-muted-foreground">
                  Almacena informes y consentimientos en la bóveda privada.
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
                <Select
                  items={Object.fromEntries(
                    patients.map((p) => [p.id, `${p.first_name} ${p.last_name}`])
                  )}
                  value={patientId}
                  onValueChange={(val) => val && setPatientId(val)}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
                    <SelectValue placeholder="Selecciona un paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Nombre del Documento / Archivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Consentimiento_Informado_Terapia.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Categoría Clínica *
                </label>
                <Select
                  items={Object.fromEntries(
                    Object.keys(CATEGORY_MAP).map((cat) => [cat, cat])
                  )}
                  value={categoryLabel}
                  onValueChange={(val) => val && setCategoryLabel(val)}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
                    <SelectValue placeholder="Selecciona una categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATEGORY_MAP).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle de Compartición con el Paciente */}
              <div className="rounded-2xl border border-primary/20 bg-secondary/30 p-4 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Share2 size={14} className="text-primary" /> Compartir con el paciente en su portal
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Permite que el paciente visualice y descargue este archivo desde su portal seguro.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharedWithPatient}
                    onChange={(e) => setSharedWithPatient(e.target.checked)}
                    className="size-5 rounded border-gray-300 accent-primary cursor-pointer"
                  />
                </label>
                {!sharedWithPatient && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock size={11} /> Documento privado: solo visible para el equipo clínico.
                  </span>
                )}
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
