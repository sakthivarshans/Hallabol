import { ArrowLeftRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RadarCompare } from '@/src/components/charts/RadarCompare';
import { DataStateWrapper } from '@/src/components/ui/DataStateWrapper';
import { PlayerAvatar } from '@/src/components/ui/PlayerAvatar';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import type { PlayerRecord } from '@/src/types/data';
import { fmtNum, fmtPct, fmtSigned } from '@/src/utils/format';

interface StatComparisonRow {
  label: string;
  valA: string;
  valB: string;
  numA: number | null;
  numB: number | null;
  lowerIsBetter?: boolean;
}

export default function ComparePage() {
  const { data, loading, error, retry } = useDashboardData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [role, setRole] = useState<'Batter' | 'Bowler'>('Batter');
  const [slugA, setSlugA] = useState<string>('');
  const [slugB, setSlugB] = useState<string>('');

  // Sync initial selection from URL params or defaults
  useEffect(() => {
    if (!data) return;
    const p1 = searchParams.get('p1');
    const p2 = searchParams.get('p2');

    if (p1) {
      const inBat = data.batters.find((p) => p.slug === p1);
      const inBowl = data.bowlers.find((p) => p.slug === p1);
      if (inBowl) {
        setRole('Bowler');
        setSlugA(inBowl.slug);
        const second =
          p2 && data.bowlers.find((p) => p.slug === p2)
            ? p2
            : data.bowlers.find((p) => p.slug !== inBowl.slug)?.slug ?? inBowl.slug;
        setSlugB(second);
        return;
      }
      if (inBat) {
        setRole('Batter');
        setSlugA(inBat.slug);
        const second =
          p2 && data.batters.find((p) => p.slug === p2)
            ? p2
            : data.batters.find((p) => p.slug !== inBat.slug)?.slug ?? inBat.slug;
        setSlugB(second);
        return;
      }
    }

    const pool = role === 'Batter' ? data.batters : data.bowlers;
    if (!pool.some((p) => p.slug === slugA)) {
      setSlugA(pool[0]?.slug ?? '');
    }
    if (!pool.some((p) => p.slug === slugB)) {
      setSlugB(pool[1]?.slug ?? pool[0]?.slug ?? '');
    }
  }, [data, role, searchParams, slugA, slugB]);

  const pool: PlayerRecord[] = useMemo(() => {
    if (!data) return [];
    return role === 'Batter' ? data.batters : data.bowlers;
  }, [data, role]);

  const playerA = pool.find((p) => p.slug === slugA) ?? pool[0] ?? null;
  const playerB = pool.find((p) => p.slug === slugB) ?? pool[1] ?? pool[0] ?? null;

  const handleRoleSwitch = (nextRole: 'Batter' | 'Bowler') => {
    setRole(nextRole);
    if (!data) return;
    const nextPool = nextRole === 'Batter' ? data.batters : data.bowlers;
    const nextA = nextPool[0]?.slug ?? '';
    const nextB = nextPool[1]?.slug ?? nextA;
    setSlugA(nextA);
    setSlugB(nextB);
    setSearchParams({ p1: nextA, p2: nextB }, { replace: true });
  };

  const updateSelection = (which: 'A' | 'B', slug: string) => {
    const nextA = which === 'A' ? slug : playerA?.slug ?? '';
    const nextB = which === 'B' ? slug : playerB?.slug ?? '';
    if (which === 'A') setSlugA(slug);
    else setSlugB(slug);
    setSearchParams({ p1: nextA, p2: nextB }, { replace: true });
  };

  const swapPlayers = () => {
    if (!playerA || !playerB) return;
    setSlugA(playerB.slug);
    setSlugB(playerA.slug);
    setSearchParams({ p1: playerB.slug, p2: playerA.slug }, { replace: true });
  };

  const rows: StatComparisonRow[] = useMemo(() => {
    if (!playerA || !playerB) return [];
    const base: StatComparisonRow[] = [
      {
        label: 'Pressure Rank',
        valA: `#${playerA.rank}`,
        valB: `#${playerB.rank}`,
        numA: playerA.rank,
        numB: playerB.rank,
        lowerIsBetter: true,
      },
      {
        label: 'Blended Pressure Score',
        valA: fmtNum(playerA.score, 1),
        valB: fmtNum(playerB.score, 1),
        numA: playerA.score,
        numB: playerB.score,
      },
      {
        label: 'Pressure Effect (RAE/100 balls)',
        valA: fmtSigned(playerA.pressEffect, 2),
        valB: fmtSigned(playerB.pressEffect, 2),
        numA: playerA.pressEffect,
        numB: playerB.pressEffect,
      },
      {
        label: 'Non-Pressure Effect (RAE/100 balls)',
        valA: fmtSigned(playerA.overallEffect, 2),
        valB: fmtSigned(playerB.overallEffect, 2),
        numA: playerA.overallEffect,
        numB: playerB.overallEffect,
      },
      {
        label: 'P(top 10) Certainty',
        valA: fmtPct(playerA.pTop10, 0),
        valB: fmtPct(playerB.pTop10, 0),
        numA: playerA.pTop10,
        numB: playerB.pTop10,
      },
      {
        label: '90% Rank Range',
        valA: `#${fmtNum(playerA.rankLo)}–#${fmtNum(playerA.rankHi)}`,
        valB: `#${fmtNum(playerB.rankLo)}–#${fmtNum(playerB.rankHi)}`,
        numA: null,
        numB: null,
      },
      {
        label: 'Recent Form (2025–26)',
        valA: fmtNum(playerA.recentScore, 1),
        valB: fmtNum(playerB.recentScore, 1),
        numA: playerA.recentScore,
        numB: playerB.recentScore,
      },
      {
        label: 'Positive Impact Share',
        valA: fmtPct(playerA.positiveShare, 0),
        valB: fmtPct(playerB.positiveShare, 0),
        numA: playerA.positiveShare,
        numB: playerB.positiveShare,
      },
      {
        label: 'Pressure Balls',
        valA: fmtNum(playerA.pressureBalls),
        valB: fmtNum(playerB.pressureBalls),
        numA: playerA.pressureBalls,
        numB: playerB.pressureBalls,
      },
      {
        label: 'Innings',
        valA: fmtNum(playerA.innings),
        valB: fmtNum(playerB.innings),
        numA: playerA.innings,
        numB: playerB.innings,
      },
    ];

    if (role === 'Batter') {
      base.push(
        {
          label: 'Pressure Runs',
          valA: fmtNum(playerA.runs),
          valB: fmtNum(playerB.runs),
          numA: playerA.runs,
          numB: playerB.runs,
        },
        {
          label: 'Pressure Strike Rate',
          valA: fmtNum(playerA.strikeRate, 1),
          valB: fmtNum(playerB.strikeRate, 1),
          numA: playerA.strikeRate,
          numB: playerB.strikeRate,
        },
        {
          label: 'Pressure Average',
          valA: fmtNum(playerA.average, 1),
          valB: fmtNum(playerB.average, 1),
          numA: playerA.average,
          numB: playerB.average,
        },
        {
          label: 'Pressure Sixes',
          valA: fmtNum(playerA.sixes),
          valB: fmtNum(playerB.sixes),
          numA: playerA.sixes,
          numB: playerB.sixes,
        }
      );
    } else {
      base.push(
        {
          label: 'Pressure Economy',
          valA: fmtNum(playerA.economy, 2),
          valB: fmtNum(playerB.economy, 2),
          numA: playerA.economy,
          numB: playerB.economy,
          lowerIsBetter: true,
        },
        {
          label: 'Pressure Wickets',
          valA: fmtNum(playerA.wickets),
          valB: fmtNum(playerB.wickets),
          numA: playerA.wickets,
          numB: playerB.wickets,
        }
      );
    }

    return base;
  }, [playerA, playerB, role]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#EA1A85]">
            Head-to-Head Scouting Workbench
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0B1033] dark:text-white font-heading">
            Compare Pressure Performers
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Select any two batters or any two bowlers from the Top 20 to evaluate tactical trade-offs.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#141A4A] p-1 self-start">
          {(['Batter', 'Bowler'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleSwitch(r)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                role === r
                  ? 'bg-[#EA1A85] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1033] dark:hover:text-white'
              }`}
            >
              {r}s
            </button>
          ))}
        </div>
      </div>

      <DataStateWrapper loading={loading} error={error} onRetry={retry}>
        {playerA && playerB && (
          <div className="space-y-8">
            {/* Selector Strip */}
            <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5">
              <div className="md:col-span-5 space-y-2">
                <label
                  htmlFor="compare-player-a"
                  className="block text-xs font-semibold text-[#EA1A85]"
                >
                  Player A (Pink)
                </label>
                <div className="flex items-center gap-3">
                  <PlayerAvatar slug={playerA.slug} name={playerA.name} size="md" />
                  <select
                    id="compare-player-a"
                    value={playerA.slug}
                    onChange={(e) => updateSelection('A', e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0B1033] px-3 text-sm font-medium text-[#0B1033] dark:text-white focus:border-[#EA1A85] focus:outline-none"
                  >
                    {pool.map((p) => (
                      <option key={p.id} value={p.slug}>
                        #{p.rank} {p.name} ({fmtNum(p.score, 1)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={swapPlayers}
                  aria-label="Swap Player A and Player B"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0B1033] text-slate-600 dark:text-slate-200 hover:border-[#EA1A85] hover:text-[#EA1A85] transition-colors"
                >
                  <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="md:col-span-5 space-y-2">
                <label
                  htmlFor="compare-player-b"
                  className="block text-xs font-semibold text-[#254AA5] dark:text-[#7FA4FF]"
                >
                  Player B (Royal Blue)
                </label>
                <div className="flex items-center gap-3">
                  <PlayerAvatar slug={playerB.slug} name={playerB.name} size="md" />
                  <select
                    id="compare-player-b"
                    value={playerB.slug}
                    onChange={(e) => updateSelection('B', e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#0B1033] px-3 text-sm font-medium text-[#0B1033] dark:text-white focus:border-[#EA1A85] focus:outline-none"
                  >
                    {pool.map((p) => (
                      <option key={p.id} value={p.slug}>
                        #{p.rank} {p.name} ({fmtNum(p.score, 1)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Radar + Side-by-Side Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6">
                <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
                  Normalised 5-Metric Radar
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  Scaled 0–100 across Pressure Score, Lift, Certainty, Consistency, and Tempo/Economy.
                </p>
                <div className="mt-4">
                  <RadarCompare primary={playerA} secondary={playerB} height={340} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-white/10 text-xs">
                  <Link
                    to={`/player/${playerA.slug}`}
                    className="inline-flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 font-medium text-[#0B1033] dark:text-white hover:border-[#EA1A85]"
                  >
                    <span className="truncate">{playerA.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#EA1A85]" aria-hidden="true" />
                  </Link>
                  <Link
                    to={`/player/${playerB.slug}`}
                    className="inline-flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 font-medium text-[#0B1033] dark:text-white hover:border-[#EA1A85]"
                  >
                    <span className="truncate">{playerB.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#254AA5] dark:text-[#7FA4FF]" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0B1033]/60 text-xs font-semibold">
                      <th className="py-3.5 pl-5 pr-3 text-slate-500 dark:text-slate-300">
                        Metric
                      </th>
                      <th className="py-3.5 px-3 text-right text-[#EA1A85]">
                        {playerA.name}
                      </th>
                      <th className="py-3.5 pl-3 pr-5 text-right text-[#254AA5] dark:text-[#7FA4FF]">
                        {playerB.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                    {rows.map((r) => {
                      let aWins = false;
                      let bWins = false;
                      if (r.numA !== null && r.numB !== null && r.numA !== r.numB) {
                        if (r.lowerIsBetter) {
                          aWins = r.numA < r.numB;
                          bWins = r.numB < r.numA;
                        } else {
                          aWins = r.numA > r.numB;
                          bWins = r.numB > r.numA;
                        }
                      }

                      return (
                        <tr key={r.label}>
                          <td className="py-3 pl-5 pr-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                            {r.label}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-mono-num ${
                              aWins
                                ? 'font-bold text-[#EA1A85]'
                                : 'text-[#0B1033] dark:text-white'
                            }`}
                          >
                            {r.valA}
                          </td>
                          <td
                            className={`py-3 pl-3 pr-5 text-right font-mono-num ${
                              bWins
                                ? 'font-bold text-[#254AA5] dark:text-[#7FA4FF]'
                                : 'text-[#0B1033] dark:text-white'
                            }`}
                          >
                            {r.valB}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="py-3 pl-5 pr-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        RR Role Fit
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-slate-600 dark:text-slate-300">
                        {playerA.fitTag}
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right text-xs text-slate-600 dark:text-slate-300">
                        {playerB.fitTag}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}
