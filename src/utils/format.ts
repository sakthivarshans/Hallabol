export function fmtNum(
  val: number | null | undefined,
  decimals = 0,
  prefix = '',
  suffix = ''
): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  const formatted = val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${prefix}${formatted}${suffix}`;
}

export function fmtSigned(
  val: number | null | undefined,
  decimals = 2,
  suffix = ''
): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}${suffix}`;
}

export function fmtPct(val: number | null | undefined, decimals = 0): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  return `${(val * 100).toFixed(decimals)}%`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'RR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function isPreliminaryStatus(status?: string): boolean {
  if (!status) return false;
  return status.toLowerCase().includes('preliminary');
}

export function isDemoFlag(status?: string): boolean {
  if (!status) return false;
  return status.toUpperCase().includes('DEMO');
}
