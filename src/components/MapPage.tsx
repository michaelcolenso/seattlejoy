'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from './Sidebar';
import StatsBar from './StatsBar';
import Legend from './Legend';
import FilterPanel from './FilterPanel';
import ThemeToggle from './ThemeToggle';
import type { SelectedProperty, PriceTierKey } from '@/types';
import { ALL_TIER_KEYS } from '@/types';

const MapComponent = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#e5e0d8] dark:bg-gray-800 flex items-center justify-center">
      <span className="text-sm text-gray-500 dark:text-gray-400">Loading map…</span>
    </div>
  ),
});

export default function MapPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTiers, setActiveTiers] = useState<Set<PriceTierKey>>(
    new Set(ALL_TIER_KEYS)
  );
  const [selected, setSelected] = useState<SelectedProperty | null>(null);
  const [prices, setPrices] = useState<number[]>([]);

  // Sync dark class on <html> for Tailwind dark: variants
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSelectProperty = useCallback(
    (p: SelectedProperty | null) => setSelected(p),
    []
  );
  const handlePricesLoaded = useCallback((p: number[]) => setPrices(p), []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#e5e0d8] dark:bg-gray-900">
      <MapComponent
        darkMode={darkMode}
        activeTiers={activeTiers}
        onSelectProperty={handleSelectProperty}
        onPricesLoaded={handlePricesLoaded}
      />
      <Sidebar property={selected} onClose={() => setSelected(null)} />
      <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((v) => !v)} />
      <FilterPanel activeTiers={activeTiers} onChange={setActiveTiers} />
      <StatsBar prices={prices} />
      <Legend />
    </div>
  );
}
