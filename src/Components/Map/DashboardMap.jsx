import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, LayersControl, CircleMarker, Marker, Popup, WMSTileLayer } from "react-leaflet";
import Heatmap from "./Heatmap";
import styles from "./Map.module.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const { BaseLayer, Overlay } = LayersControl;

function DashboardMap({ bloomEvents = [], ndviData = [], soilMoistureData = [], bloomData = [], desertificationData = [], selectedTime = '' }) {
  const [satelliteImagery, setSatelliteImagery] = useState([]);
  const [ndviOverlay, setNdviOverlay] = useState([]);
  const [eviOverlay, setEviOverlay] = useState([]);
  const [bloomHotspots, setBloomHotspots] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [timelineData, setTimelineData] = useState([]);

  // Fetch NASA GIBS imagery for base layer
  useEffect(() => {
    const fetchGibsImagery = async () => {
      // Placeholder for NASA GIBS tiles
      // In real implementation, use NASA GIBS API
      setSatelliteImagery([]);
    };
    fetchGibsImagery();
  }, [selectedTime]);

  // Fetch NDVI/EVI data
  useEffect(() => {
    const fetchVegetationIndices = async () => {
      try {
        const ndviResponse = await fetch(`http://localhost:5000/api/ndvi_data?start=${selectedTime}-01&end=${selectedTime}-31`);
        const ndvi = await ndviResponse.json();
        setNdviOverlay(ndvi);

        const eviResponse = await fetch(`http://localhost:5000/api/evi_data?start=${selectedTime}-01&end=${selectedTime}-31`);
        const evi = await eviResponse.json();
        setEviOverlay(evi);
      } catch (error) {
        console.error("Error fetching vegetation indices:", error);
      }
    };
    if (selectedTime) fetchVegetationIndices();
  }, [selectedTime]);

  // Detect bloom hotspots
  useEffect(() => {
    const hotspots = ndviData.filter(d => d.NDVI > 0.6 && (selectedTime ? d.date.startsWith(selectedTime) : true));
    setBloomHotspots(hotspots);
  }, [ndviData, selectedTime]);

  // Handle map click for location timeline
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });

    try {
      const response = await fetch(`http://localhost:5000/api/ndvi_data?lat=${lat}&lon=${lng}&start=2018-01-01&end=2024-12-31`);
      const data = await response.json();
      setTimelineData(data);
    } catch (error) {
      console.error("Error fetching timeline data:", error);
    }
  };

  return (
    <>
      <MapContainer
        center={[30.0444, 31.2357]}
        zoom={5}
        minZoom={2}
        className={styles.earthMap}
        onClick={handleMapClick}
      >
        <LayersControl position="topright">
          {/* Base Layers */}
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <BaseLayer name="Satellite Imagery">
            <TileLayer
              attribution="Tiles © Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>

          <BaseLayer name="NASA GIBS VIIRS">
            <WMSTileLayer
              url="https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2024-03-01/250m/{z}/{y}/{x}.png"
              layers="VIIRS_SNPP_CorrectedReflectance_TrueColor"
              format="image/png"
              transparent={true}
              attribution="NASA GIBS"
            />
          </BaseLayer>

          {/* Vegetation Indices Overlays */}
          <Overlay name="NDVI">
            <div>
              {ndviOverlay.map((d, i) => (
                <CircleMarker
                  key={`ndvi-${i}`}
                  center={[d.lat || 30.0, d.lng || 31.2]}
                  radius={8}
                  pathOptions={{
                    color: d.NDVI > 0.5 ? "darkgreen" : d.NDVI > 0.3 ? "yellow" : "red",
                    fillColor: d.NDVI > 0.5 ? "darkgreen" : d.NDVI > 0.3 ? "yellow" : "red",
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div>
                      <strong>NDVI: {d.NDVI?.toFixed(3)}</strong><br/>
                      Date: {d.date}<br/>
                      Location: {d.lat?.toFixed(2)}, {d.lng?.toFixed(2)}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </div>
          </Overlay>

          <Overlay name="EVI">
            <div>
              {eviOverlay.map((d, i) => (
                <CircleMarker
                  key={`evi-${i}`}
                  center={[d.lat || 30.0, d.lng || 31.2]}
                  radius={8}
                  pathOptions={{
                    color: d.EVI > 0.4 ? "green" : d.EVI > 0.2 ? "orange" : "brown",
                    fillColor: d.EVI > 0.4 ? "green" : d.EVI > 0.2 ? "orange" : "brown",
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div>
                      <strong>EVI: {d.EVI?.toFixed(3)}</strong><br/>
                      Date: {d.date}<br/>
                      Location: {d.lat?.toFixed(2)}, {d.lng?.toFixed(2)}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </div>
          </Overlay>

          {/* Bloom Detection Overlay */}
          <Overlay checked name="Current Bloom Detection">
            <Heatmap
              points={bloomHotspots.map(d => ({
                lat: d.lat,
                lng: d.lng,
                value: d.NDVI
              }))}
              options={{ radius: 30, blur: 25, max: 1, gradient: {0.2: 'yellow', 0.5: 'orange', 1.0: 'red'} }}
            />
          </Overlay>

          {/* Bloom Trends Animation */}
          <Overlay name="Bloom Trends (Animated)">
            <Heatmap
              points={bloomData.map(d => ({
                lat: d.lat,
                lng: d.lng,
                value: d.value
              }))}
              options={{ radius: 40, blur: 30, max: 1 }}
            />
          </Overlay>

          {/* Citizen Science Inputs */}
          <Overlay name="Citizen Science Reports">
            <div>
              {bloomEvents.map((event, i) => (
                <Marker
                  key={`citizen-${i}`}
                  position={event.geoCode}
                  icon={L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                >
                  <Popup>
                    <div>
                      <strong>🌸 Citizen Bloom Report</strong><br/>
                      {event.text}<br/>
                      Intensity: {event.intensity?.toFixed(1)}<br/>
                      Reported: {event.date || 'Recent'}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </div>
          </Overlay>

          {/* Soil Moisture */}
          <Overlay name="Soil Moisture">
            <div>
              {soilMoistureData.map((d, i) => (
                <CircleMarker
                  key={`sm-${i}`}
                  center={[d.lat || 30.0, d.lng || 31.2]}
                  radius={6}
                  pathOptions={{
                    color: "blue",
                    fillColor: "blue",
                    fillOpacity: 0.6,
                    weight: 1,
                  }}
                >
                  <Popup>Soil Moisture: {d.value?.toFixed(3)}</Popup>
                </CircleMarker>
              ))}
            </div>
          </Overlay>

          {/* Desertification Risk */}
          <Overlay name="Desertification Risk">
            <Heatmap
              points={desertificationData.map(d => ({
                lat: d.lat,
                lng: d.lng,
                value: d.value
              }))}
              options={{ radius: 35, blur: 30, max: 1, gradient: {0.2: 'yellow', 0.6: 'orange', 1.0: 'red'} }}
            />
          </Overlay>
        </LayersControl>
      </MapContainer>

      {/* Location Timeline Modal */}
      {selectedLocation && timelineData.length > 0 && (
        <div className={styles["modal-overlay"]} onClick={() => setSelectedLocation(null)}>
          <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
            <h3>Bloom Timeline for Selected Location</h3>
            <p>Lat: {selectedLocation.lat.toFixed(2)}, Lng: {selectedLocation.lng.toFixed(2)}</p>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {timelineData.slice(-12).map((d, i) => (
                <div key={i} style={{ margin: '5px 0', padding: '5px', border: '1px solid #ccc' }}>
                  <strong>{d.date}:</strong> NDVI {d.NDVI?.toFixed(3)}
                </div>
              ))}
            </div>
            <button className={styles["close-button"]} onClick={() => setSelectedLocation(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardMap;
