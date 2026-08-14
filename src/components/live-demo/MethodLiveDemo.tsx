"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { getLiveDemoKind, type LiveDemoKind } from "@/data/live-demos";
import { IntactMassDemo } from "@/components/live-demo/IntactMassDemo";
import { PeptideMapDemo } from "@/components/live-demo/PeptideMapDemo";
import { QualityRangeDemo } from "@/components/live-demo/QualityRangeDemo";
import { LiveDemoProvenancePanel } from "@/components/live-demo/LiveDemoProvenance";
import type { DetectionMethod } from "@/types/models";

interface MethodLiveDemoProps {
  method: DetectionMethod;
}

function DemoBody({ kind }: { kind: LiveDemoKind }) {
  if (kind === "intact-mass") {
    return <IntactMassDemo />;
  }
  if (kind === "peptide-map") {
    return <PeptideMapDemo />;
  }
  return <QualityRangeDemo />;
}

/** Renders the runnable demo of a method, or nothing when the method has none.
 *  The caller decides what to show when neither SOP body nor demo exists. */
export function MethodLiveDemo({ method }: MethodLiveDemoProps) {
  const { localize, messages } = useLanguage();
  const kind = getLiveDemoKind(method.id);

  if (kind === undefined) {
    return null;
  }

  return (
    <div className="rounded-lg border-2 border-teal-600 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded bg-teal-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {messages.liveDemo.badge}
        </span>
        <p className="text-sm font-semibold text-slate-800">{localize(method.name)}</p>
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{messages.liveDemo.title}</h3>
      <p className="mt-1 mb-3 text-[11px] leading-relaxed text-slate-500">
        {messages.liveDemo.disclaimer}
      </p>
      <DemoBody kind={kind} />
      <LiveDemoProvenancePanel kind={kind} />
      <p className="mt-4 border-t border-slate-200 pt-2 text-[11px] text-slate-400">
        {messages.liveDemo.sopStillPending}
      </p>
    </div>
  );
}
