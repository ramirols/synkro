"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import {
  FileText,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Send,
  Building2,
  Clock,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reclamacionesSchema, validateForm } from "@/lib/validations";
import { siteConfig, getWhatsAppUrl } from "@/lib/config/site";

interface ComplaintData {
  code: string;
  date: string;
  fullName: string;
  docType: string;
  docNumber: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  planName: string;
  claimedAmount: string;
  type: "reclamo" | "queja";
  description: string;
  request: string;
}

export default function ReclamacionesClient() {
  const [submitted, setSubmitted] = useState<ComplaintData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [docType, setDocType] = useState("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [planName, setPlanName] = useState("Starter (S/ 49/mes)");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [type, setType] = useState<"reclamo" | "queja">("reclamo");
  const [description, setDescription] = useState("");
  const [request, setRequest] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(reclamacionesSchema, {
      fullName,
      docType,
      docNumber,
      email,
      phone,
      address,
      planName,
      claimedAmount: claimedAmount || undefined,
      type: type === "reclamo" ? "Reclamo" : "Queja",
      description,
      request,
      termsAccepted,
    });

    if (!validation.success) {
      setFieldErrors(validation.errors);
      toast.error(validation.firstError);
      return;
    }

    setFieldErrors({});

    setLoading(true);
    setTimeout(() => {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const generatedCode = `LRV-${year}-${randomNum}`;
      const now = new Date().toLocaleString("es-PE", {
        timeZone: "America/Lima",
        dateStyle: "long",
        timeStyle: "short",
      });

      const record: ComplaintData = {
        code: generatedCode,
        date: now,
        fullName: validation.data.fullName,
        docType: validation.data.docType,
        docNumber: validation.data.docNumber,
        email: validation.data.email,
        phone: validation.data.phone,
        address: validation.data.address,
        serviceType: "Software SaaS de Gestión Clínica Synkro",
        planName: validation.data.planName,
        claimedAmount: validation.data.claimedAmount || "0.00",
        type,
        description: validation.data.description,
        request: validation.data.request,
      };

      setSubmitted(record);
      setLoading(false);
      toast.success("Hoja de reclamación registrada con éxito.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  const handleCopyCode = () => {
    if (!submitted) return;
    navigator.clipboard.writeText(submitted.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-12">
      {/* Back button */}
      <div className="print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver a la página principal</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4 border-b pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/80 px-3.5 py-1 text-xs font-semibold text-primary">
          <ShieldCheck size={14} />
          <span>Ley N° 29571 • D.S. N° 011-2011-PCM • INDECOPI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Libro de Reclamaciones Virtual
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, ponemos a disposición de nuestros usuarios y profesionales de la salud mental este canal formal de registro de reclamos y quejas sobre los servicios de Synkro by VelyonSoft S.A.C.
        </p>
      </div>

      {submitted ? (
        /* Confirmation Voucher / Hoja de Reclamación Generada */
        <div className="space-y-8 rounded-2xl border bg-card p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>Hoja de Reclamación Registrada Exitosamente</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                N° de Registro: <span className="text-primary font-mono">{submitted.code}</span>
              </h2>
              <p className="text-xs text-muted-foreground">Fecha y hora de registro (Hora de Perú): {submitted.date}</p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handleCopyCode} className="h-9 gap-1.5 text-xs font-semibold">
                <Copy size={14} />
                <span>{copied ? "¡Código Copiado!" : "Copiar Código"}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 gap-1.5 text-xs font-semibold">
                <Printer size={14} />
                <span>Imprimir Hoja</span>
              </Button>
            </div>
          </div>

          {/* Legal Provider Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4 text-xs border">
            <div>
              <p className="font-semibold text-foreground">Proveedor del Servicio:</p>
              <p className="text-muted-foreground">VelyonSoft S.A.C.</p>
              <p className="text-muted-foreground">Plataforma: Synkro SaaS Clínico</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Domicilio Fiscal:</p>
              <p className="text-muted-foreground">{siteConfig.location}</p>
              <p className="text-muted-foreground">Canal oficial: {siteConfig.email}</p>
            </div>
          </div>

          {/* Summary Details */}
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="border-b pb-4">
              <h3 className="font-bold text-foreground text-sm mb-2">1. Identificación del Consumidor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                <p><strong className="text-foreground">Nombre:</strong> {submitted.fullName}</p>
                <p><strong className="text-foreground">Documento:</strong> {submitted.docType} {submitted.docNumber}</p>
                <p><strong className="text-foreground">Email de contacto:</strong> {submitted.email}</p>
                <p><strong className="text-foreground">Teléfono:</strong> {submitted.phone}</p>
                <p className="sm:col-span-2"><strong className="text-foreground">Domicilio:</strong> {submitted.address}</p>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-bold text-foreground text-sm mb-2">2. Identificación del Servicio Contratado</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                <p><strong className="text-foreground">Servicio:</strong> {submitted.serviceType}</p>
                <p><strong className="text-foreground">Plan:</strong> {submitted.planName}</p>
                <p><strong className="text-foreground">Monto Reclamado:</strong> S/ {submitted.claimedAmount}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-foreground text-sm mb-2">
                3. Detalle de la Disconformidad (
                <span className="uppercase text-primary font-bold">{submitted.type}</span>)
              </h3>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Detalle de los Hechos:</p>
                <div className="rounded-lg bg-muted/40 p-3.5 text-xs text-foreground whitespace-pre-wrap border">
                  {submitted.description}
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Pedido Concreto del Consumidor:</p>
                <div className="rounded-lg bg-muted/40 p-3.5 text-xs text-foreground whitespace-pre-wrap border">
                  {submitted.request}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Note & Next Steps */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Clock size={16} className="text-primary" />
              <span>Plazo de Respuesta Legal: Máximo 15 Días Hábiles</span>
            </div>
            <p>
              Conforme a la normativa vigente establecida por el <strong>INDECOPI</strong> mediante el D.S. N° 011-2011-PCM y sus modificatorias, <strong>VelyonSoft S.A.C.</strong> dará respuesta formal y motivada a esta hoja de reclamación al correo electrónico consignado (<strong>{submitted.email}</strong>) dentro del plazo improrrogable de quince (15) días hábiles.
            </p>
            <p>
              Le sugerimos guardar o imprimir esta constancia para el seguimiento correspondiente.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
            <Button
              variant="default"
              onClick={() => {
                setSubmitted(null);
                setDescription("");
                setRequest("");
                setTermsAccepted(false);
              }}
              className="font-bold text-xs"
            >
              Registrar otra comunicación
            </Button>
            <a
              href={getWhatsAppUrl(
                `Hola Velyon! He registrado la hoja de reclamación ${submitted.code} en el Libro Virtual.`
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle size={14} />
              <span>Notificar al Soporte WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Legal Definition Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" />
                  ¿Qué es un Reclamo?
                </span>
                <p className="text-muted-foreground">
                  Disconformidad relacionada a los servicios de software brindados (ej: fallas técnicas, facturación o acceso no resuelto).
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" />
                  ¿Qué es una Queja?
                </span>
                <p className="text-muted-foreground">
                  Disconformidad respecto al malestar generado en la atención o soporte al cliente, sin incidir directamente en el producto.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs" noValidate>
              {/* Sección 1: Datos Personales */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
                  Identificación del Consumidor Reclamante
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-bold">
                      Nombres y Apellidos Completos *
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Ej. Dra. Valeria Quiroz M."
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
                      }}
                      className={`text-xs ${fieldErrors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-[11px] text-destructive">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="docType" className="text-xs font-bold">
                      Tipo de Documento *
                    </Label>
                    <select
                      id="docType"
                      aria-label="Tipo de Documento de Identidad"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                      <option value="Carné de Extranjería">Carné de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="RUC">RUC (Persona Jurídica)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="docNumber" className="text-xs font-bold">
                      Número de Documento *
                    </Label>
                    <Input
                      id="docNumber"
                      placeholder="Ej. 45892134"
                      value={docNumber}
                      onChange={(e) => {
                        setDocNumber(e.target.value);
                        if (fieldErrors.docNumber) setFieldErrors((p) => ({ ...p, docNumber: "" }));
                      }}
                      className={`text-xs font-mono ${fieldErrors.docNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {fieldErrors.docNumber && (
                      <p className="text-[11px] text-destructive">{fieldErrors.docNumber}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold">
                      Correo Electrónico (Notificación Oficial) *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="consultorio@psicologia.pe"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                      }}
                      className={`text-xs ${fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-destructive">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold">
                      Teléfono / WhatsApp de Contacto *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="999 123 456"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                      }}
                      className={`text-xs ${fieldErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-destructive">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-bold">
                      Domicilio (Dirección, Distrito y Ciudad) *
                    </Label>
                    <Input
                      id="address"
                      placeholder="Av. Javier Prado Este 1234, San Isidro, Lima"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (fieldErrors.address) setFieldErrors((p) => ({ ...p, address: "" }));
                      }}
                      className={`text-xs ${fieldErrors.address ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {fieldErrors.address && (
                      <p className="text-[11px] text-destructive">{fieldErrors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 2: Identificación del Servicio */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
                  Identificación del Bien o Servicio Contratado
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="planName" className="text-xs font-bold">
                      Plan o Servicio Contratado *
                    </Label>
                    <select
                      id="planName"
                      aria-label="Plan o Servicio Contratado"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="Plan Gratuito (S/ 0)">Plan Gratuito (S/ 0 / mes)</option>
                      <option value="Starter (S/ 49/mes)">Plan Starter - Independiente (S/ 49 / mes)</option>
                      <option value="Professional (S/ 89/mes)">Plan Professional - Consolidado (S/ 89 / mes)</option>
                      <option value="Clínica / Empresa (S/ 189/mes)">Plan Clínica & Equipos (S/ 189 / mes)</option>
                      <option value="Servicio de Capacitación / Onboarding">Servicio de Onboarding o Capacitación</option>
                      <option value="Otro">Otro servicio complementario</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="claimedAmount" className="text-xs font-bold">
                      Monto Reclamado en Soles (PEN) (Opcional)
                    </Label>
                    <Input
                      id="claimedAmount"
                      placeholder="0.00"
                      value={claimedAmount}
                      onChange={(e) => setClaimedAmount(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Detalle de Reclamación */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
                  Detalle del Reclamo o Queja
                </h3>

                {/* Tipo Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Tipo de Solicitud *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType("reclamo")}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                        type === "reclamo"
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-input bg-card hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-bold text-xs text-foreground">Reclamo</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        Disconformidad directa con el servicio o facturación
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setType("queja")}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                        type === "queja"
                          ? "border-amber-600 bg-amber-500/10 ring-1 ring-amber-600"
                          : "border-input bg-card hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-bold text-xs text-foreground">Queja</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        Malestar o disconformidad en la atención al cliente
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-bold">
                    Detalle de los Hechos (Descripción clara y precisa) *
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describa de manera detallada lo ocurrido, fechas relevantes, número de cuenta o detalles técnicos..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: "" }));
                    }}
                    className={`text-xs leading-relaxed ${fieldErrors.description ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {fieldErrors.description && (
                    <p className="text-[11px] text-destructive">{fieldErrors.description}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="request" className="text-xs font-bold">
                    Pedido Concreto del Consumidor *
                  </Label>
                  <Textarea
                    id="request"
                    rows={3}
                    placeholder="Especifique qué solución o acción solicita por parte de VelyonSoft S.A.C."
                    value={request}
                    onChange={(e) => {
                      setRequest(e.target.value);
                      if (fieldErrors.request) setFieldErrors((p) => ({ ...p, request: "" }));
                    }}
                    className={`text-xs leading-relaxed ${fieldErrors.request ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {fieldErrors.request && (
                    <p className="text-[11px] text-destructive">{fieldErrors.request}</p>
                  )}
                </div>
              </div>

              {/* Declaración Jurada */}
              <div className="space-y-3 rounded-xl border border-muted bg-muted/20 p-4 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-input size-4 text-primary focus:ring-primary"
                    required
                  />
                  <span className="text-muted-foreground leading-snug">
                    Declaro bajo juramento que los datos consignados en la presente Hoja de Reclamación son verdaderos y autorizo a <strong>VelyonSoft S.A.C.</strong> a remitir la respuesta formal al correo electrónico consignado, conforme al D.S. N° 011-2011-PCM y la Ley N° 29733.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading || !termsAccepted}
                className="w-full h-11 font-bold text-xs gap-2"
              >
                <Send size={15} />
                <span>{loading ? "Registrando Hoja de Reclamación..." : "Enviar Hoja de Reclamación Virtual"}</span>
              </Button>
            </form>
          </div>

          {/* Right Information Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Building2 size={18} />
                <span>Razón Social del Proveedor</span>
              </div>
              <div className="space-y-1 text-muted-foreground border-b pb-4">
                <p className="font-semibold text-foreground">{siteConfig.legalName}</p>
                <p>Desarrollo de Software y Servicios Digitales</p>
                <p>{siteConfig.location}</p>
                <p>Canal oficial: {siteConfig.email}</p>
              </div>

              <div className="space-y-2 border-b pb-4">
                <p className="font-bold text-foreground">Plazo Legal de Respuesta</p>
                <p className="text-muted-foreground leading-relaxed">
                  Conforme al <strong>D.S. N° 011-2011-PCM</strong>, la respuesta a su reclamo o queja será remitida en un plazo máximo de quince (15) días hábiles improrrogables a su correo electrónico.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-foreground">¿Necesita asistencia inmediata?</p>
                <p className="text-muted-foreground leading-relaxed">
                  Para consultas operativas, dudas sobre planes o soporte técnico en tiempo real, puede contactar a nuestro equipo de atención directa.
                </p>
                <a
                  href={getWhatsAppUrl("Hola Velyon! Necesito soporte sobre Synkro.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/20 py-2.5 font-bold text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp {siteConfig.phoneFormatted}</span>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-5 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <HelpCircle size={15} />
                <span>Garantía de Derechos del Usuario</span>
              </div>
              <p>
                La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el <strong>INDECOPI</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

