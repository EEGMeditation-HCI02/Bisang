import { useEffect, useRef, useContext } from "react";
//import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";
import type { BrainwaveMetrics } from "./useMeditationLLM";

interface SaveReportParams {
  isFinished: boolean;
  durationMin: number;
  totalRounds: number;
  theme: string;
  unstableCount: number;           // useMotionStability의 unstableCount
  brainwaveMetrics: BrainwaveMetrics; // { attention, meditation, signal }
  onSaved?: () => void;
}

export function useSaveMeditationReport({
  isFinished,
  durationMin,
  totalRounds,
  theme,
  unstableCount,
  brainwaveMetrics,
  onSaved,
}: SaveReportParams) {
  const { user } = useContext(UserContext);
  const savedRef = useRef(false); // 중복 저장 방지

  useEffect(() => {
    if (!isFinished || savedRef.current || !user || !supabase) return;
    savedRef.current = true;

    const save = async () => {
      try {
        const totalMinutes = durationMin * totalRounds;

        // ── 점수 계산 ──────────────────────────────────────────
        // 기본 70점
        // + 안정도 보정: 자세 흐트러짐이 적을수록 최대 +20
        // + 뇌파 명상도 보정: meditation 값이 높을수록 최대 +10
        const stabilityBonus = Math.max(0, 20 - unstableCount * 2);
        const meditationBonus = Math.min(
          10,
          Math.round((brainwaveMetrics.meditation / 100) * 10)
        );
        const score = Math.min(100, Math.max(0, 70 + stabilityBonus + meditationBonus));

        // ── total_duration ──────────────────────────────────────
        // ReportPage의 /(\d+)m/ 파싱에 맞는 형식
        const total_duration = `${totalMinutes}m 0s`;

        // ── trend ──────────────────────────────────────────────
        const trend =
          score >= 80 ? "Great session" :
          score >= 60 ? "Good progress" :
          "Keep going";

        // ── current_streak ─────────────────────────────────────
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        const { data: yesterdayData } = await supabase
          .from("meditation_reports")
          .select("current_streak")
          .eq("user_id", user.id)
          .gte("created_at", `${yesterday}T00:00:00`)
          .lt("created_at", `${today}T00:00:00`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const prevStreak = yesterdayData?.current_streak
          ? parseInt(String(yesterdayData.current_streak).replace(/[^0-9]/g, ""), 10)
          : 0;
        const current_streak = `${prevStreak + 1} Days`;

        // ── graph_data: 오늘 포함 7일치 ────────────────────────
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data: pastData } = await supabase
          .from("meditation_reports")
          .select("created_at, total_duration")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        const daysMap = new Map<string, { day: string; minutes: number }>();
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const dayName = d
            .toLocaleDateString("en-US", { weekday: "short" })
            .toUpperCase();
          daysMap.set(dateStr, { day: dayName, minutes: 0 });
        }

        (pastData ?? []).forEach((row) => {
          const rowDate = new Date(row.created_at).toISOString().split("T")[0];
          if (daysMap.has(rowDate)) {
            const minMatch = row.total_duration?.match(/(\d+)m/);
            const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
            daysMap.get(rowDate)!.minutes += mins;
          }
        });

        // 오늘 치 추가
        if (daysMap.has(today)) {
          daysMap.get(today)!.minutes += totalMinutes;
        }

        const rawDays = Array.from(daysMap.values());
        const maxMins = Math.max(...rawDays.map((d) => d.minutes), 30);
        const graph_data = rawDays.map((d) => ({
          day: d.day,
          minutes: d.minutes,
          height: `${Math.max(10, Math.round((d.minutes / maxMins) * 100))}%`,
        }));

        // ── AI 피드백 (Claude API) ──────────────────────────────
        let ai_pattern =
          `Your ${theme} session showed consistent engagement with ${score}% stability.`;
        let ai_recommendation =
          `Continue with ${durationMin}-minute sessions to deepen your ${theme} practice.`;

        try {
          const aiPrompt = `Meditation session summary:
- Theme: ${theme}
- Total time: ${totalMinutes} minutes (${durationMin}min × ${totalRounds} rounds)
- Score: ${score}/100
- Posture disruptions: ${unstableCount} times
- Brainwave attention: ${brainwaveMetrics.attention}/100
- Brainwave meditation: ${brainwaveMetrics.meditation}/100
- Signal quality: ${brainwaveMetrics.signal} (0=best, 200=worst)

Based on this data, write a 1-2 sentence pattern observation and a 1-2 sentence recommendation.
Respond ONLY as JSON: {"pattern": "...", "recommendation": "..."}`;

          const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 300,
              messages: [{ role: "user", content: aiPrompt }],
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const text = aiData.content?.[0]?.text ?? "";
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.pattern)       ai_pattern       = parsed.pattern;
              if (parsed.recommendation) ai_recommendation = parsed.recommendation;
            }
          }
        } catch (e) {
          // AI 피드백 실패해도 저장 진행
          console.warn("AI feedback skipped:", e);
        }

        // ── Supabase INSERT ─────────────────────────────────────
        const { error } = await supabase.from("meditation_reports").insert({
          user_id:             user.id,
          score,
          trend,
          total_duration,
          sessions_completed:  totalRounds,
          current_streak,
          graph_data,
          ai_pattern,
          ai_recommendation,
          created_at:          new Date().toISOString(),
        });

        if (error) throw error;
        console.log("✅ Meditation report saved");
      } catch (err) {
        console.error("❌ Save failed:", err);
      } finally {
        // 저장 성공·실패 모두 콜백 호출 (페이지 이동)
        onSaved?.();
      }
    };

    save();
  }, [isFinished]); // isFinished 변화 시 딱 한 번
}