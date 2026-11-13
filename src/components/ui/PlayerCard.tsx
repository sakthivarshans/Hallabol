import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PlayerRecord } from '@/src/types/data';
import { fmtNum, fmtPct, fmtSigned } from '@/src/utils/format';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerCardProps {
  player: PlayerRecord;
  kicker: string;
}

export function PlayerCard({ player, kicker }: PlayerCardProps) {
  const isBatter = player.role.toLowerCase().includes('bat');

  return (
    <Link
      to={`/player/${player.slug}`}
      className="group block rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141A4A] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#EA1A85]/60 rr-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA1A85]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <PlayerAvatar slug={player.slug} name={player.name} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#EA1A85] truncate">{kicker}</p>
            <h3 className="mt-0.5 text-xl font-bold text-[#0B1033] dark:text-white truncate font-heading">
              {player.name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300 truncate">
              {player.handOrType} · {player.fitTag}
            </p>
          </div>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 group-hover:border-[#EA1A85] group-hover:text-[#EA1A85] transition-colors">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Pressure Score</div>
          <div className="mt-0.5 text-lg font-bold text-[#EA1A85] font-mono-num">
            {fmtNum(player.score, 1)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">P(top 10)</div>
          <div className="mt-0.5 text-lg font-bold text-[#0B1033] dark:text-white font-mono-num">
            {fmtPct(player.pTop10, 0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isBatter ? 'Pressure SR' : 'Pressure Econ'}
          </div>
          <div className="mt-0.5 text-lg font-bold text-[#0B1033] dark:text-white font-mono-num">
            {isBatter ? fmtNum(player.strikeRate, 1) : fmtNum(player.economy, 2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Press Effect</div>
          <div className="mt-0.5 text-lg font-bold text-[#0B1033] dark:text-white font-mono-num">
            {fmtSigned(player.pressEffect, 2)}
          </div>
        </div>
      </div>
    </Link>
  );
}
