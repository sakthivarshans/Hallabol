import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoTooltip } from '@/src/components/ui/InfoTooltip';
import { PlayerAvatar } from '@/src/components/ui/PlayerAvatar';
import { METRIC_TOOLTIPS } from '@/src/data/glossary';
import type { PlayerRecord } from '@/src/types/data';
import { fmtNum, fmtPct, fmtSigned } from '@/src/utils/format';

export type DatasetFilter = 'all' | 'ipl';
export type FormWindow = 'all' | 'recent' | 'older';
type SortKey =
  | 'activeRank'
  | 'name'
  | 'activeScore'
  | 'pTop10'
  | 'pressEffect'
  | 'primaryStat'
  | 'positiveShare'
  | 'pressureBalls';

interface LeaderboardTableProps {
  players: PlayerRecord[];
  roleType: 'Batter' | 'Bowler';
  dataset: DatasetFilter;
  onDatasetChange: (val: DatasetFilter) => void;
  formWindow: FormWindow;
  onFormWindowChange: (val: FormWindow) => void;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
}

export function getDisplayScore(p: PlayerRecord, formWindow: FormWindow): number {
  if (formWindow === 'recent') return p.recentScore ?? p.score ?? 0;
  if (formWindow === 'older') return p.olderScore ?? p.score ?? 0;
  return p.score ?? 0;
}

export function applyRankView(
  players: PlayerRecord[],
  dataset: DatasetFilter,
  formWindow: FormWindow
): Array<PlayerRecord & { viewRank: number; viewScore: number }> {
  const scored = players.map((p) => ({
    ...p,
    viewScore: getDisplayScore(p, formWindow),
    viewRank: p.rank,
  }));

  if (dataset === 'ipl' && formWindow === 'all') {
    scored.sort((a, b) => (a.iplOnlyRank ?? a.rank) - (b.iplOnlyRank ?? b.rank));
    return scored.map((p, idx) => ({
      ...p,
      viewRank: p.iplOnlyRank ?? idx + 1,
    }));
  }

  if (formWindow !== 'all') {
    scored.sort((a, b) => b.viewScore - a.viewScore);
    return scored.map((p, idx) => ({
      ...p,
      viewRank: idx + 1,
    }));
  }

  scored.sort((a, b) => a.rank - b.rank);
  return scored;
}

