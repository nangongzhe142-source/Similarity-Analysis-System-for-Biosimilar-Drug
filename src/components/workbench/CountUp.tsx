"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = { value: number; duration?: number; suffix?: string };

export function CountUp({ value, duration = 600, suffix = "" }: CountUpProps) {
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const animatedValue = useRef<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => {
        setDisplay(value);
        animatedValue.current = value;
      });
      return () => window.cancelAnimationFrame(frame);
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const startValue = animatedValue.current ?? 0;
        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(startValue + (value - startValue) * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
          else animatedValue.current = value;
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [duration, value]);

  return (
    <span ref={elementRef} className="count-up" aria-label={`${value}${suffix}`}>
      {display}
      {suffix}
    </span>
  );
}
