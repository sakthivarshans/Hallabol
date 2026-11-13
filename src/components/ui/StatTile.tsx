import { CountUpNumber } from './CountUpNumber';
import { InfoTooltip } from './InfoTooltip';

interface StatTileProps {
  label: string;
  value: number | string | null | undefined;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  sublabel?: string;
  tooltip?: string;
  animate?: boolean;
  highlight?: boolean;
}

export function StatTile({
  label,
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  sublabel,
  tooltip,
  animate = true,
  highlight = false,
}: StatTileProps) {
  const isNumeric = typeof value === 'number' && !Number.isNaN(value);

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-0.5 print-card ${
        highlight
          ? 'border-[#EA1A85]/40 bg-gradient-to-br from-[#FFE3F1]/70 to-white dark:from-[#EA1A85]/15 dark:to-[#141A4A] rr-glow'
          : 'border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A]'
      }`}
    >
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-300">
        <span>{label}</span>
        {tooltip && <InfoTooltip text={tooltip} label={label} />}
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1033] dark:text-white font-heading tabular-nums">
        {value === null || value === undefined ? (
          <span className="font-mono-num">—</span>
        ) : isNumeric && animate ? (
          <CountUpNumber
            value={value}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
          />
        ) : isNumeric ? (
          <span className="font-mono-num">
            {prefix}
            {value.toLocaleString('en-IN', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
            {suffix}
          </span>
        ) : (
          <span>{value}</span>
        )}
      </div>
      {sublabel && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          {sublabel}
        </p>
      )}
    </div>
  );
}
