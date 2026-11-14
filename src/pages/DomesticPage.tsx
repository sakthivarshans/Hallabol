import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RankRangeChart } from '@/src/components/charts/RankRangeChart';
import {
  applyRankView,
  type DatasetFilter,
  type FormWindow,
  LeaderboardTable,
} from '@/src/components/tables/LeaderboardTable';
import { DataStateWrapper } from '@/src/components/ui/DataStateWrapper';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { fmtSigned } from '@/src/utils/format';

type Role = 'Batter' | 'Bowler';

export default function DomesticPage() {
  const { data, loading, error, retry } = useDashboardData();
  const [role, setRole] = useState<Role>('Batter');
  const [dataset, setDataset] = useState<DatasetFilter>('all');
  const [formWindow, setFormWindow] = useState<FormWindow>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isBatter = role === 'Batter';
  const players = useMemo(() => {
    if (!data) return [];
    return isBatter ? data.domesticBatters : data.domesticBowlers;
  }, [data, isBatter]);

  const rankedForChart = useMemo(
    () => applyRankView(players, dataset, formWindow).map((p) => ({ ...p, rank: p.viewRank })),
    [players, dataset, formWindow]
  );

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    players.forEach((p) => m.set(p.fitTag, (m.get(p.fitTag) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [players]);

  const deathRow = data?.rrPhase.rows.find((r) => r.phase === 'Death');
  const deathGap = deathRow
    ? isBatter
      ? (deathRow.rrBat ?? 0) - (deathRow.leagueBat ?? 0)
      : (deathRow.rrBowl ?? 0) - (deathRow.leagueBowl ?? 0)
    : null;
  const deathCount = players.filter((p) => p.fitTag.toLowerCase().includes('death')).length;
  const alreadyRR = players.filter((p) => p.rrNeed.toLowerCase().includes('already in rr')).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <p className="text-xs font-semibold text-[#EA1A85]">SupeRR Selector · Domestic Strategy</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0B1033] dark:text-white font-heading">
          Top 10 Indian {isBatter ? 'Batters' : 'Bowlers'} Under Pressure
        </h1>
        <p className="mt-1.5 max-w-3xl text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {data?.domestic.note ??
            'The best-performing Indian players under pressure, ranked with the same model as the main lists.'}
        </p>
      </div>

      <DataStateWrapper loading={loading} error={error} onRetry={retry}>
        {data && (
          <div className="space-y-8">
            <div
              role="tablist"
              aria-label="Domestic role"
              className="inline-flex rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A4A] p-1"
            >
              {(['Batter', 'Bowler'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={role === r}
                  onClick={() => setRole(r)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
                    role === r
                      ? 'bg-[#EA1A85] text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#EA1A85]'
                  }`}
                >
                  {r === 'Batter' ? 'Batters' : 'Bowlers'}
                </button>
              ))}
            </div>

            <LeaderboardTable
              players={players}
              roleType={role}
              dataset={dataset}
              onDatasetChange={setDataset}
              formWindow={formWindow}
              onFormWindowChange={setFormWindow}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />

            <RankRangeChart
              players={rankedForChart}
              title={`Indian ${isBatter ? 'Batters' : 'Bowlers'} Rank Stability`}
              subtitle="Ranks and probabilities are computed inside the Indian pool only. Median bootstrap rank with 5th–95th percentile intervals."
            />

            <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 space-y-4">
              <h2 className="text-lg font-extrabold text-[#0B1033] dark:text-white font-heading">
                Domestic strategy for RR
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200 list-disc pl-5">
                <li>
                  <span className="font-semibold">Fallback plan.</span> Indian nationals do not use one of RR&apos;s overseas places
                  (IPL squads are capped at 8 overseas players), so they are the natural alternative if the overall top performers are not released.
                </li>
                {deathGap !== null && (
                  <li>
                    <span className="font-semibold">Death-over gap.</span> RR&apos;s death-over {isBatter ? 'batting' : 'bowling'} under pressure is{' '}
                    {fmtSigned(deathGap, 1)} runs per 100 balls versus the league (IPL 2025–26); {deathCount} of these 10 are tagged death-over{' '}
                    {isBatter ? 'finishers' : 'specialists'}.
                  </li>
                )}
                {alreadyRR > 0 && (
                  <li>
                    <span className="font-semibold">Already at RR.</span> {alreadyRR} of these 10 are in RR&apos;s 2026 squad, so for them the question is retention rather than a bid.
                  </li>
                )}
                <li>
                  <span className="font-semibold">How the pool is built.</span> {data.domestic.criteria} Pool size: {data.domestic.poolBatters} batters and{' '}
                  {data.domestic.poolBowlers} bowlers.
                </li>
              </ul>
              <div className="flex flex-wrap gap-2">
                {tagCounts.map(([tag, n]) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#EA1A85]/10 px-3 py-1 text-xs font-semibold text-[#EA1A85]"
                  >
                    {tag} · {n}
                  </span>
                ))}
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-white/5 p-3 text-xs text-slate-600 dark:text-slate-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#EA1A85]" aria-hidden="true" />
                <p>
                  <span className="font-semibold">Nationality rule.</span> {data.domestic.nationalityRule} Each player&apos;s source is stored in the data (
                  {data.domestic.mappedIndian} via the mapping, {data.domestic.supplementedIndian} from public records). Overall top performers are on the{' '}
                  <Link to={isBatter ? '/batters' : '/bowlers'} className="font-semibold text-[#EA1A85] underline underline-offset-2">
                    main {isBatter ? 'batters' : 'bowlers'} page
                  </Link>
                  .
                </p>
              </div>
            </section>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}
