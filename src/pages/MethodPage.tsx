import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MethodStep } from '@/src/components/method/MethodStep';
import { DataStateWrapper } from '@/src/components/ui/DataStateWrapper';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { fmtNum, isPreliminaryStatus } from '@/src/utils/format';

function orToBeAdded(val: number | string | null | undefined, formatter?: (n: number) => string): string {
  if (val === null || val === undefined || (typeof val === 'number' && Number.isNaN(val))) {
    return 'to be added';
  }
  if (typeof val === 'number' && formatter) return formatter(val);
  return String(val);
}

export default function MethodPage() {
  const { data, loading, error, retry } = useDashboardData();

  const alphaChartData = (() => {
    if (!data) return [];
    const byAlpha = new Map<number, { alpha: number; batter?: number; bowler?: number }>();
    for (const pt of data.methodology.alphaCV) {
      const entry = byAlpha.get(pt.alpha) ?? { alpha: pt.alpha };
      if (pt.target.toLowerCase().includes('bat')) {
        entry.batter = pt.r2 ?? undefined;
      } else {
        entry.bowler = pt.r2 ?? undefined;
      }
      byAlpha.set(pt.alpha, entry);
    }
    return Array.from(byAlpha.values()).sort((a, b) => a.alpha - b.alpha);
  })();

  const calibrationData =
    data?.methodology.calibration.map((c) => ({
      bin: c.bin,
      predicted: c.predicted !== null ? Number((c.predicted * 100).toFixed(1)) : null,
      actual: c.actual !== null ? Number((c.actual * 100).toFixed(1)) : null,
      n: c.n,
    })) ?? [];

  const benchmarkChartData =
    data?.benchmarks.rows.map((r) => ({
      label: `${r.method} (${r.role})`,
      method: r.method,
      role: r.role,
      correlation: r.heldOutCorrelation ?? 0,
    })) ?? [];

  const isPrelim = isPreliminaryStatus(data?.benchmarks.status);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div>
        <p className="text-xs font-semibold text-[#EA1A85]">
          Technical Appendix & Validation
        </p>
        <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#0B1033] dark:text-white font-heading [text-wrap:balance]">
          How I Calculated Pressure Performers
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Every figure below is populated directly from the competition data pack artifacts (
          <code className="font-mono-num">meta.json</code>,{' '}
          <code className="font-mono-num">methodology.json</code>, and{' '}
          <code className="font-mono-num">benchmarks.json</code>).
        </p>
      </div>

      <DataStateWrapper loading={loading} error={error} onRetry={retry}>
        {data && (
          <div className="space-y-12">
            {/* a. Problem & What Pressure Means */}
            <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0B1033] dark:text-white font-heading">
                1. The Problem & What "Pressure" Means
              </h2>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  Raw T20 averages and strike rates treat a low-stakes boundary at 180/1 in the 17th over identically to a six hit when chasing 42 off 18 balls with three wickets left. For franchise recruitment, that conflation overrates front-runners and hides clutch finishers and death bowlers.
                </p>
                <p>
                  I define pressure dynamically using ball-by-ball{' '}
                  <strong className="text-[#0B1033] dark:text-white">match leverage</strong>: how steeply team win probability can swing on the upcoming delivery. Within every innings, only the top{' '}
                  <span className="font-mono-num font-semibold text-[#EA1A85]">
                    {orToBeAdded(data.meta.leverageCutoffPct)}%
                  </span>{' '}
                  highest-leverage deliveries are flagged as pressure balls ({orToBeAdded(data.meta.pressureBalls, (n) => fmtNum(n))} out of {orToBeAdded(data.meta.balls, (n) => fmtNum(n))} balls).
                </p>
                <p>
                  Each delivery is scored as context-adjusted Runs Above Expected, pricing every dismissal at{' '}
                  <span className="font-mono-num font-semibold text-[#EA1A85]">
                    {orToBeAdded(data.meta.wicketCostRuns, (n) => n.toFixed(1))} runs
                  </span>{' '}
                  from the empirical win-probability surface across {orToBeAdded(data.meta.matches, (n) => fmtNum(n))} matches.
                </p>
              </div>
            </section>

            {/* b. Animated Pipeline Diagram */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#0B1033] dark:text-white font-heading">
                  2. End-to-End Modelling Pipeline
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Nine deterministic stages transforming raw ball-by-ball logs into bootstrap-certified rankings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MethodStep
                  stepNumber={1}
                  title="Ball-by-Ball Ingestion"
                  metricBadge={`${orToBeAdded(data.meta.matches, (n) => fmtNum(n))} matches`}
                  description="Clean IPL and eligible T20I deliveries, filtering out rain-affected and Super Over distortions."
                />
                <MethodStep
                  stepNumber={2}
                  title="Match-State Features"
                  description="Encode innings, balls remaining, wickets in hand, runs required (chases) or runs ahead of par (first innings), and competition type. No venue data is used."
                />
                <MethodStep
                  stepNumber={3}
                  title="Win-Probability Model"
                  description="Gradient-boosted classifier trained with grouped cross-validation by match ID to prevent leakage."
                />
                <MethodStep
                  stepNumber={4}
                  title="Delivery Leverage"
                  description="Compute expected |ΔWin Probability| for each ball from counterfactual run and wicket outcomes."
                />
                <MethodStep
                  stepNumber={5}
                  title="Pressure Filter"
                  metricBadge={`Top ${orToBeAdded(data.meta.leverageCutoffPct)}% / inns`}
                  description="Select the top leverage quantile per innings so both low-scoring thrillers and 220+ chases contribute fairly."
                />
                <MethodStep
                  stepNumber={6}
                  title="Runs Above Expected"
                  metricBadge={`Wicket = ${orToBeAdded(data.meta.wicketCostRuns, (n) => n.toFixed(1))}r`}
                  description="Subtract expected runs for match state and penalise dismissals at empirical run cost."
                />
                <MethodStep
                  stepNumber={7}
                  title="Joint Ridge Shrinkage"
                  description="Simultaneously estimate batter and bowler effects with L2 regularisation so opposition quality is adjusted."
                />
                <MethodStep
                  stepNumber={8}
                  title="Pressure + Non-Pressure Blend"
                  metricBadge={`Bat ${orToBeAdded(data.meta.blendWeights?.bat?.[0], (n) => n.toFixed(2))} / ${orToBeAdded(data.meta.blendWeights?.bat?.[1], (n) => n.toFixed(2))}`}
                  description="Combine noisy pressure-ball skill with skill measured on non-pressure balls, using weights learned from held-out matches."
                />
                <MethodStep
                  stepNumber={9}
                  title="Bootstrap Uncertainty"
                  metricBadge={`${orToBeAdded(data.meta.playersRated, (n) => fmtNum(n))} rated`}
                  description="Clustered match resampling produces 90% rank intervals and P(top 10) stability probabilities."
                />
              </div>
            </section>

            {/* c. Why This Algorithm */}
            <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold text-[#0B1033] dark:text-white font-heading">
                3. Why This Algorithm
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="rounded-xl border border-slate-200/70 dark:border-white/10 p-4">
                  <h3 className="font-heading font-bold text-[#0B1033] dark:text-white">
                    Grouped Match CV Win-Prob
                  </h3>
                  <p className="mt-1.5">
                    Splitting folds strictly by match prevents ball-level leakage within the same chase and gives honest out-of-fold probabilities; the calibration chart shows where the model is slightly overconfident.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/70 dark:border-white/10 p-4">
                  <h3 className="font-heading font-bold text-[#0B1033] dark:text-white">
                    Leverage Over Fixed Overs
                  </h3>
                  <p className="mt-1.5">
                    Hand-picked thresholds like "overs 16–20" miss 45/3 powerplay collapses or 12th-over choke points. Leverage adapts continuously to match tension.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/70 dark:border-white/10 p-4">
                  <h3 className="font-heading font-bold text-[#0B1033] dark:text-white">
                    Joint Ridge Regularisation
                  </h3>
                  <p className="mt-1.5">
                    Modelling batters and bowlers together credits scoring against elite death bowlers and shrinks small-sample outliers back toward the population prior.
                  </p>
                </div>
              </div>
            </section>

            {/* d. Evidence It Works */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-[#0B1033] dark:text-white font-heading">
                4. Empirical Evidence & Validation
              </h2>

              {/* OOS Table & IPL Overlap */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A]">
                  <div className="border-b border-slate-200 dark:border-white/10 px-5 py-4">
                    <h3 className="text-sm font-bold text-[#0B1033] dark:text-white font-heading">
                      Out-of-Sample Correlation With Held-Out Pressure Performance
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#0B1033]/50 text-xs text-slate-500 dark:text-slate-300">
                          <th className="py-3 pl-5 pr-3">Role</th>
                          <th className="py-3 px-3 text-right">Pressure Only</th>
                          <th className="py-3 px-3 text-right">Non-Pressure Only</th>
                          <th className="py-3 px-3 text-right text-[#EA1A85]">Blend (Mine)</th>
                          <th className="py-3 pl-3 pr-5 text-right">Weights (P / All)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono-num">
                        {data.methodology.oosTable.map((row) => (
                          <tr key={row.role}>
                            <td className="py-3 pl-5 pr-3 font-sans font-semibold text-[#0B1033] dark:text-white">
                              {row.role}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {orToBeAdded(row.pressureOnly, (n) => n.toFixed(3))}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {orToBeAdded(row.overallOnly, (n) => n.toFixed(3))}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#EA1A85]">
                              {orToBeAdded(row.blend, (n) => n.toFixed(3))}
                            </td>
                            <td className="py-3 pl-3 pr-5 text-right text-xs text-slate-500 dark:text-slate-300">
                              {orToBeAdded(row.wPressure, (n) => n.toFixed(2))} /{' '}
                              {orToBeAdded(row.wOverall, (n) => n.toFixed(2))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1033] dark:text-white font-heading">
                      IPL-Only vs All-Data Top-10 Overlap
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                      Share of Top-10 selections retained when restricting training exclusively to IPL matches.
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-[#0B1033]/60 p-4">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Batters</div>
                      <div className="mt-1 text-2xl font-extrabold font-mono-num text-[#EA1A85]">
                        {orToBeAdded(data.methodology.iplOnlyOverlap?.bat, (n) => `${Math.round(n * 100)}%`)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-[#0B1033]/60 p-4">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Bowlers</div>
                      <div className="mt-1 text-2xl font-extrabold font-mono-num text-[#254AA5] dark:text-[#7FA4FF]">
                        {orToBeAdded(data.methodology.iplOnlyOverlap?.bowl, (n) => `${Math.round(n * 100)}%`)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calibration + Alpha CV Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6">
                  <h3 className="text-sm font-bold text-[#0B1033] dark:text-white font-heading">
                    Win-Probability Calibration Curve
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    Predicted win probability deciles vs observed win frequency.
                  </p>
                  <div className="mt-4 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calibrationData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                        <XAxis dataKey="bin" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} unit="%" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid rgba(234,26,133,0.35)',
                            backgroundColor: '#0B1033',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          name="Predicted %"
                          stroke="#254AA5"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          name="Actual Win %"
                          stroke="#EA1A85"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: '#EA1A85' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6">
                  <h3 className="text-sm font-bold text-[#0B1033] dark:text-white font-heading">
                    Ridge Penalty (α) Cross-Validation R²
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    Out-of-fold R² across ridge regularisation strengths.
                  </p>
                  <div className="mt-4 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={alphaChartData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                        <XAxis dataKey="alpha" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid rgba(234,26,133,0.35)',
                            backgroundColor: '#0B1033',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line
                          type="monotone"
                          dataKey="batter"
                          name="Batter Pressure R²"
                          stroke="#EA1A85"
                          strokeWidth={2.5}
                          dot={{ r: 3.5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="bowler"
                          name="Bowler Pressure R²"
                          stroke="#254AA5"
                          strokeWidth={2.5}
                          dot={{ r: 3.5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Cut-off Sensitivity */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6">
                <h3 className="text-sm font-bold text-[#0B1033] dark:text-white font-heading">
                  Minimum Sample Cut-off Sensitivity
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  Top-10 list overlap across alternative minimum pressure-ball eligibility thresholds.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-300">
                        <th className="py-2.5 pr-4">Min Batter Pressure Balls</th>
                        <th className="py-2.5 px-4">Min Bowler Pressure Balls</th>
                        <th className="py-2.5 px-4 text-right">Batter Top-10 Overlap</th>
                        <th className="py-2.5 pl-4 text-right">Bowler Top-10 Overlap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono-num">
                      {data.methodology.cutoffSensitivity.map((c, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 pr-4">{orToBeAdded(c.batMin)}</td>
                          <td className="py-2.5 px-4">{orToBeAdded(c.bowlMin)}</td>
                          <td className="py-2.5 px-4 text-right text-[#EA1A85] font-semibold">
                            {orToBeAdded(c.batOverlap, (n) => `${Math.round(n * 100)}%`)}
                          </td>
                          <td className="py-2.5 pl-4 text-right text-[#254AA5] dark:text-[#7FA4FF] font-semibold">
                            {orToBeAdded(c.bowlOverlap, (n) => `${Math.round(n * 100)}%`)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* e. Benchmarks: Compared with simpler approaches */}
            <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#0B1033] dark:text-white font-heading">
                    5. Compared With Simpler Approaches
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Held-out correlation benchmarks from <code className="font-mono-num">benchmarks.json</code>.
                  </p>
                  {data.benchmarks.summary && (
                    <p className="mt-3 max-w-3xl rounded-xl border border-[#EA1A85]/30 bg-[#FFE3F1]/50 dark:bg-[#EA1A85]/10 p-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {data.benchmarks.summary}
                    </p>
                  )}
                </div>
                {isPrelim && (
                  <span className="rounded-lg border border-amber-400/50 bg-amber-100 dark:bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Preliminary
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={benchmarkChartData}
                      layout="vertical"
                      margin={{ top: 4, right: 20, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" horizontal={false} />
                      <XAxis type="number" domain={[0, 0.5]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={175}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <ReferenceLine x={0} stroke="rgba(148,163,184,0.3)" />
                      <Tooltip
                        formatter={(val) => [
                          typeof val === 'number' ? val.toFixed(3) : val,
                          'Held-out r',
                        ]}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(234,26,133,0.35)',
                          backgroundColor: '#0B1033',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="correlation" fill="#EA1A85" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-300">
                        <th className="py-2.5 pr-3">Method</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3 text-right">Held-Out r</th>
                        <th className="py-2.5 pl-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {data.benchmarks.rows.map((r, i) => (
                        <tr key={`${r.method}-${r.role}-${i}`}>
                          <td className="py-2.5 pr-3 font-medium text-[#0B1033] dark:text-white">
                            {r.method}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-300">
                            {r.role}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono-num font-bold text-[#EA1A85]">
                            {orToBeAdded(r.heldOutCorrelation, (n) => n.toFixed(3))}
                          </td>
                          <td className="py-2.5 pl-3 text-xs text-slate-500 dark:text-slate-400">
                            {r.notes || 'to be added'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* f. Fairness & g. Limitations & h. Reproducibility */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6">
                <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
                  6. Fairness & Eligibility Rules
                </h2>
                <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
                  <li>Minimum pressure-ball eligibility thresholds enforce stable estimation across roles.</li>
                  <li>IPL and eligible T20I fixtures are normalised for league run environments.</li>
                  <li>Rain-affected / DLS-truncated matches and Super Overs are excluded to avoid leverage skew.</li>
                  <li>Pakistan-team players are explicitly flagged as not IPL-eligible and excluded from RR shortlist slots.</li>
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6">
                <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
                  7. Limitations & Uncertainty
                </h2>
                <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
                  {data.methodology.limitations.length === 0 ? (
                    <li>to be added</li>
                  ) : (
                    data.methodology.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))
                  )}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6">
                <h2 className="text-base font-bold text-[#0B1033] dark:text-white font-heading">
                  8. Reproducibility Manifest
                </h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Generated: <span className="font-mono-num">{data.meta.generatedAt || 'to be added'}</span> · Model:{' '}
                  <span className="font-mono-num">{data.meta.modelVersion || 'to be added'}</span>
                </p>
                <ul className="mt-3 space-y-1.5 font-mono-num text-xs text-slate-600 dark:text-slate-300">
                  <li>/public/data/meta.json</li>
                  <li>/public/data/batters.json</li>
                  <li>/public/data/bowlers.json</li>
                  <li>/public/data/rr_squad.json</li>
                  <li>/public/data/rr_phase.json</li>
                  <li>/public/data/methodology.json</li>
                  <li>/public/data/benchmarks.json</li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}
