import { useUser } from "../contexts/userContextHelpers";

import styles from "./css/DashboardPage.module.css";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className={styles.root}>
      {/* ── Main Content ── */}
      <main className={styles.main}>
        {/* Welcome */}
        <section className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>Hello, {user?.name}</h1>
          <p className={styles.welcomeSubtitle}>Welcome to your sanctuary.</p>
        </section>

        {/* Bento Grid */}
        <div className={styles.grid}>
          {/* Today's Meditation — Hero Card */}
          <div className={`${styles.card} ${styles.cardMeditation}`}>
            {/* Gradient overlay */}
            <div className={styles.cardGradient} />
            {/* Decorative image */}
            <div className={styles.cardDecorImg}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADAaE6p3R1LK9bufR29_XZ8X8CE_MWD2ko38i8HZv7H2oq6t9OEG2pfwCON4LMLK4wJiFXQvM6ex17SPSlr6XzEcJuAM70QyHPY2_B2lt-y5kEeahyCGtkXMWBWXxTKEreaZ8bXsOyyM09cd4DKqh2zPLqge5FMpoUqTICxfDXknUUii0cgz4JZQDIkEvjMNNlJP-2auP-VsyF1TZbU2sII-U9iJLIjXGPxE6-XWu5LE0e2hxsX42Srsh1dDfHKy7qnmjsO99rtxgG"
                alt="Zen leaves"
              />
            </div>
            {/* Content */}
            <div className={styles.cardMeditationContent}>
              <div>
                <h2 className={styles.cardHeadline}>Today's Meditation</h2>
                <p className={styles.cardSubtext}>
                  Find your center with guided mindfulness.
                </p>
              </div>
              <div className={styles.meditationPlayer}>
                <button className={styles.playBtn} aria-label="Play">
                  {/* Play icon */}
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <div className={styles.meditationMeta}>
                  <span className={styles.meditationName}>Morning Clarity</span>
                  <span className={styles.meditationDetail}>
                    15 min • Alpha Waves
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Edit */}
          <div className={`${styles.card} ${styles.cardProfile}`}>
            <div className={styles.cardProfileTop}>
              <div className={styles.profileAvatar}>
                <img
                  src= {user?.avatar_url || "/assets/default_profile.svg"}
                  alt="User Profile"
                />
              </div>
              <span className={styles.arrowIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            <div>
              <h3 className={styles.cardTitle}>Profile Edit</h3>
              <p className={styles.cardBody}>Manage your sanctuary settings</p>
            </div>
          </div>

          {/* Today's Feedback */}
          <div className={`${styles.card} ${styles.cardFeedback}`}>
            <div className={styles.cardHeader}>
              <span className={styles.iconWrap}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </span>
              <h3 className={styles.cardHeadline}>Today's Feedback</h3>
            </div>
            <div className={styles.feedbackBox}>
              <p className={styles.feedbackQuote}>
                "Your focus was deeply sustained today. The resonant glow
                indicates a calm state."
              </p>
            </div>
            <button className={styles.linkBtn}>View Details</button>
          </div>

          {/* My Meditation Report */}
          <div className={`${styles.card} ${styles.cardReport}`}>
            <div className={styles.cardHeader}>
              <span className={styles.iconWrap}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 3v18h18v-2H5V3H3zm16 14l-5-5-3 3-4-4-1.5 1.5L11 17l3-3 5 5 1.5-1.5z" />
                </svg>
              </span>
              <h3 className={styles.cardHeadline}>My Meditation Report</h3>
            </div>

            <div className={styles.reportStats}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Weekly Sync</span>
                <span className={styles.statValue}>85%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: "85%" }} />
              </div>

              <div className={`${styles.statRow} ${styles.statRowMt}`}>
                <span className={styles.statLabel}>Total Sessions</span>
                <span className={styles.statValue}>12</span>
              </div>
            </div>

            <button className={styles.linkBtn}>Full Report</button>
          </div>
        </div>
      </main>
    </div>
  );
}
