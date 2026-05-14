import { Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import styles from './CSS/Header.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard',  to: '/dashboard' },
  { label: 'Meditation', to: '/meditationsetup' },
  { label: 'Reports',    to: '/reports' },
];

export default function Header() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <NavLink to="/dashboard" className={styles.logo}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            BiSang
          </motion.div>
        </NavLink>

        <div className={styles.navLinks}>
          {NAV_ITEMS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className={styles.actions}>
          <NavLink to="/meditationsetup" className={styles.startButton}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Session
            </motion.div>
          </NavLink>
          <NavLink to="/profile" className={styles.iconButtons}>
             <button className={styles.iconButton}>
              <Settings size={20} />
            </button>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}