import type { Metadata } from "next";
import "./globals.css";
import "./workbench-shell.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { DrawerStackProvider } from "@/components/drawer/DrawerStackProvider";
import { DrawerStack } from "@/components/drawer/DrawerStack";
import { SideExplorerRail } from "@/components/layout/SideExplorerRail";
import { IntakeProvider } from "@/components/intake/IntakeProvider";
import { WorkbenchProvider } from "@/components/workbench/WorkbenchProvider";
import { WorkspaceShell } from "@/components/workbench/WorkspaceShell";

export const metadata: Metadata = {
  title: {
    default: "生物类似药药学相似性分析 | Biosimilar CMC Similarity Assessment",
    template: "%s | 生物类似药药学相似性分析",
  },
  description:
    "生物类似药药学比对研究质量属性、检测方法及相似性评价原则的结构化框架网站。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="surface-canvas flex min-h-full flex-col text-ink">
        <LanguageProvider>
          <DrawerStackProvider>
            <WorkbenchProvider>
              <IntakeProvider>
                <WorkspaceShell>{children}</WorkspaceShell>
                <SideExplorerRail />
                <DrawerStack />
                <AssistantWidget />
              </IntakeProvider>
            </WorkbenchProvider>
          </DrawerStackProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
