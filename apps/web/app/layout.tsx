import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import "@fontsource-variable/manrope";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://synkro.velyonsoft.com"),
  title: {
    default: "Synkro | Software para psicólogos y centros clínicos",
    template: "%s | Synkro",
  },
  description:
    "Gestiona pacientes, agenda, sesiones clínicas y documentos desde una plataforma creada para psicólogos y consultorios.",
  keywords: [
    "software para psicólogos",
    "gestión clínica",
    "agenda psicológica",
    "historia clínica digital",
    "software psicológico",
    "portal del paciente",
    "notas SOAP",
  ],
  authors: [
    {
      name: "Synkro by Velyon",
      url: "https://synkro.velyonsoft.com",
    },
  ],
  creator: "Velyon Soft",
  publisher: "Velyon Soft",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Synkro | Software para psicólogos y centros clínicos",
    description:
      "Gestión clínica inteligente para una salud mental mejor. Organiza tu práctica psicológica en un solo lugar con historias clínicas digitales, agenda visual y notas SOAP.",
    url: "https://synkro.velyonsoft.com",
    siteName: "Synkro by Velyon",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1024,
        height: 389,
        alt: "Synkro by Velyon - Gestión clínica inteligente para una salud mental mejor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Synkro | Software para psicólogos y centros clínicos",
    description:
      "Gestión clínica inteligente para una salud mental mejor. Organiza tu práctica psicológica en un solo lugar.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="es">
        <body className="min-h-screen bg-background font-sans antialiased text-foreground">
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}