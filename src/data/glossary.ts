export interface GlossaryTerm {
  id: string;
  term: string;
  shortLabel: string;
  definition: string;
  formula?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'pressure',
    term: 'Pressure Delivery',
    shortLabel: 'Top 30% leverage balls',
    definition:
      'Any legal ball falling inside the top 30% of match leverage within each innings — moments where a single boundary or wicket causes the largest swing in win probability.',
  },
  {
    id: 'leverage',
    term: 'Match Leverage',
    shortLabel: 'Win-probability swing potential',
    definition:
      'Expected absolute change in team win probability on the upcoming ball given current score, wickets in hand, balls remaining, and target (in chases) or projected par.',
  },
  {
    id: 'rae',
    term: 'Runs Above Expected (RAE)',
    shortLabel: 'Context-adjusted ball value',
    definition:
      'Actual runs scored minus expected runs for that match state, phase, and venue, with dismissals penalised at the model’s empirical wicket cost in runs.',
  },
  {
    id: 'shrinkage',
    term: 'Ridge Shrinkage',
    shortLabel: 'Small-sample & opponent adjustment',
    definition:
      'L2-regularised joint regression estimating batter and bowler effects simultaneously. Pulls low-sample players toward zero so 40-ball hot streaks do not overtake proven performers.',
  },
  {
    id: 'ptop10',
    term: 'P(top 10)',
    shortLabel: 'Bootstrap top-10 probability',
    definition:
      'Share of 1,000 match-clustered bootstrap resamples in which a player finishes inside the top 10 for their role, quantifying selection certainty alongside the 5th–95th percentile rank range.',
  },
  {
    id: 'blend',
    term: 'Blended Pressure Score',
    shortLabel: 'Pressure + non-pressure skill composite',
    definition:
      'Cross-validated weighted blend combining pressure-ball ridge skill and non-pressure ridge skill, with weights chosen to best predict held-out pressure performance. Expressed as runs above expected per 100 pressure balls.',
  },
];

export const METRIC_TOOLTIPS: Record<string, string> = {
  score:
    'Blended pressure rating (runs above par per 100 pressure balls) combining high-leverage ridge skill and non-pressure skill.',
  pressEffect:
    'Context-adjusted Runs Above Expected per 100 pressure balls (batters: positive is better; bowlers: runs saved per ball, positive is better).',
  overallEffect:
    'Context-adjusted Runs Above Expected per 100 non-pressure balls, used to stabilise noisy pressure samples.',
  pTop10:
    'Probability of finishing inside the Top 10 across 300 match-level bootstrap resamples.',
  rankRange:
    'Median rank with 5th–95th percentile (90% confidence interval) across bootstrap resamples.',
  positiveShare:
    'Share of pressure innings or spells where the player produced net positive context-adjusted impact.',
  wicketCost:
    'Empirical value of a wicket in runs derived from the win-probability model.',
};
