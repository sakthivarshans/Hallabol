import { ArrowUpRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RRPhaseChart } from '@/src/components/charts/RRPhaseChart';
import { DataStateWrapper } from '@/src/components/ui/DataStateWrapper';
import { PlayerAvatar } from '@/src/components/ui/PlayerAvatar';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import type { PlayerRecord, RRPhaseRow } from '@/src/types/data';
import { fmtNum, fmtSigned } from '@/src/utils/format';

function findWeakestPhase(rows: RRPhaseRow[], mode: 'bat' | 'bowl') {
  let weakest: { row: RRPhaseRow; gap: number } | null = null;
  for (const r of rows) {
    const rr = mode === 'bat' ? r.rrBat : r.rrBowl;
    const lg = mode === 'bat' ? r.leagueBat : r.leagueBowl;
    if (rr === null || lg === null) continue;
    const gap = rr - lg;
    if (!weakest || gap < weakest.gap) {
      weakest = { row: r, gap };
    }
  }
  return weakest;
}

function matchPlayersToPhase(players: PlayerRecord[], phase: string): PlayerRecord[] {
  const key = phase.toLowerCase();
  const phaseKey: 'PP' | 'Mid' | 'Death' = key.includes('pp')
    ? 'PP'
    : key.includes('mid')
      ? 'Mid'
      : 'Death';

  return [...players]
    .filter((p) => {
      const tag = `${p.fitTag} ${p.rrNeed}`.toLowerCase();
      if (phaseKey === 'Death') {
        return tag.includes('death') || tag.includes('finish') || (p.phaseShare.Death ?? 0) >= 40;
      }
      if (phaseKey === 'Mid') {
        return tag.includes('middle') || tag.includes('spin') || (p.phaseShare.Mid ?? 0) >= 45;
      }
      return tag.includes('powerplay') || (p.phaseShare.PP ?? 0) >= 40;
    })
    .slice(0, 4);
}

