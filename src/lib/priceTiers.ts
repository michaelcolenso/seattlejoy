import type { PriceTierKey } from '@/types';

export interface PriceTier {
  key: PriceTierKey;
  label: string;
  color: string;
  radius: number;
  min: number;
  max: number;
}

export const PRICE_TIERS: PriceTier[] = [
  { key: 'tier1', label: '$1M–$1.5M', color: '#f9c784', radius: 5,  min: 1_000_000, max: 1_500_000 },
  { key: 'tier2', label: '$1.5M–$2M', color: '#f4845f', radius: 6,  min: 1_500_000, max: 2_000_000 },
  { key: 'tier3', label: '$2M–$3M',   color: '#e84545', radius: 7,  min: 2_000_000, max: 3_000_000 },
  { key: 'tier4', label: '$3M–$5M',   color: '#bd1550', radius: 8,  min: 3_000_000, max: 5_000_000 },
  { key: 'tier5', label: '$5M+',      color: '#6d0000', radius: 10, min: 5_000_000, max: Infinity  },
];

export function getPriceTier(price: number): PriceTier {
  return PRICE_TIERS.find(t => price >= t.min && price < t.max) ?? PRICE_TIERS[0];
}
