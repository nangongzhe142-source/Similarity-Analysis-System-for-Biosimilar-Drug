import { notFound } from "next/navigation";
import { getProjectModule } from "@/lib/project";
import { ModuleWorkspace } from "./module-workspace";

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params; const module = getProjectModule(moduleId); if (!module) notFound();
  return <ModuleWorkspace module={module} />;
}
