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
      alert("로그인 필요 or supabase 미연결");
      return;
    }

    // ── 임의 테스트 데이터 ──────────────────────────────
    const totalMinutes = 12; // 3분 × 4라운드
    const score = 85;
    //const today = new Date().toISOString().split("T")[0];

    // 오늘 포함 7일 graph_data 더미
    const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
    const graph_data = days.map((day, i) => ({
      day,
      minutes: i === 6 ? totalMinutes : Math.floor(Math.random() * 20),
      height: i === 6 ? "80%" : `${10 + Math.floor(Math.random() * 60)}%`,
    }));

    const payload = {
      user_id:            user.id,
      score,
      trend:              "Great session",
      total_duration:     `${totalMinutes}m 0s`,
      sessions_completed: 4,
      current_streak:     "1 Days",
      graph_data,
      ai_pattern:         "Your calm session showed steady alpha wave engagement throughout all 4 rounds.",
      ai_recommendation:  "Try extending to 5-minute rounds to deepen your focus state.",
      created_at:         new Date().toISOString(),
    };

    console.log("📤 저장할 데이터:", payload);

    const { data, error } = await supabase
      .from("meditation_reports")
      .insert(payload)
      .select(); // 저장된 row 확인용

    if (error) {
      console.error("❌ 저장 실패:", error);
      alert(`저장 실패: ${error.message}`);
    } else {
      console.log("✅ 저장 성공:", data);
      alert("저장 성공! Reports 페이지로 이동합니다.");
      navigate("/reports", { state: { isJustFinished: true } });
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
      🧪 테스트 저장
    </button>
  );
}