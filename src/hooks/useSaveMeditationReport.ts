import { useEffect, useRef, useContext } from "react";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";
import type { SessionDetail } from "../store/useMeditationStore";

interface SaveReportParams {
  isFinished: boolean;
  durationMin: number;
  totalRounds: number;
  theme: string;
  sessionDetail: SessionDetail | null;
  onSaved?: () => void;
}

export function useSaveMeditationReport({
  isFinished,
  durationMin,
  totalRounds,
  theme,
  sessionDetail,
  onSaved,
}: SaveReportParams) {
  const { user } = useContext(UserContext);
  const savedRef = useRef(false); // 중복 저장 방지

  useEffect(() => {
    // isFinished가 참이고 sessionDetail이 준비되었을 때 진행
    if (!isFinished || !sessionDetail || savedRef.current || !user || !supabase) return;
    savedRef.current = true;

    const save = async () => {
      try {
        const totalMinutes = durationMin * totalRounds;
        const score = sessionDetail.score;

        // ── total_duration ──────────────────────────────────────
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

        const { data: yesterdayData } = await supabase!
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

        const { data: pastData } = await supabase!
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
        const weeklyGraph = rawDays.map((d) => ({
          day: d.day,
          minutes: d.minutes,
          height: `${Math.max(10, Math.round((d.minutes / maxMins) * 100))}%`,
        }));

        // ── AI 피드백 (Gemini API) ──────────────────────────────
        let ai_pattern =
          `이번 ${theme} 명상 세션에서 ${score}%의 안정도를 보여주셨습니다.`;
        let ai_recommendation =
          `자세를 편안하게 유지하고, ${durationMin}분씩 꾸준히 명상을 이어가 보세요.`;

        const apiKey = import.meta.env.VITE_AI_API_KEY;
        if (apiKey) {
          try {
            const eyeClosedRatioPercent = sessionDetail.durationMs > 0
              ? Math.round((sessionDetail.eyeClosedMs / sessionDetail.durationMs) * 100)
              : 80;

            const aiPrompt = `Meditation session summary:
- Theme: ${theme} (명상 테마)
- Total time: ${totalMinutes} minutes
- Composite Score: ${score}/100 (종합 명상 점수)
- Posture score: ${sessionDetail.postureScore}/100 (자세 안정성 점수)
- Posture disruptions: ${sessionDetail.unstableCount} times (자세 흐트러짐 횟수)
- Eye closed duration ratio: ${eyeClosedRatioPercent}% (눈감음 비율)
- Blinks count: ${sessionDetail.blinkCount} times (눈 깜빡임 횟수)
- Brainwave attention: ${sessionDetail.attentionAvg}/100 (집중도 평균)
- Brainwave meditation: ${sessionDetail.meditationAvg}/100 (명상도 평균)

Based on this data, write a 1-2 sentence pattern observation ("pattern") and a 1-2 sentence recommendation ("recommendation") in Korean.
For pattern, focus on their brainwave stability, posture consistency, and eye closure.
For recommendation, give actionable tips to improve focus or relaxation.
Respond ONLY as JSON: {"pattern": "...", "recommendation": "..."}`;

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: aiPrompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 500,
                  responseMimeType: "application/json",
                },
              }),
            });

            if (response.ok) {
              const resData = await response.json();
              const text = resData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.pattern)       ai_pattern       = parsed.pattern;
                if (parsed.recommendation) ai_recommendation = parsed.recommendation;
              }
            }
          } catch (e) {
            console.warn("❌ Gemini feedback creation failed:", e);
          }
        }

        // ── Supabase INSERT ─────────────────────────────────────
        const graph_payload = {
          weekly_graph: weeklyGraph,
          session_detail: sessionDetail,
        };

        const { error } = await supabase!.from("meditation_reports").insert({
          user_id:             user.id,
          score,
          trend,
          total_duration,
          sessions_completed:  totalRounds,
          current_streak,
          graph_data:          graph_payload,
          ai_pattern,
          ai_recommendation,
          created_at:          new Date().toISOString(),
        });

        if (error) throw error;
        console.log("✅ Meditation report saved successfully");
      } catch (err) {
        console.error("❌ Save failed:", err);
      } finally {
        onSaved?.();
      }
    };

    save();
  }, [isFinished, sessionDetail]);
}