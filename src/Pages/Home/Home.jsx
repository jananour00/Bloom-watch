import Landing from "../../Components/Landing/Landing.jsx";
import Card from "../../Components/Card/Card.jsx";
import BloomWatchForm from "../../form/form.jsx";
import styles from "./Home.module.css";

function Home() {
  return (
    <div className={styles.landingWrapper}>
      <Landing className={styles.homeLanding}>
        <h2>Bee-yond Sights</h2>
        <p>BloomWatch: Connecting Earth, Air & Life</p>
      </Landing>

      <Landing className={styles.cardsLanding}>
        <h2>Problem & Mission</h2>
        <div className={styles.cardsContainer}>
          <Card
            src="./src/assets/TestCardimg.png"
            title="Mission & Solution"
            description="Lorem ipsum..."
          />
          <Card
            src="./src/assets/TestCardimg.png"
            title="Mission & Solution"
            description="Lorem ipsum..."
          />
        </div>
      </Landing>

      <Landing className={styles.tempLanding}>
        <BloomWatchForm />
      </Landing>
    </div>
  );
}

export default Home;
