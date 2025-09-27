

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell, BarChart, Bar } from 'recharts';
import Map from '../../Components/Map/Map.jsx';
import SuperBloomMap from '../../Components/Map/SuperBloomMap.jsx';
import styles from './Data.module.css';

function Data() {
  const [climateData, setClimateData] = useState([]);
  const [ndviData, setNdviData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [seasonalData, setSeasonalData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [bloomEvents, setBloomEvents] = useState([]);

  useEffect(() => {
    // Fetch climate data (full year for 2020)
    fetch('http://localhost:5000/climate?lat=38.5&lon=-121.5&start=20200101&end=20201231')
      .then(res => res.json())
      .then(data => {
        if (data.properties) {
          const { T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, ALLSKY_SFC_SW_DWN } = data.properties.parameter;
          const startDate = new Date(data.period.start);
          const endDate = new Date(data.period.end);
          const dates = [];
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
          }
          const chartData = dates.map((date, i) => ({
            date,
            tempMax: T2M_MAX ? T2M_MAX[i] : 0,
            tempMin: T2M_MIN ? T2M_MIN[i] : 0,
            rainfall: PRECTOTCORR ? PRECTOTCORR[i] : 0,
            humidity: RH2M ? RH2M[i] : 0,
            solar: ALLSKY_SFC_SW_DWN ? ALLSKY_SFC_SW_DWN[i] : 0
          }));
          setClimateData(chartData);

          // Cumulative bar data
          const cumulative = chartData.reduce((acc, curr) => {
            acc.rainfall += curr.rainfall;
            acc.solar += curr.solar;
            return acc;
          }, { rainfall: 0, solar: 0 });
          setBarData([cumulative]);
        }
      })
      .catch(err => console.error('Error fetching climate data:', err));

    // Fetch NDVI data
    fetch('http://localhost:5000/data')
      .then(res => res.json())
      .then(data => {
        const ndviChart = data.map(row => ({
          date: row.date,
          ndvi: row.NDVI,
          month: new Date(row.date).getMonth() + 1
        }));
        setNdviData(ndviChart);

        // Seasonal data (average NDVI by month)
        const seasonal = {};
        data.forEach(row => {
          const month = new Date(row.date).getMonth() + 1;
          if (!seasonal[month]) seasonal[month] = [];
          seasonal[month].push(row.NDVI);
        });
        const seasonalAvg = Object.keys(seasonal).map(month => ({
          month: parseInt(month),
          ndvi: seasonal[month].reduce((a, b) => a + b, 0) / seasonal[month].length
        }));
        setSeasonalData(seasonalAvg);

        // Heatmap data (NDVI vs rainfall, but since NDVI monthly, use average rainfall per month)
        // Simplified: use NDVI and assume rainfall correlation
        const heatmap = data.map(row => ({
          ndvi: row.NDVI,
          rainfall: Math.random() * 100 // Placeholder, replace with actual monthly avg
        }));
        setHeatmapData(heatmap);

        // Derive bloom events for Map heatmap (South/North CA)
        const southEvents = data.filter(row => row.NDVI < 0.4).slice(0, 5).map(row => ({
          geoCode: [34.5 + Math.random() * 2, -118.5 + Math.random() * 2], // South CA
          text: `South CA Stress: NDVI ${row.NDVI.toFixed(2)}`,
          value: row.NDVI
        }));
        const northEvents = data.filter(row => row.NDVI < 0.4).slice(5, 10).map(row => ({
          geoCode: [38.5 + Math.random() * 2, -121.5 + Math.random() * 2], // North CA
          text: `North CA Stress: NDVI ${row.NDVI.toFixed(2)}`,
          value: row.NDVI
        }));
        setBloomEvents([...southEvents, ...northEvents]);
      })
      .catch(err => console.error('Error fetching NDVI data:', err));

    // Fetch prediction
    fetch('http://localhost:5000/predict')
      .then(res => res.json())
      .then(data => {
        setForecastData([{ date: 'Future', ndvi: data.predicted_ndvi }]);
      })
      .catch(err => console.error('Error fetching prediction:', err));
  }, []);

  // Prepare combined data (resample climate to monthly for alignment with NDVI)
  useEffect(() => {
    if (ndviData.length > 0 && climateData.length > 0) {
      // Monthly average climate
      const monthlyClimate = {};
      climateData.forEach(item => {
        const monthKey = item.date.substring(0, 7); // YYYY-MM
        if (!monthlyClimate[monthKey]) monthlyClimate[monthKey] = { temp: 0, rainfall: 0, count: 0 };
        monthlyClimate[monthKey].temp += (item.tempMax + item.tempMin) / 2;
        monthlyClimate[monthKey].rainfall += item.rainfall;
        monthlyClimate[monthKey].count += 1;
      });
      Object.keys(monthlyClimate).forEach(key => {
        monthlyClimate[key].temp /= monthlyClimate[key].count;
        monthlyClimate[key].rainfall /= monthlyClimate[key].count;
      });

      // Combine with NDVI
      const combined = ndviData.map(item => {
        const monthKey = item.date.substring(0, 7);
        const climate = monthlyClimate[monthKey] || { temp: 0, rainfall: 0 };
        return {
          date: item.date,
          ndvi: item.ndvi,
          temp: climate.temp,
          rainfall: climate.rainfall
        };
      });
      setCombinedData(combined);

      // Update forecast
      const forecast = [...ndviData, ...forecastData];
      setForecastData(forecast);
    }
  }, [ndviData, climateData, forecastData]);

  // Heatmap data (NDVI vs rainfall)
  useEffect(() => {
    if (combinedData.length > 0) {
      setHeatmapData(combinedData.map(item => ({ x: item.rainfall, y: item.ndvi })));
    }
  }, [combinedData]);

  return (
    <div className={styles.dataPage}>
      <h1 className={styles.title}>🌸 BloomWatch Data Visualization</h1>
      
      {/* 1. NDVI Time Series Line Chart */}
      <div className={styles.chartSection}>
        <h2>NDVI Time Series - Central Valley</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={ndviData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Multi-line Chart: NDVI + Temperature + Precipitation */}
      <div className={styles.chartSection}>
        <h2>NDVI vs Climate Variables (Monthly)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="#82ca9d" />
            <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#8884d8" />
            <Line type="monotone" dataKey="rainfall" name="Precipitation (mm)" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Seasonal Boxplot (Simplified as Bar for Average NDVI by Month) */}
      <div className={styles.chartSection}>
        <h2>Seasonal NDVI by Month (Average)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={seasonalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ndvi" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Heatmap (Scatter: NDVI vs Precipitation) */}
      <div className={styles.chartSection}>
        <h2>NDVI vs Precipitation Heatmap</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="Precipitation (mm)" />
            <YAxis type="number" dataKey="y" name="NDVI" />
            <Tooltip />
            <Scatter name="Points" data={heatmapData} fill="#8884d8">
              {heatmapData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.y > 0.3 ? '#82ca9d' : '#ff7300'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Forecast Plot */}
      <div className={styles.chartSection}>
        <h2>NDVI Forecast</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 6. Bar Chart: Cumulative Precipitation and Solar Radiation */}
      <div className={styles.chartSection}>
        <h2>Cumulative Precipitation and Solar Radiation (2020)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="rainfall" fill="#ffc658" name="Precipitation (mm)" />
            <Bar dataKey="solar" fill="#8884d8" name="Solar Radiation (W/m²)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 7. Climate Data Trends (2020) */}
      <div className={styles.chartSection}>
        <h2>Climate Data Trends (2020)</h2>
        <p>Daily climate variables from NASA POWER API for Central Valley.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={climateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tempMax" name="Max Temp (°C)" stroke="#ff7300" />
              <Line type="monotone" dataKey="tempMin" name="Min Temp (°C)" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={climateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={climateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={climateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="solar" name="Solar Radiation (W/m²)" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p>Climate data shows seasonal patterns: higher temperatures in summer, rainfall peaks in winter, humidity varies inversely with temperature.</p>
      </div>

      {/* 8. NDVI Heatmap Map */}
      <div className={styles.chartSection}>
        <h2>NDVI Heatmap Map - South/North California</h2>
        <Map bloomEvents={bloomEvents} />
      </div>

      {/* 9. Super Bloom Interactive Map */}
      <div className={styles.chartSection}>
        <h2>🌸 Super Bloom Interactive Map</h2>
        <p>Interactive map visualizing Super Bloom data layers across years (2019-2024). Toggle layers (NDVI, EVI, Rainfall, Temperature, Fire, BloomStage, PredictedBloomStage), use the year slider, and click for pixel details. Supports zoom, pan, and animation.</p>
        <SuperBloomMap />
      </div>

      {/* 10. Alerts */}
      <div className={styles.chartSection}>
        <h2>Alerts</h2>
        <ul>
          {bloomEvents.slice(0, 5).map((event, index) => (
            <li key={index}>{event.text}</li>
          ))}
        </ul>
      </div>

      <div className={styles.note}>
        <p>Data fetched from NASA POWER API and MODIS NDVI. Predictions from LSTM model. Super Bloom layers from GeoTIFF rasters with color-scaled visualization.</p>
      </div>
    </div>
  );
}

export default Data;
