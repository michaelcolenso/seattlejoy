'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as esri from 'esri-leaflet';
import { getPriceTier } from '@/lib/priceTiers';
import type { SaleProperties, SelectedProperty, PriceTierKey } from '@/types';

interface MapInnerProps {
  activeTiers: Set<PriceTierKey>;
  darkMode: boolean;
  onSelectProperty: (p: SelectedProperty | null) => void;
  onPricesLoaded: (prices: number[]) => void;
}

const SALES_URL =
  'https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_PropertyInfo/MapServer/3';
const PARCELS_URL =
  'https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_PropertyInfo/MapServer';

export default function MapInner({
  activeTiers,
  darkMode,
  onSelectProperty,
  onPricesLoaded,
}: MapInnerProps) {
  const map = useMap();
  const highlightRef = useRef<L.GeoJSON | null>(null);
  // Hold refs to layers so we can clean up on activeTiers change
  const salesLayerRef = useRef<ReturnType<typeof esri.featureLayer> | null>(null);
  const parcelsLayerRef = useRef<ReturnType<typeof esri.dynamicMapLayer> | null>(null);

  useEffect(() => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateEpoch = oneYearAgo.getTime();

    const salesWhere = `SalePrice > 1000000 AND Principal_Use = 'RESIDENTIAL' AND SaleDate >= ${dateEpoch}`;

    const salesLayer = esri.featureLayer({
      url: SALES_URL,
      where: salesWhere,
      pointToLayer: (feature, latlng) => {
        const props = feature.properties as unknown as SaleProperties;
        const price = props.SalePrice;
        const tier = getPriceTier(price);

        const visible = activeTiers.has(tier.key);
        return L.circleMarker(latlng, {
          radius:      visible ? tier.radius : 0,
          fillColor:   tier.color,
          color:       '#fff',
          weight:      1,
          opacity:     visible ? 0.9 : 0,
          fillOpacity: visible ? 0.85 : 0,
        });
      },
    });

    const parcelsLayer = esri.dynamicMapLayer({
      url: PARCELS_URL,
      layers: [0],
      opacity: darkMode ? 0.25 : 0.15,
      useCors: false,
    });

    salesLayer.on('load', () => {
      const prices: number[] = [];
      salesLayer.eachFeature((layer) => {
        const props = layer.feature.properties as unknown as SaleProperties;
        if (activeTiers.has(getPriceTier(props.SalePrice).key)) {
          prices.push(props.SalePrice);
        }
      });
      onPricesLoaded(prices);
    });

    salesLayer.on('click', (e) => {
      const props = e.layer.feature.properties as unknown as SaleProperties;
      const address =
        [props.SitusStreet, props.SitusCity].filter(Boolean).join(', ') ||
        'King County Property';

      if (highlightRef.current) {
        map.removeLayer(highlightRef.current);
        highlightRef.current = null;
      }

      parcelsLayer.identify().on(map).at(e.latlng).run((err, fc) => {
        if (!err && fc?.features.length) {
          highlightRef.current = L.geoJSON(fc.features[0], {
            style: { color: '#3be579', weight: 6, opacity: 1, fillOpacity: 0 },
          }).addTo(map);
        }
      });

      onSelectProperty({
        pin: props.PIN,
        address,
        price: props.SalePrice,
        saleDate: props.SaleDate,
        latlng: e.latlng,
      });
    });

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent.target as HTMLElement;
      if (target.tagName === 'path' || target.classList.contains('leaflet-container')) return;
      onSelectProperty(null);
      if (highlightRef.current) {
        map.removeLayer(highlightRef.current);
        highlightRef.current = null;
      }
    };

    parcelsLayer.addTo(map);
    salesLayer.addTo(map);
    map.on('click', onMapClick);

    salesLayerRef.current = salesLayer;
    parcelsLayerRef.current = parcelsLayer;

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.removeLayer(salesLayer as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.removeLayer(parcelsLayer as any);
      map.off('click', onMapClick);
      if (highlightRef.current) {
        map.removeLayer(highlightRef.current);
        highlightRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, activeTiers, darkMode]);

  return null;
}
