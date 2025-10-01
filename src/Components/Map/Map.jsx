import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, LayersControl, CircleMarker, Marker, Popup } from "react-leaflet";
import Heatmap from "./Heatmap";
import styles from "./Map.module.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const { BaseLayer, Overlay } = LayersControl;

function Map({ bloomEvents = [] , animate = false, ndviData = [], soilMoistureData = [], bloomData = [], desertificationData = [], selectedTime = ''}) {
  const basePoints = useMemo(
    () => bloomEvents.map((e) => ({ lat: e.geoCode[0], lng: e.geoCode[1], value:(!animate)? 5:  e.value ?? 1})),
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
    <>
      <MapContainer center={[30.0444, 31.2357]} zoom={13} minZoom={2} className={styles.earthMap}>
        <LayersControl position="topright">
          <BaseLayer checked name="Tiles">
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

          <Overlay name="NDVI">
            <div>
              {ndviData.filter(d => selectedTime ? d.date.startsWith(selectedTime) : true).map((d, i) => (
                <CircleMarker
                  key={`ndvi-${i}`}
                  center={[d.lat || 30.0, d.lng || 31.2]}
                  radius={10}
                  pathOptions={{
                    color: d.NDVI > 0.5 ? 'green' : d.NDVI > 0.3 ? 'yellow' : 'red',
                    fillColor: d.NDVI > 0.5 ? 'green' : d.NDVI > 0.3 ? 'yellow' : 'red',
                    fillOpacity: 0.7
                  }}
                >
                  <Popup>NDVI: {d.NDVI}</Popup>
                </CircleMarker>
              ))}
            </div>
          </Overlay>

          <Overlay name="Soil Moisture">
            <div>
              {soilMoistureData.filter(d => selectedTime ? d.date.startsWith(selectedTime) : true).map((d, i) => (
                <CircleMarker
                  key={`sm-${i}`}
                  center={[d.lat || 30.0, d.lng || 31.2]}
                  radius={10}
                  pathOptions={{
                    color: 'blue',
                    fillColor: 'blue',
                    fillOpacity: 0.7
                  }}
                >
                  <Popup>Soil Moisture: {d.value}</Popup>
                </CircleMarker>
              ))}
            </div>
          </Overlay>

          <Overlay name="Bloom Predictions">
            <Heatmap points={bloomData.filter(d => selectedTime ? d.date.startsWith(selectedTime) : true).map(d => ({ lat: d.lat || 30.0, lng: d.lng || 31.2, value: d.value || 1 }))} options={{ radius: 50, blur: 40, max: 1 }} />
          </Overlay>

          <Overlay name="Desertification Risk">
            <Heatmap points={desertificationData.filter(d => selectedTime ? d.date.startsWith(selectedTime) : true).map(d => ({ lat: d.lat || 30.0, lng: d.lng || 31.2, value: d.value || 1 }))} options={{ radius: 50, blur: 40, max: 1 }} />
          </Overlay>
        </LayersControl>

        <Heatmap points={animate ? points : basePoints} options={{ radius: 70, blur: 60, max: 1, minZoom: 5, maxZoom: 10}} />
        {bloomEvents.map((Event, i) => (
          <CircleMarker
            key={i}
            center={Event.geoCode}
            radius={40}
            pathOptions={{ opacity: 0, fillOpacity: 0 }}
            maxZoom={10}
            eventHandlers={{
              click: () => {
                setSelectedEvent(Event);
                setIsModalOpen(true);
              },
            }}
          />
        ))}
      </MapContainer>
        {isModalOpen && selectedEvent && (
        <div className={styles['modal-overlay']} onClick={() => setIsModalOpen(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <h2>🌸 Bloom Event</h2>
            <p>Details: {selectedEvent.text}</p>
            <p>Location: {`${Math.round(selectedEvent.geoCode[0]*100)/100}° N ${Math.round(selectedEvent.geoCode[1]*100)/100} ° E`}</p>
            {selectedEvent.value && <p>Intensity: {Math.round(selectedEvent.value* 1000) / 1000 }</p>}
            <button className={styles['close-button']} onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Map;