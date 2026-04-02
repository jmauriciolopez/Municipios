import { useEffect } from 'react';
import { LayerGroup, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';

type HeatmapLayerProps = {
  points: Array<{ lat: number; lng: number; intensity?: number }>;
};

export default function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    // @ts-ignore
    if (map.heatLayer) {
      // @ts-ignore
      map.removeLayer(map.heatLayer);
    }

    const heatPoints: LatLngTuple[] = points.map((p) => [p.lat, p.lng]);

    // leaflet-heat global export
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const heat = require('leaflet.heat');

    // @ts-ignore
    const layer = heat.heatLayer(heatPoints, { radius: 25, blur: 18, maxZoom: 17 }).addTo(map);
    // @ts-ignore
    map.heatLayer = layer;

    return () => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    };
  }, [map, points]);

  return <LayerGroup />;
}
