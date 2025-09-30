import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion as m } from "framer-motion";
import Map from '../../Components/Map/Map.jsx';
import RangeSlider from '../../Components/RangeSlider/RangeSlider.jsx';
import YearlyNdviChart from "../../Components/YearlyNdviChart/YearlyNdviChart.jsx";
import styles from './Storytelling.module.css';

// --- The Narrative/Story Steps ---
const storySteps = [
    {
        year: 2019,
        title: "Establishing a Baseline",
        descriptions: {
            NDVI: "In 2019, NDVI values show a healthy, typical pattern for California. The strong peak in the spring reflects a landscape nourished by consistent winter rains, setting our baseline for a 'normal' year.",
            EVI: "Similar to NDVI, the EVI confirms robust vegetation health, indicating dense, green canopies in regions that received ample precipitation.",
            Rainfall: "A year with solid, well-distributed rainfall. This precipitation was the primary driver for the healthy vegetation growth observed across the state.",
            Temperature: "Temperatures remained moderate without prolonged, extreme heatwaves. This stable climate helped maintain soil moisture and supported plant life through the spring.",
            BloomStage: "The bloom stage followed a predictable curve, peaking in early spring. The intensity was moderate, reflecting a standard, healthy year for wildflowers.",
            Pressure_api: "Atmospheric pressure followed typical seasonal patterns, with no extreme anomalies that would drastically alter prevailing weather systems."
        }
    },
    {
        year: 2020,
        title: "The Onset of Drought",
        descriptions: {
            NDVI: "By 2020, a visible reduction in peak NDVI values signals the start of a dry period. The landscape is clearly less vibrant compared to the previous year due to water stress.",
            EVI: "The EVI data corroborates the drought's impact, showing lower values that point to sparser vegetation and less vigorous growth across the state.",
            Rainfall: "Significantly lower rainfall totals were recorded this year. This lack of water is the direct cause of the diminished vegetation health seen in other metrics.",
            Temperature: "Higher average temperatures and more frequent heatwaves began to emerge, further stressing plant life by increasing evaporation and water demand.",
            BloomStage: "The wildflower bloom was noticeably subdued. The drier conditions led to a shorter, less intense flowering season compared to the 2019 baseline.",
            Pressure_api: "Persistent high-pressure systems were more common this year, which typically lead to clearer skies and less rainfall, contributing to the drought conditions."
        }
    },
    {
        year: 2021,
        title: "The Impact of Wildfires",
        descriptions: {
            NDVI: "In the aftermath of significant wildfire activity, NDVI values show sharp declines in burned areas. This metric is crucial for assessing the immediate ecological damage of the fires.",
            EVI: "EVI readings also reflect the fire's impact, though sometimes they can show post-fire greening from opportunistic grasses in the following seasons.",
            Rainfall: "Continuing the trend, rainfall remained critically low, creating tinder-dry conditions that fueled one of the most active wildfire seasons on record.",
            Temperature: "Extreme heat events were prevalent in 2021, creating ideal conditions for fires to start and spread rapidly across the parched landscape.",
            BloomStage: "Bloom activity was minimal and localized. The combination of severe drought and fire risk suppressed much of the state's natural flowering cycle.",
            Pressure_api: "Weather patterns associated with low humidity and high winds, often linked to specific pressure gradients, contributed to the extreme fire danger this year."
        }
    },
    {
        year: 2023,
        title: "Nature's Rebound: The Superbloom",
        descriptions: {
            NDVI: "After years of dry conditions, the map is alive with exceptionally high NDVI values. This is a direct visualization of the 'superbloom' triggered by record-breaking winter rains.",
            EVI: "The EVI values for 2023 are among the highest recorded, indicating not just widespread greenness but also a structurally dense and healthy vegetation canopy.",
            Rainfall: "A series of powerful atmospheric rivers brought historic amounts of rain, completely replenishing reservoirs and saturating the soil, setting the stage for the superbloom.",
            Temperature: "Cooler and milder spring temperatures helped prolong the bloom, allowing wildflowers to thrive for an extended period across the state.",
            BloomStage: "This year saw one of the most spectacular bloom events in recent memory. The chart shows an intense and sustained peak, a testament to the ecosystem's powerful resilience.",
            Pressure_api: "The dominant weather pattern was a series of low-pressure systems, the mechanism that delivered the immense amount of rainfall and broke the multi-year drought."
        }
    },
    {
        year: 2024,
        title: "The Current Landscape",
        descriptions: {
            NDVI: "In 2024, NDVI values remain strong, showing the lasting benefits of the previous year's rains. The landscape has largely maintained its health, though not at the superbloom's peak.",
            EVI: "The EVI reflects a stable and healthy ecosystem. While not as high as 2023, the values are well above the drought years, indicating a return to a new, healthier baseline.",
            Rainfall: "Rainfall totals returned to more average levels. While not as dramatic as 2023, it was sufficient to sustain the recovery and prevent a slide back into drought.",
            Temperature: "A return to more typical temperature patterns is observed, helping to stabilize the environment after the dramatic swings of previous years.",
            BloomStage: "The bloom was healthy and widespread, though more in line with a 'normal' good year rather than a historic superbloom. This indicates a stabilizing ecosystem.",
            Pressure_api: "Weather patterns have normalized, showing a typical mix of high and low-pressure systems, reflecting a more balanced and predictable climate state."
        }
    }
];

