import { useState, useEffect, useContext } from "react";
import styles from "./css/SessionReportPage.module.css";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";

interface SessionReportPageProps {
  toggleNode?: React.ReactNode;
  hideHeader?: boolean;
}

interface ReportData {
  score: number;
  trend: string;
  total_duration: string;
  sessions_completed: number;
  current_streak: string;
  ai_pattern: string;
  ai_recommendation: string;
  created_at: string;
}

// "12m 0s" / "4h 12m" → { display: "12m 0s", totalMins: 12 }
function parseDuration(raw: string | undefined) {
  if (!raw) return { display: "—", totalMins: 0, secs: 0 };
  const hMatch   = raw.match(/(\d+)h/);
  const minMatch = raw.match(/(\d+)m/);
  const secMatch = raw.match(/(\d+)s/);
  const hours  = hMatch   ? parseInt(hMatch[1],   10) : 0;
  const mins   = minMatch ? parseInt(minMatch[1], 10) : 0;
  const secs   = secMatch ? parseInt(secMatch[1], 10) : 0;
  const totalMins = hours * 60 + mins;
  return { display: `${totalMins}m ${secs}s`, totalMins, secs };
}

export default function SessionReportPage({ toggleNode, hideHeader }: SessionReportPageProps) {
  const { user } = useContext(UserContext);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) { setIsLoading(false); return; }

    const fetch = async () => {
        try {
        const { data, error } = await supabase
            .from("meditation_reports")
            .select("score, trend, total_duration, sessions_completed, current_streak, ai_pattern, ai_recommendation, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (!error && data) setReport(data);
        else if (error?.code !== "PGRST116") console.error("Report fetch error:", error);
        } catch (err) {
        console.error("Unexpected error:", err);
        } finally {
        setIsLoading(false); // ✅ async/await의 finally는 정상 동작
        }
    };

    fetch();
    }, [user]);

  const reportDate = report?.created_at
    ? new Date(report.created_at).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });

  const score     = report?.score    ?? 0;
  const duration  = parseDuration(report?.total_duration);
  const aiInsight = report?.ai_recommendation ?? "Complete a session to see your personalized insights.";
  const aiPattern = report?.ai_pattern        ?? "";
  const streak    = report?.current_streak
    ? parseInt(report.current_streak.replace(/[^0-9]/g, ""), 10)
    : 0;

  const headerContent = hideHeader ? null : (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.title}>Today's Cognitive Resonance</h1>
        <p className={styles.subtitle}>
          Your immediate neural reflection. Analyze your recent session's depth and stillness.
        </p>
      </div>
      <div className={styles.headerRight}>
        {toggleNode ?? (
          <div className={styles.metaInfo}>
            <p className={styles.date}>{reportDate}</p>
            <p className={styles.sessionTheme}>{report?.trend ?? ""}</p>
          </div>
        )}
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <>
        {headerContent}
        <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
          Loading your reflection...
        </div>
      </>
    );
  }

  if (!report) {
    return (
      <>
        {headerContent}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: "12px" }}>
          <p style={{ fontSize: "1.125rem", color: "#625f57" }}>No session data yet.</p>
          <p style={{ fontSize: "0.875rem", color: "#a39a91" }}>
            Complete a meditation session to see your report here.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {headerContent}

      <div className={styles.grid}>
        {/* ── Score ── */}
        <div className={styles.scoreCard}>
          <p className={styles.subLabel}>MEDITATION SCORE</p>
          <div className={styles.scoreVisual}>
            <h2 className={styles.scoreValue}>{score}%</h2>
            <p className={styles.scoreLabel}>STABILITY</p>
          </div>
        </div>

        {/* ── AI Insight ── */}
        <div className={styles.insightCard}>
          <div>
            <div className={styles.insightHeader}>
              <div className={styles.insightIconWrap}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                </svg>
              </div>
              <h3 className={styles.insightTitle}>Insights from Bibi</h3>
            </div>

            {/* ai_pattern */}
            {aiPattern && (
              <p className={styles.insightPattern}>
                <span className={styles.patternBadge}>PATTERN</span> {aiPattern}
              </p>
            )}

            {/* ai_recommendation */}
            <p className={styles.insightText}>{aiInsight}</p>
          </div>

          <img
            className={styles.insightImage}
            src="/public/assets/meditation_bg.jpg"
            alt="Meditation insight visual"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23e2dcd0'/%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* ── Metrics ── */}
        <div className={styles.metricsCol}>
          {/* Average Focus = score */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <svg className={styles.metricIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
              </svg>
              <span className={styles.metricTag}>CONSISTENCY</span>
            </div>
            <p className={styles.metricTitle}>Average Focus</p>
            <div className={styles.metricValueWrap}>
              <p className={styles.metricValue}>{score}</p>
              <span className={styles.metricUnit}>%</span>
            </div>
          </div>

          {/* Focus Duration */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <svg className={styles.metricIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className={styles.metricTag}>TIME</span>
            </div>
            <p className={styles.metricTitle}>Focus Duration</p>
            <div className={styles.metricValueWrap}>
              <p className={styles.metricValue}>{duration.totalMins}</p>
              <span className={styles.metricUnit}>m</span>
              <p className={styles.metricValue} style={{ marginLeft: "8px" }}>{duration.secs}</p>
              <span className={styles.metricUnit}>s</span>
              <span style={{ fontSize: "14px", color: "#625F57", marginLeft: "auto", fontWeight: "bold" }}>
                / {duration.display}
              </span>
            </div>
          </div>

          {/* Current Streak */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <svg className={styles.metricIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              <span className={styles.metricTag}>STREAK</span>
            </div>
            <p className={styles.metricTitle}>Current Streak</p>
            <div className={styles.metricValueWrap}>
              <p className={styles.metricValue}>{streak}</p>
              <span className={styles.metricUnit}>days</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}