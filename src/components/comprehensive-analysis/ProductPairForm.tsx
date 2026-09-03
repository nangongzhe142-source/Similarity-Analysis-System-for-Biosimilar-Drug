"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { LocalizedText } from "@/types/models";
import type { ProductPairInput } from "@/types/comprehensive-analysis";

interface ProductPairFormProps {
  productPair: ProductPairInput;
  onProductPairChange: (productPair: ProductPairInput) => void;
  onClearAndReenter: () => void;
  onRestoreDemo: () => void;
}

function updateLocalizedField(
  current: LocalizedText,
  locale: "zh" | "en",
  value: string,
): LocalizedText {
  if (locale === "zh") {
    return { zh: value, en: current.en };
  }
  return { zh: current.zh, en: value };
}

interface LabeledTextFieldProps {
  fieldId: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  multiline?: boolean;
}

function LabeledTextField({
  fieldId,
  label,
  value,
  onValueChange,
  multiline = false,
}: LabeledTextFieldProps) {
  const fieldClassName =
    "mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink";
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          rows={3}
          className={fieldClassName}
        />
      ) : (
        <input
          id={fieldId}
          type="text"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className={`${fieldClassName} tap-target`}
        />
      )}
    </div>
  );
}

export function ProductPairForm({
  productPair,
  onProductPairChange,
  onClearAndReenter,
  onRestoreDemo,
}: ProductPairFormProps) {
  const { locale, localize, messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;

  const updateField = (fieldName: keyof ProductPairInput, value: string) => {
    onProductPairChange({
      ...productPair,
      [fieldName]: updateLocalizedField(productPair[fieldName], locale, value),
    });
  };

  return (
    <section
      aria-labelledby="comprehensive-product-form-heading"
      className="surface-card p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="comprehensive-product-form-heading"
            className="text-lg font-semibold text-navy-900"
          >
            {copy.formSectionTitle}
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">{copy.demoUseBanner}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClearAndReenter}
            className="tap-target rounded-sm border border-line bg-paper px-3 text-sm font-semibold text-navy-900 hover:bg-canvas-muted"
          >
            {copy.clearAndReenter}
          </button>
          <button
            type="button"
            onClick={onRestoreDemo}
            className="tap-target rounded-sm bg-coral-700 px-3 text-sm font-semibold text-paper hover:bg-coral-800"
          >
            {copy.restoreDemo}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <LabeledTextField
          fieldId="comprehensive-analysis-name"
          label={copy.analysisNameLabel}
          value={localize(productPair.analysisName)}
          onValueChange={(value) => updateField("analysisName", value)}
        />
        <LabeledTextField
          fieldId="comprehensive-product-type"
          label={copy.productTypeLabel}
          value={localize(productPair.productTypeOrNotes)}
          onValueChange={(value) => updateField("productTypeOrNotes", value)}
          multiline
        />
        <LabeledTextField
          fieldId="comprehensive-candidate-name"
          label={copy.candidateNameLabel}
          value={localize(productPair.candidateName)}
          onValueChange={(value) => updateField("candidateName", value)}
        />
        <LabeledTextField
          fieldId="comprehensive-reference-name"
          label={copy.referenceNameLabel}
          value={localize(productPair.referenceName)}
          onValueChange={(value) => updateField("referenceName", value)}
        />
        <LabeledTextField
          fieldId="comprehensive-candidate-lot"
          label={copy.candidateLotLabel}
          value={localize(productPair.candidateLot)}
          onValueChange={(value) => updateField("candidateLot", value)}
        />
        <LabeledTextField
          fieldId="comprehensive-reference-lot"
          label={copy.referenceLotLabel}
          value={localize(productPair.referenceLot)}
          onValueChange={(value) => updateField("referenceLot", value)}
        />
      </div>
    </section>
  );
}
