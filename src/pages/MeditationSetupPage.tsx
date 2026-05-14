// import { useState } from "react";
// import { useNavigate } from 'react-router-dom';
// import styles from "./css/MeditationSetupPage.module.css";
// const THEMES = [
//   {
//     id: "self-esteem",
//     label: "Self-esteem",
//     desc: "Cultivate inner worth.",
//     icon: (
//       <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
//         <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
//       </svg>
//     ),
//     iconBg: "#faf3e6",
//     iconColor: "#a67c52",
//   },
//   {
//     id: "relationships",
//     label: "Relationships",
//     desc: "Connect with others.",
//     icon: (
//       <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
//         <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
//       </svg>
//     ),
//     iconBg: "rgba(255,255,255,0.3)",
//     iconColor: "#5a4a31",
//   },
//   {
//     id: "rest",
//     label: "Rest",
//     desc: "Deep relaxation.",
//     icon: (
//       <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
//         <path d="M12.12 2.05a9.913 9.913 0 0 0-2.83 14.45 9.913 9.913 0 0 0 14.45-2.83c.42-1 .09-2.16-.8-2.75l-.1-.06a8.013 8.013 0 0 1-10.71-10.71l-.06-.1c-.59-.89-1.75-1.22-2.75-.8z" />
//       </svg>
//     ),
//     iconBg: "#f0ede9",
//     iconColor: "#8e7f74",
//   },
//   {
//     id: "focus",
//     label: "Focus",
//     desc: "Improve concentration.",
//     icon: (
//       <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
//         <circle cx="12" cy="12" r="10" />
//         <circle cx="12" cy="12" r="6" />
//         <circle cx="12" cy="12" r="2" />
//       </svg>
//     ),
//     iconBg: "#f2e6e1",
//     iconColor: "#9e7667",
//   },
//   {
//     id: "calm",
//     label: "Calm",
//     desc: "Peace of mind.",
//     icon: (
//       <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
//         <path d="M21 12.75c0-1.25-.5-2.41-1.32-3.26C19.86 7.6 19.34 5.2 18.06 3.94c-1.26-1.28-3.66-1.8-5.55-.62-.85-.82-2.01-1.32-3.26-1.32s-2.41.5-3.26 1.32c-1.89-1.18-4.29-.66-5.55.62-1.28 1.26-1.8 3.66-.62 5.55-.82.85-1.32 2.01-1.32 3.26s.5 2.41 1.32 3.26c-.18 1.89.34 4.29 1.62 5.55 1.26 1.28 3.66 1.8 5.55.62.85.82 2.01 1.32 3.26 1.32s2.41-.5 3.26-1.32c1.89 1.18 4.29.66 5.55-.62 1.28-1.26 1.8-3.66.62-5.55.82-.85 1.32-2.01 1.32-3.26zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
//       </svg>
//     ),
//     iconBg: "#e9f0ea",
//     iconColor: "#6b8c71",
//   },
//   {
//     id: "free",
//     label: "Free",
//     desc: "Unguided session.",
//     icon: (
//       <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
//         <path d="M5 16L3 5l8.5 2L21 5l-2 11h-4l-3 4-3-4H5z" />
//       </svg>
//     ),
//     iconBg: "#e9ecf0",
//     iconColor: "#7d8a9e",
//   },
// ];

// const WAVEFORM_BARS = [
//   { delay: "0.1s", height: 12 },
//   { delay: "0.3s", height: 24 },
//   { delay: "0.2s", height: 32 },
//   { delay: "0.5s", height: 18 },
//   { delay: "0.4s", height: 28 },
//   { delay: "0.7s", height: 14 },
//   { delay: "0.6s", height: 22 },
// ];

// export default function MeditationSetup() {
//   const navigate = useNavigate();
//   const [selected, setSelected] = useState("relationships");

//   return (
//     <div className={styles.root}>
//       {/* ── Header ── */}
//       <header className={styles.header}>
//         <button className={styles.backBtn} aria-label="Go back" onClick={() => navigate('/dashboard')}>
//           <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
//             <path d="m15 18-6-6 6-6" />
//           </svg>
//         </button>
//         <h1 className={styles.brand}>BiSang</h1>
//         <div className={styles.headerSpacer} />
//       </header>

