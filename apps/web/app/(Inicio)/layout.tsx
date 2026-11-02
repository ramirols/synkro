import type { Metadata } from "next";

import PublicHeader from "@/components/inicio/public-header";
import PublicFooter from "@/components/inicio/public-footer";

export const metadata: Metadata = {
  title: {
    default: "Synkro | Software de Gestión Clínica para Psicólogos y Centros en Perú",
    template: "%s | Synkro by Velyon",
  },
  description:
    "El software clínico N°1 para psicólogos y centros de psicología en Perú y Latinoamérica. Historias clínicas digitales, notas SOAP estructuradas, agenda tipo horario semanal, bóveda de pruebas psicométricas y portal seguro para pacientes. Pagos directos con Yape, Plin y tarjetas de crédito/débito.",
  keywords: [
    "software para psicólogos",
    "software para psicologos peru",
    "sistema historias clínicas psicología",
    "fichas clínicas digitales psicología",
    "agenda para psicólogos tipo horario",
    "notas soap psicología",
    "software centros de psicología",
    "portal del paciente psicología",
    "telepsicología google meet",
    "software psicología yape",
    "velyon software psicologos",
    "colegio de psicologos del peru cpsp",
    "sistema de citas psicologos lima",
    "gestion de consultorios psicologicos",
    "psicoterapia cognitivo conductual software",
    "anamnesis psicologica digital",
    "boveda inventario beck bai bdi",
    "software clinico salud mental latam",
    "psicologia clinica expediente electronico",
    "triaje psicologico centros clinicos",
  ],
  authors: [{ name: "Velyon Soft", url: "https://www.velyonsoft.com" }],
  creator: "Velyon",
  publisher: "Velyon",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://synkro.velyonsoft.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Synkro | Software Clínico para Psicólogos & Centros de Salud Mental",
    description:
      "Moderniza tu práctica psicológica. Historias clínicas, notas SOAP estructuradas, horario semanal y portal seguro para tus pacientes. Pagos por Yape y tarjetas.",
    url: "https://synkro.velyonsoft.com",
    siteName: "Synkro",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Synkro | Software para Psicólogos y Centros Clínicos",
    description:
      "La plataforma clínica creada para que te enfoques en tus pacientes, no en el papeleo. By Velyon.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Synkro",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android, Windows, macOS",
  offers: [
    {
      "@type": "Offer",
      name: "Plan Starter",
      price: "49.00",
      priceCurrency: "PEN",
      description: "Para psicólogos independientes iniciando práctica privada hasta 20 pacientes.",
    },
    {
      "@type": "Offer",
      name: "Plan Professional",
      price: "89.00",
      priceCurrency: "PEN",
      description: "Para terapeutas consolidados con pacientes ilimitados, notas SOAP estructuradas y bóveda de documentos.",
    },
    {
      "@type": "Offer",
      name: "Plan Empresa / Clínica",
      price: "189.00",
      priceCurrency: "PEN",
      description: "Para centros de psicología con múltiples terapeutas, derivaciones internas y gestión de consultorios físicos.",
    },
  ],
  author: {
    "@type": "Organization",
    name: "Velyon",
    url: "https://www.velyonsoft.com",
  },
  description:
    "Plataforma integral de gestión clínica, historias digitales y notas SOAP estructuradas para psicólogos y centros de psicología.",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "38",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <PublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
      <PublicFooter />
    </>
  );
}