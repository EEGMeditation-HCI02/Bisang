import styles from './css/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logo}>
          BiSang
        </div>

        {/* <div className={styles.navLinks}>
          <a className={styles.navLink} href="#">The Science</a>
          <a className={styles.navLink} href="#">Neuro-Privacy</a>
          <a className={styles.navLink} href="#">Our Story</a>
          <a className={styles.navLink} href="#">Support</a>
        </div> */}

        <div className={styles.copyright}>
          © {new Date().getFullYear()} BiSang Sanctuary. Engineered for clarity.
        </div>
      </div>
    </footer>
  );
}