//       <main className={styles.main}>
//         {/* ── Hero ── */}
//         <section className={styles.hero}>
//           <h2 className={styles.heroTitle}>Choose your theme for today</h2>
//           <p className={styles.heroSub}>Select a focus area to tailor your guided session.</p>
//         </section>

//         {/* ── Theme Grid ── */}
//         <section className={styles.grid}>
//           {THEMES.map((theme) => {
//             const isSelected = selected === theme.id;
//             return (
//               <div
//                 key={theme.id}
//                 className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
//                 onClick={() => setSelected(theme.id)}
//                 role="button"
//                 tabIndex={0}
//                 aria-pressed={isSelected}
//                 onKeyDown={(e) => e.key === "Enter" && setSelected(theme.id)}
//               >
//                 <div
//                   className={styles.iconWrap}
//                   style={{
//                     background: theme.iconBg,
//                     color: theme.iconColor,
//                   }}
//                 >
//                   {theme.icon}
//                 </div>
//                 <h3 className={styles.cardLabel}>{theme.label}</h3>
//                 <p className={`${styles.cardDesc} ${isSelected ? styles.cardDescSelected : ""}`}>{theme.desc}</p>
//               </div>
//             );
//           })}
//         </section>

//         {/* ── AI Assistant ── */}
//         <section className={styles.aiSection}>
//           <span className={styles.aiLabel}>AI Assistant Listening</span>
//           <div className={styles.waveform}>
//             {WAVEFORM_BARS.map((bar, i) => (
//               <div
//                 key={i}
//                 className={styles.waveBar}
//                 style={{
//                   animationDelay: bar.delay,
//                   height: `${bar.height}px`,
//                 }}
//               />
//             ))}
//           </div>
//           <p className={styles.aiQuote}>"Tell me more about your relationships today..."</p>
//         </section>

//         {/* ── CTA ── */}
//         <div className={styles.cta}>
//           <button className={styles.beginBtn} onClick={() => navigate('/meditation')}>
//             Begin Session
//             <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
//               <path d="M5 12h14m-7-7 7 7-7 7" />
//             </svg>
//           </button>
//         </div>
//       </main>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./css/MeditationSetupPage.module.css";

