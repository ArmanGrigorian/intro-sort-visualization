"use client";

import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoGroup}>
        <div className={styles.logoIcon}>IS</div>
        <div>
          <h1 className={styles.title}>IntroSort Lab</h1>
          <p className={styles.subtitle}>Algorithm Visualization</p>
        </div>
      </div>
      <div className={styles.rightSection}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          Interactive
        </span>
      </div>
    </header>
  );
}
