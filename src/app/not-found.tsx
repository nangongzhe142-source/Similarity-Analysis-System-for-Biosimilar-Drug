"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function NotFoundPage() {
  const { messages } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        {messages.common.notFoundTitle}
      </h1>
      <p className="text-sm text-slate-500">{messages.common.notFoundDescription}</p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        {messages.common.backToHome}
      </Link>
    </div>
  );
}