const THEMES = [
  {
    id: "self-esteem",
    label: "Self-esteem",
    desc: "Cultivate inner worth.",
    icon: (
      <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    iconBg: "#faf3e6",
    iconColor: "#a67c52",
  },
  {
    id: "relationships",
    label: "Relationships",
    desc: "Connect with others.",
    icon: (
      <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    iconBg: "rgba(255,255,255,0.3)",
    iconColor: "#5a4a31",
  },
  {
    id: "rest",
    label: "Rest",
    desc: "Deep relaxation.",
    icon: (
      <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
        <path d="M12.12 2.05a9.913 9.913 0 0 0-2.83 14.45 9.913 9.913 0 0 0 14.45-2.83c.42-1 .09-2.16-.8-2.75l-.1-.06a8.013 8.013 0 0 1-10.71-10.71l-.06-.1c-.59-.89-1.75-1.22-2.75-.8z" />
      </svg>
    ),
    iconBg: "#f0ede9",
    iconColor: "#8e7f74",
  },
  {
    id: "focus",
    label: "Focus",
    desc: "Improve concentration.",
    icon: (
      <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    iconBg: "#f2e6e1",
    iconColor: "#9e7667",
  },
  {
    id: "calm",
    label: "Calm",
    desc: "Peace of mind.",
    icon: (
      <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
        <path d="M21 12.75c0-1.25-.5-2.41-1.32-3.26C19.86 7.6 19.34 5.2 18.06 3.94c-1.26-1.28-3.66-1.8-5.55-.62-.85-.82-2.01-1.32-3.26-1.32s-2.41.5-3.26 1.32c-1.89-1.18-4.29-.66-5.55.62-1.28 1.26-1.8 3.66-.62 5.55-.82.85-1.32 2.01-1.32 3.26s.5 2.41 1.32 3.26c-.18 1.89.34 4.29 1.62 5.55 1.26 1.28 3.66 1.8 5.55.62.85.82 2.01 1.32 3.26 1.32s2.41-.5 3.26-1.32c1.89 1.18 4.29.66 5.55-.62 1.28-1.26 1.8-3.66.62-5.55.82-.85 1.32-2.01 1.32-3.26zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
      </svg>
    ),
    iconBg: "#e9f0ea",
    iconColor: "#6b8c71",
  },
  {
    id: "free",
    label: "Free",
    desc: "Unguided session.",
    icon: (
      <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
        <path d="M5 16L3 5l8.5 2L21 5l-2 11h-4l-3 4-3-4H5z" />
      </svg>
    ),
    iconBg: "#e9ecf0",
    iconColor: "#7d8a9e",
  },
];

const WAVEFORM_BARS = [
  { delay: "0.1s", height: 12 },
  { delay: "0.3s", height: 24 },
  { delay: "0.2s", height: 32 },
  { delay: "0.5s", height: 18 },
  { delay: "0.4s", height: 28 },
  { delay: "0.7s", height: 14 },
  { delay: "0.6s", height: 22 },
];

const ROUNDS = 4;
const SESSION_LENGTHS = [
  { label: "3:00", minutes: 3 },
  { label: "5:00", minutes: 5 },
  { label: "10:00", minutes: 10 },
];

export default function MeditationSetup() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("relationships");
  const [sessionMinutes, setSessionMinutes] = useState(3);

  const totalMinutes = sessionMinutes * ROUNDS;

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <button className={styles.backBtn} aria-label="Go back" onClick={() => navigate('/dashboard')}>
          <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 className={styles.brand}>BiSang</h1>
        <div className={styles.headerSpacer} />
      </header>

      <main className={styles.main}>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <h2 className={styles.heroTitle}>Choose your theme for today</h2>
          <p className={styles.heroSub}>Select a focus area to tailor your guided session.</p>
        </section>

        {/* ── Theme Grid ── */}
        <section className={styles.grid}>
          {THEMES.map((theme) => {
            const isSelected = selected === theme.id;
            return (
              <div
                key={theme.id}
                className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                onClick={() => setSelected(theme.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => e.key === "Enter" && setSelected(theme.id)}
              >
                <div
                  className={styles.iconWrap}
                  style={{ background: theme.iconBg, color: theme.iconColor }}
                >
                  {theme.icon}
                </div>
                <h3 className={styles.cardLabel}>{theme.label}</h3>
                <p className={`${styles.cardDesc} ${isSelected ? styles.cardDescSelected : ""}`}>
                  {theme.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* ── Session Length ── */}
        <section className={styles.lengthSection}>
          <h2 className={styles.lengthTitle}>Choose your session length</h2>
          <p className={styles.lengthSub}>You'll go through {ROUNDS} rounds at this length</p>

          <div className={styles.lengthBtns}>
            {SESSION_LENGTHS.map(({ label, minutes }) => (
              <button
                key={minutes}
                className={`${styles.lengthBtn} ${sessionMinutes === minutes ? styles.lengthBtnActive : ""}`}
                onClick={() => setSessionMinutes(minutes)}
              >
                {label}
              </button>
            ))}
          </div>

          <p className={styles.lengthSummary}>
            {sessionMinutes} min × {ROUNDS} rounds — {totalMinutes} minutes in total
          </p>
        </section>

        {/* ── AI Assistant ── */}
        <section className={styles.aiSection}>
          <span className={styles.aiLabel}>AI Assistant Listening</span>
          <div className={styles.waveform}>
            {WAVEFORM_BARS.map((bar, i) => (
              <div
                key={i}
                className={styles.waveBar}
                style={{ animationDelay: bar.delay, height: `${bar.height}px` }}
              />
            ))}
          </div>
          <p className={styles.aiQuote}>"Tell me more about your relationships today..."</p>
        </section>

        {/* ── CTA ── */}
        <div className={styles.cta}>
          <button className={styles.beginBtn} onClick={() => navigate('/meditation')}>
            Begin Session
            <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
