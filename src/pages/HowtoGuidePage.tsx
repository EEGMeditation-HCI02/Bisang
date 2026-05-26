// import { useState, useEffect } from "react";
import styles from "./css/HowtoGuidePage.module.css";


const STEPS = [
  {
    number: "01",
    title: "Place on head",
    desc: "Gently place the MindWave band over your crown. The flexible frame is designed to expand organically, ensuring a secure yet soft pressure-free experience for any head shape.",
    imgSrc: "/public/assets/mindwave_step1.png",
    imgAlt: "Placement",
  },
  {
    number: "02",
    title: "Adjust sensor to forehead",
    desc: "The primary dry-sensor should rest comfortably against your forehead, just above the left eyebrow. This is the bridge between your external world and internal focus.",
    imgSrc: "/public/assets/mindwave_step2.png",
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
                  src="/public/assets/mindwave_device.png"
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
                src="/public/assets/mindwave_step3.png"
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
              backgroundImage: `url("/public/assets/mindwave_cta_bg.png")`,
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