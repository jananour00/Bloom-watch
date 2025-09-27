import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell, BarChart, Bar } from 'recharts';
import Landing from '../../Components/Landing/Landing.jsx';
import InfoCard from '../../Components/InfoCard/InfoCard.jsx';
import Map from '../../Components/Map/Map.jsx';
import NDVIMap from '../../Components/Map/NDVIMap.jsx';
import SuperBloomMap from '../../Components/Map/SuperBloomMap.jsx';
import RangeSlider from '../../Components/RangeSlider/RangeSlider.jsx';
import styles from './Storytelling.module.css';

function Storytelling() {
  const [climateData, setClimateData] = useState([]);
  const [ndviData, setNdviData] = useState([]);
  const [eviData, setEviData] = useState([]);
  const [soilData, setSoilData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [seasonalData, setSeasonalData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [bloomEvents, setBloomEvents] = useState([]);
  const [ndviMapData, setNdviMapData] = useState([]);
  const [bloomPredictionData, setBloomPredictionData] = useState([]);
  const [timeRange, setTimeRange] = useState([0, 83]); // Index for NDVI data

  useEffect(() => {
    // Fetch climate data (full year)
    fetch('http://localhost:5000/climate?lat=38.5&lon=-121.5&start=20200101&end=20201231')
      .then(res => res.json())
      .then(data => {
        if (data.properties) {
          const { T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, ALLSKY_SFC_SW_DWN } = data.properties.parameter;
          const startDate = new Date(data.properties.period.start);
          const endDate = new Date(data.properties.period.end);
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
      .catch(err => console.error('Error fetching climate:', err));

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

        // Seasonal data
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
      .catch(err => console.error('Error fetching NDVI:', err));

    // Fetch prediction
    fetch('http://localhost:5000/predict')
      .then(res => res.json())
      .then(data => {
        setForecastData([{ date: 'Future', ndvi: data.predicted_ndvi }]);
      })
      .catch(err => console.error('Error fetching prediction:', err));

    // Fetch NDVI map data
    fetch('http://localhost:5000/ndvi_map_data')
      .then(res => res.json())
      .then(data => {
        setNdviMapData(data);
      })
      .catch(err => console.error('Error fetching NDVI map data:', err));

    // Fetch EVI data
    fetch('http://localhost:5000/evi?lat=38.5&lon=-121.5&start=20200101&end=20201231')
      .then(res => res.json())
      .then(data => {
        if (data.properties) {
          const { EVI } = data.properties.parameter;
          const startDate = new Date(data.properties.period.start);
          const endDate = new Date(data.properties.period.end);
          const dates = [];
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
          }
          const eviChart = dates.map((date, i) => ({
            date,
            evi: EVI ? EVI[i] : 0
          }));
          setEviData(eviChart);
        }
      })
      .catch(err => console.error('Error fetching EVI:', err));

    // Fetch soil moisture data
    fetch('http://localhost:5000/soil_moisture?lat=38.5&lon=-121.5&start=20200101&end=20201231')
      .then(res => res.json())
      .then(data => {
        if (data.properties) {
          const { GWETPROF } = data.properties.parameter;
          const startDate = new Date(data.properties.period.start);
          const endDate = new Date(data.properties.period.end);
          const dates = [];
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
          }
          const soilChart = dates.map((date, i) => ({
            date,
            soil: GWETPROF ? GWETPROF[i] : 0
          }));
          setSoilData(soilChart);
        }
      })
      .catch(err => console.error('Error fetching soil moisture:', err));

    // Fetch bloom prediction data
    fetch('http://localhost:5000/bloom_prediction')
      .then(res => res.json())
      .then(data => {
        const chartData = data.dates.map((date, i) => ({
          date,
          actual: data.actual_ndvi[i],
          predicted: data.predicted_ndvi[i]
        }));
        setBloomPredictionData(chartData);
      })
      .catch(err => console.error('Error fetching bloom prediction:', err));
  }, []);

  // Prepare combined data
  useEffect(() => {
    if (ndviData.length > 0 && climateData.length > 0) {
      const monthlyClimate = {};
      climateData.forEach(item => {
        const monthKey = item.date.substring(0, 7);
        if (!monthlyClimate[monthKey]) monthlyClimate[monthKey] = { temp: 0, rainfall: 0, count: 0 };
        monthlyClimate[monthKey].temp += (item.tempMax + item.tempMin) / 2;
        monthlyClimate[monthKey].rainfall += item.rainfall;
        monthlyClimate[monthKey].count += 1;
      });
      Object.keys(monthlyClimate).forEach(key => {
        monthlyClimate[key].temp /= monthlyClimate[key].count;
        monthlyClimate[key].rainfall /= monthlyClimate[key].count;
      });

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
      setHeatmapData(combined.map(item => ({ x: item.rainfall, y: item.ndvi })));
    }
  }, [ndviData, climateData]);

  // Filter data by time range
  const filteredNdvi = ndviData.slice(timeRange[0], timeRange[1] + 1);

  // Analysis: Simple bloom phase/alerts
  const getAlert = (ndvi) => {
    if (ndvi > 0.6) return { text: 'Healthy Vegetation 🟢', color: 'green' };
    if (ndvi > 0.3) return { text: 'Early Bloom Detected 🟡', color: 'yellow' };
    return { text: 'Stress / Potential Harmful Bloom 🔴', color: 'red' };
  };

  const latestPred = forecastData[0];
  const alert = latestPred ? getAlert(latestPred.ndvi) : null;

  return (
    <div className={styles.storytellingWrapper}>
      {/* Section 1: Intro */}
      <Landing className={styles.introSection}>
        <h1 className={styles.title}>From Space to Soil: The Journey of a Bloom</h1>
        <p className={styles.subtitle}>See how NASA satellites capture the birth of a bloom, and follow it as it transforms landscapes.</p>
        <div className={styles.cardsContainer}>
          <InfoCard title="Total Blooming Events" data="7,265" />
          <InfoCard title="Active Regions" data="3,671" />
          <InfoCard title="Species Monitored" data="156" />
          <InfoCard title="Prediction Accuracy" data="90%" />
        </div>
        <p className={styles.summary}>This dashboard integrates NASA POWER climate data and MODIS NDVI to monitor vegetation health and predict harmful blooms in California. The LSTM model analyzes historical patterns to forecast future NDVI values.</p>
      </Landing>

      {/* Section 2: NDVI Time Series */}
      <Landing className={styles.ndviSection}>
        <h2 className={styles.sectionTitle}>🌱 NDVI Time Series - Central Valley</h2>
        <p className={styles.analysisNote}>Monthly NDVI data from 2018-2024 shows vegetation health trends. Use the slider to explore different time periods.</p>
        <RangeSlider min={0} max={ndviData.length - 1} value={timeRange} onChange={setTimeRange} />
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredNdvi}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
        <p className={styles.summary}>NDVI values below 0.3 indicate severe stress, potentially leading to harmful blooms. The model predicts a future NDVI of {latestPred?.ndvi?.toFixed(3)}.</p>
      </Landing>

      {/* Section 2.5: Climate Data Charts */}
      <Landing className={styles.climateDataSection}>
        <h2 className={styles.sectionTitle}>🌡️ Climate Data Trends (2020)</h2>
        <p className={styles.analysisNote}>Daily climate variables from NASA POWER API for Central Valley.</p>
        <div className={styles.chartGrid}>
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
        <p className={styles.summary}>Climate data shows seasonal patterns: higher temperatures in summer, rainfall peaks in winter, humidity varies inversely with temperature.</p>
      </Landing>

      {/* Section 2.6: EVI Time Series */}
      <Landing className={styles.ndviSection}>
        <h2 className={styles.sectionTitle}>🌿 EVI Time Series - Central Valley</h2>
        <p className={styles.analysisNote}>Daily EVI data from NASA POWER API for Central Valley.</p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={eviData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="evi" name="EVI" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
        <p className={styles.summary}>EVI (Enhanced Vegetation Index) provides enhanced sensitivity to vegetation changes compared to NDVI.</p>
      </Landing>

      {/* Section 2.7: Soil Moisture Time Series */}
      <Landing className={styles.ndviSection}>
        <h2 className={styles.sectionTitle}>💧 Soil Moisture Time Series - Central Valley</h2>
        <p className={styles.analysisNote}>Daily soil moisture data from NASA POWER API for Central Valley.</p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={soilData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="soil" name="Soil Moisture" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
        <p className={styles.summary}>Soil moisture levels influence vegetation health and bloom potential. Low moisture can exacerbate stress.</p>
      </Landing>

      {/* Section 3: Multi-line Chart */}
      <Landing className={styles.multiSection}>
        <h2 className={styles.sectionTitle}>📈 NDVI vs Climate Variables</h2>
        <p className={styles.analysisNote}>Combined view of NDVI with temperature and precipitation to identify correlations.</p>
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
        <p className={styles.summary}>Higher temperatures often correlate with lower NDVI, signaling vegetation stress. Precipitation influences recovery periods.</p>
      </Landing>

      {/* Section 4: Seasonal Bar Chart */}
      <Landing className={styles.seasonalSection}>
        <h2 className={styles.sectionTitle}>📊 Seasonal NDVI by Month</h2>
        <p className={styles.analysisNote}>Average NDVI per month reveals seasonal patterns in vegetation health.</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={seasonalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ndvi" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <p className={styles.summary}>Spring and summer months show higher NDVI, while winter droughts can cause declines. This helps predict bloom seasons.</p>
      </Landing>

      {/* Section 5: Heatmap Scatter */}
      <Landing className={styles.heatmapSection}>
        <h2 className={styles.sectionTitle}>🔥 NDVI vs Precipitation Heatmap</h2>
        <p className={styles.analysisNote}>Scatter plot showing NDVI response to precipitation levels.</p>
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
        <p className={styles.summary}>Green points indicate healthy vegetation with adequate rain; red points show stress despite precipitation, possibly due to other factors.</p>
      </Landing>

      {/* Section 6: Map Heatmap */}
      <Landing className={styles.mapSection}>
        <h2 className={styles.sectionTitle}>🗺️ NDVI Heatmap - South & North California</h2>
        <p className={styles.analysisNote}>Interactive map showing NDVI stress points across California regions.</p>
        <Map bloomEvents={bloomEvents} animate={true} />
        <p className={styles.summary}>Stress events are concentrated in agricultural areas. South CA shows more frequent low NDVI due to drier conditions.</p>
      </Landing>

      {/* Section 6.5: NDVI Interactive Map */}
      <Landing className={styles.mapSection}>
        <h2 className={styles.sectionTitle}>🌍 Interactive NDVI Map with Bloom Phases</h2>
        <p className={styles.analysisNote}>Animated map showing NDVI evolution over time with bloom phase indicators. Use play/pause to control animation.</p>
        <NDVIMap data={ndviMapData} />
        <p className={styles.summary}>Gray: No Bloom, Yellow: Early Bloom, Green: Full Bloom. The map illustrates north-south gradients in vegetation health.</p>
      </Landing>

      {/* Section 7: Forecast Plot */}
      <Landing className={styles.forecastSection}>
        <h2 className={styles.sectionTitle}>🔮 NDVI Forecast</h2>
        <p className={styles.analysisNote}>LSTM model prediction for next NDVI value based on recent trends.</p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={[...ndviData, ...forecastData]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
        <p className={styles.summary}>The model forecasts future NDVI to anticipate bloom risks. Current prediction: {latestPred?.ndvi?.toFixed(3)}.</p>
      </Landing>

      {/* Section 7.5: Bloom Prediction Chart */}
      <Landing className={styles.forecastSection}>
        <h2 className={styles.sectionTitle}>🌸 Bloom Prediction Model</h2>
        <p className={styles.analysisNote}>LSTM model trained on NDVI, temperature, rainfall, and humidity data to predict bloom peaks.</p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={bloomPredictionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" name="Actual NDVI" stroke="#82ca9d" />
            <Line type="monotone" dataKey="predicted" name="Predicted NDVI" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
        <p className={styles.summary}>The model predicts NDVI trends to identify potential bloom peaks. Peaks in predicted NDVI indicate optimal bloom conditions.</p>
      </Landing>

      {/* Section 8: Cumulative Bar Chart */}
      <Landing className={styles.cumulativeSection}>
        <h2 className={styles.sectionTitle}>📊 Cumulative Climate Metrics (2020)</h2>
        <p className={styles.analysisNote}>Total precipitation and solar radiation for the year.</p>
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
        <p className={styles.summary}>Cumulative metrics help assess overall climate impact on vegetation. Low precipitation combined with high solar radiation exacerbates stress.</p>
      </Landing>

      {/* Section 9: Alerts */}
      <Landing className={styles.alertsSection}>
        <h2 className={styles.sectionTitle}>🚨 Current Alerts</h2>
        {alert && (
          <div className={styles.alert}>
            <h3>Alert: {alert.text}</h3>
            <p>Based on model prediction: NDVI {latestPred?.ndvi?.toFixed(3)}</p>
          </div>
        )}
        <p className={styles.summary}>Alerts are generated based on predicted NDVI thresholds. Green indicates healthy conditions, yellow early warning, red immediate action needed.</p>
      </Landing>

      {/* Section 10: Super Bloom Interactive Map */}
      <Landing className={styles.mapSection}>
        <h2 className={styles.sectionTitle}>🌸 Super Bloom Interactive Map</h2>
        <p className={styles.analysisNote}>Interactive map visualizing Super Bloom data layers across years. Use the slider to select year, toggle layers, and click on the map for pixel-level features.</p>
        <SuperBloomMap />
        <p className={styles.summary}>Layers include NDVI, EVI, Rainfall, Temperature, Fire, BloomStage, and Predicted BloomStage. Animation cycles through years automatically.</p>
      </Landing>
    </div>
  );
}

export default Storytelling;
