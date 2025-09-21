import Landing from "../../Components/Landing/Landing.jsx";
import Card from "../../Components/Card/Card.jsx";
import BloomWatchForm from "../../form/form.jsx";
import TypewriterText from "../../Components/TypeWriter/typeWrite.jsx"; // Import the new component

import styles from "./Home.module.css";

function Home() {
  
  return (
    <div className={styles.landingWrapper}>
      <Landing className={styles.homeLanding}>
        <h2>Bee-yond Sights</h2>
        <p>
          <TypewriterText 
            text="BloomWatch: Connecting Earth, Air & Life" 
            speed={80}
            startDelay={1000}
          />
        </p>
      </Landing>

      <Landing className={styles.cardsLanding}>
        <h2>Problem & Mission</h2>
        <div className={styles.cardsContainer}>
          <Card
            src="./src/assets/worldmap.png"
            title="Environmental Monitoring"
            description="Our advanced sensor network provides real-time data on air quality, pollen levels, and environmental conditions across multiple locations. We collect comprehensive data to help communities understand their local environment and make informed decisions about health and sustainability."
            delay={0.1}
          />
          <Card
            src="./src/assets/flower.png"
            title="Biodiversity Tracking"
            description="BloomWatch tracks plant phenology and biodiversity patterns, helping researchers and communities understand how climate change affects local ecosystems. Our data contributes to conservation efforts and helps predict seasonal changes that impact agriculture and wildlife."
            delay={0.2}
          />
        </div>
      </Landing>

      <Landing className={styles.storyLanding}>
        <div className={styles.storyContent}>
          <h2 className={styles.storyTitle}>From Space to Soil: The Journey of a Bloom</h2>
          <p className={styles.storySubtitle}>
            See how NASA satellites capture the birth of a bloom, and follow it as it transforms landscapes.
          </p>

          <div className={styles.earthMapContainer}>
            <img
              src="./src/assets/worldmap.png"
              alt="Interactive Earth Map"
              className={styles.earthMap}
            />
            <div className={styles.mapOverlay}>
              <div className={styles.bloomIndicator}></div>
            </div>
          </div>

          <button className={styles.storyCtaBtn}>
            Explore the Full Story
            <span className={styles.ctaArrow}>→</span>
          </button>
        </div>
      </Landing>

      <Landing className={styles.featuresLanding}>
        <h2>What You Can Do with Bloom-Watch</h2>
        <p className={styles.featuresSubtitle}>Explore blooms, track changes, and understand their impact — all in one place.</p>
        <div className={styles.featuresContainer}>
          <Card
            src="./src/assets/worldmap.png"
            title="See from Space"
            description="Interactive bloom maps powered by NASA & ESA satellites."
            delay={0.1}
            featureType="satellite"
          />
          <Card
            src="./src/assets/TestCardimg.png"
            title="Understand the Data"
            description="Charts & insights about bloom patterns, intensity, and coverage."
            delay={0.2}
            featureType="analytics"
          />
          <Card
            src="./src/assets/flower.png"
            title="Stay Safe"
            description="Allergy and pollen forecasts with health recommendations."
            delay={0.3}
            featureType="health"
          />
          <Card
            src="./src/assets/worldmap.png"
            title="Link to Climate"
            description="Discover how blooms connect to climate shifts and disasters."
            delay={0.4}
            featureType="climate"
          />
        </div>
      </Landing>

      
    </div>
  );
}

export default Home;
