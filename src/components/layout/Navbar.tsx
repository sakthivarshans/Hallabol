import { BookOpen, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '@/src/context/ThemeContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenGlossary: () => void;
}

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/batters', label: 'Batters' },
  { to: '/bowlers', label: 'Bowlers' },
  { to: '/rr-squad', label: 'RR Squad' },
  { to: '/compare', label: 'Compare' },
  { to: '/method', label: 'How we calculated' },
];

export function Navbar({ onOpenSearch, onOpenGlossary }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0B1033]/85 backdrop-blur-md no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-heading text-base sm:text-lg font-extrabold tracking-tight text-[#0B1033] dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA1A85]"
        >
          Supe<span className="text-[#EA1A85]">RR</span> Selector
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-6"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 py-1 border-b-2 ${
                  isActive
                    ? 'border-[#EA1A85] text-[#EA1A85]'
                    : 'border-transparent text-slate-600 hover:text-[#0B1033] dark:text-slate-300 dark:hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search players (press /)"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141A4A] px-3 text-xs font-medium text-slate-600 dark:text-slate-200 hover:border-[#EA1A85] hover:text-[#EA1A85] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA1A85]"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex items-center rounded border border-slate-300 dark:border-white/20 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-300">
              /
            </kbd>
          </button>

          <button
            type="button"
            onClick={onOpenGlossary}
            aria-label="Open metrics glossary"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141A4A] px-3 text-xs font-medium text-slate-600 dark:text-slate-200 hover:border-[#EA1A85] hover:text-[#EA1A85] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA1A85]"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Glossary</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141A4A] text-slate-600 dark:text-slate-200 hover:border-[#EA1A85] hover:text-[#EA1A85] transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA1A85]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#141A4A] text-slate-700 dark:text-slate-200"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1033] px-4 py-3 space-y-1"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EA1A85]/15 text-[#EA1A85]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
