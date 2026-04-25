'use client';

import { formatCurrency, median } from '@/lib/formatting';

export default function StatsBar({ prices }: { prices: number[] }) {
  return (
    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-2 text-xs text-gray-500 dark:text-gray-400 shadow-md whitespace-nowrap">
        {prices.length === 0 ? (
          <span>Loading sales data…</span>
        ) : (
          <>
            <strong className="text-accent">{prices.length}</strong> homes sold
            over $1M in the last 12 months &nbsp;|&nbsp; Median:{' '}
            <strong className="text-accent">
              {formatCurrency(median(prices))}
            </strong>
          </>
        )}
      </div>
    </div>
  );
}
