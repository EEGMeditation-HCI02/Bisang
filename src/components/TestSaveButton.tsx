import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";

/**
 * 개발용 테스트 컴포넌트
 * MeditationPage 아무 곳에나 <TestSaveButton /> 추가하면 됨
 * 확인 후 삭제
 */
export default function TestSaveButton() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleTest = async () => {
    if (!user || !supabase) {
      alert("Login required or Supabase is disconnected");
      return;
    }

    // ── Mock Test Data ──────────────────────────────
    const totalMinutes = 12; // 3 min × 4 rounds
    const score = 85;

    // Today inclusive 7-day dummy graph_data
    const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
    const graph_data = days.map((day, i) => ({
      day,
      minutes: i === 6 ? totalMinutes : Math.floor(Math.random() * 20),
      height: i === 6 ? "80%" : `${10 + Math.floor(Math.random() * 60)}%`,
    }));

    const graph_payload = {
      weekly_graph: graph_data,
      session_detail: {
        postureScore: 92,
        eyeClosedMs: 10 * 60 * 1000 + 15 * 1000, // 10m 15s
        eyeOpenMs: 1 * 60 * 1000 + 45 * 1000, // 1m 45s
        badPostureRatio: 0.08,
        blinkCount: 18,
        durationMs: 12 * 60 * 1000,
        unstableCount: 3,
        attentionAvg: 78,
        meditationAvg: 82,
        score: 85,
      }
    };

    const payload = {
      user_id:            user.id,
      score,
      trend:              "Great session",
      total_duration:     `${totalMinutes}m 0s`,
      sessions_completed: 4,
      current_streak:     "1 Days",
      graph_data:         graph_payload,
      ai_pattern:         "Your calm session showed steady alpha wave engagement throughout all 4 rounds.",
      ai_recommendation:  "Try extending to 5-minute rounds to deepen your focus state.",
      created_at:         new Date().toISOString(),
    };

    console.log("📤 Data to save:", payload);

    const { data, error } = await supabase
      .from("meditation_reports")
      .insert(payload)
      .select(); // verification

    if (error) {
      console.error("❌ Save failed:", error);
      alert(`Save failed: ${error.message}`);
    } else {
      console.log("✅ Save successful:", data);
      alert("Saved successfully! Redirecting to Reports page.");
      navigate("/reports", { state: { isJustFinished: true, theme: "focus" } });
    }
  };

  return (
    <button
      onClick={handleTest}
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        background: "#755c1c",
        color: "#fff8f0",
        border: "none",
        borderRadius: "9999px",
        padding: "0.75rem 1.5rem",
        fontWeight: 700,
        fontSize: "0.875rem",
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(117,92,28,0.3)",
      }}
    >
      🧪 Test Save
    </button>
  );
}