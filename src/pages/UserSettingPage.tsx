import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/userContextHelpers";

import styles from "./css/UserSettingPage.module.css";

const AGE_OPTIONS = ["18-24", "25-34", "35-44", "45-54", "55+"];

const FOCUS_OPTIONS = [
  {
    id: "self-esteem",
    label: "Self-esteem",
    desc: "Inner strength & confidence",
    iconBg: "rgba(224, 169, 175, 0.3)",
    iconColor: "#8D4956",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
  },
  {
    id: "relationships",
    label: "Relationships",
    desc: "Empathy & connection",
    iconBg: "rgba(238, 193, 160, 0.3)",
    iconColor: "#935126",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    id: "rest",
    label: "Rest",
    desc: "Deep relaxation & recovery",
    iconBg: "rgba(253, 191, 147, 0.3)",
    iconColor: "#835431",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.12 2.05a9.913 9.913 0 0 0-2.83 14.45 9.913 9.913 0 0 0 14.45-2.83c.42-1 .09-2.16-.8-2.75l-.1-.06a8.013 8.013 0 0 1-10.71-10.71l-.06-.1c-.59-.89-1.75-1.22-2.75-.8z" />
      </svg>
    ),
  },
  {
    id: "focus",
    label: "Focus",
    desc: "High-performance flow states",
    iconBg: "rgba(244, 224, 187, 0.3)",
    iconColor: "#6B5D40",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
      </svg>
    ),
  },
  {
    id: "calm",
    label: "Calm",
    desc: "Tranquility & peace",
    iconBg: "rgba(182, 210, 182, 0.3)",
    iconColor: "#426742",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c-1.2 5.4-5 7.42-5 11a5 5 0 0 0 10 0c0-3.58-3.8-5.6-5-11zm0 15.5c-1.1 0-2-.9-2-2 0-.55.22-1.05.59-1.41L12 13.67l1.41 1.42c.37.36.59.86.59 1.41 0 1.1-.9 2-2 2z" />
      </svg>
    ),
  },
  {
    id: "free",
    label: "Free",
    desc: "Unstructured mindfulness",
    iconBg: "rgba(185, 201, 222, 0.3)",
    iconColor: "#445973",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 10.5C9.5 10.5 7.5 8.5 7.5 6S9.5 1.5 12 1.5 16.5 3.5 16.5 6 14.5 10.5 12 10.5zm0-7C10.6 3.5 9.5 4.6 9.5 6s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5zM21 22.5h-2c0-3.6-2.9-6.5-6.5-6.5h-1c-3.6 0-6.5 2.9-6.5 6.5H3c0-4.7 3.8-8.5 8.5-8.5h1c4.7 0 8.5 3.8 8.5 8.5z" />
      </svg>
    ),
  },
];

export default function UserSettingPage() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [focus, setFocus] = useState("");

  const navigate = useNavigate();
  const handleSave = async () => {
    console.log("에이 설마");
    if (!user) return;
    console.log("button clicked!");
    console.log("user:", user.id);
    if (!supabase) return;

    const { error, data } = await supabase
      .from("profiles")
      .upsert({ id: user.id, name, age_group: age, primary_focus: focus });
    console.log("upsert result:", { error, data });

    if (error) {
      alert("Save failed: " + error.message);
    } else {
      alert("Save completed!");
      navigate("/dashboard");
    }
  };

  return (
    <div className={styles.root}>
      {/* Decorative blobs */}
      <div className={styles.blobTopRight} />
      <div className={styles.blobBottomLeft} />

      <div className={styles.layout}>
        {/* ── Right: Form ── */}
        <div className={styles.formCol}>
          {/* Step indicator */}
          <div className={styles.stepRow}>
            <h1 className={styles.formTitle}>Personal Details</h1>
          </div>

          <div className={styles.form}>
            {/* ── Card 1: Identity ── */}
            <div className={styles.card}>
              <label className={styles.fieldBlock}>
                <span className={styles.fieldLabel}>Preferred Name</span>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="How should we address you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className={styles.fieldBlock}>
                <span className={styles.fieldLabel}>Age Group</span>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  >
                    <option value="">Select your age range</option>
                    {AGE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {/* Chevron icon */}
                  <svg
                    className={styles.selectChevron}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </label>
            </div>

            {/* ── Card 2: Primary Focus ── */}
            <div className={styles.card}>
              <span className={styles.fieldLabel}>Primary Focus</span>
              <div className={styles.radioList}>
                {FOCUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`${styles.radioRow} ${focus === opt.id ? styles.radioRowActive : ""}`}
                    onClick={() => setFocus(opt.id)}
                  >
                    <div className={styles.radioLeft}>
                      <div
                        className={styles.radioIcon}
                        style={{ background: opt.iconBg, color: opt.iconColor }}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <div className={styles.radioLabel}>{opt.label}</div>
                        <div className={styles.radioDesc}>{opt.desc}</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="focus"
                      className={styles.radioInput}
                      checked={focus === opt.id}
                      onChange={() => setFocus(opt.id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* ── CTA ── */}
            <button
              className={styles.btnContinue}
              type="button"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
