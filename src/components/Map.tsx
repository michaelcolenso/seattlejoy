'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapInner from './MapInner';
import type { SelectedProperty, PriceTierKey } from '@/types';

export interface MapProps {
  darkMode: boolean;
  activeTiers: Set<PriceTierKey>;
  onSelectProperty: (p: SelectedProperty | null) => void;
  onPricesLoaded: (prices: number[]) => void;
}

const BOUNDS = L.latLngBounds(L.latLng(47.40, -122.55), L.latLng(47.80, -121.90));

const TILE_LIGHT =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a> | ' +
  'Sales data: <a href="https://www.kingcounty.gov/">King County GIS</a>';

export default function Map({
  darkMode,
  activeTiers,
  onSelectProperty,
  onPricesLoaded,
}: MapProps) {
  return (
    <MapContainer
      center={BOUNDS.getCenter()}
      zoom={11}
      maxBounds={BOUNDS}
      maxBoundsViscosity={1.0}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        key={darkMode ? 'dark' : 'light'}
        url={darkMode ? TILE_DARK : TILE_LIGHT}
        attribution={ATTRIBUTION}
        subdomains="abcd"
        maxZoom={19}
      />
      <MapInner
        darkMode={darkMode}
        activeTiers={activeTiers}
        onSelectProperty={onSelectProperty}
        onPricesLoaded={onPricesLoaded}
      />
    </MapContainer>
  );
}
