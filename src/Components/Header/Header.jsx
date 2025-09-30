import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./Header.module.css";

function Header() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.headerContainer}>
      <NavLink className={styles.headerContaine} to="/">
        <div className={styles.logoContainer}>
          <h1 className={styles.logoName}>Bee-yond Sights</h1>
        </div>
      </NavLink>

      <button
        className={styles.burgerMenu}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span
          className={`${styles.burgerLine} ${
            mobileMenuOpen ? styles.burgerLineOpen : ""
          }`}
        ></span>
        <span
          className={`${styles.burgerLine} ${
            mobileMenuOpen ? styles.burgerLineOpen : ""
          }`}
        ></span>
        <span
          className={`${styles.burgerLine} ${
            mobileMenuOpen ? styles.burgerLineOpen : ""
          }`}
        ></span>
      </button>

      <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <NavLink to="/" className={({isActive}) => (isActive ? styles.ActiveLink: "")} onClick={() => setMobileMenuOpen(false)}>
              Home
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="/Dashboard" className={({isActive}) => (isActive ? styles.ActiveLink: "")} onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="/Storytelling" className={({isActive}) => (isActive ? styles.ActiveLink: "")} onClick={() => setMobileMenuOpen(false)}>
              Storytelling
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="/DataExplorer" className={({isActive}) => (isActive ? styles.ActiveLink: "")} onClick={() => setMobileMenuOpen(false)}>
              Data Explorer
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="/HealthPollen" className={({isActive}) => (isActive ? styles.ActiveLink: "")} onClick={() => setMobileMenuOpen(false)}>
              Health & Pollen
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="/DesertRisk" className={({isActive}) => (isActive ? styles.ActiveLink: "")} onClick={() => setMobileMenuOpen(false)}>
              Desert Risk
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