// --- Definining the selectable data variables ---
const dataVariables = {
    'NDVI': 'NDVI',
    'EVI': 'EVI',
    'Rainfall': 'Rainfall',
    'Temperature': 'Temperature',
    'Bloom Stage': 'BloomStage',
    'Pressure': 'Pressure_api'
};


// --- The Main Storytelling Component ---
function Storytelling() {
    // --- State Management ---
    const [allBloomEvents, setAllBloomEvents] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [dateRange, setDateRange] = useState({ min: 0, max: 0 });
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    
    // --- State for the animation ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationFrame, setAnimationFrame] = useState(0);
    const [animationSpeed, setAnimationSpeed] = useState(250);
    const [selectedVariable, setSelectedVariable] = useState('NDVI');


    // --- Data Fetching ---
    useEffect(() => {
        const fetchBloomData = async () => {
            const response = await fetch('/data/california_bloom_events_accurate.json');
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1));
            setAllBloomEvents(sortedData);
        };
        fetchBloomData();
    }, []);

    // Memoize the yearly chart data
    const yearlyChartData = useMemo(() => {
        if (!allBloomEvents.length) return {};
        
        const groupedData = {};
        storySteps.forEach(step => {
            groupedData[step.year] = allBloomEvents.filter(event => event.year === step.year);
        });
        return groupedData;
    }, [allBloomEvents]);

    // --- NEW: Calculate the absolute max value for each variable ---
    const variableMaxValues = useMemo(() => {
        if (!allBloomEvents.length) return {};

        const maxValues = {};
        Object.values(dataVariables).forEach(key => {
            maxValues[key] = -Infinity;
        });

        allBloomEvents.forEach(event => {
            Object.values(dataVariables).forEach(key => {
                if (event[key] > maxValues[key]) {
                    maxValues[key] = event[key];
                }
            });
        });
        return maxValues;
    }, [allBloomEvents]);


    const dateLabels = useMemo(() => {
        if (!allBloomEvents.length) return [];
        return allBloomEvents.map(e => {
            const month = new Date(e.year, e.month - 1).toLocaleString('default', { month: 'short' });
            return `${month}-${e.year}`;
        });
    }, [allBloomEvents]);

    // Pre-transform all data for the map ONCE for performance
    const allTransformedBloomEvents = useMemo(() => {
        return allBloomEvents.map(e => ({
            geoCode: [e.lat, e.lon],
            value: e[selectedVariable],
            text: `Event from ${e.month}/${e.year}`,
            ...e
        }));
    }, [allBloomEvents, selectedVariable]);


    // --- Storytelling and Slider Interaction ---
    useEffect(() => {
        if (!allBloomEvents.length || isUserInteracting || isPlaying) return;
        
        const currentYear = storySteps[activeStep].year;
        const startIndex = allBloomEvents.findIndex(e => e.year === currentYear);
        const endIndex = allBloomEvents.findLastIndex(e => e.year === currentYear);

        if (startIndex !== -1) {
            setDateRange({ min: startIndex, max: endIndex });
            setAnimationFrame(startIndex);
        }
    }, [activeStep, allBloomEvents, isUserInteracting, isPlaying]);


    // --- Animation Logic ---
    useEffect(() => {
        if (!isPlaying) return;

        const intervalId = setInterval(() => {
            setAnimationFrame(prevFrame => {
                if (prevFrame >= dateRange.max) {
                    return dateRange.min;
                }
                return prevFrame + 1;
            });
        }, animationSpeed);

        return () => clearInterval(intervalId);
    }, [isPlaying, dateRange, animationSpeed]);


    // --- Data Filtering for the Map (Now much faster) ---
    const displayedBloomEvents = useMemo(() => {
        if (isPlaying) {
            const currentDateLabel = dateLabels[animationFrame];
            if (!currentDateLabel) return [];
            return allTransformedBloomEvents.filter(e => {
                const eventDateLabel = `${new Date(e.year, e.month - 1).toLocaleString('default', { month: 'short' })}-${e.year}`;
                return eventDateLabel === currentDateLabel;
            });
        } else {
            return allTransformedBloomEvents.slice(dateRange.min, dateRange.max + 1);
        }
    }, [dateRange, isPlaying, animationFrame, allTransformedBloomEvents, dateLabels]);


    const handleRangeChange = (min, max) => {
        setIsUserInteracting(true);
        setIsPlaying(false);
        setDateRange({ min, max });
        setAnimationFrame(min);
    };

    const handleStepInView = useCallback((index) => {
        setIsUserInteracting(false);
        setActiveStep(index);
    }, []);

    return (
        <div className={styles.storyContainer}>
            <div className={styles.visualization}>
                <Map 
                    bloomEvents={displayedBloomEvents} 
                    animate={!isPlaying} 
                    // NEW: Pass the calculated max value to the Map
                    maxHeatmapValue={variableMaxValues[selectedVariable]}
                />
                <div className={styles.sliderContainer}>
                    <div className={styles.animationControls}>
                        <div className={styles.variableSelector}>
                            {Object.entries(dataVariables).map(([displayName, keyName]) => (
                                <label key={keyName}>
                                    <input
                                        type="radio"
                                        name="variable"
                                        value={keyName}
                                        checked={selectedVariable === keyName}
                                        onChange={(e) => setSelectedVariable(e.target.value)}
                                    />
                                    <span>{displayName}</span>
                                </label>
                            ))}
                        </div>
                        <button onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? "Pause" : "Play Animation"}
                        </button>
                        {isPlaying && <span className={styles.animationStatus}>Showing: {dateLabels[animationFrame]}</span>}
                        <div className={styles.speedControl}>
                            <label htmlFor="speed">Speed</label>
                            <input
                                type="range"
                                id="speed"
                                min="50"
                                max="1000"
                                step="50"
                                value={animationSpeed}
                                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <RangeSlider
                        labels={dateLabels}
                        minValue={dateRange.min}
                        maxValue={dateRange.max}
                        onRangeChange={handleRangeChange}
                    />
                </div>
            </div>
            <div className={styles.narrative}>
                <div className={styles.narrativeIntro}>
                    <h1>California's Green Heartbeat</h1>
                    <p>Follow the story of California's landscape through the years. Scroll down to see how drought, fire, and rain have shaped the state's vegetation.</p>
                </div>
                {storySteps.map((step, index) => {
                    const dataForChart = yearlyChartData[step.year] || [];
                    
                    return (
                        <StoryStep
                            key={index}
                            index={index}
                            title={step.title}
                            // Pass the entire descriptions object
                            descriptions={step.descriptions}
                            chartData={dataForChart}
                            // Pass the currently selected variable
                            variable={selectedVariable}
                            onInView={handleStepInView}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// --- Helper Component for Scrollytelling ---
const StoryStep = React.memo(function StoryStep({ title, descriptions, onInView, chartData, index, variable }) {
    const { ref, inView } = useInView({
        threshold: 0.6,
        triggerOnce: false,
        onChange: (isInView) => {
            if (isInView) {
                onInView(index);
            }
        },
    });

    return (
        <m.div 
            ref={ref} 
            className={styles.storyStep}
            animate={{ opacity: inView ? 1 : 0.3 }}
            transition={{ duration: 0.5 }}
        > 
            <div className={styles.textContainer}>
                <h3>{title}</h3>
                {/* UPDATED: Display the correct description based on the selected variable */}
                <p>{descriptions[variable]}</p>
            </div>
            <div className={styles.chartWrapper}>
                <div className={styles.chartContainer}>
                    <YearlyNdviChart data={chartData} variable={variable}/>
                </div>
            </div>
        </m.div>
    );
});

export default Storytelling;

