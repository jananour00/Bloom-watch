import { useState } from "react";
import styles from "./Card.module.css";

function Card(props){
    return(
        <div className={styles.cardContainer}>
            <img className={styles.cardImage} src={props.src} alt={props.title}/>
            <div className={styles.cardText}>
                <h3>{props.title}</h3>
                <p>{props.description.length>200?(props.description.slice(0,200)+"..."):props.description}</p>
                <h4><a href="#">Learn More..</a></h4>
            </div>
        </div>

    );
}

export default Card