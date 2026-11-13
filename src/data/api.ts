import type {
  AllDashboardData,
  BenchmarksData,
  MetaData,
  MethodologyData,
  PlayerRecord,
  RRPhaseData,
  RRSquadMember,
} from '@/src/types/data';

const DATA_BASE = '/data';

type RawArrayOrWrapped<T> =
  | T[]
  | { status?: string; rows?: T[]; data?: T[]; players?: T[] };

function isDemoStatus(status?: string): boolean {
  if (!status) return false;
  return status.toUpperCase().includes('DEMO');
}

function unwrapArray<T extends { status?: string }>(
  payload: RawArrayOrWrapped<T>
): { items: T[]; isDemo: boolean } {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      isDemo: payload.some((item) => isDemoStatus(item?.status)),
    };
  }
  const items = payload.rows ?? payload.data ?? payload.players ?? [];
  return {
    items,
    isDemo:
      isDemoStatus(payload.status) ||
      items.some((item) => isDemoStatus(item?.status)),
  };
}

async function fetchJson<T>(filename: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}/${filename}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to load ${filename} (${res.status})`);
  }
  return (await res.json()) as T;
}

let cachedAll: Promise<AllDashboardData> | null = null;
const demoRegistry = new Set<string>();
const demoListeners = new Set<(hasDemo: boolean) => void>();

function registerDemoStatus(key: string, isDemo: boolean) {
  const prev = demoRegistry.size > 0;
  if (isDemo) {
    demoRegistry.add(key);
  } else {
    demoRegistry.delete(key);
  }
  const next = demoRegistry.size > 0;
  if (prev !== next) {
    demoListeners.forEach((cb) => cb(next));
  }
}

export function subscribeDemoStatus(cb: (hasDemo: boolean) => void): () => void {
  demoListeners.add(cb);
  cb(demoRegistry.size > 0);
  return () => {
    demoListeners.delete(cb);
  };
}

export function hasAnyDemoData(): boolean {
  return demoRegistry.size > 0;
}

export async function getMeta(): Promise<MetaData> {
  const data = await fetchJson<MetaData>('meta.json');
  registerDemoStatus('meta', isDemoStatus(data.status));
  return data;
}

export async function getBatters(): Promise<PlayerRecord[]> {
  const raw = await fetchJson<RawArrayOrWrapped<PlayerRecord>>('batters.json');
  const { items, isDemo } = unwrapArray(raw);
  registerDemoStatus('batters', isDemo);
  return items;
}

export async function getBowlers(): Promise<PlayerRecord[]> {
  const raw = await fetchJson<RawArrayOrWrapped<PlayerRecord>>('bowlers.json');
  const { items, isDemo } = unwrapArray(raw);
  registerDemoStatus('bowlers', isDemo);
  return items;
}

export async function getAllPlayers(): Promise<PlayerRecord[]> {
  const [batters, bowlers] = await Promise.all([getBatters(), getBowlers()]);
  return [...batters, ...bowlers];
}

export async function getPlayerBySlug(slug: string): Promise<{
  player: PlayerRecord | null;
  siblings: PlayerRecord[];
}> {
  const [batters, bowlers] = await Promise.all([getBatters(), getBowlers()]);
  const inBatters = batters.find((p) => p.slug === slug);
  if (inBatters) {
    return { player: inBatters, siblings: batters };
  }
  const inBowlers = bowlers.find((p) => p.slug === slug);
  if (inBowlers) {
    return { player: inBowlers, siblings: bowlers };
  }
  return { player: null, siblings: [] };
}

export async function getRRSquad(): Promise<RRSquadMember[]> {
  const raw = await fetchJson<RawArrayOrWrapped<RRSquadMember>>('rr_squad.json');
  const { items, isDemo } = unwrapArray(raw);
  registerDemoStatus('rr_squad', isDemo);
  return items;
}

export async function getRRPhase(): Promise<RRPhaseData> {
  const data = await fetchJson<RRPhaseData>('rr_phase.json');
  registerDemoStatus('rr_phase', isDemoStatus(data.status));
  return data;
}

export async function getMethodology(): Promise<MethodologyData> {
  const data = await fetchJson<MethodologyData>('methodology.json');
  registerDemoStatus('methodology', isDemoStatus(data.status));
  return data;
}

export async function getBenchmarks(): Promise<BenchmarksData> {
  const data = await fetchJson<BenchmarksData>('benchmarks.json');
  registerDemoStatus('benchmarks', isDemoStatus(data.status));
  return data;
}

export function getAllDashboardData(forceRefresh = false): Promise<AllDashboardData> {
  if (!cachedAll || forceRefresh) {
    cachedAll = Promise.all([
      getMeta(),
      getBatters(),
      getBowlers(),
      getRRSquad(),
      getRRPhase(),
      getMethodology(),
      getBenchmarks(),
    ])
      .then(([meta, batters, bowlers, rrSquad, rrPhase, methodology, benchmarks]) => ({
        meta,
        batters,
        bowlers,
        rrSquad,
        rrPhase,
        methodology,
        benchmarks,
        hasDemoData: hasAnyDemoData(),
      }))
      .catch((err) => {
        cachedAll = null;
        throw err;
      });
  }
  return cachedAll;
}
