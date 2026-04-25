export interface PropertyDetails {
  imageUrl: string | null;
  yearBuilt: string | null;
  sqft: string | null;
  beds: string | null;
  baths: string | null;
  grade: string | null;
  condition: string | null;
}

export interface SaleProperties {
  PIN: string;
  SalePrice: number;
  SaleDate: number;
  SitusStreet: string | null;
  SitusCity: string | null;
  Principal_Use: string;
}

export interface SelectedProperty {
  pin: string;
  address: string;
  price: number;
  saleDate: number;
  latlng: { lat: number; lng: number };
}

export type PriceTierKey = 'tier1' | 'tier2' | 'tier3' | 'tier4' | 'tier5';

export const ALL_TIER_KEYS: PriceTierKey[] = ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'];
