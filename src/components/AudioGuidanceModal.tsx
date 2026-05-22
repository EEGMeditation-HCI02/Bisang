import { useEffect, useState, useRef } from "react";
import styles from "./css/AudioGuidanceModal.module.css";
import { AUDIO_OPTIONS } from "../constants/audioOptions";
import { playDynamicGuidance } from "../utils/audioUtils"; // 방금 만든 함수 불러오기

interface AudioGuidanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSelection: string;
    onSelect: (id: string) => void;
}

export default function AudioGuidanceModal({ isOpen, onClose, currentSelection, onSelect }: AudioGuidanceModalProps) {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isLoading, setIsLoading] = useState<string | null>(null); // 로딩 상태 추가

    useEffect(() => {
        if (!isOpen) stopAudio();
    }, [isOpen]);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setPlayingId(null);
        setIsLoading(null);
    };

    const handlePlaySample = async (e: React.MouseEvent, opt: typeof AUDIO_OPTIONS[0]) => {
        e.stopPropagation();

        if (playingId === opt.id || isLoading === opt.id) {
            stopAudio();
            return;
        }

        stopAudio();
        setIsLoading(opt.id);

        try {
            // 파이썬 서버에 TTS 생성을 요청! (원하는 샘플 멘트 작성)
            const sampleText = "크게 숨을 들이마시고... 천천히 내쉬어보세요. 당신만의 안식처에 오신 것을 환영합니다.";
            const newAudio = await playDynamicGuidance(sampleText, opt.id);

            newAudio.onended = () => setPlayingId(null);
            newAudio.play();

            audioRef.current = newAudio;
            setPlayingId(opt.id);
        } catch (err) {
            alert("서버 연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.");
        } finally {
            setIsLoading(null);
        }
    };

    const handleSelect = (id: string) => {
        stopAudio();
        onSelect(id);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Select Audio Guidance</h3>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <p className={styles.subtitle}>
                    Choose the voice that will guide your meditation. Click the play button to hear a sample.
                </p>

                <div className={styles.list}>
                    {AUDIO_OPTIONS.map((opt) => (
                        <div
                            key={opt.id}
                            className={`${styles.row} ${currentSelection === opt.id ? styles.activeRow : ""}`}
                            onClick={() => handleSelect(opt.id)}
                        >
                            <div className={styles.info}>
                                <span className={styles.genderBadge}>{opt.gender}</span>
                                <span className={styles.label}>{opt.label}</span>
                            </div>

                            <button
                                className={`${styles.playBtn} ${playingId === opt.id ? styles.playingBtn : ""}`}
                                onClick={(e) => handlePlaySample(e, opt)}
                                aria-label="Play Sample"
                                disabled={isLoading !== null && isLoading !== opt.id} // 다른 거 로딩 중일 땐 클릭 방지
                            >
                                {isLoading === opt.id ? (
                                    // 로딩 중일 때 보여줄 스피너 애니메이션 (점 3개 등)
                                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>...</span>
                                ) : playingId === opt.id ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}