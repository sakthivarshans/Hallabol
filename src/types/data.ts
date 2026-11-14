export interface PhaseShare {
  PP: number | null;
  Mid: number | null;
  Death: number | null;
}

export interface MetaData {
  status?: string;
  modelVersion: string;
  generatedAt: string;
  matches: number;
  balls: number;
  pressureBalls: number;
  playersRated: number;
  wicketCostRuns: number;
  leverageCutoffPct: number;
  blendWeights: {
    bat: [number, number];
    bowl: [number, number];
  };
  period: string;
}

export interface PlayerRecord {
  status?: string;
  isIndian?: boolean;
  domestic?: boolean;
  nationalitySource?: string;
  rank: number;
  id: string;
  slug: string;
  name: string;
  role: 'Batter' | 'Bowler' | string;
  handOrType: string;
  score: number | null;
  pressEffect: number | null;
  overallEffect: number | null;
  pTop10: number | null;
  rankMedian: number | null;
  rankLo: number | null;
  rankHi: number | null;
  pressureBalls: number | null;
  innings: number | null;
  runs: number | null;
  outs: number | null;
  strikeRate: number | null;
  average: number | null;
  sixes: number | null;
  economy: number | null;
  wickets: number | null;
  positiveShare: number | null;
  recentScore: number | null;
  olderScore: number | null;
  iplOnlyRank: number | null;
  phaseShare: PhaseShare;
  fitTag: string;
  whyRR: string;
  rrNeed: string;
  domesticSummary: string;
}

export interface RRSquadMember {
  status?: string;
  slug: string;
  name: string;
  role: string;
  pressureBalls: number | null;
  batValue: number | null;
  bowlValue: number | null;
  phaseShare: PhaseShare;
  notes: string;
}

export interface RRPhaseRow {
  phase: string;
  rrBat: number | null;
  leagueBat: number | null;
  rrBowl: number | null;
  leagueBowl: number | null;
  rrBallsFaced: number | null;
  rrBallsBowled: number | null;
}

export interface RRPhaseData {
  status?: string;
  rows: RRPhaseRow[];
}

export interface OOSRow {
  role: string;
  pressureOnly: number | null;
  overallOnly: number | null;
  blend: number | null;
  wPressure: number | null;
  wOverall: number | null;
}

export interface AlphaCVPoint {
  target: string;
  alpha: number;
  r2: number | null;
}

export interface CalibrationBin {
  bin: string;
  predicted: number | null;
  actual: number | null;
  n: number | null;
}

export interface CutoffSensitivityRow {
  batMin: number;
  bowlMin: number;
  batOverlap: number | null;
  bowlOverlap: number | null;
}

export interface MethodologyData {
  status?: string;
  oosTable: OOSRow[];
  alphaCV: AlphaCVPoint[];
  calibration: CalibrationBin[];
  cutoffSensitivity: CutoffSensitivityRow[];
  iplOnlyOverlap: {
    bat: number | null;
    bowl: number | null;
  };
  limitations: string[];
}

export interface BenchmarkRow {
  method: string;
  role: string;
  heldOutCorrelation: number | null;
  notes: string;
}

export interface BenchmarksData {
  status?: string;
  summary?: string;
  rows: BenchmarkRow[];
}

export interface DomesticMeta {
  status?: string;
  title: string;
  note: string;
  criteria: string;
  nationalityRule: string;
  poolBatters: number;
  poolBowlers: number;
  mappedIndian: number;
  supplementedIndian: number;
}

export interface AllDashboardData {
  meta: MetaData;
  batters: PlayerRecord[];
  bowlers: PlayerRecord[];
  domesticBatters: PlayerRecord[];
  domesticBowlers: PlayerRecord[];
  domestic: DomesticMeta;
  rrSquad: RRSquadMember[];
  rrPhase: RRPhaseData;
  methodology: MethodologyData;
  benchmarks: BenchmarksData;
  hasDemoData: boolean;
}
