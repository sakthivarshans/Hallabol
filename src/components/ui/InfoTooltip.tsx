import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface InfoTooltipProps {
  text: string;
  label?: string;
}

export function InfoTooltip({ text, label = 'Metric explanation' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center align-middle">
      <button
        type="button"
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-[#EA1A85] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA1A85] transition-colors"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0B1033] p-2.5 text-left text-xs font-normal leading-relaxed text-slate-700 dark:text-slate-200 shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}
