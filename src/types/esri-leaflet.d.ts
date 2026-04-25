declare module 'esri-leaflet' {
  import type * as L from 'leaflet';
  import type * as GeoJSON from 'geojson';

  interface FeatureLayerOptions {
    url: string;
    where?: string;
    pointToLayer?: (
      feature: GeoJSON.Feature,
      latlng: L.LatLng
    ) => L.Layer;
  }

  interface EsriFeature extends GeoJSON.Feature {
    properties: Record<string, unknown>;
  }

  interface FeatureLayer extends L.FeatureGroup {
    on(event: 'load', fn: () => void): this;
    on(
      event: 'click',
      fn: (e: { layer: L.Layer & { feature: EsriFeature }; latlng: L.LatLng }) => void
    ): this;
    eachFeature(fn: (layer: L.Layer & { feature: EsriFeature }) => void): void;
    remove(): this;
  }

  interface DynamicMapLayerOptions {
    url: string;
    layers?: number[];
    opacity?: number;
    useCors?: boolean;
  }

  interface IdentifyTask {
    on(map: L.Map): this;
    at(latlng: L.LatLng): this;
    run(
      cb: (err: Error | null, fc: GeoJSON.FeatureCollection | null) => void
    ): void;
  }

  interface DynamicMapLayer extends L.Layer {
    identify(): IdentifyTask;
    remove(): this;
  }

  export function featureLayer(options: FeatureLayerOptions): FeatureLayer;
  export function dynamicMapLayer(options: DynamicMapLayerOptions): DynamicMapLayer;
}
