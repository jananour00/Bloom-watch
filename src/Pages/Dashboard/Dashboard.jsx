import Landing from "../../Components/Landing/Landing.jsx";
import InfoCard from "../../Components/InfoCard/InfoCard.jsx";
import Earth from "../../Components/Earth/Earth.jsx";
import RangeSlider from "../../Components/RangeSlider/RangeSlider.jsx";
import styles from "./Dashboard.module.css"

function Dashboard(){

    return(
        <div className={styles.landingWrapper}>
            <Landing className={styles.CardsLanding}>
                <h1>DashBoard</h1>
                <div className={styles.cardsContainer}>
                    <InfoCard title={"Total Blooming Events"} data={"7,265"}/>
                    <InfoCard title={"Active Regions"} data={"3,671"}/>
                    <InfoCard title={"Species Monitored"} data={"156"}/>
                    <InfoCard title={"Prediction Acurracy"} data={"90 %"}/>                    
                </div>
            </Landing>
            <Landing className={styles.MapLanding}>
                <div className={styles.earthMap}>
                    <Earth/>
                </div>
                <form className={styles.filtersContainer}>
                    <RangeSlider></RangeSlider>
                </form>
            </Landing>
        </div>
    );
}

export default Dashboard