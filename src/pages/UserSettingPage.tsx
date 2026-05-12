import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/userContextHelpers";

import styles from "./css/UserSettingPage.module.css";

const AGE_OPTIONS = ["18-24", "25-34", "35-44", "45-54", "55+"];

const FOCUS_OPTIONS = [
  {
    id: "meditation",
    label: "Meditation",
    desc: "Deep resonance & mindfulness",
    iconBg: "rgba(255, 220, 143, 0.3)",
    iconColor: "#755c1c",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c-1.2 5.4-5 7.42-5 11a5 5 0 0 0 10 0c0-3.58-3.8-5.6-5-11zm0 15.5c-1.1 0-2-.9-2-2 0-.55.22-1.05.59-1.41L12 13.67l1.41 1.42c.37.36.59.86.59 1.41 0 1.1-.9 2-2 2z" />
      </svg>
    ),
  },
  {
    id: "focus",
    label: "Focus",
    desc: "High-performance flow states",
    iconBg: "rgba(244, 224, 187, 0.3)",
    iconColor: "#6b5d40",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
      </svg>
    ),
  },
  {
    id: "sleep",
    label: "Sleep",
    desc: "Restorative nocturnal cycles",
    iconBg: "rgba(253, 191, 147, 0.3)",
    iconColor: "#835431",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.12 2.05a9.913 9.913 0 0 0-2.83 14.45 9.913 9.913 0 0 0 14.45-2.83c.42-1 .09-2.16-.8-2.75l-.1-.06a8.013 8.013 0 0 1-10.71-10.71l-.06-.1c-.59-.89-1.75-1.22-2.75-.8z" />
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
      alert("저장 실패: " + error.message);
    } else {
      alert("저장 완료!");
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
