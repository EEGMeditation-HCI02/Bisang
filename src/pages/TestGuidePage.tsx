import { useState } from "react";
import styles from "./css/TestGuidePage.module.css";

const STATUS_ITEMS = [
  {
    id: "signal",
    badge: "Live",
    title: "Signal Strength",
    desc: "Excellent Connection",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
      </svg>
    ),
  },
  {
    id: "sensor",
    badge: "Verified",
    title: "Sensor Contact",
    desc: "Stable Synchronization",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 12c0-1.93-.64-3.72-1.72-5.14L6.14 18.28C7.56 19.36 9.35 20 11.5 20c4.42 0 8-3.58 8-8zm-15 0c0 1.93.64 3.72 1.72 5.14L17.86 5.72C16.44 4.64 14.65 4 12.5 4c-4.42 0-8 3.58-8 8zM12.5 2C6.98 2 2.5 6.48 2.5 12s4.48 10 10 10 10-4.48 10-10S18.02 2 12.5 2z" />
      </svg>
    ),
  },
];

// Brain / psychology icon as inline SVG
function BrainIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2a4.5 4.5 0 0 1 4.5 4.5v.5h.5a3.5 3.5 0 0 1 0 7H9a5 5 0 0 1 0-10h.5V4A2 2 0 0 0 7.5 2z" />
      <path d="M14.5 2a4.5 4.5 0 0 0-4.5 4.5v.5h-.5a3.5 3.5 0 0 0 0 7H15a5 5 0 0 0 0-10h-.5V4A2 2 0 0 1 16.5 2z" />
      <path d="M9 14v7M15 14v7M12 14v7" />
    </svg>
  );
}

export default function TestGuidePage() {
  const [loading, setLoading] = useState(false);

  return (
    <main className={styles.root}>

      {/* Central content */}
      <div className={styles.content}>
        {/* Heading */}
        <div className={styles.heading}>
          <h1 className={styles.title}>Connecting...</h1>
          <p className={styles.subtitle}>
            MindWave is synchronizing with your sanctuary.
          </p>
        </div>

        {/* Orb */}
        <div className={styles.orbWrap}>
          <div className={styles.orbPing} />
          <div className={styles.orbPulse} />
          <div className={styles.orb}>
            <BrainIcon />
          </div>
          <div className={styles.orbBadge}>Active</div>
        </div>

        {/* Status Cards */}
        <div className={styles.statusGrid}>
          {STATUS_ITEMS.map((item) => (
            <div key={item.id} className={styles.statusCard}>
              <div className={styles.statusCardTop}>
                <span className={styles.statusIcon}>{item.icon}</span>
                <span className={styles.statusBadge}>{item.badge}</span>
              </div>
              <div>
                <h3 className={styles.statusTitle}>{item.title}</h3>
                <p className={styles.statusDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => setLoading((v) => !v)}
          >
            {loading ? "Synchronizing..." : "Ready to Begin"}
          </button>
          <button className={styles.btnGhost}>Rescan Devices</button>
        </div>
      </div>
    </main>
  );
}