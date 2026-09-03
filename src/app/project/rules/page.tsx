"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ProjectRulesPage() {
  const { messages } = useLanguage();
  const copy = messages.workbench;
  const [toleranceDa, setToleranceDa] = useState(0.5);
  const [intervalMethod, setIntervalMethod] = useState("observed-range");
  const [minReferenceLots, setMinReferenceLots] = useState(3);

  return (
    <section className="section-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{copy.rulesEyebrow}</span>
          <h2>{copy.rulesTitle}</h2>
          <p>{copy.rulesDescription}</p>
        </div>
        <span className="section-badge">{copy.rulesBadge}</span>
      </div>
      <div className="rules-layout">
        <div className="panel parameter-card">
          <div className="panel-title">
            <div>
              <span className="eyebrow">{copy.paramEyebrow}</span>
              <h2>{copy.paramTitle}</h2>
            </div>
          </div>
          <div className="parameter-list">
            <label>
              {copy.paramTolerance}
              <div>
                <input
                  type="number"
                  value={toleranceDa}
                  min={0.1}
                  step={0.1}
                  onChange={(event) => setToleranceDa(Number(event.target.value))}
                />
                <span>Da</span>
              </div>
            </label>
            <label>
              {copy.paramInterval}
              <select
                value={intervalMethod}
                onChange={(event) => setIntervalMethod(event.target.value)}
              >
                <option value="observed-range">{copy.intervalObserved}</option>
                <option value="mean-3sd">{copy.intervalMean}</option>
                <option value="robust-mad">{copy.intervalMad}</option>
              </select>
            </label>
            <label>
              {copy.paramMinLots}
              <div>
                <input
                  type="number"
                  min={2}
                  value={minReferenceLots}
                  onChange={(event) => setMinReferenceLots(Number(event.target.value))}
                />
                <span>n</span>
              </div>
            </label>
          </div>
          <p className="disclaimer" style={{ padding: "0 20px 16px" }}>
            {copy.rulesLocalOnly}
          </p>
        </div>
        <div className="panel risk-card">
          <div className="panel-title">
            <div>
              <span className="eyebrow">{copy.riskEyebrow}</span>
              <h2>{copy.riskTitle}</h2>
            </div>
          </div>
          <div className="risk-level high">
            <span>{copy.riskHighLabel}</span>
            <div>
              <strong>{copy.riskHighTitle}</strong>
              <small>{copy.riskHighCopy}</small>
            </div>
          </div>
          <div className="risk-level medium">
            <span>{copy.riskMedLabel}</span>
            <div>
              <strong>{copy.riskMedTitle}</strong>
              <small>{copy.riskMedCopy}</small>
            </div>
          </div>
          <div className="risk-level low">
            <span>{copy.riskLowLabel}</span>
            <div>
              <strong>{copy.riskLowTitle}</strong>
              <small>{copy.riskLowCopy}</small>
            </div>
          </div>
        </div>
      </div>
      <div className="panel policy-list">
        <div className="policy-row">
          <span>01</span>
          <div>
            <strong>{copy.policy1Title}</strong>
            <small>{copy.policy1Copy}</small>
          </div>
          <em>{copy.policyLocked}</em>
        </div>
        <div className="policy-row">
          <span>02</span>
          <div>
            <strong>{copy.policy2Title}</strong>
            <small>{copy.policy2Copy}</small>
          </div>
          <em>{copy.policyLocked}</em>
        </div>
        <div className="policy-row">
          <span>03</span>
          <div>
            <strong>{copy.policy3Title}</strong>
            <small>{copy.policy3Copy}</small>
          </div>
          <em>{copy.policyLocked}</em>
        </div>
      </div>
    </section>
  );
}
