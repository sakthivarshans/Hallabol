import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RRLogo } from '@/src/components/ui/RRLogo';

const PARTICLES = [
  { id: 1, x: '12%', y: '18%', size: 8, delay: 0 },
  { id: 2, x: '82%', y: '22%', size: 10, delay: 0.8 },
  { id: 3, x: '24%', y: '72%', size: 6, delay: 1.4 },
  { id: 4, x: '76%', y: '68%', size: 9, delay: 0.4 },
  { id: 5, x: '48%', y: '14%', size: 5, delay: 1.9 },
  { id: 6, x: '62%', y: '84%', size: 7, delay: 1.1 },
  { id: 7, x: '8%', y: '48%', size: 6, delay: 2.3 },
  { id: 8, x: '90%', y: '46%', size: 8, delay: 0.6 },
];

export default function LandingPage() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-between overflow-hidden bg-[#0B1033] text-white">
      {/* Animated pink-to-navy atmospheric gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 animate-gradient bg-gradient-to-br from-[#0B1033] via-[#141A4A] to-[#EA1A85]/45 opacity-95"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-[#EA1A85]/25 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#254AA5]/35 blur-[100px]"
      />

      {/* Subtle floating pink particles */}
      {!reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0.15, y: 0 }}
              animate={{ opacity: [0.15, 0.55, 0.15], y: [-10, 14, -10] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
              style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
              className="absolute rounded-full bg-[#FF4FA8]/60"
            />
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center"
        >
          <div className="mb-8">
            <RRLogo className="h-28 sm:h-36 w-auto drop-shadow-2xl" />
          </div>

          <h1 className="font-heading text-5xl sm:text-7xl font-extrabold tracking-tight text-white [text-wrap:balance]">
            <span className="bg-gradient-to-r from-[#FFE3F1] via-[#FF4FA8] to-[#EA1A85] bg-clip-text text-transparent">
              #HALLA BOL
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-xl font-medium text-[#FFE3F1]/90 [text-wrap:balance]">
            SupeRR Selector S2 · Most Reliable Players Under Pressure
          </p>

          <p className="mt-3 max-w-xl text-sm text-slate-300 leading-relaxed">
            Franchise decision room identifying T20 batters and bowlers who outperform expectation inside the highest-leverage deliveries, adjusted for opposition quality and sample uncertainty.
          </p>

          <div className="mt-9">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#EA1A85] to-[#FF4FA8] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#EA1A85]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[#EA1A85]/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF4FA8]"
            >
              <span>View Stats</span>
              <ArrowRight
                className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 border-t border-white/10 px-6 py-4 text-center text-xs text-slate-300/80">
        <p>Built for the RR SupeRR Selector Season 2 · Data pack used for this competition only</p>
        <p className="mt-1">
          Built by <span className="font-semibold text-[#FF4FA8]">Sakthivarshan S</span> · LinkedIn: linkedin.com/in/sakthivarshans10
        </p>
      </div>
    </section>
  );
}