export default function RRSquadPage() {
  const { data, loading, error, retry } = useDashboardData();
  const [roleFilter, setRoleFilter] = useState<'all' | 'Batter' | 'Bowler' | 'All-Rounder'>('all');

  const squadRows = useMemo(() => {
    if (!data) return [];
    if (roleFilter === 'all') return data.rrSquad;
    return data.rrSquad.filter((m) =>
      m.role.toLowerCase().includes(roleFilter.toLowerCase())
    );
  }, [data, roleFilter]);

  const phaseStackData = useMemo(
    () =>
      squadRows.map((m) => ({
        name: m.name.split(' ').slice(-1)[0] ?? m.name,
        fullName: m.name,
        PP: m.phaseShare.PP ?? 0,
        Mid: m.phaseShare.Mid ?? 0,
        Death: m.phaseShare.Death ?? 0,
      })),
    [squadRows]
  );

  const weakestBat = data ? findWeakestPhase(data.rrPhase.rows, 'bat') : null;
  const weakestBowl = data ? findWeakestPhase(data.rrPhase.rows, 'bowl') : null;

  const batFits =
    data && weakestBat ? matchPlayersToPhase(data.batters, weakestBat.row.phase) : [];
  const bowlFits =
    data && weakestBowl ? matchPlayersToPhase(data.bowlers, weakestBowl.row.phase) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#EA1A85]">
            Rajasthan Royals · Current Roster Diagnostics
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0B1033] dark:text-white font-heading">
            RR Squad Pressure Profile & Gap Analysis
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Evaluating Rajasthan Royals incumbents under top-30% leverage balls to pinpoint recruitment targets.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#141A4A] p-1 self-start">
          {(['all', 'Batter', 'All-Rounder', 'Bowler'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-[#EA1A85] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1033] dark:hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      <DataStateWrapper loading={loading} error={error} onRetry={retry}>
        {data && (
          <div className="space-y-8">
            {/* Squad Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0B1033]/60 text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                      <th className="py-3 pl-5 pr-3">Player</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3 text-right">Pressure Balls</th>
                      <th className="py-3 px-3 text-right">Bat Value (RAE)</th>
                      <th className="py-3 px-3 text-right">Bowl Value (RAE)</th>
                      <th className="py-3 px-3 text-center">PP / Mid / Death</th>
                      <th className="py-3 pl-3 pr-5">Scouting Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                    {squadRows.map((m) => (
                      <tr key={m.slug} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                        <td className="py-3 pl-5 pr-3">
                          <div className="flex items-center gap-3">
                            <PlayerAvatar slug={m.slug} name={m.name} size="sm" />
                            <span className="font-semibold text-[#0B1033] dark:text-white whitespace-nowrap">
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {m.role}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num text-slate-700 dark:text-slate-200">
                          {fmtNum(m.pressureBalls)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono-num font-semibold ${
                            m.batValue === null
                              ? 'text-slate-400'
                              : m.batValue >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-500'
                          }`}
                        >
                          {fmtSigned(m.batValue, 2)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono-num font-semibold ${
                            m.bowlValue === null
                              ? 'text-slate-400'
                              : m.bowlValue >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-500'
                          }`}
                        >
                          {fmtSigned(m.bowlValue, 2)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono-num text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {fmtNum(m.phaseShare.PP)}% / {fmtNum(m.phaseShare.Mid)}% /{' '}
                          {fmtNum(m.phaseShare.Death)}%
                        </td>
                        <td className="py-3 pl-3 pr-5 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                          {m.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Phase Workload + League Phase Comparison */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6">
                <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
                  Squad Pressure Workload by Phase
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  Distribution of pressure deliveries across Powerplay (1–6), Middle (7–15), and Death (16–20).
                </p>
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={phaseStackData}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 16, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={84}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(val) => [`${val}%`, 'Share']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(234,26,133,0.35)',
                          backgroundColor: '#0B1033',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="PP" stackId="a" fill="#254AA5" name="Powerplay" />
                      <Bar dataKey="Mid" stackId="a" fill="#FF4FA8" name="Middle" />
                      <Bar dataKey="Death" stackId="a" fill="#EA1A85" name="Death" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
                    RR vs League by Phase
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    Highlighting where Rajasthan Royals underperform league pressure averages.
                  </p>
                </div>
                <RRPhaseChart rows={data.rrPhase.rows} mode="bat" />
              </div>
            </section>

            {/* Gap Analysis Panel */}
            <section
              aria-label="Gap analysis and top-10 fits"
              className="rounded-2xl border border-[#EA1A85]/40 bg-gradient-to-br from-[#FFE3F1]/40 via-white to-white dark:from-[#EA1A85]/15 dark:via-[#141A4A] dark:to-[#141A4A] p-6 sm:p-8"
            >
              <h2 className="text-xl font-bold text-[#0B1033] dark:text-white font-heading">
                Gap Analysis & Recommended Top-10 Fits
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Weakest phases derived from <code className="font-mono-num">rr_phase.json</code> matched with Top-10 candidates by role fit tag.
              </p>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Batting Gap */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0B1033]/70 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#0B1033] dark:text-white font-heading">
                      Weakest Batting Phase:{' '}
                      <span className="text-[#EA1A85]">
                        {weakestBat ? weakestBat.row.phase : '—'}
                      </span>
                    </h3>
                    {weakestBat && (
                      <span className="font-mono-num text-xs font-semibold text-rose-500">
                        {fmtSigned(weakestBat.gap, 2)} vs League
                      </span>
                    )}
                  </div>
                  {weakestBat && (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                      RR {fmtNum(weakestBat.row.rrBat, 2)} vs League{' '}
                      {fmtNum(weakestBat.row.leagueBat, 2)} across{' '}
                      {fmtNum(weakestBat.row.rrBallsFaced)} pressure balls faced
                    </p>
                  )}

                  <div className="mt-4 space-y-2.5">
                    {batFits.map((p) => (
                      <Link
                        key={p.id}
                        to={`/player/${p.slug}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-3 hover:border-[#EA1A85] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <PlayerAvatar slug={p.slug} name={p.name} size="sm" />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#0B1033] dark:text-white truncate">
                              #{p.rank} {p.name}
                            </div>
                            <div className="text-[11px] text-[#EA1A85] truncate">
                              {p.fitTag}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-num text-xs font-bold text-[#0B1033] dark:text-white">
                            {fmtNum(p.score, 1)}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Bowling Gap */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0B1033]/70 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#0B1033] dark:text-white font-heading">
                      Weakest Bowling Phase:{' '}
                      <span className="text-[#EA1A85]">
                        {weakestBowl ? weakestBowl.row.phase : '—'}
                      </span>
                    </h3>
                    {weakestBowl && (
                      <span className="font-mono-num text-xs font-semibold text-rose-500">
                        {fmtSigned(weakestBowl.gap, 2)} vs League
                      </span>
                    )}
                  </div>
                  {weakestBowl && (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                      RR {fmtNum(weakestBowl.row.rrBowl, 2)} vs League{' '}
                      {fmtNum(weakestBowl.row.leagueBowl, 2)} across{' '}
                      {fmtNum(weakestBowl.row.rrBallsBowled)} pressure balls bowled
                    </p>
                  )}

                  <div className="mt-4 space-y-2.5">
                    {bowlFits.map((p) => (
                      <Link
                        key={p.id}
                        to={`/player/${p.slug}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-3 hover:border-[#EA1A85] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <PlayerAvatar slug={p.slug} name={p.name} size="sm" />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#0B1033] dark:text-white truncate">
                              #{p.rank} {p.name}
                            </div>
                            <div className="text-[11px] text-[#EA1A85] truncate">
                              {p.fitTag}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-num text-xs font-bold text-[#0B1033] dark:text-white">
                            {fmtNum(p.score, 1)}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}
