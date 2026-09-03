"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CharacterizationCatalog } from "@/components/workbench/CharacterizationCatalog";
import { ConnectedItemAccordion } from "@/components/workbench/ConnectedItemAccordion";
import { useWorkbench } from "@/components/workbench/WorkbenchProvider";
import { characterizationItems } from "@/data/characterization-items";
import { useLanguage } from "@/i18n/LanguageProvider";
import { computableItemIds } from "@/lib/workbench/name-match";

export function ProjectOverviewDisclosure() {
  const { messages } = useLanguage();
  const copy = messages.workbench;
  const { runStatusByItemId } = useWorkbench();
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const attentionCount = Object.values(runStatusByItemId).filter(
    (run) => run.status === "failed",
  ).length;
  const contentId = "all-comparison-projects-overview";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOverviewExpanded(localStorage.getItem("biocompare.project-overview.expanded") === "true");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleOverview() {
    setOverviewExpanded((current) => {
      localStorage.setItem("biocompare.project-overview.expanded", String(!current));
      return !current;
    });
  }

  return (
    <section className={`project-overview-disclosure ${overviewExpanded ? "expanded" : ""}`}>
      <div className="overview-parent-row">
        <div className="overview-parent-copy">
          <span className="eyebrow">{copy.overviewEyebrow}</span>
          <h2>{copy.overviewTitle}</h2>
          <p>{copy.overviewDescription}</p>
          <div className="overview-parent-metrics">
            <div>
              <span>{copy.overviewTotal}</span>
              <strong>{characterizationItems.length}</strong>
              <small>{copy.catalogItemsUnit.trim()}</small>
            </div>
            <div>
              <span>{copy.overviewConnected}</span>
              <strong>{computableItemIds.length}</strong>
              <small>{copy.catalogItemsUnit.trim()}</small>
            </div>
            <div>
              <span>{copy.overviewAttention}</span>
              <strong>{attentionCount}</strong>
              <small>{copy.catalogItemsUnit.trim()}</small>
            </div>
          </div>
        </div>
        <div className="overview-orbit" aria-hidden="true">
          <span>
            QUALITY
            <br />
            PROFILE
          </span>
        </div>
      </div>
      <div className="overview-entry-grid">
        <article className="overview-entry-card catalog-entry">
          <div className="overview-entry-top">
            <span className="overview-entry-number">01</span>
            <em>{copy.entry1Eyebrow}</em>
          </div>
          <h3>{copy.entry1Title}</h3>
          <p>{copy.entry1Body.replace("{count}", String(characterizationItems.length))}</p>
          <div className="overview-entry-flow">
            <span>{copy.flowNav}</span>
            <b>→</b>
            <span>{copy.flowSearch}</span>
            <b>→</b>
            <span>{copy.flowDetail}</span>
          </div>
          <button
            type="button"
            className="overview-master-toggle"
            aria-expanded={overviewExpanded}
            aria-controls={contentId}
            onClick={toggleOverview}
          >
            <span>{overviewExpanded ? copy.entry1Close : copy.entry1Open}</span>
            <i aria-hidden="true">⌄</i>
          </button>
        </article>
        <article className="overview-entry-card engine-entry">
          <div className="overview-entry-top">
            <span className="overview-entry-number">02</span>
            <em>{copy.entry2Eyebrow}</em>
          </div>
          <h3>{copy.entry2Title}</h3>
          <p>{copy.entry2Body.replace("{count}", String(computableItemIds.length))}</p>
          <div className="overview-entry-flow">
            <span>{copy.flowInput}</span>
            <b>→</b>
            <span>{copy.flowCompute}</span>
            <b>→</b>
            <span>{copy.flowReview}</span>
          </div>
          <Link className="overview-entry-link" href="/project/data">
            {copy.entry2Link}
          </Link>
        </article>
      </div>
      {overviewExpanded && (
        <div id={contentId} className="overview-disclosure-content">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{copy.catalogLevelEyebrow}</span>
              <h2>{copy.catalogLevelTitle}</h2>
              <p>{copy.catalogLevelDescription}</p>
            </div>
            <Link className="quiet link-button" href="/project/report">
              {copy.viewBrief}
            </Link>
          </div>
          <CharacterizationCatalog />
          <section className="connected-modules-section">
            <div className="connected-modules-head">
              <div>
                <span className="eyebrow">{copy.connectedEyebrow}</span>
                <h3>{copy.connectedTitle}</h3>
                <p>{copy.connectedBody}</p>
              </div>
              <strong>
                {computableItemIds.length}
                <small>{copy.connectedCountSuffix}</small>
              </strong>
            </div>
            <ConnectedItemAccordion />
          </section>
        </div>
      )}
    </section>
  );
}
