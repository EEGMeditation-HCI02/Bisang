import { useState, useEffect, useContext } from "react";
import styles from "./css/ReportPage.module.css";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";
import SessionReportPage from "./SessionReportPage";

// 데이터가 없을 때 보여줄 기본값 (Fallback)
const DUMMY_DATA = {
    score: 87,
    trend: "+4 pts this week",
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
        pattern: "Morning sessions yield 20% faster entry into Alpha states compared to evenings.",
        recommendation: "Increase breathwork duration before evening sessions to improve transition time."
    },
    stats: {
        duration: "0h 0m",
        sessions: 0,
        streak: "0 Days"
    }
};

export default function ReportPage() {
    const { user } = useContext(UserContext);
    const [reportData, setReportData] = useState(DUMMY_DATA);
    const [activeTab, setActiveTab] = useState("Weekly");

    useEffect(() => {
        const fetchWeeklyReport = async () => {
            if (!user || !supabase) return;
            try {
                // 1. 오늘을 기준으로 7일 전 날짜 구하기
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 과거 6일 + 오늘 = 총 7일
                sevenDaysAgo.setHours(0, 0, 0, 0);

                // 2. 수퍼베이스에서 최근 7일치 데이터 모두 가져오기
                const { data, error } = await supabase
                    .from("meditation_reports")
                    .select("*")
                    .eq("user_id", user.id)
                    .gte("created_at", sevenDaysAgo.toISOString())
                    .order("created_at", { ascending: true }); // 과거순으로 정렬

                if (error) throw error;

                // 3. 데이터가 존재하면 요일별로 가공(Aggregation) 시작
                if (data && data.length > 0) {
                    const daysMap = new Map();
                    const today = new Date();

                    // 최근 7일의 요일 틀(Map) 미리 만들기 (예: TUE, WED, THU ...)
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date(today);
                        d.setDate(d.getDate() - i);
                        const dateString = d.toISOString().split('T')[0];
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                        daysMap.set(dateString, { day: dayName, minutes: 0 });
                    }

                    let totalScore = 0;
                    let totalMinutes = 0;

                    // 가져온 세션 데이터들을 요일별로 합산하기
                    data.forEach((row) => {
                        const rowDate = new Date(row.created_at).toISOString().split('T')[0];
                        if (daysMap.has(rowDate)) {
                            let mins = 0;
                            // "9m 0s" 형태의 문자열에서 분(minutes) 숫자만 추출
                            if (row.total_duration) {
                                const minMatch = row.total_duration.match(/(\d+)m/);
                                if (minMatch) mins = parseInt(minMatch[1], 10);
                            }
                            daysMap.get(rowDate).minutes += mins;
                            totalMinutes += mins;
                        }
                        totalScore += (row.score || 0);
                    });

                    // 4. 그래프 높이(height) 계산 및 가공 완료
                    const rawDays = Array.from(daysMap.values());
                    const maxMins = Math.max(...rawDays.map(d => d.minutes), 30); // 기준점 최소 30분
                    const formattedGraphData = rawDays.map(d => ({
                        day: d.day,
                        minutes: d.minutes,
                        height: `${Math.max(10, Math.round((d.minutes / maxMins) * 100))}%` // 최소 높이 10% 보장
                    }));

                    // 통계 포맷팅
                    const avgScore = Math.round(totalScore / data.length);
                    const hours = Math.floor(totalMinutes / 60);
                    const remainderMins = totalMinutes % 60;
                    const durationStr = hours > 0 ? `${hours}h ${remainderMins}m` : `${remainderMins}m`;

                    // AI 피드백과 스트릭은 가장 마지막(최신) 세션의 데이터를 사용
                    const latestSession = data[data.length - 1];

                    // 가공된 데이터 화면에 적용
                    setReportData({
                        score: avgScore,
                        trend: "Steady progress", // 추후 이번주-저번주 비교 로직 추가 가능
                        graphData: formattedGraphData,
                        aiFeedback: {
                            pattern: latestSession?.ai_pattern || DUMMY_DATA.aiFeedback.pattern,
                            recommendation: latestSession?.ai_recommendation || DUMMY_DATA.aiFeedback.recommendation
                        },
                        stats: {
                            duration: durationStr,
                            sessions: data.length,
                            streak: latestSession?.current_streak || DUMMY_DATA.stats.streak
                        }
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

    return (
        <div className={styles.root}>
            <main className={styles.main}>

                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '16px' }}>
                    {toggleSwitch}
                </div>

                {activeTab === "today" ? (
                    <SessionReportPage />
                ) : (
                    <>
                        <header className={styles.header}>
                            <div className={styles.headerLeft}>
                                <h1 className={styles.title}>Weekly Cognitive Resonance</h1>
                                <p className={styles.subtitle}>
                                    Your neural harmony over time. Analyze the depth of your focus and the quality of your stillness.
                                </p>
                            </div>
                        </header>

                        <div className={styles.grid}>
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
                    </>
                )}
            </main>
        </div>
    );
}