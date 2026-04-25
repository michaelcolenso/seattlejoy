'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatRelativeDate } from '@/lib/formatting';
import type { PropertyDetails, SelectedProperty } from '@/types';

interface SidebarProps {
  property: SelectedProperty | null;
  onClose: () => void;
}

export default function Sidebar({ property, onClose }: SidebarProps) {
  const [detail, setDetail] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!property) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setDetail(null);
    fetch(`/api/property/${property.pin}`)
      .then((r) => r.json())
      .then((d: PropertyDetails) => {
        setDetail(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [property?.pin]);

  const isOpen = property !== null;

  const specs: [string, string | null | undefined][] = detail
    ? [
        ['Sq Ft', detail.sqft],
        ['Beds', detail.beds],
        ['Baths', detail.baths],
        ['Year Built', detail.yearBuilt],
        ['Grade', detail.grade],
        ['Condition', detail.condition],
      ]
    : [];

  return (
    <>
      {/* Desktop: right panel */}
      <aside
        className={[
          'hidden sm:flex',
          'absolute top-0 right-0 w-80 h-full z-[1000]',
          'flex-col bg-white dark:bg-gray-900',
          'shadow-[-2px_0_12px_rgba(0,0,0,0.15)]',
          'transition-transform duration-250',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <SidebarContent
          property={property}
          detail={detail}
          loading={loading}
          specs={specs}
          onClose={onClose}
        />
      </aside>

      {/* Mobile: bottom sheet */}
      <div
        className={[
          'sm:hidden',
          'absolute bottom-0 left-0 right-0 z-[1000]',
          'bg-white dark:bg-gray-900 rounded-t-2xl',
          'shadow-[0_-4px_20px_rgba(0,0,0,0.15)]',
          'transition-transform duration-250',
          'max-h-[75vh] flex flex-col',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
        <SidebarContent
          property={property}
          detail={detail}
          loading={loading}
          specs={specs}
          onClose={onClose}
        />
      </div>
    </>
  );
}

function SidebarContent({
  property,
  detail,
  loading,
  specs,
  onClose,
}: {
  property: SelectedProperty | null;
  detail: PropertyDetails | null;
  loading: boolean;
  specs: [string, string | null | undefined][];
  onClose: () => void;
}) {
  return (
    <>
      <button
        onClick={onClose}
        className="absolute top-2.5 right-3 text-2xl text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 z-10 leading-none"
        aria-label="Close"
      >
        &times;
      </button>

      {/* Featured image */}
      <div
        className="w-full h-48 flex-shrink-0 bg-map-dark bg-cover bg-center"
        style={
          detail?.imageUrl
            ? { backgroundImage: `url("${detail.imageUrl}")` }
            : undefined
        }
      />

      {/* Summary */}
      {property && (
        <div className="px-4 pt-4 pb-3.5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            {property.address}
          </p>
          <p className="text-3xl font-bold text-accent tracking-tight">
            {formatCurrency(property.price)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sold {formatRelativeDate(property.saleDate)}
          </p>
        </div>
      )}

      {/* Specs */}
      <div className="px-4 py-3.5 flex-1 overflow-y-auto">
        {loading && (
          <p className="text-xs text-gray-300 dark:text-gray-600 py-2">
            Loading details…
          </p>
        )}
        {specs
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800 text-sm last:border-0"
            >
              <span className="text-gray-400 dark:text-gray-500">{label}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {value}
              </span>
            </div>
          ))}
      </div>
    </>
  );
}
