import { motion } from 'framer-motion';

interface MethodStepProps {
  stepNumber: number;
  title: string;
  description: string;
  metricBadge?: string;
}

export function MethodStep({
  stepNumber,
  title,
  description,
  metricBadge,
}: MethodStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.28, delay: Math.min(stepNumber * 0.04, 0.25) }}
      className="relative rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#EA1A85] to-[#254AA5] font-mono-num text-xs font-bold text-white">
          {String(stepNumber).padStart(2, '0')}
        </span>
        {metricBadge && (
          <span className="text-[11px] font-mono-num text-[#EA1A85] text-right">
            {metricBadge}
          </span>
        )}
      </div>
      <h4 className="mt-3 text-sm font-bold text-[#0B1033] dark:text-white font-heading">
        {title}
      </h4>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </motion.div>
  );
}
