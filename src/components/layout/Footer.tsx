import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0B1033] py-8 text-xs text-slate-500 dark:text-slate-400 no-print">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center sm:text-left">
          Built for the RR SupeRR Selector Season 2 · Data pack used for this competition only
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link to="/dashboard" className="hover:text-[#EA1A85] transition-colors">
            Overview
          </Link>
          <Link to="/batters" className="hover:text-[#EA1A85] transition-colors">
            Batters
          </Link>
          <Link to="/bowlers" className="hover:text-[#EA1A85] transition-colors">
            Bowlers
          </Link>
          <Link to="/domestic" className="hover:text-[#EA1A85] transition-colors">
            Domestic
          </Link>
          <Link to="/rr-squad" className="hover:text-[#EA1A85] transition-colors">
            RR Squad
          </Link>
          <Link to="/method" className="hover:text-[#EA1A85] transition-colors">
            Methodology
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-5 max-w-7xl border-t border-slate-200/60 dark:border-white/10 px-4 sm:px-6 lg:px-8 pt-4 text-center">
        <p className="font-semibold text-[#0B1033] dark:text-white">
          Built by <span className="text-[#EA1A85]">Sakthivarshan S</span>
        </p>
        <p className="mt-1">LinkedIn: linkedin.com/in/sakthivarshans10</p>
      </div>
    </footer>
  );
}
