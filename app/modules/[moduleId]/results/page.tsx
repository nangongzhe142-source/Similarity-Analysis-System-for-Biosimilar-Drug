import { notFound } from "next/navigation";
import { getProjectModule } from "@/lib/project";
import { ModuleResultPage } from "./module-result-page";

export default async function ResultsPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params; const module = getProjectModule(moduleId); if (!module) notFound();
  return <ModuleResultPage module={module} />;
}
