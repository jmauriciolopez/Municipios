import { useEffect, useRef } from 'react';
import { LayerGroup, useMap } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';
import 'leaflet.heat';

type HeatmapLayerProps = {
  points: Array<{ lat: number; lng: number; intensity?: number }>;
};

export default function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (points.length === 0) return;

    const heatPoints: LatLngTuple[] = points.map((p) => [p.lat, p.lng, p.intensity ?? 1] as LatLngTuple);
    layerRef.current = (L as any).heatLayer(heatPoints, { radius: 25, blur: 18, maxZoom: 17 }).addTo(map);

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points]);

  return <LayerGroup />;
}
