'use client';

import { PRICE_TIERS } from '@/lib/priceTiers';
import type { PriceTierKey } from '@/types';

interface FilterPanelProps {
  activeTiers: Set<PriceTierKey>;
  onChange: (tiers: Set<PriceTierKey>) => void;
}

export default function FilterPanel({ activeTiers, onChange }: FilterPanelProps) {
  function toggle(key: PriceTierKey) {
    const next = new Set(activeTiers);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  }

  return (
    <>
      {/* Desktop: top-left floating card */}
      <div className="hidden sm:block absolute top-3 left-3 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3.5 py-3 shadow-md">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
          Price Filter
        </p>
        <div className="space-y-1.5">
          {PRICE_TIERS.map(({ key, label, color }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeTiers.has(key)}
                onChange={() => toggle(key)}
                className="sr-only"
              />
              <span
                className={[
                  'w-3 h-3 rounded-full flex-shrink-0 border-2 transition-opacity',
                  activeTiers.has(key) ? 'opacity-100' : 'opacity-30',
                ].join(' ')}
                style={{ backgroundColor: color, borderColor: color }}
              />
              <span
                className={[
                  'text-xs transition-colors',
                  activeTiers.has(key)
                    ? 'text-gray-700 dark:text-gray-200'
                    : 'text-gray-300 dark:text-gray-600',
                ].join(' ')}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Mobile: dot toggles row above stats */}
      <div className="sm:hidden absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
        {PRICE_TIERS.map(({ key, color }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={[
              'w-5 h-5 rounded-full border-2 transition-opacity',
              activeTiers.has(key) ? 'opacity-100' : 'opacity-30',
            ].join(' ')}
            style={{ backgroundColor: color, borderColor: color }}
            aria-label={`Toggle ${key}`}
          />
        ))}
      </div>
    </>
  );
}
