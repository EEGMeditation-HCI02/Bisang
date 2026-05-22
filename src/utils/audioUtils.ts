export const playDynamicGuidance = async (text: string, voiceId: string): Promise<HTMLAudioElement> => {
    try {
        const response = await fetch("http://localhost:8000/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice_id: voiceId }),
        });

        if (!response.ok) throw new Error("TTS 변환 실패");

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);

        // 재생이 끝나면 메모리 정리
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
        });

        return audio;
    } catch (error) {
        console.error("오디오 에러:", error);
        throw error;
    }
};