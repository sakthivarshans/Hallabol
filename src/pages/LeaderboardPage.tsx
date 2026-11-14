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

interface LeaderboardPageProps {
  roleType: 'Batter' | 'Bowler';
}

export default function LeaderboardPage({ roleType }: LeaderboardPageProps) {
  const { data, loading, error, retry } = useDashboardData();
  const [dataset, setDataset] = useState<DatasetFilter>('all');
  const [formWindow, setFormWindow] = useState<FormWindow>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const rawPlayers = useMemo(() => {
    if (!data) return [];
    return roleType === 'Batter' ? data.batters : data.bowlers;
  }, [data, roleType]);

  const rankedForChart = useMemo(() => {
    return applyRankView(rawPlayers, dataset, formWindow).map((p) => ({
      ...p,
      rank: p.viewRank,
    }));
  }, [rawPlayers, dataset, formWindow]);

  const isBatter = roleType === 'Batter';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <p className="text-xs font-semibold text-[#EA1A85]">
          SupeRR Selector Rankings · {isBatter ? 'Batting' : 'Bowling'}
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0B1033] dark:text-white font-heading">
          Top 10 {isBatter ? 'Batters' : 'Bowlers'} Under Pressure
        </h1>
        <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Ranked by blended ridge pressure score. Toggle dataset or form window to re-rank players dynamically; click any row for full diagnostics.
        </p>
      </div>

      <div className="rounded-2xl border border-[#EA1A85]/30 bg-[#FFE3F1]/50 dark:bg-[#EA1A85]/10 p-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        <span className="font-semibold text-[#EA1A85]">Note: </span>
        These are the top-performing players overall, whatever their nationality, and they are my top predictions. If they are
        released by their franchises RR can bid for them at the auction. If they are not available, see the{' '}
        <Link to="/domestic" className="font-semibold text-[#EA1A85] underline underline-offset-2">Domestic Strategy</Link>{' '}
        tab, which ranks Indian nationals only.
      </div>

      <DataStateWrapper loading={loading} error={error} onRetry={retry}>
        <div className="space-y-8">
          <LeaderboardTable
            players={rawPlayers}
            roleType={roleType}
            dataset={dataset}
            onDatasetChange={setDataset}
            formWindow={formWindow}
            onFormWindowChange={setFormWindow}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          <RankRangeChart
            players={rankedForChart}
            title={`${isBatter ? 'Batters' : 'Bowlers'} Rank Stability Forest Plot`}
            subtitle="Median bootstrap rank with 5th–95th percentile intervals. Narrower bands indicate higher certainty."
          />
        </div>
      </DataStateWrapper>
    </div>
  );
}
