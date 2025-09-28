 import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { Bar, Scatter, Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  RadarController,
  Tooltip,
  Legend
} from "chart.js";
import chroma from "chroma-js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, RadarController, Tooltip, Legend);

// Gradients for different features
const gradients = {
  PredictedRisk: {0.2: 'blue', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red'},
  Temperature: {0.2: 'blue', 0.4: 'cyan', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red'},
  Rainfall: {0.2: 'red', 0.4: 'orange', 0.6: 'yellow', 0.8: 'lime', 1.0: 'blue'},
  NDVI: {0.2: 'red', 0.4: 'orange', 0.6: 'yellow', 0.8: 'lime', 1.0: 'green'},
  EVI: {0.2: 'red', 0.4: 'orange', 0.6: 'yellow', 0.8: 'lime', 1.0: 'green'},
  SoilMoisture: {0.2: 'red', 0.4: 'orange', 0.6: 'yellow', 0.8: 'lime', 1.0: 'blue'},
  Evapotranspiration: {0.2: 'blue', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red'},
  FireIndex: {0.2: 'blue', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red'},
  elevation: {0.2: 'blue', 0.4: 'cyan', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red'}
};

// HeatLayer component
function HeatLayer({ data, feature }) {
  const map = useMap();

  useEffect(() => {
    const heatData = data.map(d => [d.lat, d.lng, d[feature]]);
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: gradients[feature]
    }).addTo(map);

    return () => {
      if (heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [data, feature, map]);

  return null;
}

export default function DesertRisk() {
  // State
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [riskThreshold, setRiskThreshold] = useState(0.5);
  const [selectedLayer, setSelectedLayer] = useState("PredictedRisk");
  const [viewMode, setViewMode] = useState("points"); // points or heatmap
  const [visibleLayers, setVisibleLayers] = useState(["PredictedRisk"]);
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(50);
  const [rainMin, setRainMin] = useState(0);
  const [rainMax, setRainMax] = useState(30);
  const [ndviMin, setNdviMin] = useState(0);
  const [ndviMax, setNdviMax] = useState(1);

  // Load all data from GeoJSON
  useEffect(() => {
    fetch('/data/DesertRisk.geojson')
      .then(res => res.json())
      .then(geojson => {
        const features = geojson.features.map(f => ({
          ...f.properties,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0]
        }));
        setData(features);
        setFilteredData(features);
      })
      .catch(err => console.error('Error loading data:', err));
  }, []);

  // Filter data based on all thresholds
  useEffect(() => {
    setFilteredData(data.filter(d =>
      d.PredictedRisk >= riskThreshold &&
      d.Temperature >= tempMin && d.Temperature <= tempMax &&
      d.Rainfall >= rainMin && d.Rainfall <= rainMax &&
      d.NDVI >= ndviMin && d.NDVI <= ndviMax
    ));
  }, [data, riskThreshold, tempMin, tempMax, rainMin, rainMax, ndviMin, ndviMax]);

  // Color scale for risk
  const getColor = (value, layer) => {
    if (layer === "PredictedRisk") {
      return value > 0.7 ? "#e74c3c" : value > 0.4 ? "#e67e22" : "#2ecc71";
    } else if (layer === "Temperature") {
      return value > 30 ? "#e74c3c" : value > 20 ? "#e67e22" : "#3498db";
    } else if (layer === "Rainfall") {
      return value < 10 ? "#e74c3c" : value < 20 ? "#e67e22" : "#2ecc71";
    }
    return "gray";
  };

  // Prepare histogram data
  const riskBins = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const counts = riskBins.slice(0, -1).map(
    (bin, i) =>
      filteredData.filter(
        (d) => d.PredictedRisk >= bin && d.PredictedRisk < riskBins[i + 1]
      ).length
  );

  const barData = {
    labels: ["0–0.2", "0.2–0.4", "0.4–0.6", "0.6–0.8", "0.8–1.0"],
    datasets: [
      {
        label: "Count of Areas",
        data: counts,
        backgroundColor: ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#8e44ad"]
      }
    ]
  };

  // Scatter plot: Rainfall vs Risk
  const scatterData = {
    datasets: [
      {
        label: "Rainfall vs Risk",
        data: filteredData.map(d => ({ x: d.Rainfall, y: d.PredictedRisk })),
        backgroundColor: "rgba(75, 192, 192, 0.6)"
      }
    ]
  };

  // Line chart: Temperature vs Risk
  const sortedData = [...filteredData].sort((a, b) => a.Temperature - b.Temperature);
  const lineData = {
    labels: sortedData.map(d => `${d.Temperature}°C`),
    datasets: [
      {
        label: "Predicted Risk",
        data: sortedData.map(d => d.PredictedRisk),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)"
      }
    ]
  };

  // NDVI Distribution
  const ndviBins = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const ndviCounts = ndviBins.slice(0, -1).map(
    (bin, i) =>
      filteredData.filter(
        (d) => d.NDVI >= bin && d.NDVI < ndviBins[i + 1]
      ).length
  );
  const ndviData = {
    labels: ndviBins.slice(0, -1).map((b, i) => `${b}-${ndviBins[i+1]}`),
    datasets: [
      {
        label: "NDVI Count",
        data: ndviCounts,
        backgroundColor: "#3498db"
      }
    ]
  };

  // Temperature Distribution
  const tempBins = [0, 10, 20, 30, 40, 50];
  const tempCounts = tempBins.slice(0, -1).map(
    (bin, i) =>
      filteredData.filter(
        (d) => d.Temperature >= bin && d.Temperature < tempBins[i + 1]
      ).length
  );
  const tempData = {
    labels: tempBins.slice(0, -1).map((b, i) => `${b}-${tempBins[i+1]}°C`),
    datasets: [
      {
        label: "Temperature Count",
        data: tempCounts,
        backgroundColor: "#e74c3c"
      }
    ]
  };

  // Rainfall Distribution
  const rainBins = [0, 5, 10, 15, 20, 25, 30];
  const rainCounts = rainBins.slice(0, -1).map(
    (bin, i) =>
      filteredData.filter(
        (d) => d.Rainfall >= bin && d.Rainfall < rainBins[i + 1]
      ).length
  );
  const rainData = {
    labels: rainBins.slice(0, -1).map((b, i) => `${b}-${rainBins[i+1]}mm`),
    datasets: [
      {
        label: "Rainfall Count",
        data: rainCounts,
        backgroundColor: "#2ecc71"
      }
    ]
  };

  // Insights
  const avgRisk = (filteredData.reduce((a, b) => a + b.PredictedRisk, 0) / filteredData.length).toFixed(2);
  const highRiskCount = filteredData.filter(d => d.PredictedRisk >= 0.7).length;
  const highRiskPercent = ((highRiskCount / filteredData.length) * 100).toFixed(1);
  const maxRiskLocation = filteredData.reduce((max, d) => d.PredictedRisk > max.PredictedRisk ? d : max, filteredData[0]);

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 30%, #16213e 70%, #0f3460 100%)', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div style={{ padding: '5rem 2rem', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ fontFamily: 'Righteous', fontSize: '4rem', fontWeight: 400, textShadow: '2px 2px 4px rgba(0,0,0,0.8)', marginBottom: '2rem' }}>DesertRisk Dashboard — MENA</h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.85 }}>Interactive map and analytics for desertification risk across the MENA region.</p>
        <p style={{ fontSize: '1rem', marginTop: '1rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Filter Controls */}
      <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.1)', margin: '0 2rem', borderRadius: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Risk Threshold: {riskThreshold}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
              style={{ width: '200px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Temperature Min: {tempMin}°C</label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={tempMin}
              onChange={(e) => setTempMin(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Temperature Max: {tempMax}°C</label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={tempMax}
              onChange={(e) => setTempMax(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rainfall Min: {rainMin}mm</label>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={rainMin}
              onChange={(e) => setRainMin(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rainfall Max: {rainMax}mm</label>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={rainMax}
              onChange={(e) => setRainMax(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>NDVI Min: {ndviMin}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ndviMin}
              onChange={(e) => setNdviMin(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>NDVI Max: {ndviMax}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ndviMax}
              onChange={(e) => setNdviMax(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Layer</label>
            <select value={selectedLayer} onChange={(e) => setSelectedLayer(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
              <option value="PredictedRisk">Predicted Risk</option>
              <option value="Temperature">Temperature</option>
              <option value="Rainfall">Rainfall</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>View Mode</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode("points")}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: viewMode === "points" ? '#A41C6C' : 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
              >
                Points
              </button>
              <button
                onClick={() => setViewMode("heatmap")}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: viewMode === "heatmap" ? '#A41C6C' : 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
              >
                Heatmap
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Visible Layers</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['PredictedRisk', 'Temperature', 'Rainfall', 'NDVI'].map(layer => (
                <label key={layer} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={visibleLayers.includes(layer)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setVisibleLayers([...visibleLayers, layer]);
                      } else {
                        setVisibleLayers(visibleLayers.filter(l => l !== layer));
                      }
                    }}
                  />
                  {layer}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ padding: '2rem' }}>
        <MapContainer center={[25, 30]} zoom={4} style={{ height: '500px', width: '100%', borderRadius: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {viewMode === "heatmap" && visibleLayers.map(layer => <HeatLayer key={layer} data={filteredData} feature={layer} />)}
          {viewMode === "points" && visibleLayers.includes(selectedLayer) && filteredData.map((d, idx) => (
            <CircleMarker
              key={idx}
              center={[d.lat, d.lng]}
              radius={8}
              fillOpacity={0.7}
              color={getColor(d[selectedLayer], selectedLayer)}
            >
              <Popup>
                <strong>Risk:</strong> {d.PredictedRisk} <br />
                <strong>Temp:</strong> {d.Temperature} °C <br />
                <strong>Rain:</strong> {d.Rainfall} mm <br />
                <strong>NDVI:</strong> {d.NDVI}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Analytics */}
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Risk Distribution</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Shows the distribution of desertification risk levels across the dataset. Higher bins indicate more areas at risk.</p>
          <Bar data={barData} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Rainfall vs Risk</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Scatter plot showing inverse correlation: lower rainfall often correlates with higher desertification risk.</p>
          <Scatter data={scatterData} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Temperature vs Risk</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Line chart illustrating how increasing temperatures may elevate desertification risk.</p>
          <Line data={lineData} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>NDVI Distribution</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Normalized Difference Vegetation Index: lower values indicate sparse vegetation, a key desertification indicator.</p>
          <Bar data={ndviData} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Temperature Distribution</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Histogram of temperature ranges; hotter areas are more prone to desertification.</p>
          <Bar data={tempData} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Rainfall Distribution</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Rainfall amounts; arid regions with low precipitation face higher desertification risks.</p>
          <Bar data={rainData} />
        </div>
      </div>

      {/* Data Analysis Plots */}
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Feature Correlation Matrix</h3>
          <img src="/data/feature_correlation_matrix.png" alt="Feature Correlation Matrix" style={{ width: '100%', height: 'auto' }} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Feature Distributions</h3>
          <img src="/data/feature_distributions.png" alt="Feature Distributions" style={{ width: '100%', height: 'auto' }} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Key Scatter Plots</h3>
          <img src="/data/key_scatter_plots.png" alt="Key Scatter Plots" style={{ width: '100%', height: 'auto' }} />
        </div>
      </div>

      {/* Insights */}
      <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.1)', margin: '2rem', borderRadius: '1rem', boxShadow: '0 8px 25px rgba(164, 28, 108, 0.3)' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Key Insights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <p><strong>Average Risk:</strong> {avgRisk} (scale 0-1, where 1 is highest risk)</p>
            <p><strong>High Risk Areas (≥0.7):</strong> {highRiskPercent}% ({highRiskCount} locations)</p>
            <p><strong>Correlation Insights:</strong> Temperature and rainfall are key predictors; NDVI indicates vegetation health.</p>
          </div>
          <div>
            <p><strong>Highest Risk Location:</strong> ({maxRiskLocation?.lat.toFixed(1)}, {maxRiskLocation?.lng.toFixed(1)})</p>
            <p><strong>Summary:</strong> {highRiskPercent}% of areas show high desertification risk. Hot, dry regions with low NDVI have the highest vulnerability. Climate change exacerbates this through rising temperatures and altered precipitation patterns.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.5)' }}>
        <p>Data source: DesertRisk dataset from environmental monitoring. Project by BlackBoxAI.</p>
        <a href="/data/DesertRisk_WithCoords.csv" download style={{ color: '#A41C6C', textDecoration: 'underline' }}>Download Full CSV</a>
      </div>
    </div>
  );
}
