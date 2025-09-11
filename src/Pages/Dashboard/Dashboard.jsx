import Header from "../../Components/Header/Header.jsx";
import InfoCard from "../../Components/InfoCard/InfoCard.jsx";
import Earth from "../../Components/Earth/Earth.jsx";
import styles from "./Dashboard.module.css"

function Dashboard(){

    return(
        <>
            <div className={styles.homeContainer}>
                <Header/>
                <h1>DashBoard</h1>
                <div className={styles.cardsContainer}>
                    <InfoCard title={"Total Blooming Events"} data={"7,265"}/>
                    <InfoCard title={"Active Regions"} data={"3,671"}/>
                    <InfoCard title={"Species Monitored"} data={"156"}/>
                    <InfoCard title={"Prediction Acurracy"} data={"90 %"}/>                    
                </div>
                <div className={styles.earthMap}>
                    {/* <Earth/> */}
                    <img src="./src\assets\worldmap.png" alt="earth map"/>
                </div>
                <form className={styles.filtersContainer}>
                    <input type="text"></input>
                    <input type="text"></input>
                    <input type="text"></input>
                    <input type="text"></input>
                </form>
            </div>
        </>
    );
}

export default Dashboard