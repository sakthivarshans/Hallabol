import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RRPhaseChart } from '@/src/components/charts/RRPhaseChart';
import { DataStateWrapper } from '@/src/components/ui/DataStateWrapper';
import { PlayerAvatar } from '@/src/components/ui/PlayerAvatar';
import { PlayerCard } from '@/src/components/ui/PlayerCard';
import { StatTile } from '@/src/components/ui/StatTile';
import { METRIC_TOOLTIPS } from '@/src/data/glossary';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import type { PlayerRecord } from '@/src/types/data';
import { fmtNum, fmtPct, fmtSigned } from '@/src/utils/format';

function MiniLeaderboard({
  title,
  players,
  viewAllTo,
}: {
  title: string;
  players: PlayerRecord[];
  viewAllTo: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
          {title}
        </h2>
        <Link
          to={viewAllTo}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#EA1A85] hover:text-[#FF4FA8] whitespace-nowrap"
        >
          Full table <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {players.slice(0, 10).map((p) => {
          const p10 = Math.round((p.pTop10 ?? 0) * 100);
          return (
            <Link
              key={p.id}
              to={`/player/${p.slug}`}
              className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-[#FFE3F1]/40 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-xs font-mono-num font-bold text-[#EA1A85]">
                  {p.rank}
                </span>
                <PlayerAvatar slug={p.slug} name={p.name} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#0B1033] dark:text-white truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {p.fitTag}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:flex flex-col items-end w-28">
                  <div className="flex w-full items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Chance Top 10</span>
                    <span className="font-mono-num">{fmtPct(p.pTop10, 0)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#254AA5] to-[#EA1A85]"
                      style={{ width: `${p10}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right font-mono-num text-sm font-bold text-[#0B1033] dark:text-white">
                  {fmtNum(p.score, 1)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, retry } = useDashboardData();

  const topBatter = data?.batters[0];
  const topBowler = data?.bowlers[0];

  const deathRow = data?.rrPhase.rows.find((r) =>
    r.phase.toLowerCase().includes('death')
  );
  const batGap =
    deathRow && deathRow.rrBat !== null && deathRow.leagueBat !== null
      ? deathRow.rrBat - deathRow.leagueBat
      : null;
  const bowlGap =
    deathRow && deathRow.rrBowl !== null && deathRow.leagueBowl !== null
      ? deathRow.rrBowl - deathRow.leagueBowl
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#EA1A85]">
            Rajasthan Royals · SupeRR Selector Season 2
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0B1033] dark:text-white font-heading [text-wrap:balance]">
            Pressure Performers Overview
          </h1>
          {data && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              Evaluation Window: {data.meta.period} · Top {data.meta.leverageCutoffPct}% Leverage Cutoff
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/rr-squad"
            className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A4A] px-4 py-2 text-xs font-semibold text-[#0B1033] dark:text-white hover:border-[#EA1A85] transition-colors whitespace-nowrap"
          >
            Inspect RR Squad Gaps
          </Link>
          <Link
            to="/compare"
            className="rounded-xl bg-[#EA1A85] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FF4FA8] transition-colors whitespace-nowrap"
          >
            Compare Players
          </Link>
        </div>
      </div>

      <DataStateWrapper loading={loading} error={error} onRetry={retry}>
        {data && (
          <div className="space-y-8">
            {/* KPI Strip */}
            <section aria-label="Dataset summary metrics" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatTile label="Matches Analysed" value={data.meta.matches} />
              <StatTile label="Balls Analysed" value={data.meta.balls} />
              <StatTile
                label="Pressure Balls"
                value={data.meta.pressureBalls}
                sublabel={`Top ${data.meta.leverageCutoffPct}% leverage`}
                highlight
              />
              <StatTile label="Players Rated" value={data.meta.playersRated} />
              <StatTile
                label="Wicket Cost"
                value={data.meta.wicketCostRuns}
                decimals={1}
                suffix=" runs"
                tooltip={METRIC_TOOLTIPS.wicketCost}
              />
              <StatTile
                label="Model Version"
                value={data.meta.modelVersion}
                animate={false}
                sublabel={`Bat ${Math.round((data.meta.blendWeights?.bat?.[0] ?? 0) * 100)}/${Math.round((data.meta.blendWeights?.bat?.[1] ?? 0) * 100)} blend`}
              />
            </section>

            {/* Headline #1 Batter & #1 Bowler */}
            <section aria-label="Top ranked pressure performers" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topBatter && (
                <PlayerCard
                  player={topBatter}
                  kicker={`#1 Pressure Batter · ${topBatter.role}`}
                />
              )}
              {topBowler && (
                <PlayerCard
                  player={topBowler}
                  kicker={`#1 Pressure Bowler · ${topBowler.role}`}
                />
              )}
            </section>

            {/* Mini Top 10 Leaderboards */}
            <section aria-label="Top 10 leaderboards" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MiniLeaderboard
                title="Top 10 Batters Under Pressure"
                players={data.batters}
                viewAllTo="/batters"
              />
              <MiniLeaderboard
                title="Top 10 Bowlers Under Pressure"
                players={data.bowlers}
                viewAllTo="/bowlers"
              />
            </section>

            {/* RR Needs at a Glance */}
            <section
              aria-label="Rajasthan Royals phase needs at a glance"
              className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-[#0B1033] dark:text-white font-heading">
                    RR Needs at a Glance
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    Rajasthan Royals vs League average pressure Runs Above Expected (RAE) by match phase.
                  </p>
                </div>
                {deathRow && (
                  <div className="rounded-xl border border-[#EA1A85]/40 bg-[#FFE3F1]/60 dark:bg-[#EA1A85]/15 px-4 py-2.5 text-xs">
                    <span className="font-semibold text-[#EA1A85]">Death-Over Gap (16–20): </span>
                    <span className="font-mono-num text-[#0B1033] dark:text-white">
                      Bat {fmtSigned(batGap, 2)} vs League · Bowl {fmtSigned(bowlGap, 2)} vs League
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[#0B1033] dark:text-white">
                    Pressure Batting by Phase
                  </h3>
                  <RRPhaseChart rows={data.rrPhase.rows} mode="bat" />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[#0B1033] dark:text-white">
                    Pressure Bowling by Phase
                  </h3>
                  <RRPhaseChart rows={data.rrPhase.rows} mode="bowl" />
                </div>
              </div>
            </section>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}
