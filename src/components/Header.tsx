import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { LogOut } from "lucide-react";
import styles from "./CSS/Header.module.css";
import GoogleLoginButton from "./GoogleLoginButton";
import { useUser } from "../contexts/userContextHelpers";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Meditation", to: "/testguide" },
  { label: "Reports", to: "/reports" },
  { label: "Profile", to: "/profile" },
  { label: "How to wear", to: "/howtoguide" },
];

export default function Header() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      return;
    }

    setIsDropdownOpen(false);
    navigate("/");
  };

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

        {user && (
          <div className={styles.navLinks}>
            {NAV_ITEMS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {/*<NavLink to="/meditationsetup" className={styles.startButton}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Session
            </motion.div>
          </NavLink>*/}

          {!user ? (
            <GoogleLoginButton />
          ) : (
            <>
              <div className={styles.profileDropdown}>
                <button
                  className={styles.profileButton}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className={styles.userGreeting}>
                    Hello, <span className={styles.userName}>{user.name}</span>
                  </div>
                  <img
                    src={user.avatar_url || "/assets/default_profile.svg"}
                    alt="profile"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </button>

                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <button
                      className={styles.dropdownItem}
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
