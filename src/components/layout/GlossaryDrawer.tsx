import { X } from 'lucide-react';
import { GLOSSARY_TERMS } from '@/src/data/glossary';

interface GlossaryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function GlossaryDrawer({ open, onClose }: GlossaryDrawerProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Analytics Glossary"
      className="fixed inset-0 z-50 flex justify-end bg-[#0B1033]/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1033] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0B1033] dark:text-white font-heading">
              Model Glossary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Definitions for SupeRR Selector pressure metrics
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close glossary"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-[#EA1A85]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-6 space-y-5">
          {GLOSSARY_TERMS.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#141A4A] p-4"
            >
              <dt className="flex items-baseline justify-between gap-2">
                <span className="font-heading text-sm font-bold text-[#0B1033] dark:text-white">
                  {item.term}
                </span>
                <span className="text-[11px] font-medium text-[#EA1A85]">
                  {item.shortLabel}
                </span>
              </dt>
              <dd className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.definition}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141A4A] p-4">
          <h3 className="text-xs font-semibold text-[#0B1033] dark:text-white">
            Keyboard Shortcuts
          </h3>
          <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span>Quick Player Search</span>
              <kbd className="rounded border border-slate-300 dark:border-white/20 px-1.5 py-0.5 font-mono text-[11px]">
                /
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Toggle Glossary</span>
              <kbd className="rounded border border-slate-300 dark:border-white/20 px-1.5 py-0.5 font-mono text-[11px]">
                g
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Close Overlays</span>
              <kbd className="rounded border border-slate-300 dark:border-white/20 px-1.5 py-0.5 font-mono text-[11px]">
                Esc
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
