'use client';

import { useState } from 'react';
import { PRICE_TIERS } from '@/lib/priceTiers';

export default function Legend() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: always-visible floating box */}
      <div className="hidden sm:block absolute bottom-[70px] left-2.5 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3.5 py-2.5 text-xs text-gray-500 dark:text-gray-400 shadow-md leading-7">
        <LegendItems />
      </div>

      {/* Mobile: collapsed toggle */}
      <div className="sm:hidden absolute bottom-20 left-2.5 z-[1000]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-md text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center"
          aria-label="Toggle legend"
        >
          ?
        </button>
        {open && (
          <div className="absolute bottom-10 left-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3.5 py-2.5 text-xs text-gray-500 dark:text-gray-400 shadow-md leading-7 whitespace-nowrap">
            <LegendItems />
          </div>
        )}
      </div>
    </>
  );
}

function LegendItems() {
  return (
    <>
      {PRICE_TIERS.map(({ key, label, color }) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          {label}
        </div>
      ))}
    </>
  );
}
