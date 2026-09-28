import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: {
    default: "Synkro | Software para psicólogos",
    template: "%s | Synkro",
  },
  description:
    "Gestiona pacientes, agenda, sesiones clínicas y documentos desde una plataforma creada para psicólogos.",
  keywords: [
    "software para psicólogos",
    "gestión clínica",
    "agenda psicológica",
    "historia clínica digital",
    "software psicológico",
  ],
  authors: [
    {
      name: "Synkro by Velyon",
    },
  ],
  openGraph: {
    title: "Synkro | Software para psicólogos",
    description: "Organiza tu práctica psicológica en un solo lugar.",
    type: "website",
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
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}