export function LeaderboardTable({
  players,
  roleType,
  dataset,
  onDatasetChange,
  formWindow,
  onFormWindowChange,
  searchQuery,
  onSearchQueryChange,
}: LeaderboardTableProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('activeRank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const isBatter = roleType === 'Batter';

  const ranked = useMemo(
    () => applyRankView(players, dataset, formWindow),
    [players, dataset, formWindow]
  );

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? ranked.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.handOrType.toLowerCase().includes(q) ||
            p.fitTag.toLowerCase().includes(q)
        )
      : [...ranked];

    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'activeRank':
          return (a.viewRank - b.viewRank) * dir;
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'activeScore':
          return ((a.viewScore ?? 0) - (b.viewScore ?? 0)) * dir;
        case 'pTop10':
          return ((a.pTop10 ?? 0) - (b.pTop10 ?? 0)) * dir;
        case 'pressEffect':
          return ((a.pressEffect ?? 0) - (b.pressEffect ?? 0)) * dir;
        case 'primaryStat':
          return isBatter
            ? ((a.strikeRate ?? 0) - (b.strikeRate ?? 0)) * dir
            : ((a.economy ?? 99) - (b.economy ?? 99)) * dir;
        case 'positiveShare':
          return ((a.positiveShare ?? 0) - (b.positiveShare ?? 0)) * dir;
        case 'pressureBalls':
          return ((a.pressureBalls ?? 0) - (b.pressureBalls ?? 0)) * dir;
        default:
          return 0;
      }
    });

    return list;
  }, [ranked, searchQuery, sortKey, sortDir, isBatter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'activeRank' || key === 'name' || (!isBatter && key === 'primaryStat') ? 'asc' : 'desc');
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-3 w-3 opacity-45" aria-hidden="true" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-[#EA1A85]" aria-hidden="true" />
    ) : (
      <ArrowDown className="h-3 w-3 text-[#EA1A85]" aria-hidden="true" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder={`Filter ${roleType.toLowerCase()}s by name, style, or RR fit...`}
            aria-label={`Filter ${roleType.toLowerCase()}s`}
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0B1033] pl-9 pr-3 text-sm text-[#0B1033] dark:text-white placeholder:text-slate-400 focus:border-[#EA1A85] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0B1033] p-1">
            <span className="px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Dataset:
            </span>
            <button
              type="button"
              onClick={() => onDatasetChange('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                dataset === 'all'
                  ? 'bg-[#EA1A85] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1033] dark:hover:text-white'
              }`}
            >
              All matches
            </button>
            <button
              type="button"
              onClick={() => onDatasetChange('ipl')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                dataset === 'ipl'
                  ? 'bg-[#EA1A85] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1033] dark:hover:text-white'
              }`}
            >
              IPL only
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0B1033] p-1">
            <span className="px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Form:
            </span>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'recent', label: '2025–26' },
                { id: 'older', label: '2022–24' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFormWindowChange(opt.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  formWindow === opt.id
                    ? 'bg-[#254AA5] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1033] dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0B1033]/60 text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                <th className="py-3 pl-4 pr-2">
                  <button
                    type="button"
                    onClick={() => toggleSort('activeRank')}
                    className="inline-flex items-center gap-1 hover:text-[#EA1A85]"
                  >
                    Rank {renderSortIcon('activeRank')}
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    className="inline-flex items-center gap-1 hover:text-[#EA1A85]"
                  >
                    Player {renderSortIcon('name')}
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('activeScore')}
                    className="inline-flex items-center gap-1 hover:text-[#EA1A85]"
                  >
                    Score {renderSortIcon('activeScore')}
                  </button>
                  <InfoTooltip text={METRIC_TOOLTIPS.score} label="Score definition" />
                </th>
                <th className="py-3 px-3 text-center">
                  <span>90% Rank Range</span>
                  <InfoTooltip text={METRIC_TOOLTIPS.rankRange} label="Rank range definition" />
                </th>
                <th className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('pTop10')}
                    className="inline-flex items-center gap-1 hover:text-[#EA1A85]"
                  >
                    P(top 10) {renderSortIcon('pTop10')}
                  </button>
                  <InfoTooltip text={METRIC_TOOLTIPS.pTop10} label="P(top 10) definition" />
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('pressEffect')}
                    className="inline-flex items-center gap-1 hover:text-[#EA1A85]"
                  >
                    Press RAE {renderSortIcon('pressEffect')}
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('primaryStat')}
                    className="inline-flex items-center gap-1 hover:text-[#EA1A85]"
                  >
                    {isBatter ? 'SR / Runs' : 'Econ / Wkts'}{' '}
                    {renderSortIcon('primaryStat')}
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('positiveShare')}
                    className="inline-flex items-center gap-1 hover:text-[#EA1A85]"
                  >
                    Pos. Share {renderSortIcon('positiveShare')}
                  </button>
                </th>
                <th className="py-3 pl-3 pr-4 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('pressureBalls')}
                    className="inline-flex items-center gap-1 hover:text-[#EA1A85]"
                  >
                    P-Balls {renderSortIcon('pressureBalls')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    No {roleType.toLowerCase()}s match "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((p) => {
                  const p10Pct = Math.round((p.pTop10 ?? 0) * 100);
                  return (
                    <tr
                      key={p.id}
                      tabIndex={0}
                      onClick={() => navigate(`/player/${p.slug}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/player/${p.slug}`);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-[#FFE3F1]/40 dark:hover:bg-[#EA1A85]/10 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#EA1A85]"
                    >
                      <td className="py-3 pl-4 pr-2 font-mono-num font-bold text-[#EA1A85]">
                        #{p.viewRank}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <PlayerAvatar slug={p.slug} name={p.name} size="sm" />
                          <div className="min-w-0">
                            <div className="font-semibold text-[#0B1033] dark:text-white truncate">
                              {p.name}
                              {p.isIndian && <span className="ml-1.5 align-middle rounded-full bg-[#EA1A85]/15 px-2 py-0.5 text-[10px] font-semibold text-[#EA1A85]">Indian</span>}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {p.handOrType} · {p.fitTag}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-bold text-[#0B1033] dark:text-white">
                        {fmtNum(p.viewScore, 1)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono-num text-xs text-slate-600 dark:text-slate-300">
                        #{fmtNum(p.rankLo)}–#{fmtNum(p.rankHi)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 min-w-[110px]">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#254AA5] to-[#EA1A85]"
                              style={{ width: `${p10Pct}%` }}
                            />
                          </div>
                          <span className="w-9 text-right font-mono-num text-xs text-slate-700 dark:text-slate-200">
                            {fmtPct(p.pTop10, 0)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-medium text-emerald-600 dark:text-emerald-400">
                        {fmtSigned(p.pressEffect, 2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-slate-700 dark:text-slate-200">
                        {isBatter
                          ? `${fmtNum(p.strikeRate, 1)} · ${fmtNum(p.runs)}`
                          : `${fmtNum(p.economy, 2)} · ${fmtNum(p.wickets)}w`}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-slate-600 dark:text-slate-300">
                        {fmtPct(p.positiveShare, 0)}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right font-mono-num text-slate-500 dark:text-slate-400">
                        {fmtNum(p.pressureBalls)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
