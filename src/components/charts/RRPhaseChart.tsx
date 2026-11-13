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
import type { RRPhaseRow } from '@/src/types/data';

interface RRPhaseChartProps {
  rows: RRPhaseRow[];
  mode: 'bat' | 'bowl';
}

export function RRPhaseChart({ rows, mode }: RRPhaseChartProps) {
  const chartData = rows.map((r) => ({
    phase:
      r.phase === 'PP'
        ? 'Powerplay (1–6)'
        : r.phase === 'Mid'
          ? 'Middle (7–15)'
          : r.phase === 'Death'
            ? 'Death (16–20)'
            : r.phase,
    RR: mode === 'bat' ? r.rrBat : r.rrBowl,
    League: mode === 'bat' ? r.leagueBat : r.leagueBowl,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
          <XAxis
            dataKey="phase"
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(val) => [
              typeof val === 'number' ? val.toFixed(2) : val,
              mode === 'bat' ? 'Pressure Bat RAE / 100 balls' : 'Pressure Bowl runs saved / 100 balls',
            ]}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid rgba(234,26,133,0.35)',
              backgroundColor: '#0B1033',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar
            dataKey="RR"
            name="Rajasthan Royals"
            fill="#EA1A85"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="League"
            name="League Avg"
            fill="#254AA5"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
