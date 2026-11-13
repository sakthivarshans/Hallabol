import { useEffect, useState } from 'react';

interface CountUpNumberProps {
  value: number | null | undefined;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export function CountUpNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  durationMs = 700,
  className = '',
}: CountUpNumberProps) {
  const [display, setDisplay] = useState<number>(value ?? 0);

  useEffect(() => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return;
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || durationMs <= 0) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className={`font-mono-num ${className}`}>—</span>;
  }

  const formatted = display.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`font-mono-num ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
