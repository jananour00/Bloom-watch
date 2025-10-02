import React, { useState, useEffect } from "react";
import Landing from "../../Components/Landing/Landing.jsx";
import InfoCard from "../../Components/InfoCard/InfoCard.jsx";
import DashboardMap from "../../Components/Map/DashboardMap.jsx";
import RangeSlider from "../../Components/RangeSlider/RangeSlider.jsx";
import styles from "./Dashboard.module.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function Dashboard() {
  const [bloomEvents, setBloomEvents] = useState([]);
  const [ndviData, setNdviData] = useState([]);
  const [soilMoistureData, setSoilMoistureData] = useState([]);
  const [bloomData, setBloomData] = useState([]);
  const [desertificationData, setDesertificationData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState("2024-03"); // YYYY-MM
  const [isPlaying, setIsPlaying] = useState(false);

  // Forecasting form state
  const [forecastModel, setForecastModel] = useState("xgboost");
  const [forecastRegion, setForecastRegion] = useState("");
  const [forecastCrop, setForecastCrop] = useState("");
  const [forecastData, setForecastData] = useState([]);

  // Feature importance data
  const [featureImportance, setFeatureImportance] = useState([]);

  // Climate scenario simulation state
  const [rainfallChange, setRainfallChange] = useState(0);
  const [tempChange, setTempChange] = useState(0);
  const [climateSimulation, setClimateSimulation] = useState([]);

  useEffect(() => {
    const fetchBloomEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/bloom_events");
        if (response.ok) {
          const data = await response.json();
          const events = data.map((item) => ({
            geoCode: [
              parseFloat(
                item["spatial"]["horizontal-spatial-domain"]["geometry"][
                  "gpolygons"
                ][0]["boundary"]["points"][0][1]
              ),
              parseFloat(
                item["spatial"]["horizontal-spatial-domain"]["geometry"][
                  "gpolygons"
                ][0]["boundary"]["points"][0][0]
              )
            ],
            intensity: Math.random() * 100, // Placeholder for bloom intensity
            text: item['title'] || 'Bloom Event'
          }));
          setBloomEvents(events);
        } else {
          console.error("Failed to fetch bloom events");
        }
      } catch (error) {
        console.error("Error fetching bloom events:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNdviData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ndvi_data?start=2018-01-01&end=2024-12-31");
        if (response.ok) {
          const data = await response.json();
          const processed = data.map((d) => ({
            ...d,
            lat: 30.0 + Math.random() * 2,
            lng: 31.0 + Math.random() * 2,
            NDVI: d.NDVI || d.ndvi || d.value || 0,
            date: d.date || d.Date || '2024-01-01'
          }));
          setNdviData(processed);
        }
      } catch (error) {
        console.error("Error fetching NDVI data:", error);
      }
    };

    const fetchSoilMoistureData = async () => {
      const dummy = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-${String(Math.floor(i / 10) + 1).padStart(2, "0")}-01`,
        value: Math.random() * 0.5,
        lat: 30.0 + Math.random() * 2,
        lng: 31.0 + Math.random() * 2,
      }));
      setSoilMoistureData(dummy);
    };

    const fetchBloomData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/bloom_prediction");
        if (response.ok) {
          const data = await response.json();
          const processed = data.map((d) => ({
            date: d.date,
            value: d.predicted_ndvi,
            lat: 30.0 + Math.random() * 2,
            lng: 31.0 + Math.random() * 2,
          }));
          setBloomData(processed);
        }
      } catch (error) {
        console.error("Error fetching bloom prediction data:", error);
      }
    };

    const fetchDesertificationData = async () => {
      const dummy = Array.from({ length: 50 }, (_, i) => ({
        date: `2024-${String(Math.floor(i / 5) + 1).padStart(2, "0")}-01`,
        value: Math.random(),
        lat: 30.0 + Math.random() * 2,
        lng: 31.0 + Math.random() * 2,
      }));
      setDesertificationData(dummy);
    };

    const fetchTimeSeriesData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/ndvi_data?start=2020-01-01&end=2024-12-31"
        );
        if (response.ok) {
          const data = await response.json();
          setTimeSeriesData(data);
        }
      } catch (error) {
        console.error("Error fetching time series data:", error);
      }
    };

    fetchBloomEvents();
    fetchNdviData();
    fetchSoilMoistureData();
    fetchBloomData();
    fetchDesertificationData();
    fetchTimeSeriesData();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSelectedTime((prev) => {
        const [year, month] = prev.split("-").map(Number);
        let newMonth = month + 1;
        let newYear = year;
        if (newMonth > 12) {
          newMonth = 1;
          newYear += 1;
        }
        if (newYear > 2024) {
          setIsPlaying(false);
          return "2024-12";
        }
        return `${newYear}-${String(newMonth).padStart(2, "0")}`;
      });
    }, 1000); // 1 second per month

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Prepare data for NDVI trend chart
  const ndviTrendData = timeSeriesData.map((d) => ({
    date: d.date,
    NDVI: d.NDVI,
  }));

  // Forecast form handlers
  const handleForecastSubmit = async (e) => {
    e.preventDefault();
    // Fetch forecast data from backend API
    try {
      const response = await fetch(
        `http://localhost:5000/api/rf_predict?region=${forecastRegion}&crop=${forecastCrop}&model=${forecastModel}`
      );
      if (response.ok) {
        const data = await response.json();
        // Transform data to chart format
        const chartData = data.future_days.map((day, idx) => ({
          date: `Day ${day}`,
          predicted: data.predicted_ndvi[idx],
          observed: null, // Placeholder, could be filled with actual data
        }));
        setForecastData(chartData);
        // Dummy feature importance data
        setFeatureImportance([
          { feature: "Temperature", importance: 0.4 },
          { feature: "Rainfall", importance: 0.3 },
          { feature: "Soil Moisture", importance: 0.2 },
          { feature: "NDVI", importance: 0.1 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  // Climate scenario simulation handler
  const handleClimateSimulate = async (e) => {
    e.preventDefault();
    // Simulate climate impact on bloom probability
    const simulatedData = [
      { scenario: "Base", bloom_probability: 0.5 },
      { scenario: `Rainfall ${rainfallChange}%`, bloom_probability: 0.5 + rainfallChange * 0.01 },
      { scenario: `Temp ${tempChange}°C`, bloom_probability: 0.5 + tempChange * 0.02 },
    ];
    setClimateSimulation(simulatedData);
  };

  // Data download handlers
  const handleDownloadCSV = () => {
    // Convert bloomData to CSV and trigger download
    const csvContent = "data:text/csv;charset=utf-8," +
      ["date,value,lat,lng"]
      .concat(bloomData.map(d => `${d.date},${d.value},${d.lat},${d.lng}`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bloom_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGeoJSON = () => {
    // Placeholder: Download GeoJSON file
    const geojson = {
      type: "FeatureCollection",
      features: bloomEvents.map((event, idx) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: event.geoCode,
        },
        properties: {
          intensity: event.intensity,
          text: event.text,
        },
      })),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "bloom_events.geojson");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Bloom-Watch Dashboard</h1>
          <div className={styles.keyMetrics}>
            <InfoCard title="Avg. Global NDVI Today" data="0.65" tooltip="Average NDVI value globally for today" />
            <InfoCard title="Active Bloom Hotspots" data={bloomEvents.length.toString()} tooltip="Number of active bloom hotspots worldwide" />
            <InfoCard title="Next Predicted Global Peak Bloom" data="2024-04-15" tooltip="Date of next predicted global peak bloom" />
            <InfoCard title="Regions Monitored / Datasets Used" data="3,671 / 12" tooltip="Number of regions monitored and datasets used" />
          </div>
        </div>
        <div className={styles.trendOverview}>
          <h3>Global NDVI Trend (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={ndviTrendData.slice(-12)}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="NDVI" stroke="#4CAF50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className={styles.trendNote}>Spring bloom is earlier by 10 days this year vs last year</p>
        </div>
      </header>

      {/* Core Visualization Zone */}
      <div className={styles.coreVisualizationZone}>
        <div className={styles.mapContainer}>
          {loading ? (
            <p>Loading bloom data...</p>
          ) : (
            <DashboardMap
              bloomEvents={bloomEvents}
              selectedTime={selectedTime}
              ndviData={ndviData}
              soilMoistureData={soilMoistureData}
              bloomData={bloomData}
              desertificationData={desertificationData}
            />
          )}
          <div className={styles.legend}>
            <h4>Bloom Stage Legend</h4>
            <div className={styles.legendItem}>
              <span style={{ backgroundColor: "gray" }}></span> No Bloom
            </div>
            <div className={styles.legendItem}>
              <span style={{ backgroundColor: "green" }}></span> Early Bloom
            </div>
            <div className={styles.legendItem}>
              <span style={{ backgroundColor: "yellow" }}></span> Peak Bloom
            </div>
            <div className={styles.legendItem}>
              <span style={{ backgroundColor: "red" }}></span> Late Bloom
            </div>
          </div>
        </div>
        <div className={styles.timeSliderContainer}>
          <label>
            Select Time:
            <input
              type="month"
              min="2020-01"
              max="2024-12"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </label>
          <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? "Pause" : "Play"}</button>
        </div>
      </div>

      {/* Secondary Map Zone */}
      <div className={styles.secondaryMapZone}>
        <h2>Regional Bloom Overview</h2>
        <div className={styles.secondaryMapContainer}>
          {loading ? (
            <p>Loading regional data...</p>
          ) : (
            <DashboardMap
              bloomEvents={bloomEvents.slice(0, 10)} // Show fewer events for overview
              selectedTime={selectedTime}
              ndviData={ndviData.slice(0, 20)} // Limit data points
              soilMoistureData={soilMoistureData.slice(0, 20)}
              bloomData={bloomData.slice(0, 20)}
              desertificationData={desertificationData.slice(0, 20)}
            />
          )}
        </div>
      </div>

      {/* Data Analysis Zone */}
      <div className={styles.dataAnalysisZone}>
        <div className={styles.trendGraphs}>
          <h3>Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ndviTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="NDVI" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p>Multi-year NDVI Comparison (Coming Soon)</p>
        </div>
        <div className={styles.bloomCyclePanel}>
          <h3>Bloom Cycle</h3>
          <p>Bloom started 2 weeks earlier than last year.</p>
          <p>Peak bloom date: April 15, 2024</p>
          <p>Duration: 6 weeks</p>
        </div>
        <div className={styles.ecologicalInsights}>
          <h3>Ecological Insights</h3>
          <p>Pollination Impact: High</p>
          <p>Allergy Risk: Medium</p>
          <p>Crop Productivity: Good</p>
          <p>Desertification Risk: Low</p>
          <p>Forecasted Temp Next Month: 25°C</p>
        </div>
      </div>

      {/* Predictive Modeling Zone */}
      <div className={styles.predictiveModelingZone}>
        <div className={styles.forecastingWidget}>
          <h3>Forecasting Widget</h3>
          <select value={forecastModel} onChange={(e) => setForecastModel(e.target.value)}>
            <option value="xgboost">XGBoost Model</option>
            <option value="statistical">Statistical Model</option>
          </select>
          <input
            type="text"
            placeholder="Region"
            value={forecastRegion}
            onChange={(e) => setForecastRegion(e.target.value)}
          />
          <input
            type="text"
            placeholder="Crop"
            value={forecastCrop}
            onChange={(e) => setForecastCrop(e.target.value)}
          />
          <button onClick={handleForecastSubmit}>Generate Forecast</button>
          {/* Forecast Graph */}
          <div className={styles.forecastGraph}>
            <h4>Forecast Graph</h4>
            {forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="observed" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>Probability curve for next 1-3 months (Placeholder)</p>
            )}
            <p>Confidence intervals shaded</p>
            <p>Compare observed vs predicted lines</p>
          </div>
        </div>
        <div className={styles.featureImportance}>
          <h3>Feature Importance Plot</h3>
          {featureImportance.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={featureImportance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="importance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>SHAP or XGBoost feature importances (Placeholder)</p>
          )}
          <p>Show which drivers influenced predictions</p>
        </div>
        <div className={styles.climateScenarioExplorer}>
          <h3>Climate Scenario Explorer</h3>
          <label>
            Rainfall Change (%):
            <input
              type="number"
              value={rainfallChange}
              onChange={(e) => setRainfallChange(Number(e.target.value))}
            />
          </label>
          <label>
            Temperature Change (°C):
            <input
              type="number"
              value={tempChange}
              onChange={(e) => setTempChange(Number(e.target.value))}
            />
          </label>
          <button onClick={handleClimateSimulate}>Simulate</button>
          {climateSimulation.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={climateSimulation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bloom_probability" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <>
              <p>What-if graphs: “If rainfall ↑10%, what happens to bloom probability?”</p>
              <p>Shows climate impact on phenology</p>
            </>
          )}
        </div>
      </div>

      {/* Data Download Zone */}
      <div className={styles.dataDownloadZone}>
        <h2>Data Downloads</h2>
        <div className={styles.downloadButtons}>
          <button onClick={handleDownloadCSV}>Download Bloom Data (CSV)</button>
          <button onClick={handleDownloadGeoJSON}>Download Bloom Events (GeoJSON)</button>
        </div>
        <p>Export processed bloom data and events for further analysis or integration with other tools.</p>
      </div>
    </div>
  );
}

export default Dashboard;
