import { use } from "react";
import PacienteDetailView from "@/components/software/paciente-detail-view";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PacienteDetailView id={id} />;
}
