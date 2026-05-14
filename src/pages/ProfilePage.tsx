import { useState, useEffect, useRef, useContext } from "react";
import styles from "./css/ProfilePage.module.css";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";

const FOCUS_OPTIONS = [
  {
    id: "meditation",
    label: "Meditation",
    desc: "Deep resonance & mindfulness",
    iconBg: "rgba(255, 220, 143, 0.3)",
    iconColor: "#755C1C",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c-1.2 5.4-5 7.42-5 11a5 5 0 0 0 10 0c0-3.58-3.8-5.6-5-11zm0 15.5c-1.1 0-2-.9-2-2 0-.55.22-1.05.59-1.41L12 13.67l1.41 1.42c.37.36.59.86.59 1.41 0 1.1-.9 2-2 2z" />
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.12 2.05a9.913 9.913 0 0 0-2.83 14.45 9.913 9.913 0 0 0 14.45-2.83c.42-1 .09-2.16-.8-2.75l-.1-.06a8.013 8.013 0 0 1-10.71-10.71l-.06-.1c-.59-.89-1.75-1.22-2.75-.8z" />
      </svg>
    ),
  },
];

export default function ProfilePage() {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 더미데이터 ──
  const [name, setName] = useState("Unknown User");
  const [age, setAge] = useState("");
  const [focus, setFocus] = useState("meditation");
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80");
  const [streak, setStreak] = useState("42 Days");
  const [syncStatus, setSyncStatus] = useState("Active");
  const [isLoading, setIsLoading] = useState(false);

  // Sanctuary Preferences - 일단 보류 나중에 구현 예정
  const [aural] = useState("Tibetan Bowls");
  const [audio] = useState("Minimalist Light");

  // ── 데이터 Fetching ──
  useEffect(() => {

    const fetchProfileData = async () => {
      if (!user || !supabase) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, age_group, primary_focus, avatar_url, streak_days, sync_active")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          // DB에 값이 존재할 경우에만 상태 업데이트 (없으면 기존 더미 데이터 유지)
          if (data.name) setName(data.name);
          if (data.age_group) setAge(data.age_group);
          if (data.primary_focus) setFocus(data.primary_focus);
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
          if (data.streak_days !== null && data.streak_days !== undefined) setStreak(`${data.streak_days} Days`);
          if (data.sync_active !== null && data.sync_active !== undefined) setSyncStatus(data.sync_active ? "Active" : "Inactive");
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };

    fetchProfileData();
  }, [user]);

  // ── 프로필 정보 저장 로직 ──
  const handleSaveProfile = async () => {
    if (!user || !supabase) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name,
          age_group: age,
          primary_focus: focus,
        })
        .eq("id", user.id);

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Error saving profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── 이미지 로컬 선택 및 Supabase 업로드 로직 ──
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // 파일이 없거나, 유저 정보가 없거나, 수퍼베이스 연결이 안 되어있으면 중단
    if (!file || !user) return;
    if (!supabase) {
      alert("데이터베이스(Supabase)가 연결되지 않았습니다. 환경변수 설정을 확인해주세요.");
      return;
    }

    // 1. 선택 즉시 로컬 미리보기 적용
    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarUrl(localPreviewUrl);

    try {
      // 2. Supabase Storage 에 업로드
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // 4. profiles 테이블의 avatar_url 업데이트
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // DB URL로 최종 확정
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      alert(`이미지 업로드에 실패했습니다.\n사유: ${err?.message || "알 수 없는 에러"}`);
    }
  };

  return (
    <div className={styles.root}>
      <main className={styles.main}>
        {/* ── Page Header ── */}
        <header className={styles.header}>
          <h1 className={styles.title}>Profile & Settings</h1>
          <p className={styles.subtitle}>
            Manage your personalized meditation experience, neuro-data
            synchronization, and sanctuary preferences.
          </p>
        </header>

        {/* ── Bento Grid Layout ── */}
        <div className={styles.grid}>
          {/* ── Column 1: Profile Card ── */}
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrap}>
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className={styles.avatarImg}
                />

                {/* 숨겨진 File Input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />

                <button
                  className={styles.editBtn}
                  aria-label="Edit Profile Image"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
              </div>
              <h2 className={styles.profileName}>{name}</h2>
              <p className={styles.profileRole}>Master Practitioner • 428 Hours</p>
            </div>

            <div className={styles.statsDivider} />

            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>STREAK</span>
                <span className={styles.statValue}>{streak}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>SYNC</span>
                <span className={styles.statValue}>{syncStatus}</span>
              </div>
            </div>
          </div>

          {/* ── Column 2: Personal Details ── */}
          <div className={styles.personalColumn}>
            <h2 className={styles.columnTitle}>Personal Details</h2>

            {/* Form */}
            <div className={styles.formGroup}>
              {/* Identity Card */}
              <div className={styles.card}>
                <label className={styles.fieldBlock}>
                  <span className={styles.fieldLabel}>PREFERRED NAME</span>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="User Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label className={styles.fieldBlock}>
                  <span className={styles.fieldLabel}>AGE GROUP</span>
                  <div className={styles.selectWrap}>
                    <select
                      className={styles.select}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    >
                      <option value="" disabled>Select your age range</option>
                      <option value="18-24">18-24</option>
                      <option value="25-34">25-34</option>
                      <option value="35-44">35-44</option>
                      <option value="45-54">45-54</option>
                      <option value="55+">55+</option>
                    </select>
                    <svg className={styles.selectChevron} width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </label>
              </div>

              {/* Primary Focus Card */}
              <div className={styles.card}>
                <span className={styles.fieldLabel}>PRIMARY FOCUS</span>
                <div className={styles.radioList}>
                  {FOCUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`${styles.radioRow} ${focus === opt.id ? styles.radioRowActive : ""}`}
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

              {/* Save Button */}
              <button
                className={styles.btnSave}
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* ── Column 3: Sanctuary Preferences ── */}
          <div className={styles.sanctuaryColumn}>
            <div className={styles.card}>
              <div className={styles.sanctuaryHeader}>
                <div className={styles.sanctuaryIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c4-4 8-9 8-14a8 8 0 1 0-16 0c0 5 4 10 8 14z" />
                    <path d="M12 22V12" />
                    <path d="M12 12c-2-2-4-2-6-1" />
                    <path d="M12 12c2-2 4-2 6-1" />
                  </svg>
                </div>
                <h3 className={styles.sanctuaryTitle}>Sanctuary<br />Preferences</h3>
              </div>

              <div className={styles.preferencesList}>
                {/* Aural Atmosphere */}
                <div className={styles.preferenceRow}>
                  <div className={styles.preferenceInfo}>
                    <div className={styles.preferenceName}>Aural Atmosphere</div>
                    <div className={styles.preferenceSelected}>Selected: {aural}</div>
                  </div>
                  <svg className={styles.chevronRight} width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Audio Guidance */}
                <div className={styles.preferenceRow}>
                  <div className={styles.preferenceInfo}>
                    <div className={styles.preferenceName}>Audio Guidance</div>
                    <div className={styles.preferenceSelected}>Selected: {audio}</div>
                  </div>
                  <svg className={styles.chevronRight} width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}