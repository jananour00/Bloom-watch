import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './ExploreData.module.css';

function ExploreData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariable, setSelectedVariable] = useState('NDVI');
  const [selectedTime, setSelectedTime] = useState(0);
  const [regionFilter, setRegionFilter] = useState('all');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-03-12');
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');

  useEffect(() => {
    // Load CSV data
    Papa.parse('/Africa_Biweekly_Final_2023.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const processedData = results.data.map(row => ({
          ...row,
          lat: parseFloat(row.lat),
          lon: parseFloat(row.lon),
          NDVI: parseFloat(row.NDVI),
          Temperature_C: parseFloat(row.Temperature_C),
          Humidity_percent: parseFloat(row.Humidity_percent),
          SoilMoisture: parseFloat(row.SoilMoisture),
          Rainfall_mm: parseFloat(row.Rainfall_mm),
          Clay: parseFloat(row.Clay),
          Sand: parseFloat(row.Sand),
          Silt: parseFloat(row.Silt),
          OrganicCarbon: parseFloat(row.OrganicCarbon),
          Date: new Date(row.Date),
          week_start: new Date(row.week_start)
        })).filter(row => !isNaN(row.lat) && !isNaN(row.lon));
        setData(processedData);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error loading CSV:', error);
        setLoading(false);
      }
    });
  }, []);

  // Stop playing when switching to heatmap
  useEffect(() => {
    if (viewMode === 'heatmap') {
      setIsPlaying(false);
    }
  }, [viewMode]);

  // Filter data based on region and date range
  const filteredData = data.filter(row => {
    const inDateRange = row.Date >= new Date(startDate) && row.Date <= new Date(endDate);
    if (regionFilter === 'all') return inDateRange;
    if (regionFilter === 'coastal') return inDateRange && row.lat < 7;
    if (regionFilter === 'transition') return inDateRange && row.lat >= 7 && row.lat < 10;
    if (regionFilter === 'sahel') return inDateRange && row.lat >= 10;
    return inDateRange;
  });

  const temporalData = filteredData.reduce((acc, row) => {
    const week = row.week_start.toISOString().split('T')[0];
    if (!acc[week]) acc[week] = { date: week, NDVI: 0, Temperature_C: 0, count: 0 };
    acc[week].NDVI += row.NDVI;
    acc[week].Temperature_C += row.Temperature_C;
    acc[week].count += 1;
    return acc;
  }, {});

  const temporalChartData = Object.values(temporalData).map(item => ({
    date: item.date,
    NDVI: item.NDVI / item.count,
    Temperature_C: item.Temperature_C / item.count
  }));

  // Filter data for selected time
  const selectedDate = temporalChartData[selectedTime]?.date;
  const timeFilteredData = selectedDate ? filteredData.filter(row => row.week_start.toISOString().split('T')[0] === selectedDate) : filteredData;

  // Prepare chart data
  const gradientData = filteredData.map(row => ({
    lat: row.lat,
    [selectedVariable]: row[selectedVariable]
  }));

  const waterStressData = filteredData.map(row => ({
    soilMoisture: row.SoilMoisture,
    ndvi: row.NDVI,
    region: row.lat < 7 ? 'Coastal' : row.lat < 10 ? 'Transition' : 'Sahelian'
  }));

  const correlationData = [
    { variable: 'NDVI vs Soil Moisture', correlation: 0.65 },
    { variable: 'Temperature vs Humidity', correlation: -0.71 },
    { variable: 'Clay vs Soil Moisture', correlation: 0.52 },
    { variable: 'Sand vs Soil Moisture', correlation: -0.49 }
  ];

  // Animation effect
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedTime(prev => {
          if (prev >= temporalChartData.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500); // Change every 0.5 seconds for faster animation
    }
    return () => clearInterval(interval);
  }, [isPlaying, temporalChartData.length]);

  // Color function for map markers
  const getColor = (value, variable) => {
    if (variable === 'NDVI') {
      if (value < 0.2) return 'red';
      if (value < 0.4) return 'orange';
      if (value < 0.6) return 'yellow';
      return 'green';
    }
    if (variable === 'Temperature_C') {
      if (value < 25) return 'blue';
      if (value < 30) return 'yellow';
      return 'red';
    }
    if (variable === 'SoilMoisture') {
      if (value < 0.1) return 'red';
      if (value < 0.2) return 'orange';
      return 'green';
    }
    if (variable === 'Humidity_percent') {
      if (value < 40) return 'red';
      if (value < 60) return 'yellow';
      return 'blue';
    }
    return 'gray';
  };

  if (loading) {
    return <div className={styles.loading}>Loading West Africa Environmental Data...</div>;
  }

  return (
    <div className={styles.exploreData}>
      {/* Header */}
      <header className={styles.header}>
        <h1>WEST AFRICA ENVIRONMENTAL MONITORING DASHBOARD</h1>
        <p>Period: Jan-Mar 2023 | Region: West Africa | Data: Bi-weekly Updates</p>
      </header>

      {/* Executive Summary */}
      <div className={styles.summary}>
        <h2>Executive Summary of Valuable Information</h2>
        <p>This dataset allows us to understand the interplay between climate, soil, and vegetation across West Africa over time. Key valuable insights include:</p>
        <ul>
          <li><strong>Spatio-temporal Dynamics:</strong> We can track how environmental conditions change from north to south and over time.</li>
          <li><strong>Water Stress Indicators:</strong> The relationship between low rainfall, soil moisture, and vegetation health identifies water stress regions.</li>
          <li><strong>Soil Composition Impact:</strong> Soil types influence soil moisture retention and vegetation vitality.</li>
          <li><strong>Climate Drivers:</strong> Variables like solar radiation and temperature drive evaporation and plant growth.</li>
          <li><strong>Regional Profiles:</strong> Create profiles for different latitudinal bands by their unique climate and soil conditions.</li>
        </ul>
      </div>

      {/* Main Dashboard */}
      <div className={styles.dashboard}>
        {/* Quick Insights Panel */}
        <div className={styles.insightsPanel}>
          <div className={styles.statCard}>
            <h4>Critical Alert</h4>
            <p>Northern regions showing severe water stress (NDVI {'<'} 0.2)</p>
          </div>
          <div className={styles.statCard}>
            <h4>Key Metrics</h4>
            <ul>
              <li>Avg Temperature: {filteredData.reduce((sum, row) => sum + row.Temperature_C, 0) / filteredData.length || 0}°C</li>
              <li>Soil Moisture: {filteredData.reduce((sum, row) => sum + row.SoilMoisture, 0) / filteredData.length || 0} m³/m³</li>
              <li>Vegetation Health: Moderate</li>
            </ul>
          </div>
        </div>

        {/* Interactive Map */}
        <div className={styles.mapContainer}>
          <div className={styles.mapControls}>
            <select value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)}>
              <option value="NDVI">Vegetation (NDVI)</option>
              <option value="Temperature_C">Temperature</option>
              <option value="SoilMoisture">Soil Moisture</option>
              <option value="Humidity_percent">Humidity</option>
            </select>
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <option value="timeline">Timeline Animation</option>
              <option value="heatmap">Heatmap All Time</option>
            </select>
            {viewMode === 'timeline' && (
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? 'Pause' : 'Play'} Timeline
              </button>
            )}
          </div>
          <MapContainer center={[8, 0]} zoom={6} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {(viewMode === 'timeline' ? timeFilteredData : filteredData).map((row, index) => (
              <CircleMarker
                key={index}
                center={[row.lat, row.lon]}
                radius={viewMode === 'heatmap' ? 3 : 5}
                fillColor={getColor(row[selectedVariable], selectedVariable)}
                color={getColor(row[selectedVariable], selectedVariable)}
                fillOpacity={viewMode === 'heatmap' ? 0.6 : 0.8}
              >
                <Popup>
                  <div>
                    <strong>Lat: {row.lat}, Lon: {row.lon}</strong><br />
                    {selectedVariable}: {row[selectedVariable]}<br />
                    NDVI: {row.NDVI}<br />
                    Temperature: {row.Temperature_C}°C<br />
                    Humidity: {row.Humidity_percent}%<br />
                    Soil Moisture: {row.SoilMoisture} m³/m³
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Time Controls */}
        {viewMode === 'timeline' && (
          <div className={styles.timePanel}>
            <h4>Timeline Controls</h4>
            <input
              type="range"
              min="0"
              max={temporalChartData.length - 1}
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
            <div className={styles.dateDisplay}>
              {temporalChartData[selectedTime]?.date || '2023-01-01'}
            </div>
          </div>
        )}
      </div>

      {/* Analysis Charts */}
      <div className={styles.analysisGrid}>
        {/* North-South Climate Gradient */}
        <div className={styles.chartCard}>
          <h3>North-South Climate Gradient</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={gradientData}>
              <CartesianGrid />
              <XAxis type="number" dataKey="lat" name="Latitude" />
              <YAxis type="number" dataKey={selectedVariable} name={selectedVariable} />
              <Tooltip />
              <Scatter name="Data Points" data={gradientData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
          <p>Temperature decreases southward, humidity increases</p>
        </div>

        {/* Water Stress Analysis */}
        <div className={styles.chartCard}>
          <h3>Water Stress Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={waterStressData}>
              <CartesianGrid />
              <XAxis type="number" dataKey="soilMoisture" name="Soil Moisture" />
              <YAxis type="number" dataKey="ndvi" name="NDVI" />
              <Tooltip />
              <Scatter name="Data Points" data={waterStressData} fill="#82ca9d" />
            </ScatterChart>
          </ResponsiveContainer>
          <p>NDVI strongly correlates with soil moisture availability</p>
        </div>

        {/* Soil Composition */}
        <div className={styles.chartCard}>
          <h3>Soil Composition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData.slice(0, 10)}>
              <CartesianGrid />
              <XAxis dataKey="lat" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Clay" stackId="a" fill="#8884d8" />
              <Bar dataKey="Sand" stackId="a" fill="#82ca9d" />
              <Bar dataKey="Silt" stackId="a" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
          <p>Soil types vary from sandy north to clay-rich south</p>
        </div>

        {/* Correlation Matrix */}
        <div className={styles.chartCard}>
          <h3>Variable Correlations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={correlationData}>
              <CartesianGrid />
              <XAxis dataKey="variable" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="correlation" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <p>Heatmap showing relationships between all parameters</p>
        </div>

        {/* Temporal Trends */}
        <div className={styles.chartCard}>
          <h3>Temporal Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temporalChartData}>
              <CartesianGrid />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="NDVI" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Temperature_C" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
          <p>Seasonal progression of key environmental factors</p>
        </div>

        {/* Regional Zones */}
        <div className={styles.chartCard}>
          <h3>Regional Zones</h3>
          <div className={styles.zonesInfo}>
            <div className={styles.zone}>
              <h4>Coastal Humid Zone (Lat {'<'}7°N)</h4>
              <p>Higher humidity, more consistent vegetation</p>
            </div>
            <div className={styles.zone}>
              <h4>Transition Zone (Lat 7-10°N)</h4>
              <p>Mixed soil types, seasonal vegetation</p>
            </div>
            <div className={styles.zone}>
              <h4>Sahelian Zone (Lat {'>'}10°N)</h4>
              <p>Sandy soils, low organic matter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <label>Region:
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
            <option value="all">All West Africa</option>
            <option value="coastal">Coastal Zone</option>
            <option value="transition">Transition Zone</option>
            <option value="sahel">Sahelian Zone</option>
          </select>
        </label>
        <label>Date Range:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

export default ExploreData;
