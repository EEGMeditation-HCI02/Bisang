// import { useState, useEffect } from "react";
import styles from "./css/HowtoGuidePage.module.css";


const STEPS = [
  {
    number: "01",
    title: "Place on head",
    desc: "Gently place the MindWave band over your crown. The flexible frame is designed to expand organically, ensuring a secure yet soft pressure-free experience for any head shape.",
    imgSrc:
      "https://lh3.googleusercontent.com/aida/ADBb0ugkZaT0pvnaoJOOAHyh8Y_vVjPNSep4c-b_ftrspgbxYnc0QAvPB_P-gzR1W_bQKmiob3RmcKXDDXokNml-5D2aUJQnQCc4ooFNVC8HaPCPHRWO7js7rpnM1sGWagXuajPG0zQxtncjy3P9lkPUpw1pAh7whvpvAG_zYvGKo2Vhs8fmBRZ5GNfUtvtG1kITN7aqAklrzNfLe569U020mGKR09Lzu2HYmdtGc4sZEgEObulJ6WBUkwBBJ0jH2gZ4BG1kVGUfZWjxpn4",
    imgAlt: "Placement",
  },
  {
    number: "02",
    title: "Adjust sensor to forehead",
    desc: "The primary dry-sensor should rest comfortably against your forehead, just above the left eyebrow. This is the bridge between your external world and internal focus.",
    imgSrc:
      "https://lh3.googleusercontent.com/aida/ADBb0uip5Ofdvh5dwZve94EeV1FtB_iIMxzHNmaWYFw6UmCbV-pd7_nvpovRCZWhSMWq9Kx9IIUpXh_mK64t5IBvJw73cVo_vrqD2mg4LxTzspqhQgNunRXncL-ZCY9XJ2g_gLznz-GWIVg96V4ZtjwF2zaQwF914Lk4atFhMn38_htY_oPzDx8IqM4YuA6uqI3yqrVcnQdULCVJ08BhjJ7qZXHpZ0NRQw4K7IhNnhlioVO92S-6_IunW8HTskm7mkR0rVXofkadLCkKC_I",
    imgAlt: "Forehead Sensor",
  },
];


export default function MindWaveGuide() {
  // const [scrolled, setScrolled] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => setScrolled(window.scrollY > 20);
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  return (
    <div className={styles.root}>
      {/* ── Main Content ── */}
      <main className={styles.main}>
        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>How to Wear MindWave</h1>
          <p className={styles.heroDesc}>
            Achieving perfect brainwave synchronization begins with the right fit. Follow this brief guide to prepare
            your sanctuary for the session.
          </p>
        </header>

        {/* Bento Grid */}
        <div className={styles.grid}>
          {/* Device Card */}
          <div className={`${styles.card} ${styles.cardDevice}`}>
            <div className={styles.cardBody}>
              <div>
                <span className={styles.badge}>The Device</span>
                <h2 className={styles.cardTitle}>Precision Engineering</h2>
                <p className={styles.cardText}>
                  Our minimalist headset uses medical-grade sensors to map your neural rhythms with zero intrusive wires.
                </p>
              </div>
              <div className={styles.deviceImgWrap}>
                <img
                  src="https://lh3.googleusercontent.com/aida/ADBb0uivBBvSzcogKZprKrwXxJpY9rAaKaYgdaaFn3hbsv-yV7f8ZC2pOZWd2bF61D6simpPF7StZjtw41EUNIzZZ10ollf1iI0z6u9lut-70GiuF0v0ri4Oaa7YvAXkEJ0A6dhiS-1PaAg7qNgPAmi_P71_-r8th0THkPgKWCyYttnjmPALOmzwkbMgjFQUfgWIW3sSJpQgx14W6f51pPOu68eddDLcK7gtjTqUhrhJA1FVhmt6qD1ZapNDCx-vvwRbS21onuLOmE695Q"
                  alt="MindWave Device"
                  className={styles.deviceImg}
                />
              </div>
            </div>
          </div>

          {/* Step Cards (01, 02) */}
          {STEPS.map((step) => (
            <div key={step.number} className={`${styles.card} ${styles.cardStep}`}>
              <div className={styles.stepNum}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              <div className={styles.stepImgWrap}>
                <img src={step.imgSrc} alt={step.imgAlt} className={styles.stepImg} />
              </div>
            </div>
          ))}

          {/* Step 03 — Ear Clip */}
          <div className={`${styles.card} ${styles.cardEar}`}>
            <div className={styles.earText}>
              <div className={styles.stepNum}>03</div>
              <h3 className={styles.stepTitle}>Clip ear sensor</h3>
              <p className={styles.stepDesc}>
                Finally, attach the grounding clip to your left earlobe. Ensure direct skin contact for the most
                accurate bio-feedback during your meditation session.
              </p>
            </div>
            <div className={styles.earImgWrap}>
              <img
                src="https://lh3.googleusercontent.com/aida/ADBb0uiy_1rZfJAWp6ZMtUPWOeWVsSbeVVdD4SEHdBdEgWRMXDjH2G6WX1sSwiLVAlVNF0e4Er_k6vcTQxRh-mOw_EzSINsGvulFLUAAqcyo5JPJ-2j50ccDXXoFptD1pFk5C5JUOcA3NII_eaNZUWdjrwxo7ZQm21hHlEA8aGOYcg4QVmkhI0CyukD8aS-7i1enaIdoCaM1zLUINaxlb5GfWcVpyuOC-c1fXzl0j3LsBagR40VLoGswWIgLRnABTA1_0m_5xbTUiwIXwA"
                alt="Ear Sensor"
                className={styles.earImg}
              />
            </div>
          </div>
        </div>

        {/* CTA Glass Card */}
        <div className={styles.cta}>
          <div
            className={styles.ctaBg}
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida/ADBb0uiW4kxOk4Df3oxYAVgtB9SXd8nQCMaPUUQ4dWJonqvQzShceeGPypTz_4kAxC-9yRTYLjom8fiWw6qzNMANoWnnQqKKqGIS5-HtqOpOuiuS7yzuhPIygzCOX9rhESVrC4rlTLh_PLfUaRtjAMVyjFZqiR37hO4Hl08qb36Y2J4lZ-eS3I-z8fuA3yPj9esEBtsFkL9Dsa-o3liISNANoT4reDkqjN5yPPhutjILPGjjZu3AZBf9QJ0bzMbwyxRMtfknR2Fzol-HamQ")`,
            }}
          />
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Sync?</h2>
            <p className={styles.ctaDesc}>
              Once fitted, the MindWave will automatically detect your signal strength and begin the calibration
              process.
            </p>
            <button className={`${styles.btnPrimary} ${styles.btnLg}`}>Start Your Session</button>
          </div>
        </div>
      </main>

    </div>
  );
}