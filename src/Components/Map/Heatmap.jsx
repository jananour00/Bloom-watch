import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat"; // this extends L with heatLayer

export default function Heatmap({ points = [], options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // sanity check
    if (typeof L.heatLayer !== "function") {
      console.error("leaflet.heat not loaded - L.heatLayer is", L.heatLayer);
      return;
    }

    // convert to [lat, lng, intensity]
    const heatPoints = points.map((p) => [p.lat, p.lng, p.value ?? 1]);

    const layer = L.heatLayer(heatPoints, {
      radius: 0,
      blur: 0,
      minZoom: 0,
      maxZoom: 0,
      gradient: {
        0.4: '#ff0000ff', // Yellow
        0.6: '#ff8800ff', // GreenYellow
        0.8: '#008000', // Green
        1.0: '#006400'  // DarkGreen
      },
      ...options
    }).addTo(map);

    return () => {
      if (map && layer) map.removeLayer(layer);
    };
  }, [map, points, options]);

  return null;
}
