import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { PlayerRecord } from '@/src/types/data';

interface RadarCompareProps {
  primary: PlayerRecord;
  secondary?: PlayerRecord | null;
  height?: number;
}

function clamp0100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function buildMetrics(player: PlayerRecord): Record<string, number> {
  const isBatter = player.role.toLowerCase().includes('bat');
  const score = clamp0100(player.score ?? 50);
  const pressLift = clamp0100(50 + (player.pressEffect ?? 0) * 30);
  const certainty = clamp0100((player.pTop10 ?? 0) * 100);
  const consistency = clamp0100((player.positiveShare ?? 0) * 100);
  const specialist = isBatter
    ? clamp0100((((player.strikeRate ?? 130) - 105) / 85) * 100)
    : clamp0100(((10.2 - (player.economy ?? 8.2)) / 4.5) * 100);

  return {
    'Pressure Score': score,
    'Pressure Lift': pressLift,
    'Top-10 Certainty': certainty,
    'Positive Impact': consistency,
    [isBatter ? 'Pressure Tempo' : 'Economy Control']: specialist,
  };
}

export function RadarCompare({ primary, secondary, height = 310 }: RadarCompareProps) {
  const pMetrics = buildMetrics(primary);
  const sMetrics = secondary ? buildMetrics(secondary) : null;

  const data = Object.keys(pMetrics).map((axis) => ({
    metric: axis,
    [primary.name]: pMetrics[axis],
    ...(secondary && sMetrics ? { [secondary.name]: sMetrics[axis] } : {}),
  }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.28)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name={primary.name}
            dataKey={primary.name}
            stroke="#EA1A85"
            fill="#EA1A85"
            fillOpacity={0.32}
            strokeWidth={2}
          />
          {secondary && (
            <Radar
              name={secondary.name}
              dataKey={secondary.name}
              stroke="#254AA5"
              fill="#254AA5"
              fillOpacity={0.28}
              strokeWidth={2}
            />
          )}
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid rgba(234,26,133,0.35)',
              backgroundColor: '#0B1033',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          {secondary && <Legend wrapperStyle={{ fontSize: '12px' }} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
