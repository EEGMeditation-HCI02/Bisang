import { useState, useEffect, useRef, useContext } from "react";
import styles from "./css/ProfilePage.module.css";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";
// 새로 추가된 컴포넌트 및 옵션 임포트
import AudioGuidanceModal from "../components/AudioGuidanceModal";
import { AUDIO_OPTIONS } from "../constants/audioOptions";

const FOCUS_OPTIONS = [
  {
    id: "self-esteem",
    label: "Self-esteem",
    desc: "Inner strength & confidence",
    iconBg: "rgba(224, 169, 175, 0.3)",
    iconColor: "#8D4956",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 10.5C9.5 10.5 7.5 8.5 7.5 6S9.5 1.5 12 1.5 16.5 3.5 16.5 6 14.5 10.5 12 10.5zm0-7C10.6 3.5 9.5 4.6 9.5 6s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5zM21 22.5h-2c0-3.6-2.9-6.5-6.5-6.5h-1c-3.6 0-6.5 2.9-6.5 6.5H3c0-4.7 3.8-8.5 8.5-8.5h1c4.7 0 8.5 3.8 8.5 8.5z" />
      </svg>
    ),
  },
];

export default function ProfilePage() {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 상태 관리 ──
  const [name, setName] = useState("Unknown User");
  const [age, setAge] = useState("");
  const [focus, setFocus] = useState("calm");
  const [avatarUrl, setAvatarUrl] = useState("/public/assets/default_profile.svg");
  const [streak, setStreak] = useState("42 Days");
  const [syncStatus, setSyncStatus] = useState("Active");
  const [isLoading, setIsLoading] = useState(false);

  // // Sanctuary Preferences
  // const [aural] = useState("Tibetan Bowls");

  // Audio Guidance 관련 상태 추가
  const [audio, setAudio] = useState("female-calm"); // 기본값 ID
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  // 현재 선택된 오디오의 라벨 찾기 (화면 표시용)
  const currentAudioLabel = AUDIO_OPTIONS.find(opt => opt.id === audio)?.label || "Select Audio";

  // ── 데이터 Fetching ──
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !supabase) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          // audio_guidance 추가
          .select("name, age_group, primary_focus, avatar_url, streak_days, sync_active, audio_guidance")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          if (data.name) setName(data.name);
          if (data.age_group) setAge(data.age_group);
          if (data.primary_focus) setFocus(data.primary_focus);
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
          if (data.streak_days !== null && data.streak_days !== undefined) setStreak(`${data.streak_days} Days`);
          if (data.sync_active !== null && data.sync_active !== undefined) setSyncStatus(data.sync_active ? "Active" : "Inactive");
          // DB에 오디오 세팅이 있으면 덮어쓰기
          if (data.audio_guidance) setAudio(data.audio_guidance);
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };

    fetchProfileData();
  }, [user]);

  // ── 프로필 정보 저장 로직 (수퍼베이스 연동) ──
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
          audio_guidance: audio, // audio_guidance 저장 추가
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

  // ── 이미지 업로드 로직 ──
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!supabase) {
      alert("데이터베이스(Supabase)가 연결되지 않았습니다. 환경변수 설정을 확인해주세요.");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarUrl(localPreviewUrl);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
    } catch (err: unknown) {
      console.error("Failed to upload image:", err);
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 에러";
      alert(`이미지 업로드에 실패했습니다.\n사유: ${errorMessage}`);
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
          {/* ── Column 1: DETAILS COLUMN (Personal Details & Sanctuary) ── */}
          <div className={styles.detailsColumn}>
            <h2 className={styles.columnTitle}>Personal Details</h2>

            <div className={styles.formGroup}>
              {/* Identity Card (Name & Age) */}
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

              {/* Sanctuary Preferences Card */}
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
                  {/* <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <div className={styles.preferenceName}>Aural Atmosphere</div>
                      <div className={styles.preferenceSelected}>Selected: {aural}</div>
                    </div>
                    <svg className={styles.chevronRight} width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div> */}

                  {/* Audio Guidance 팝업 오픈을 위한 클릭 이벤트 연결 */}
                  <div className={styles.preferenceRow} onClick={() => setIsAudioModalOpen(true)}>
                    <div className={styles.preferenceInfo}>
                      <div className={styles.preferenceName}>Audio Guidance</div>
                      <div className={styles.preferenceSelected}>Selected: {currentAudioLabel}</div>
                    </div>
                    <svg className={styles.chevronRight} width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Column 2: FOCUS COLUMN (Primary Focus) ── */}
          <div className={styles.focusColumn}>
            {/* Primary Focus Card (6 items) */}
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
          </div>

          {/* ── Column 3: PROFILE COLUMN (Profile Card & Save) ── */}
          <div className={styles.profileColumn}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrap}>
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className={styles.avatarImg}
                />
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

            <div className={styles.actionDivider} />

            <button
              className={styles.btnSave}
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </main>

      {/* Audio Guidance Modal */}
      <AudioGuidanceModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        currentSelection={audio}
        onSelect={(newAudio) => setAudio(newAudio)}
      />
    </div>
  );
}