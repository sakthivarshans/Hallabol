import {
  ArrowLeft,
  ArrowRight,
  Check,
  GitCompareArrows,
  Printer,
  Share2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PhaseDonut } from '@/src/components/charts/PhaseDonut';
import { RadarCompare } from '@/src/components/charts/RadarCompare';
import { DataStateWrapper } from '@/src/components/ui/DataStateWrapper';
import { PlayerAvatar } from '@/src/components/ui/PlayerAvatar';
import { StatTile } from '@/src/components/ui/StatTile';
import { METRIC_TOOLTIPS } from '@/src/data/glossary';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { fmtNum, fmtPct, fmtSigned } from '@/src/utils/format';

export default function PlayerProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, loading, error, retry } = useDashboardData();
  const [copied, setCopied] = useState(false);

  const allBatters = data?.batters ?? [];
  const allBowlers = data?.bowlers ?? [];
  const domBatters = data?.domesticBatters ?? [];
  const domBowlers = data?.domesticBowlers ?? [];

  const inBatters = allBatters.findIndex((p) => p.slug === slug);
  const inBowlers = allBowlers.findIndex((p) => p.slug === slug);
  const inDomBat = domBatters.findIndex((p) => p.slug === slug);
  const inDomBowl = domBowlers.findIndex((p) => p.slug === slug);

  const siblings =
    inBatters >= 0 ? allBatters : inBowlers >= 0 ? allBowlers : inDomBat >= 0 ? domBatters : inDomBowl >= 0 ? domBowlers : [];
  const currentIdx =
    inBatters >= 0 ? inBatters : inBowlers >= 0 ? inBowlers : inDomBat >= 0 ? inDomBat : inDomBowl;
  const player = currentIdx >= 0 ? siblings[currentIdx] : null;
  const prevPlayer = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextPlayer =
    currentIdx >= 0 && currentIdx < siblings.length - 1
      ? siblings[currentIdx + 1]
      : null;

  const isBatter = player?.role.toLowerCase().includes('bat') ?? true;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const effectBarData = player
    ? [
        { name: 'Pressure Effect', value: player.pressEffect ?? 0 },
        { name: 'Overall Effect', value: player.overallEffect ?? 0 },
      ]
    : [];

  const formBarData = player
    ? [
        { name: '2025–26 Form', value: player.recentScore ?? 0 },
        { name: '2022–24 Form', value: player.olderScore ?? 0 },
      ]
    : [];

  const rankLo = player?.rankLo ?? player?.rank ?? 1;
  const rankHi = player?.rankHi ?? player?.rank ?? 1;
  const rankMed = player?.rankMedian ?? player?.rank ?? 1;
  const maxAxis = Math.max(15, rankHi + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <DataStateWrapper loading={loading} error={error} onRetry={retry}>
        {!player ? (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#141A4A] p-10 text-center">
            <h1 className="text-xl font-bold text-[#0B1033] dark:text-white font-heading">
              Player not found
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              No player profile matches "{slug}".
            </p>
            <Link
              to="/dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#EA1A85] px-4 py-2 text-sm font-semibold text-white"
            >
              Back to Overview
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Navigation & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(player?.domestic ? '/domestic' : isBatter ? '/batters' : '/bowlers')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A4A] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#EA1A85]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {player?.domestic ? 'Domestic list' : `All ${isBatter ? 'Batters' : 'Bowlers'}`}
                </button>
                {prevPlayer && (
                  <Link
                    to={`/player/${prevPlayer.slug}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A4A] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#EA1A85]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Prev (#{prevPlayer.rank})
                  </Link>
                )}
                {nextPlayer && (
                  <Link
                    to={`/player/${nextPlayer.slug}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A4A] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#EA1A85]"
                  >
                    Next (#{nextPlayer.rank})
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/compare?p1=${player.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#EA1A85] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FF4FA8] transition-colors"
                >
                  <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
                  Compare
                </Link>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A4A] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#EA1A85]"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {copied ? 'Link copied' : 'Share'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A4A] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#EA1A85]"
                >
                  <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                  Print
                </button>
              </div>
            </div>

            {/* Player Hero */}
            <section className="rounded-2xl border border-[#EA1A85]/30 bg-gradient-to-br from-white via-[#FFE3F1]/30 to-white dark:from-[#141A4A] dark:via-[#141A4A] dark:to-[#EA1A85]/15 p-6 sm:p-8 print-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <PlayerAvatar slug={player.slug} name={player.name} size="xl" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#EA1A85]">
                      <span>Rank #{player.rank} {player.role}</span>
                      <span aria-hidden="true">·</span>
                      <span>IPL-Only Rank #{fmtNum(player.iplOnlyRank)}</span>
                    </div>
                    <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#0B1033] dark:text-white font-heading">
                      {player.name}
                      {player.isIndian && <span className="ml-2 align-middle rounded-full bg-[#EA1A85]/15 px-2 py-0.5 text-[10px] font-semibold text-[#EA1A85]">Indian</span>}
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                      {player.handOrType} · {player.fitTag}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 dark:border-white/10">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Pressure Score
                    </div>
                    <div className="text-4xl font-extrabold text-[#EA1A85] font-mono-num">
                      {fmtNum(player.score, 1)}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-slate-200 dark:bg-white/15" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      P(top 10)
                    </div>
                    <div className="text-2xl font-bold text-[#0B1033] dark:text-white font-mono-num">
                      {fmtPct(player.pTop10, 0)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-num">
                      90% CI #{fmtNum(player.rankLo)}–#{fmtNum(player.rankHi)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Stats Grid */}
            <section aria-label="Player key pressure statistics">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatTile
                  label="Pressure Effect"
                  value={fmtSigned(player.pressEffect, 2)}
                  animate={false}
                  tooltip={METRIC_TOOLTIPS.pressEffect}
                  sublabel={`Overall: ${fmtSigned(player.overallEffect, 2)}`}
                />
                <StatTile label="Pressure Balls" value={player.pressureBalls} />
                <StatTile label="Innings" value={player.innings} />
                {isBatter ? (
                  <>
                    <StatTile label="Pressure Runs" value={player.runs} />
                    <StatTile label="Strike Rate" value={player.strikeRate} decimals={1} />
                    <StatTile label="Average" value={player.average} decimals={1} />
                    <StatTile label="Dismissals" value={player.outs} />
                    <StatTile label="Sixes" value={player.sixes} />
                    <StatTile
                      label="Positive Innings"
                      value={
                        player.positiveShare !== null
                          ? Math.round(player.positiveShare * 100)
                          : null
                      }
                      suffix="%"
                      tooltip={METRIC_TOOLTIPS.positiveShare}
                    />
                    <StatTile
                      label="Recent vs Earlier"
                      value={
                        player.recentScore !== null && player.olderScore !== null
                          ? fmtSigned(player.recentScore - player.olderScore, 1)
                          : '—'
                      }
                      animate={false}
                      sublabel={`${fmtNum(player.recentScore, 1)} vs ${fmtNum(player.olderScore, 1)}`}
                    />
                  </>
                ) : (
                  <>
                    <StatTile label="Pressure Economy" value={player.economy} decimals={2} />
                    <StatTile label="Pressure Wickets" value={player.wickets} />
                    <StatTile
                      label="Positive Spells"
                      value={
                        player.positiveShare !== null
                          ? Math.round(player.positiveShare * 100)
                          : null
                      }
                      suffix="%"
                      tooltip={METRIC_TOOLTIPS.positiveShare}
                    />
                    <StatTile
                      label="Recent vs Earlier"
                      value={
                        player.recentScore !== null && player.olderScore !== null
                          ? fmtSigned(player.recentScore - player.olderScore, 1)
                          : '—'
                      }
                      animate={false}
                      sublabel={`${fmtNum(player.recentScore, 1)} vs ${fmtNum(player.olderScore, 1)}`}
                    />
                  </>
                )}
              </div>
            </section>

            {/* 5 Visual Charts */}
            <section aria-label="Player diagnostic charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PhaseDonut phaseShare={player.phaseShare} />

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 print-card">
                <h3 className="text-sm font-semibold text-[#0B1033] dark:text-white font-heading">
                  5-Metric Pressure Radar
                </h3>
                <RadarCompare primary={player} height={240} />
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 print-card">
                <h3 className="text-sm font-semibold text-[#0B1033] dark:text-white font-heading">
                  Pressure Effect vs Overall Effect (RAE / 100 balls)
                </h3>
                <div className="mt-3 h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={effectBarData}
                      margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [typeof val === 'number' ? val.toFixed(2) : val, 'RAE / 100 balls']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(234,26,133,0.35)',
                          backgroundColor: '#0B1033',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                        <Cell fill="#EA1A85" />
                        <Cell fill="#254AA5" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 print-card">
                <h3 className="text-sm font-semibold text-[#0B1033] dark:text-white font-heading">
                  Recent (2025–26) vs Earlier (2022–24) Form Score
                </h3>
                <div className="mt-3 h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formBarData}
                      margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [typeof val === 'number' ? val.toFixed(1) : val, 'Form Score']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(234,26,133,0.35)',
                          backgroundColor: '#0B1033',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                        <Cell fill="#FF4FA8" />
                        <Cell fill="#254AA5" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Rank Range Bar */}
            <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 sm:p-6 print-card print-break-inside-avoid">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#0B1033] dark:text-white font-heading">
                  Bootstrap 90% Rank Range (5th–95th Percentile)
                </h3>
                <span className="font-mono-num text-xs font-semibold text-[#EA1A85]">
                  Median #{fmtNum(rankMed)} · Interval #{fmtNum(rankLo)} to #{fmtNum(rankHi)}
                </span>
              </div>
              <div className="mt-5 relative h-8 flex items-center">
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
                <div
                  className="absolute h-3 rounded-full bg-[#254AA5] dark:bg-[#FF4FA8]/65"
                  style={{
                    left: `${((rankLo - 1) / (maxAxis - 1)) * 100}%`,
                    width: `${Math.max(3, ((rankHi - rankLo) / (maxAxis - 1)) * 100)}%`,
                  }}
                />
                <div
                  className="absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white dark:border-[#0B1033] bg-[#EA1A85] shadow"
                  style={{
                    left: `${((rankMed - 1) / (maxAxis - 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[11px] font-mono-num text-slate-400">
                <span>Rank #1</span>
                <span>Rank #{Math.round(maxAxis / 2)}</span>
                <span>Rank #{maxAxis}</span>
              </div>
            </section>

            {/* Scouting Narrative Blocks */}
            <section
              aria-label="Rajasthan Royals scouting assessment"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-break-inside-avoid"
            >
              <article className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6 print-card">
                <h2 className="text-base font-bold text-[#EA1A85] font-heading">
                  Why RR should pick him
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {player.whyRR || '—'}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6 print-card">
                <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
                  The RR need he fills
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {player.rrNeed || '—'}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6 print-card">
                <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
                  Domestic performance summary
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {player.domesticSummary || '—'}
                </p>
              </article>
            </section>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}
