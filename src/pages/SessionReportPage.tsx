import { useState, useEffect, useContext } from "react";
import styles from "./css/SessionReportPage.module.css";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";
import { useMeditationStore } from "../store/useMeditationStore";

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
  graph_data: any;
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

function formatMs(ms: number | undefined) {
  if (!ms || isNaN(ms)) return "0s";
  const totalSecs = Math.round(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export default function SessionReportPage({ toggleNode, hideHeader }: SessionReportPageProps) {
  const { user } = useContext(UserContext);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Zustand Store for transient live session detail ──
  const { latestSessionResult } = useMeditationStore();

  useEffect(() => {
    if (!user || !supabase) { setIsLoading(false); return; }

    const fetch = async () => {
      try {
        const { data, error } = await supabase!.from("meditation_reports")
          .select("score, trend, total_duration, sessions_completed, current_streak, ai_pattern, ai_recommendation, created_at, graph_data")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && data) setReport(data);
        else if (error?.code !== "PGRST116") console.error("Report fetch error:", error);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [user]);

  // Extract detailed metrics from Zustand (live session) or fallback to Supabase graph_data (archived)
  let detail = latestSessionResult;
  if (!detail && report?.graph_data) {
    try {
      const rawData = typeof report.graph_data === "string"
        ? JSON.parse(report.graph_data)
        : report.graph_data;
      if (rawData && typeof rawData === "object" && rawData.session_detail) {
        detail = rawData.session_detail;
      }
    } catch (e) {
      console.warn("Failed to parse graph_data details:", e);
    }
  }

  const reportDate = report?.created_at
    ? new Date(report.created_at).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });

  const score     = detail?.score ?? report?.score ?? 0;
  const duration  = parseDuration(report?.total_duration);
  const aiInsight = report?.ai_recommendation ?? "Complete a session to see your personalized insights.";
  const aiPattern = report?.ai_pattern        ?? "";
  const streak    = report?.current_streak
    ? parseInt(report.current_streak.replace(/[^0-9]/g, ""), 10)
    : 0;

  const eyeClosedRatioPercent = detail
    ? detail.durationMs > 0
      ? Math.min(100, Math.round((detail.eyeClosedMs / detail.durationMs) * 100))
      : 80
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
            src="/assets/meditation_bg.jpg"
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

      {/* ── Detailed Analysis Section ── */}
      {detail && (
        <section className={styles.detailsSection}>
          <h2 className={styles.sectionTitle}>Cognitive & Posture Dynamics</h2>
          <div className={styles.detailsGrid}>
            {/* Posture Card */}
            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <svg className={styles.detailIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className={styles.detailTag}>Posture Stability</span>
              </div>
              <h3 className={styles.detailTitle}>자세 안정도</h3>
              <div className={styles.detailValueWrap}>
                <p className={styles.detailValue}>{detail.postureScore}</p>
                <span className={styles.detailUnit}>%</span>
              </div>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${detail.postureScore}%` }} />
              </div>
              <p className={styles.detailSubtext}>
                자세 흔들림/이탈 감지: <span className={styles.highlightText}>{detail.unstableCount}회</span>
              </p>
            </div>

            {/* Eye Closed Card */}
            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <svg className={styles.detailIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className={styles.detailTag}>Eye Closure</span>
              </div>
              <h3 className={styles.detailTitle}>눈 감음 (몰입 비율)</h3>
              <div className={styles.detailValueWrap}>
                <p className={styles.detailValue}>{eyeClosedRatioPercent}</p>
                <span className={styles.detailUnit}>%</span>
              </div>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${eyeClosedRatioPercent}%` }} />
              </div>
              <p className={styles.detailSubtext}>
                총 눈감은 시간: <span className={styles.highlightText}>{formatMs(detail.eyeClosedMs)}</span> / 눈 깜빡임: <span className={styles.highlightText}>{detail.blinkCount}회</span>
              </p>
            </div>

            {/* Brainwave Cards */}
            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <svg className={styles.detailIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className={styles.detailTag}>Brainwave Depth</span>
              </div>
              <h3 className={styles.detailTitle}>뇌파 활성도 분석</h3>
              <div className={styles.brainwaveRows}>
                <div className={styles.brainwaveRow}>
                  <div className={styles.brainwaveLabelWrap}>
                    <span>평균 집중도 (Attention)</span>
                    <span className={styles.brainwaveValue}>{detail.attentionAvg}%</span>
                  </div>
                  <div className={styles.miniBarBg}>
                    <div className={styles.miniBarFillAttention} style={{ width: `${detail.attentionAvg}%` }} />
                  </div>
                </div>
                <div className={styles.brainwaveRow}>
                  <div className={styles.brainwaveLabelWrap}>
                    <span>평균 명상도 (Meditation)</span>
                    <span className={styles.brainwaveValue}>{detail.meditationAvg}%</span>
                  </div>
                  <div className={styles.miniBarBg}>
                    <div className={styles.miniBarFillMeditation} style={{ width: `${detail.meditationAvg}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}