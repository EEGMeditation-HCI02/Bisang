import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import styles from "./css/ReportPage.module.css";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";
import SessionReportPage from "./SessionReportPage";

const EMPTY_STATE = {
    score: 0,
    trend: "No data this week",
    graphData: [
        { day: "MON", minutes: 0, height: "10%" },
        { day: "TUE", minutes: 0, height: "10%" },
        { day: "WED", minutes: 0, height: "10%" },
        { day: "THU", minutes: 0, height: "10%" },
        { day: "FRI", minutes: 0, height: "10%" },
        { day: "SAT", minutes: 0, height: "10%" },
        { day: "SUN", minutes: 0, height: "10%" },
    ],
    aiFeedback: {
        pattern: "There are no meditation records this week.",
        recommendation: "Start a new meditation session to analyze your brainwave data."
    },
    stats: {
        duration: "0h 0m",
        sessions: 0,
        streak: "0 Days"
    }
};

export default function ReportPage() {
    const { user } = useContext(UserContext);
    const location = useLocation();

    const isJustFinished = location.state?.isJustFinished;

    const themeKey = location.state?.theme || "meditation";
    const themeLabels: Record<string, string> = {
        "self-esteem": "Self-Esteem",
        "relationships": "Relationships",
        "rest": "Rest",
        "focus": "Focus",
        "calm": "Calm",
        "free": "Free"
    };
    const themeName = themeLabels[themeKey] || (themeKey.charAt(0).toUpperCase() + themeKey.slice(1));

    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const [reportData, setReportData] = useState(EMPTY_STATE);
    const [activeTab, setActiveTab] = useState(isJustFinished ? "today" : "Weekly");

    useEffect(() => {
        const fetchWeeklyReport = async () => {
            if (!user || !supabase) return;
            try {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                sevenDaysAgo.setHours(0, 0, 0, 0);

                const { data, error } = await supabase
                    .from("meditation_reports")
                    .select("*")
                    .eq("user_id", user.id)
                    .gte("created_at", sevenDaysAgo.toISOString())
                    .order("created_at", { ascending: true });

                if (error) throw error;

                // 1. 기본 일주일 치 틀(Map) 만들기
                const daysMap = new Map();
                const today = new Date();
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const dateString = d.toISOString().split('T')[0];
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    daysMap.set(dateString, { day: dayName, minutes: 0 });
                }

                // 2. 데이터가 있을 경우에만 덮어쓰기
                if (data && data.length > 0) {
                    let totalScore = 0;
                    let validScoreCount = 0;
                    let totalMinutes = 0;

                    data.forEach((row) => {
                        const rowDate = new Date(row.created_at).toISOString().split('T')[0];

                        // 시간 계산 (그래프 및 전체 통계용)
                        let mins = 0;
                        if (row.total_duration) {
                            const minMatch = row.total_duration.match(/(\d+)m/);
                            if (minMatch) mins = parseInt(minMatch[1], 10);
                        }
                        totalMinutes += mins;

                        // 요일별 시간에 누적
                        if (daysMap.has(rowDate)) {
                            daysMap.get(rowDate).minutes += mins;
                        }

                        // 점수 누적 (0점 제외한 유효 세션만)
                        const sessionScore = row.score || 0;
                        if (sessionScore > 0) {
                            totalScore += sessionScore;
                            validScoreCount += 1;
                        }
                    });

                    const rawDays = Array.from(daysMap.values());
                    const maxMins = Math.max(...rawDays.map(d => d.minutes), 30);

                    // 그래프 데이터 매핑 (다시 시간 단위로 복원)
                    const formattedGraphData = rawDays.map(d => ({
                        day: d.day,
                        minutes: d.minutes,
                        height: `${Math.max(10, Math.round((d.minutes / maxMins) * 100))}%`
                    }));

                    const avgScore = validScoreCount > 0 ? Math.round(totalScore / validScoreCount) : 0;
                    const hours = Math.floor(totalMinutes / 60);
                    const remainderMins = totalMinutes % 60;
                    const durationStr = hours > 0 ? `${hours}h ${remainderMins}m` : `${remainderMins}m`;

                    const latestSession = data[data.length - 1];

                    setReportData({
                        score: avgScore,
                        trend: avgScore > 0 ? "Steady progress" : "No recent data",
                        graphData: formattedGraphData,
                        aiFeedback: {
                            pattern: latestSession?.ai_pattern || "Sufficient data was not collected.",
                            recommendation: latestSession?.ai_recommendation || "AI feedback is provided when you conduct a meditation session."
                        },
                        stats: {
                            duration: durationStr,
                            sessions: data.length,
                            streak: latestSession?.current_streak || "0 Days"
                        }
                    });
                } else {
                    // 데이터가 없을 경우 (DUMMY 데이터 대신 실제 빈 화면에 맞는 세팅)
                    const rawDays = Array.from(daysMap.values());
                    setReportData({
                        ...EMPTY_STATE,
                        graphData: rawDays.map(d => ({
                            day: d.day,
                            minutes: 0,
                            height: "10%"
                        }))
                    });
                }
            } catch (err) {
                console.error("Failed to fetch weekly report data.", err);
            }
        };

        fetchWeeklyReport();
    }, [user]);

    const toggleSwitch = (
        <div className={styles.toggleWrap}>
            <button
                className={activeTab === "today" ? styles.toggleBtnActive : styles.toggleBtn}
                onClick={() => setActiveTab("today")}
            >
                today
            </button>
            <button
                className={activeTab === "Weekly" ? styles.toggleBtnActive : styles.toggleBtn}
                onClick={() => setActiveTab("Weekly")}
            >
                Weekly
            </button>
        </div>
    );

    const isToday = activeTab === "today";

    return (
        <div className={styles.root}>
            <main className={styles.main}>

                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>
                            {isToday ? "Today's Cognitive Resonance" : "Weekly Cognitive Resonance"}
                        </h1>
                        <p className={styles.subtitle}>
                            {isToday
                                ? "Your immediate neural reflection. Analyze your recent session's depth and stillness."
                                : "Your neural harmony over time. Analyze the depth of your focus and the quality of your stillness."}
                        </p>
                    </div>

                    <div className={styles.headerRight}>
                        {isJustFinished && isToday ? (
                            <div className={styles.metaInfo}>
                                <p className={styles.date}>
                                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className={styles.sessionTheme}>{formattedTime} — {themeName} Session</p>
                            </div>
                        ) : (
                            toggleSwitch
                        )}
                    </div>
                </header>

                {isToday ? (
                    <SessionReportPage hideHeader={true} />
                ) : (
                    <div className={styles.grid}>
                        <div className={`${styles.card} ${styles.scoreCard}`}>
                            <div className={styles.scoreGlow} />
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>Resonance Score</h2>
                                <p className={styles.cardSub}>Overall neural synchronization</p>
                            </div>

                            <div className={styles.scoreContent}>
                                <div className={styles.scoreValueWrap}>
                                    {/* 점수가 0이면 흐리게 보이거나 0으로 명확히 표시 */}
                                    <span className={styles.scoreValue} style={reportData.score === 0 ? { color: "#a39a91" } : {}}>
                                        {reportData.score}
                                    </span>
                                    <span className={styles.scoreTotal}>/100</span>
                                </div>

                                <div className={styles.trendPill}>
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 6.5L4.5 3L7.5 6L11 1.5" stroke="#5F5235" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 1.5H11V4.5" stroke="#5F5235" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {reportData.trend}
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.card} ${styles.graphCard}`}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>Alpha Wave Consistency</h2>
                                <p className={styles.cardSub}>Minutes in deep focus state</p>
                            </div>

                            <div className={styles.graphWrap}>
                                {reportData.graphData.map((data: any, index: number) => (
                                    <div key={index} className={styles.barCol}>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{ height: data.height }}
                                            >
                                                <div className={styles.tooltip}>
                                                    Peak: {data.minutes} min
                                                </div>
                                            </div>
                                        </div>
                                        <span className={styles.barLabel}>{data.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.aiPanel}>
                            <div className={styles.aiHeaderWrap}>
                                <div className={styles.aiHeader}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#835431" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2a5 5 0 0 1 5 5v2.5M7 7a5 5 0 0 1 10 0M12 21a9 9 0 0 1-9-9v-2a9 9 0 0 1 18 0v2a9 9 0 0 1-9 9z" />
                                        <path d="M12 12v3" />
                                    </svg>
                                    <h2 className={styles.aiTitle}>AI Synthesis</h2>
                                </div>
                                <p className={styles.aiSub}>
                                    Your neural patterns indicate a shift towards deeper restfulness during morning sessions.
                                </p>
                            </div>

                            <div className={styles.aiCardsWrap}>
                                <div className={styles.aiCard}>
                                    <div className={styles.aiCardHeader}>
                                        <span className={styles.patternLabel}>PATTERN DETECTED</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B5D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                                        </svg>
                                    </div>
                                    <p className={styles.aiCardText}>
                                        {reportData.aiFeedback.pattern}
                                    </p>
                                </div>

                                <div className={styles.aiCard}>
                                    <div className={styles.aiCardHeader}>
                                        <span className={styles.recommendLabel}>RECOMMENDATION</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#835431" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2v20" /><path d="m17 7-5-5-5 5" /><path d="m17 17-5 5-5-5" />
                                        </svg>
                                    </div>
                                    <p className={styles.aiCardText}>
                                        {reportData.aiFeedback.recommendation}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7E7A72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span className={styles.statLabel}>Total Duration</span>
                                </div>
                                <div className={styles.statValue}>{reportData.stats.duration}</div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7E7A72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span className={styles.statLabel}>Sessions Completed</span>
                                </div>
                                <div className={styles.statValue}>{reportData.stats.sessions}</div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7E7A72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                                    </svg>
                                    <span className={styles.statLabel}>Current Streak</span>
                                </div>
                                <div className={styles.statValue}>{reportData.stats.streak}</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}