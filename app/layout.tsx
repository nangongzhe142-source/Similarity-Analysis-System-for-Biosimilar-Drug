import type { Metadata } from "next";
import "./globals.css";
import { ProjectProvider } from "@/app/project-provider";
import { WorkspaceShell } from "@/app/workspace-shell";

export const metadata: Metadata = {
  title: "BioCompare｜生物类似药多维药学项目比对工作台",
  description: "统一调度多类专项比对任务的可追溯审评工作台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><ProjectProvider><WorkspaceShell>{children}</WorkspaceShell></ProjectProvider></body>
    </html>
  );
}
