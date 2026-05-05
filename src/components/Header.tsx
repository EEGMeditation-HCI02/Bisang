import { Bell, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './CSS/Header.module.css';

export default function Header() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={styles.logo}
        >
          BeeSang
        </motion.div>
        
        <div className={styles.navLinks}>
          <a className={`${styles.navLink} ${styles.navLinkActive}`} href="#">Dashboard</a>
          <a className={styles.navLink} href="#">Meditation</a>
          <a className={styles.navLink} href="#">Reports</a>
          <a className={styles.navLink} href="#">Profile</a>
        </div>

        <div className={styles.actions}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.startButton}
          >
            Start Session
          </motion.button>
          
          <div className={styles.iconButtons}>
            <button className={styles.iconButton}>
              <Bell size={20} />
            </button>
            <button className={styles.iconButton}>
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}