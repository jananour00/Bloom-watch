import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./Header.module.css";
import LogoPic from "../../assets/flower.png";

function Header() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.headerContainer}>
      <NavLink to="/">
        <div className={styles.logoContainer}>
          <img alt="Bloom Watch Logo" src={LogoPic} className={styles.logoPic} />
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
            <button
              className={styles.dropdownBtn}
              onClick={() => setOpen(!open)}
            >
              Features{" "}
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
            <NavLink to="/Data" className={({isActive}) => (isActive ? styles.ActiveLink: "")} onClick={() => setMobileMenuOpen(false)}>
              Data
            </NavLink>
          </li>
        </ul>
      </nav>
      <button className={styles.APIButton}>GET API</button>
    </header>
  );
}

export default Header;
