import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PhaseShare } from '@/src/types/data';

interface PhaseDonutProps {
  phaseShare: PhaseShare;
  title?: string;
}

const COLORS = ['#254AA5', '#FF4FA8', '#EA1A85'];

export function PhaseDonut({ phaseShare, title = 'Pressure Workload by Phase' }: PhaseDonutProps) {
  const data = [
    { name: 'Powerplay (1–6)', value: phaseShare.PP ?? 0 },
    { name: 'Middle (7–15)', value: phaseShare.Mid ?? 0 },
    { name: 'Death (16–20)', value: phaseShare.Death ?? 0 },
  ];

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-5 print-card">
      <h3 className="text-sm font-semibold text-[#0B1033] dark:text-white font-heading">
        {title}
      </h3>
      {total === 0 ? (
        <div className="flex h-52 items-center justify-center text-xs text-slate-400">
          Phase breakdown unavailable
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(234,26,133,0.3)',
                    backgroundColor: '#0B1033',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 text-xs">
            {data.map((d, idx) => (
              <div key={d.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: COLORS[idx] }}
                    aria-hidden="true"
                  />
                  <span>{d.name}</span>
                </div>
                <span className="font-mono-num font-semibold text-[#0B1033] dark:text-white">
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
