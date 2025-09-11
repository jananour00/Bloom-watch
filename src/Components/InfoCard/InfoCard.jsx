import styles from "./InfoCard.module.css"

function InfoCard(props){
    return(
        <div className={styles.cardContainer}>
            <h3>{props.title}</h3>
            <p>{props.data}</p>
        </div>
    );
}

export default InfoCard