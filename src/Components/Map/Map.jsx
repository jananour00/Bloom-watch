import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, LayersControl, CircleMarker } from "react-leaflet";
import Heatmap from "./Heatmap";
import styles from "./Map.module.css";
import "leaflet/dist/leaflet.css";

const { BaseLayer } = LayersControl;

function Map({ bloomEvents = [] , animate = false}) {
  const basePoints = useMemo(
    () => bloomEvents.map((e) => ({ lat: e.geoCode[0], lng: e.geoCode[1], value: e.value ?? 1 })),
    [bloomEvents]
  );

  // optional simple pulsing animation: vary value between 0.5 and 1.5
  const [points, setPoints] = useState(basePoints);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    setPoints(basePoints);
  }, [basePoints]);

  useEffect(() => {
    if (!animate) return;

    let t = 0;
    const id = setInterval(() => {
      t += 0.12;
      const animated = basePoints.map((p, i) => {
        // each point can have a phase so they don't all pulse in sync
        const phase = (i * 0.6) % Math.PI;
        const val = 1 + 0.6 * Math.sin(t + phase);
        return { ...p, value: Math.max(0.1, val) };
      });
      setPoints(animated);
    }, 80);

    return () => clearInterval(id);
  }, [animate, basePoints]);

  return (
    <MapContainer center={[30.0444, 31.2357]} zoom={13} className={styles.earthMap}>
      <LayersControl position="topright">
        <BaseLayer checked name="Cartoon">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </BaseLayer>

        <BaseLayer name="Satellite">
          <TileLayer
            attribution="Tiles © Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </BaseLayer>
      </LayersControl>

      <Heatmap points={animate ? points : basePoints} options={{ radius: 40, blur: 80, max: 1, minZoom: 5, maxZoom: 10}} />
      {bloomEvents.map((Event, i) => (
        <CircleMarker
          key={i}
          center={Event.geoCode}
          radius={40}
          pathOptions={{ opacity: 0, fillOpacity: 0 }}
          eventHandlers={{
            click: () => {
              setSelectedEvent(Event);
              setIsModalOpen(true);
            },
          }}
        />
      ))}

      {isModalOpen && selectedEvent && (
        <div className={styles['modal-overlay']} onClick={() => setIsModalOpen(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <h2>🌸 Bloom Event</h2>
            <p><strong>Details:</strong> {selectedEvent.text}</p>
            <p><strong>Location:</strong> {selectedEvent.geoCode.join(', ')}</p>
            {selectedEvent.value && <p><strong>Value:</strong> {selectedEvent.value}</p>}
            <button className={styles['close-button']} onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

    </MapContainer>
  );
}

export default Map;
