import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { subscribeDemoStatus } from '@/src/data/api';

export function DemoBanner() {
  const [hasDemo, setHasDemo] = useState(false);

  useEffect(() => {
    return subscribeDemoStatus(setHasDemo);
  }, []);

  if (!hasDemo) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-[#EA1A85]/35 bg-[#FFE3F1] dark:bg-[#EA1A85]/20 px-4 py-2 text-xs text-[#0B1033] dark:text-[#FFE3F1] no-print"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center font-medium">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#EA1A85]" aria-hidden="true" />
        <span>
          <strong>DEMO DATA</strong> · Showing placeholder JSON outputs from{' '}
          <code className="font-mono-num">/public/data</code>. Replace with competition outputs to switch to live scoring.
        </span>
      </div>
    </div>
  );
}
