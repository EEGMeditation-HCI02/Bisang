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
    // Proceed once the session is finished and sessionDetail is available
    if (!isFinished || !sessionDetail || savedRef.current) return;
    savedRef.current = true;

    const save = async () => {
      try {
        if (!user || !supabase) {
          console.warn("⚠️ User not logged in or Supabase not connected. Skipping DB save, redirecting to reports.");
          return;
        }

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

        // ── AI Feedback (Gemini API) ──────────────────────────────
        let ai_pattern =
          `You achieved a meditation score of ${score} points in this ${theme} meditation session.`;
        let ai_recommendation =
          `Try to maintain a comfortable posture and continue meditating for ${durationMin} minutes consistently.`;

        const apiKey = import.meta.env.VITE_AI_API_KEY;
        if (apiKey) {
          try {
            const eyeClosedRatioPercent = sessionDetail.durationMs > 0
              ? Math.round((sessionDetail.eyeClosedMs / sessionDetail.durationMs) * 100)
              : 80;

            const aiPrompt = `Meditation session summary:
- Theme: ${theme} (Meditation Theme)
- Total time: ${totalMinutes} minutes
- Composite Score: ${score}/100 (Overall Meditation Score)
- Posture score: ${sessionDetail.postureScore}/100 (Posture Stability Score)
- Posture disruptions: ${sessionDetail.unstableCount} times (Posture Disruptions)
- Eye closed duration ratio: ${eyeClosedRatioPercent}% (Eye Closure Ratio)
- Blinks count: ${sessionDetail.blinkCount} times (Blink Count)
- Brainwave attention: ${sessionDetail.attentionAvg}/100 (Attention Average)
- Brainwave meditation: ${sessionDetail.meditationAvg}/100 (Meditation Average)

Based on this data, write a 1-2 sentence pattern observation ("pattern") and a 1-2 sentence recommendation ("recommendation") in English.
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
  }, [isFinished, sessionDetail, user, supabase, durationMin, totalRounds, theme, onSaved]);
}