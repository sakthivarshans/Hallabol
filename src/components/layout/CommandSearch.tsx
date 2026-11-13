import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerAvatar } from '@/src/components/ui/PlayerAvatar';
import { getAllPlayers } from '@/src/data/api';
import type { PlayerRecord } from '@/src/types/data';
import { fmtNum, fmtPct } from '@/src/utils/format';

interface CommandSearchProps {
  open: boolean;
  onClose: () => void;
}

export function CommandSearch({ open, onClose }: CommandSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    getAllPlayers()
      .then(setPlayers)
      .catch(() => setPlayers([]));
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.handOrType.toLowerCase().includes(q) ||
        p.fitTag.toLowerCase().includes(q)
    );
  }, [players, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = (slug: string) => {
    onClose();
    navigate(`/player/${slug}`);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Top-20 Pressure Performers"
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#0B1033]/75 backdrop-blur-sm px-4 pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A4A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 px-4 py-3">
          <Search className="h-4 w-4 text-[#EA1A85] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose();
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter' && filtered[activeIndex]) {
                e.preventDefault();
                handleSelect(filtered[activeIndex].slug);
              }
            }}
            placeholder="Search any of the 20 players by name, role, or RR fit..."
            className="w-full bg-transparent text-sm text-[#0B1033] dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-[#EA1A85]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching players found for "{query}".
            </div>
          ) : (
            filtered.map((player, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={player.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(player.slug)}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#FFE3F1]/70 dark:bg-[#EA1A85]/20'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar slug={player.slug} name={player.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0B1033] dark:text-white truncate">
                        <span>{player.name}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          · #{player.rank} {player.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {player.handOrType} · {player.fitTag}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#EA1A85] font-mono-num">
                        {fmtNum(player.score, 1)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-num">
                        P10: {fmtPct(player.pTop10, 0)}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B1033]/60 px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Use ↑ ↓ to navigate, Enter to open player profile</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
