import { use } from "react";
import PacienteDetailView from "@/components/software/paciente-detail-view";

export default function DemoPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PacienteDetailView id={id} />;
}
