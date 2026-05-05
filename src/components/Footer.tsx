import styles from './CSS/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logo}>
          BeeSang
        </div>
        
        <div className={styles.navLinks}>
          <a className={styles.navLink} href="#">The Science</a>
          <a className={styles.navLink} href="#">Neuro-Privacy</a>
          <a className={styles.navLink} href="#">Our Story</a>
          <a className={styles.navLink} href="#">Support</a>
        </div>
        
        <div className={styles.copyright}>
          © {new Date().getFullYear()} BeeSang Sanctuary. Engineered for clarity.
        </div>
      </div>
    </footer>
  );
}