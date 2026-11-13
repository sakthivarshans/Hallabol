import { AlertCircle, RefreshCw } from 'lucide-react';
import { PageSkeleton } from './Skeleton';

interface DataStateWrapperProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function DataStateWrapper({
  loading,
  error,
  onRetry,
  children,
}: DataStateWrapperProps) {
  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-8 text-center"
      >
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-bold text-[#0B1033] dark:text-white font-heading">
          Unable to load data pack
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#EA1A85] px-4 py-2 text-sm font-semibold text-white hover:bg-[#FF4FA8] transition-colors"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
