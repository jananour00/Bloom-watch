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
        description: "We begin in 2019, a year that provides a clear baseline for California's typical vegetation cycle. Notice the seasonal ebb and flow of NDVI, peaking in the spring months following winter rains. This is the state's normal rhythm."
    },
    {
        year: 2020,
        title: "The Onset of Drought",
        description: "By 2020, conditions began to change. Lower rainfall totals led to increased stress on plant life. On the map, you can see a visible reduction in peak NDVI values compared to the previous year, signaling the start of a dry period."
    },
    {
        year: 2021,
        title: "The Impact of Wildfires",
        description: "The year 2021 was marked by significant wildfire activity, a common consequence of drought. While our data shows the green vegetation, these fires drastically reshaped landscapes, and their impact is often seen in the sharp decline of NDVI in affected areas post-burn."
    },
    {
        year: 2023,
        title: "Nature's Rebound: The Superbloom",
        description: "After years of dry conditions, 2023 brought a dramatic shift with record-breaking winter rainfall. This led to a breathtaking 'superbloom' across the state. The map is alive with high NDVI values, a testament to the ecosystem's powerful resilience."
    },
    {
        year: 2024,
        title: "The Current Landscape",
        description: "This brings us to our most recent data from 2024. How does the vegetation health compare to the lushness of 2023 or the baseline of 2019? This current view helps us understand the ever-changing state of California's environment."
    }
];


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
            value: e.NDVI,
            text: `Event from ${e.month}/${e.year}`,
            ...e
        }));
    }, [allBloomEvents]);


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
            // Filter the pre-transformed data for the animation
            return allTransformedBloomEvents.filter(e => {
                const eventDateLabel = `${new Date(e.year, e.month - 1).toLocaleString('default', { month: 'short' })}-${e.year}`;
                return eventDateLabel === currentDateLabel;
            });
        } else {
            // For the slider, just slice the pre-transformed data. This is extremely fast.
            return allTransformedBloomEvents.slice(dateRange.min, dateRange.max + 1);
        }
    }, [dateRange, isPlaying, animationFrame, allTransformedBloomEvents, dateLabels]);


    const handleRangeChange = (min, max) => {
        setIsUserInteracting(true);
        setIsPlaying(false);
        setDateRange({ min, max });
        setAnimationFrame(min);
    };

    // PERFORMANCE FIX: Create a stable callback function for the StoryStep component.
    // This function's identity will not change across re-renders.
    const handleStepInView = useCallback((index) => {
        setIsUserInteracting(false);
        setActiveStep(index);
    }, []); // State setters are stable, so the dependency array is empty.

    return (
        <div className={styles.storyContainer}>
            <div className={styles.visualization}>
                <Map bloomEvents={displayedBloomEvents} animate={!isPlaying} />
                <div className={styles.sliderContainer}>
                    <RangeSlider
                        labels={dateLabels}
                        minValue={dateRange.min}
                        maxValue={dateRange.max}
                        onRangeChange={handleRangeChange}
                    />
                    <div className={styles.animationControls}>
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
                            index={index} // Pass index to the child
                            title={step.title}
                            description={step.description}
                            chartData={dataForChart}
                            onInView={handleStepInView} // Pass the new stable callback
                        />
                    );
                })}
            </div>
        </div>
    );
}

// --- Helper Component for Scrollytelling ---
// PERFORMANCE FIX: Wrap the entire component in React.memo
const StoryStep = React.memo(function StoryStep({ title, description, onInView, chartData, index }) {
    const { ref, inView } = useInView({
        threshold: 0.6,
        triggerOnce: false,
        onChange: (isInView) => {
            if (isInView) {
                // Pass the index back up to the parent's stable callback
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
                <p>{description}</p>
            </div>
            <div className={styles.chartWrapper}>
                <div className={styles.chartContainer}>
                    <YearlyNdviChart data={chartData}/>
                </div>
            </div>
        </m.div>
    );
});

export default Storytelling;

