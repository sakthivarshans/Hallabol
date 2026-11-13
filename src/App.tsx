import { MotionConfig, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CommandSearch } from '@/src/components/layout/CommandSearch';
import { DemoBanner } from '@/src/components/layout/DemoBanner';
import { Footer } from '@/src/components/layout/Footer';
import { GlossaryDrawer } from '@/src/components/layout/GlossaryDrawer';
import { Navbar } from '@/src/components/layout/Navbar';
import { PageSkeleton } from '@/src/components/ui/Skeleton';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { getAllDashboardData } from '@/src/data/api';

const LandingPage = lazy(() => import('@/src/pages/LandingPage'));
const DashboardPage = lazy(() => import('@/src/pages/DashboardPage'));
const LeaderboardPage = lazy(() => import('@/src/pages/LeaderboardPage'));
const PlayerProfilePage = lazy(() => import('@/src/pages/PlayerProfilePage'));
const RRSquadPage = lazy(() => import('@/src/pages/RRSquadPage'));
const ComparePage = lazy(() => import('@/src/pages/ComparePage'));
const MethodPage = lazy(() => import('@/src/pages/MethodPage'));

function AppShell() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // Preload JSON pack on mount so DemoBanner and search are immediately informed
  useEffect(() => {
    getAllDashboardData().catch(() => {
      // Handled gracefully by individual page DataStateWrapper
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (e.key === 'Escape') {
        setSearchOpen(false);
        setGlossaryOpen(false);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlossaryOpen(false);
        setSearchOpen((v) => !v);
        return;
      }

      if (isInput) return;

      if (e.key === '/') {
        e.preventDefault();
        setGlossaryOpen(false);
        setSearchOpen(true);
      } else if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setSearchOpen(false);
        setGlossaryOpen((v) => !v);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] text-[#0B1033] dark:bg-[#0B1033] dark:text-white bg-grain">
      <Navbar
        onOpenSearch={() => {
          setGlossaryOpen(false);
          setSearchOpen(true);
        }}
        onOpenGlossary={() => {
          setSearchOpen(false);
          setGlossaryOpen(true);
        }}
      />
      <DemoBanner />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              <PageSkeleton />
            </div>
          }
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/batters" element={<LeaderboardPage roleType="Batter" />} />
              <Route path="/bowlers" element={<LeaderboardPage roleType="Bowler" />} />
              <Route path="/player/:slug" element={<PlayerProfilePage />} />
              <Route path="/rr-squad" element={<RRSquadPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/method" element={<MethodPage />} />
              <Route path="*" element={<DashboardPage />} />
            </Routes>
          </motion.div>
        </Suspense>
      </main>

      {!isLanding && <Footer />}

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <HashRouter>
          <AppShell />
        </HashRouter>
      </ThemeProvider>
    </MotionConfig>
  );
}
