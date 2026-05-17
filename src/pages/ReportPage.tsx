import { useState, useEffect, useContext } from "react";
import styles from "./css/ReportPage.module.css";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";

// 더미 데이터 (Fallback)
const DUMMY_DATA = {
    score: 87,
    trend: "+4 pts this week",
    graphData: [
        { day: "MON", minutes: 15, height: "35%" },
        { day: "TUE", minutes: 22, height: "53%" },
        { day: "WED", minutes: 12, height: "30%" },
        { day: "THU", minutes: 30, height: "70%" },
        { day: "FRI", minutes: 42, height: "100%" }, // isPeak 제거
        { day: "SAT", minutes: 25, height: "60%" },
        { day: "SUN", minutes: 35, height: "82%" },
    ],
    aiFeedback: {
        pattern: "Morning sessions yield 20% faster entry into Alpha states compared to evenings.",
        recommendation: "Increase breathwork duration before evening sessions to improve transition time."
    },
    stats: {
        duration: "4h 12m",
        sessions: 14,
        streak: "5 Days"
    }
};

export default function ReportPage() {
    const { user } = useContext(UserContext);
    const [reportData, setReportData] = useState(DUMMY_DATA);
    const [activeTab, setActiveTab] = useState("Weekly");

    useEffect(() => {
        

        const fetchReport = async () => {
            if (!user) return;
            if (!supabase) {
                console.warn("Supabase client is not initialized.");
                return;
            }
            try {
                const { data, error } = await supabase
                    .from("meditation_reports")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    const parsedGraphData = typeof data.graph_data === "string"
                        ? JSON.parse(data.graph_data)
                        : (data.graph_data || DUMMY_DATA.graphData);

                    setReportData({
                        score: data.score ?? DUMMY_DATA.score,
                        trend: data.trend ?? DUMMY_DATA.trend,
                        graphData: parsedGraphData,
                        aiFeedback: {
                            pattern: data.ai_pattern ?? DUMMY_DATA.aiFeedback.pattern,
                            recommendation: data.ai_recommendation ?? DUMMY_DATA.aiFeedback.recommendation
                        },
                        stats: {
                            duration: data.total_duration ?? DUMMY_DATA.stats.duration,
                            sessions: data.sessions_completed ?? DUMMY_DATA.stats.sessions,
                            streak: data.current_streak ?? DUMMY_DATA.stats.streak
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to fetch report data. Using fallback data.", err);
            }
        };

        fetchReport();
    }, [user]);

    return (
        <div className={styles.root}>
            <main className={styles.main}>
                {/* ── Header ── */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>Weekly Cognitive Resonance</h1>
                        <p className={styles.subtitle}>
                            Your neural harmony over time. Analyze the depth of your focus and the quality of your stillness.
                        </p>
                    </div>

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
                </header>

                {/* ── Bento Grid ── */}
                <div className={styles.grid}>

                    {/* 1. Resonance Score Card */}
                    <div className={`${styles.card} ${styles.scoreCard}`}>
                        <div className={styles.scoreGlow} />
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Resonance Score</h2>
                            <p className={styles.cardSub}>Overall neural synchronization</p>
                        </div>

                        <div className={styles.scoreContent}>
                            <div className={styles.scoreValueWrap}>
                                <span className={styles.scoreValue}>{reportData.score}</span>
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

                    {/* 2. Focus Graph Card */}
                    <div className={`${styles.card} ${styles.graphCard}`}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Alpha Wave Consistency</h2>
                            <p className={styles.cardSub}>Minutes in deep focus state</p>
                        </div>

                        <div className={styles.graphWrap}>
                            {reportData.graphData.map((data: any, index: number) => (
                                <div key={index} className={styles.barCol}>
                                    <div className={styles.barTrack}>
                                        {/* 수정: styles.barPeak 클래스 적용 로직 제거 */}
                                        <div
                                            className={styles.barFill}
                                            style={{ height: data.height }}
                                        >
                                            {/* Tooltip on hover */}
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

                    {/* 3. AI Synthesis Panel */}
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
                            {/* Pattern Detected */}
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

                            {/* Recommendation */}
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

                    {/* 4. Mini Stats Row */}
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
            </main>
        </div>
    );
}