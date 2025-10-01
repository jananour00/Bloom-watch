import Landing from "../../Components/Landing/Landing.jsx";
import InfoCard from "../../Components/InfoCard/InfoCard.jsx";
import Map from "../../Components/Map/Map.jsx";
import RangeSlider from "../../Components/RangeSlider/RangeSlider.jsx";
import styles from "./Dashboard.module.css"
import { useState, useEffect } from "react";

function Dashboard(){
    const [bloomEvents, setBloomEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTime, setSelectedTime] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        const fetchBloomEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/bloom_events');
                if (response.ok) {
                    const data = await response.json();
                    // Process data to match Map component expectations
                    // Assuming data is array of granules with lat/lon
                    const events = data.map(item => ({
                        lat: parseFloat(item['spatial']['horizontal-spatial-domain']['geometry']['gpolygons'][0]['boundary']['points'][0][1]),
                        lng: parseFloat(item['spatial']['horizontal-spatial-domain']['geometry']['gpolygons'][0]['boundary']['points'][0][0]),
                        intensity: Math.random() * 100 // Placeholder for bloom intensity
                    }));
                    setBloomEvents(events);
                } else {
                    console.error('Failed to fetch bloom events');
                }
            } catch (error) {
                console.error('Error fetching bloom events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBloomEvents();
    }, []);

    return(
        <div className={styles.dashboardContainer}>
            {/* Header with Info Cards */}
            <Landing className={styles.CardsLanding}>
                <h1>Bloom-Watch Dashboard</h1>
                <div className={styles.cardsContainer}>
                    <InfoCard title={"Total Blooming Events"} data={bloomEvents.length.toString()}/>
                    <InfoCard title={"Active Regions"} data={"3,671"}/>
                    <InfoCard title={"Species Monitored"} data={"156"}/>
                    <InfoCard title={"Prediction Accuracy"} data={"90 %"}/>
                </div>
            </Landing>

            {/* Core Visualization Zone */}
            <div className={styles.coreVisualizationZone}>
                <div className={styles.mapContainer}>
                    {loading ? <p>Loading bloom data...</p> : <Map bloomEvents={bloomEvents} animate={true} selectedTime={selectedTime}></Map>}
                    <div className={styles.legend}>
                        <h4>Bloom Stage Legend</h4>
                        <div className={styles.legendItem}><span style={{backgroundColor: 'gray'}}></span> No Bloom</div>
                        <div className={styles.legendItem}><span style={{backgroundColor: 'green'}}></span> Early Bloom</div>
                        <div className={styles.legendItem}><span style={{backgroundColor: 'yellow'}}></span> Peak Bloom</div>
                        <div className={styles.legendItem}><span style={{backgroundColor: 'red'}}></span> Late Bloom</div>
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
                    <button onClick={() => {/* Play animation logic */}}>Play/Pause</button>
                </div>
            </div>

            {/* Data Analysis Zone */}
            <div className={styles.dataAnalysisZone}>
                <div className={styles.trendGraphs}>
                    <h3>Trend Analysis</h3>
                    {/* Placeholder for charts */}
                    <p>NDVI Trend Chart (Placeholder)</p>
                    <p>Multi-year Comparison (Placeholder)</p>
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
                    <select>
                        <option>XGBoost Model</option>
                        <option>Statistical Model</option>
                    </select>
                    <input type="text" placeholder="Region" />
                    <input type="text" placeholder="Crop" />
                    <button onClick={() => {/* Fetch forecast */}}>Generate Forecast</button>
                    {/* Forecast Graph */}
                    <div className={styles.forecastGraph}>
                        <h4>Forecast Graph</h4>
                        <p>Probability curve for next 1-3 months (Placeholder)</p>
                        <p>Confidence intervals shaded</p>
                        <p>Compare observed vs predicted lines</p>
                    </div>
                </div>
                <div className={styles.featureImportance}>
                    <h3>Feature Importance Plot</h3>
                    <p>SHAP or XGBoost feature importances (Placeholder)</p>
                    <p>Show which drivers influenced predictions</p>
                </div>
                <div className={styles.climateScenarioExplorer}>
                    <h3>Climate Scenario Explorer</h3>
                    <label>Rainfall Change (%): <input type="number" /></label>
                    <label>Temperature Change (°C): <input type="number" /></label>
                    <button onClick={() => {/* Simulate */}}>Simulate</button>
                    <p>What-if graphs: “If rainfall ↑10%, what happens to bloom probability?”</p>
                    <p>Shows climate impact on phenology</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard
