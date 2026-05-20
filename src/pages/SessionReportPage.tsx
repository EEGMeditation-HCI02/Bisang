import { useState, useEffect, useContext } from "react";
import styles from "./css/SessionReportPage.module.css";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "../contexts/userContextHelpers";

interface SessionReportPageProps {
    toggleNode?: React.ReactNode;
}

interface ReportData {
    score: number;
    trend: string;
    total_duration: string;
    ai_recommendation: string;
    created_at: string;
}

export default function SessionReportPage({ toggleNode }: SessionReportPageProps) {
    const { user } = useContext(UserContext);
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLatestReport = async () => {
            if (!user || !supabase) return;

            try {
                const { data, error } = await supabase
                    .from("meditation_reports")
                    .select("score, trend, total_duration, ai_recommendation, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (error) {
                    if (error.code !== 'PGRST116') throw error;
                } else {
                    setReport(data);
                }
            } catch (err) {
                console.error("Failed to fetch report:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatestReport();
    }, [user]);

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>Loading your reflection...</div>;
    }

    const score = report?.score || 92;
    const aiText = report?.ai_recommendation || `"Your focus during the Relationships session was exceptionally deep, showing high resonance and empathy."`;
    const focusPercent = report?.trend || "88";

    const reportDate = report?.created_at
        ? new Date(report.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : "October 24th, 2024";

    return (
        <>
            {/* ── Header ── */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <p className={styles.subLabel}>SESSION SUMMARY</p>
                    <h1 className={styles.title}>Your Reflection</h1>
                </div>

                <div className={styles.headerRight}>
                    {toggleNode ? (
                        toggleNode
                    ) : (
                        <div className={styles.metaInfo}>
                            <p className={styles.date}>{reportDate}</p>
                            <p className={styles.sessionTheme}>10:30 AM — Morning Serenity</p>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Bento Grid ── */}
            <div className={styles.grid}>
                {/* 1. Meditation Score */}
                <div className={styles.scoreCard}>
                    <p className={styles.subLabel}>MEDITATION SCORE</p>
                    <div className={styles.scoreVisual}>
                        <h2 className={styles.scoreValue}>{score}%</h2>
                        <p className={styles.scoreLabel}>STABILITY</p>
                    </div>
                </div>

                {/* 2. AI Insights */}
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
                        <p className={styles.insightText}>{aiText}</p>
                    </div>

                    <img
                        className={styles.insightImage}
                        src="/public/assets/meditation_bg.jpg"
                        alt="Meditation insight visual"
                        onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23e2dcd0'/%3E%3C/svg%3E";
                        }}
                    />
                </div>

                {/* 3. Detailed Metrics */}
                <div className={styles.metricsCol}>
                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <svg className={styles.metricIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                                <circle cx="12" cy="12" r="4" fill="currentColor" />
                            </svg>
                            <span className={styles.metricTag}>CONSISTENCY</span>
                        </div>
                        <p className={styles.metricTitle}>Average Focus</p>
                        <div className={styles.metricValueWrap}>
                            <p className={styles.metricValue}>{focusPercent}</p>
                            <span className={styles.metricUnit}>%</span>
                        </div>
                    </div>

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
                            <p className={styles.metricValue}>24</p><span className={styles.metricUnit}>m</span>
                            <p className={styles.metricValue} style={{ marginLeft: '8px' }}>12</p><span className={styles.metricUnit}>s</span>
                            <span style={{ fontSize: '16px', color: '#625F57', marginLeft: 'auto', fontWeight: 'bold' }}>/ 24m 12s</span>
                        </div>
                    </div>

                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <svg className={styles.metricIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                            </svg>
                            <span className={styles.metricTag}>PEAK STATE</span>
                        </div>
                        <p className={styles.metricTitle}>자세 몇번 흐트러졌는지</p>
                        <div className={styles.metricValueWrap}>
                            <p className={styles.metricValue}>18</p>
                            <span className={styles.metricUnit}>m</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}