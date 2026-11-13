import { useNavigate } from 'react-router-dom';
import type { PlayerRecord } from '@/src/types/data';
import { fmtNum, fmtPct } from '@/src/utils/format';

interface RankRangeChartProps {
  players: PlayerRecord[];
  title?: string;
  subtitle?: string;
}

export function RankRangeChart({
  players,
  title = 'Bootstrap Rank Stability (90% Confidence Interval)',
  subtitle = 'Median rank (pink marker) with 5th–95th percentile range across 1,000 match-clustered resamples.',
}: RankRangeChartProps) {
  const navigate = useNavigate();

  const maxRank = Math.max(
    12,
    ...players.map((p) => p.rankHi ?? p.rankMedian ?? p.rank ?? 10)
  );

  const pct = (rank: number) => ((rank - 1) / Math.max(1, maxRank - 1)) * 100;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
        <div>
          <h3 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
            {title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-300 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EA1A85]" aria-hidden="true" />
            Median
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-4 rounded bg-[#254AA5] dark:bg-[#FF4FA8]/60" aria-hidden="true" />
            5th–95th pct
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {players.map((p) => {
          const lo = p.rankLo ?? p.rank;
          const hi = p.rankHi ?? p.rank;
          const med = p.rankMedian ?? p.rank;
          const left = pct(lo);
          const right = pct(hi);
          const width = Math.max(2, right - left);
          const medLeft = pct(med);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate(`/player/${p.slug}`)}
              className="group grid w-full grid-cols-12 items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-[#EA1A85]"
            >
              <div className="col-span-5 sm:col-span-4 flex items-center gap-2 min-w-0">
                <span className="w-5 text-xs font-mono-num text-slate-400">
                  #{p.rank}
                </span>
                <span className="truncate text-xs sm:text-sm font-medium text-[#0B1033] dark:text-white group-hover:text-[#EA1A85] transition-colors">
                  {p.name}
                </span>
              </div>

              <div className="col-span-5 sm:col-span-6 relative h-6 flex items-center">
                <div className="w-full h-px bg-slate-200 dark:bg-white/10" />
                <div
                  className="absolute h-2 rounded-full bg-[#254AA5]/75 dark:bg-[#FF4FA8]/50"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`90% range: #${lo} to #${hi}`}
                />
                <div
                  className="absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white dark:border-[#0B1033] bg-[#EA1A85] shadow"
                  style={{ left: `${medLeft}%` }}
                  title={`Median rank: #${med}`}
                />
              </div>

              <div className="col-span-2 text-right font-mono-num text-xs text-slate-600 dark:text-slate-300">
                #{fmtNum(lo)}–#{fmtNum(hi)}
                <span className="hidden md:inline text-[11px] text-slate-400 ml-1">
                  ({fmtPct(p.pTop10, 0)})
                </span>
              </div>
            </button>
          );
        })}

        <div className="grid grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-white/10 text-[10px] font-mono-num text-slate-400">
          <div className="col-span-5 sm:col-span-4">Player</div>
          <div className="col-span-5 sm:col-span-6 flex justify-between">
            <span>Rank 1</span>
            <span>Rank {Math.round(maxRank / 2)}</span>
            <span>Rank {maxRank}</span>
          </div>
          <div className="col-span-2 text-right">90% CI</div>
        </div>
      </div>
    </div>
  );
}
