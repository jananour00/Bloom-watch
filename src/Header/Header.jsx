import { useState } from "react";
import styles from "./Header.module.css";
import LogoPic from "../assets/flower.png";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoContainer}>
        <img
          alt="Bloom Watch Logo"
          src={LogoPic}
          className={styles.logoPic}
        />
        <h1 className={styles.logoName}>Bloom Watch</h1>
      </div>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.navItem}><a href="#">Home</a></li>
          <li className={styles.navItem}><a href="#">Dashboard</a></li>
          <li className={styles.navItem}>
            <button
              className={styles.dropdownBtn}
              onClick={() => setOpen(!open)}
            >
              Predictions{" "}
              <span className={`${styles.arrow} ${open ? styles.open : ""}`}>
                ▼
              </span>
            </button>
            {open && (
              <div className={styles.dropDownMenuContainer}>
                <ul className={styles.dropDownMenu}>
                  <li>Model 1</li>
                  <li>Model 2</li>
                  <li>Model 3</li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
