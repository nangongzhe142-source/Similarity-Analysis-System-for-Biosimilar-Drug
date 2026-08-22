"use client";

import { useEffect, useMemo, useState, useId } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  IMAGE_AXIS_PRESETS,
  IMAGE_CALIBRATION_MIN_PIXEL_SPAN,
  IMAGE_CALIBRATION_MIN_POINTS,
  type ImageAxisKind,
  type ImageAxisPreset,
  type ImageCalibrationAnchor,
  type ImageCalibrationPayload,
  clickToNaturalPixel,
  defaultImageAxisKind,
  imageCalibrationPayload,
} from "@/lib/image-axis-calibration";

interface ImageAxisCalibrationPickerProps {
  file: File;
  profileId: string | undefined;
  disabled: boolean;
  onPayloadChange: (payload: ImageCalibrationPayload | null) => void;
}

export function ImageAxisCalibrationPicker({
  file,
  profileId,
  disabled,
  onPayloadChange,
}: ImageAxisCalibrationPickerProps) {
  const { messages } = useLanguage();
  const copy = messages.methodAnalysis;
  const radioName = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [kind, setKind] = useState<ImageAxisKind>(() => defaultImageAxisKind(profileId));
  const [anchors, setAnchors] = useState<ImageCalibrationAnchor[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (cancelled || typeof reader.result !== "string") {
        return;
      }
      setPreviewUrl(reader.result);
      setPreviewFailed(false);
      setNaturalSize(null);
    };
    reader.onerror = () => {
      if (!cancelled) {
        setPreviewUrl(null);
        setPreviewFailed(true);
        setNaturalSize(null);
      }
    };
    reader.readAsDataURL(file);
    return () => {
      cancelled = true;
      reader.onload = null;
      reader.onerror = null;
    };
  }, [file]);

  const preset = useMemo(
    () => IMAGE_AXIS_PRESETS.find((entry) => entry.id === kind) ?? IMAGE_AXIS_PRESETS[0],
    [kind],
  );
  const payload = imageCalibrationPayload(preset, anchors);
  const payloadKey = payload ? JSON.stringify(payload) : "";

  useEffect(() => {
    onPayloadChange(payloadKey ? (JSON.parse(payloadKey) as ImageCalibrationPayload) : null);
  }, [onPayloadChange, payloadKey]);

  const spanTooSmall =
    naturalSize !== null &&
    anchors.length >= IMAGE_CALIBRATION_MIN_POINTS &&
    Math.abs(anchors[1].pixel - anchors[0].pixel) < IMAGE_CALIBRATION_MIN_PIXEL_SPAN;

  const onImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (disabled || previewFailed) return;
    const image = event.currentTarget;
    const natural = clickToNaturalPixel(
      event.clientX,
      event.clientY,
      image.getBoundingClientRect(),
      image.naturalWidth,
      image.naturalHeight,
    );
    if (!natural) {
      return;
    }
    setAnchors((current) => {
      if (current.length < IMAGE_CALIBRATION_MIN_POINTS) {
        const updated = [
          ...current,
          { pixel: natural.x, displayY: natural.y, axisValueText: "" },
        ];
        setActiveIndex(updated.length - 1);
        return updated;
      }
      const updated = [...current];
      const previous = updated[activeIndex];
      updated[activeIndex] = {
        pixel: natural.x,
        displayY: natural.y,
        axisValueText: previous?.axisValueText ?? "",
      };
      return updated;
    });
  };

  return (
    <div className="mt-3 rounded border border-slate-300 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-900">{copy.imageCalibrationTitle}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{copy.imageCalibrationHint}</p>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-700">
        {IMAGE_AXIS_PRESETS.map((entry) => (
          <label key={entry.id} className="flex items-center gap-1">
            <input
              type="radio"
              name={radioName}
              checked={kind === entry.id}
              disabled={disabled}
              onChange={() => setKind(entry.id)}
            />
            {axisKindLabel(entry, copy)}
          </label>
        ))}
      </div>
      <div className="relative mt-2 overflow-auto rounded border border-slate-300 bg-white">
        {previewUrl ? (
          <>
            {/* Data URL from the selected File; next/image does not accept those. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={file.name}
              className="block h-auto w-full cursor-crosshair"
              onLoad={(event) =>
                setNaturalSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
              onError={() => {
                setPreviewFailed(true);
                setNaturalSize(null);
              }}
              onClick={onImageClick}
            />
            {naturalSize
              ? anchors.map((anchor, index) => (
                  <span
                    key={`${index}-${anchor.pixel}`}
                    className={`pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                      index === activeIndex
                        ? "border-teal-800 bg-teal-300"
                        : "border-rose-800 bg-rose-300"
                    }`}
                    style={{
                      left: `${(anchor.pixel / naturalSize.width) * 100}%`,
                      top: `${(anchor.displayY / naturalSize.height) * 100}%`,
                    }}
                  />
                ))
              : null}
          </>
        ) : (
          <div className="min-h-[8rem] bg-white" />
        )}
      </div>
      {previewFailed ? (
        <p className="mt-2 text-[11px] text-rose-800">{copy.imageCalibrationLoadFailed}</p>
      ) : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {[0, 1].map((index) => {
          const anchor = anchors[index];
          return (
            <label key={index} className="flex flex-col gap-1 text-xs">
              <button
                type="button"
                disabled={disabled || !anchor}
                onClick={() => setActiveIndex(index)}
                className={`text-left font-medium ${
                  activeIndex === index ? "text-teal-800" : "text-slate-700"
                }`}
              >
                {index === 0 ? copy.imageCalibrationPointOne : copy.imageCalibrationPointTwo}
                {anchor ? ` · x = ${anchor.pixel.toFixed(1)} px` : ""}
              </button>
              <input
                type="text"
                inputMode="decimal"
                value={anchor?.axisValueText ?? ""}
                disabled={disabled || !anchor}
                placeholder={copy.imageCalibrationValuePlaceholder}
                onChange={(event) => {
                  const text = event.target.value;
                  setAnchors((current) =>
                    current.map((item, currentIndex) =>
                      currentIndex === index ? { ...item, axisValueText: text } : item,
                    ),
                  );
                }}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </label>
          );
        })}
      </div>
      {spanTooSmall ? (
        <p className="mt-2 text-[11px] text-amber-900">{copy.imageCalibrationSpanTooSmall}</p>
      ) : null}
      {payload ? (
        <p className="mt-2 text-[11px] text-teal-800">{copy.imageCalibrationReady}</p>
      ) : (
        <p className="mt-2 text-[11px] text-slate-500">{copy.imageCalibrationOptional}</p>
      )}
      <button
        type="button"
        disabled={disabled || anchors.length === 0}
        onClick={() => {
          setAnchors([]);
          setActiveIndex(0);
        }}
        className="mt-2 rounded border border-slate-400 px-2 py-1 text-xs text-slate-700 hover:bg-white disabled:opacity-50"
      >
        {copy.imageCalibrationClear}
      </button>
    </div>
  );
}

function axisKindLabel(
  preset: ImageAxisPreset,
  copy: {
    imageCalibrationAxisMass: string;
    imageCalibrationAxisMz: string;
    imageCalibrationAxisRt: string;
  },
): string {
  if (preset.id === "mz-da") return copy.imageCalibrationAxisMz;
  if (preset.id === "rt-min") return copy.imageCalibrationAxisRt;
  return copy.imageCalibrationAxisMass;
}
