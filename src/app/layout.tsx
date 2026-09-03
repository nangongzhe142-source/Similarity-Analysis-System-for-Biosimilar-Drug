import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { DrawerStackProvider } from "@/components/drawer/DrawerStackProvider";
import { DrawerStack } from "@/components/drawer/DrawerStack";
import { SideExplorerRail } from "@/components/layout/SideExplorerRail";

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
            <SiteHeader />
            <SideExplorerRail />
            <main
              id="main-content"
              tabIndex={-1}
              className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 outline-none sm:px-6 md:pl-[var(--drawer-rail-width)]"
            >
              {children}
            </main>
            <SiteFooter />
            <DrawerStack />
            <AssistantWidget />
          </DrawerStackProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
