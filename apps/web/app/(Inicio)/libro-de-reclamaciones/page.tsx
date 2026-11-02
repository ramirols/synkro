import { Metadata } from "next";
import ReclamacionesClient from "./reclamaciones-client";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones Virtual | Synkro by VelyonSoft",
  description:
    "Libro de Reclamaciones Virtual de Synkro by VelyonSoft S.A.C. conforme a la Ley N° 29571 (Código de Protección y Defensa del Consumidor) y el D.S. N° 011-2011-PCM de INDECOPI en Perú.",
  keywords: [
    "libro de reclamaciones synkro",
    "libro de reclamaciones virtual velyonsoft",
    "indecopi libro reclamaciones software psicologia",
    "ley 29571 consumidor peru",
    "reclamos y quejas synkro saas",
  ],
};

export default function LibroDeReclamacionesPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="mx-auto max-w-4xl">
        <ReclamacionesClient />
      </div>
    </main>
  );
}

