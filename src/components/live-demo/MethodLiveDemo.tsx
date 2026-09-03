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
    <div className="glass-surface glass-edge relative border-l-4 border-l-cyan-700 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-sm bg-cyan-700 px-1.5 py-0.5 text-[11px] font-semibold text-paper">
          {messages.liveDemo.badge}
        </span>
        <p className="text-sm font-semibold text-navy-900">{localize(method.name)}</p>
      </div>
      <h3 className="mb-3 text-sm font-semibold text-navy-900">{messages.liveDemo.title}</h3>
      <DemoBody kind={kind} />
      <LiveDemoProvenancePanel kind={kind} />
      <p className="mt-4 border-t border-line pt-2 text-[11px] text-ink-secondary">
        {messages.liveDemo.sopStillPending}
      </p>
    </div>
  );
}
