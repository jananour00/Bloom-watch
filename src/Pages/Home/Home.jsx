import Card from "../../Components/Card/Card.jsx";
import Header from "../../Components/Header/Header.jsx";
import BloomWatchForm from "../../form/form.jsx";
import styles from "./Home.module.css"

function Home() {
  return (
    <>
      <div className={styles.homeContainer}>
        <Header/>
      </div>
        {/* <Land/> */}
        <div className={styles.cardsContainer}>
          <Card
            src="./src\assets\TestCardimg.png"
            title="Mission & Solution"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          />
          <Card
            src="./src\assets\TestCardimg.png"
            title="Mission & Solution"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          />
        </div>
        <BloomWatchForm />
      </>
  );
}

export default Home;
