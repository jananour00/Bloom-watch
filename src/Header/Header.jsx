import { useState } from "react";
import styles from "./Header.module.css";
import LogoPic from "../assets/flower.png";

function Header() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {/* Burger Menu Button */}
      <button
        className={styles.burgerMenu}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.burgerLineOpen : ""}`}></span>
        <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.burgerLineOpen : ""}`}></span>
        <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.burgerLineOpen : ""}`}></span>
      </button>

      {/* Navigation */}
      <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <a href="#" onClick={() => setMobileMenuOpen(false)}>Home</a>
          </li>
          <li className={styles.navItem}>
            <a href="#" onClick={() => setMobileMenuOpen(false)}>Dashboard</a>
          </li>
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
                  <li onClick={() => setMobileMenuOpen(false)}>Model 1</li>
                  <li onClick={() => setMobileMenuOpen(false)}>Model 2</li>
                  <li onClick={() => setMobileMenuOpen(false)}>Model 3</li>
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