import Landing from "../../Components/Landing/Landing.jsx";
import InfoCard from "../../Components/InfoCard/InfoCard.jsx";
import Map from "../../Components/Map/Map.jsx";
import RangeSlider from "../../Components/RangeSlider/RangeSlider.jsx";
import styles from "./Dashboard.module.css"

function Dashboard(){

    const bloomEvents = [
    { geoCode: [30.0, 31.2], text: "Jasmine", value: 1},
    { geoCode: [30.1, 31.3], text: "Lily", value: 1},
    { geoCode: [30.2, 31.5], text: "Tulip", value: 1},
    ];

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
                    <Map bloomEvents={bloomEvents} animate={true}></Map>
                <form className={styles.filtersContainer}>
                    <RangeSlider></RangeSlider>
                </form>
            </Landing>
        </div>
    );
}

export default Dashboard