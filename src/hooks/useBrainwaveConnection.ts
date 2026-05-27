import { useState, useEffect, useRef } from "react";
import {
  assessBrainwaveState,
  type BrainwaveMetrics,
} from "./useMeditationLLM";

interface UseBrainwaveReturn {
  brainwaveMetrics: BrainwaveMetrics;
  brainwaveState: "focused" | "stable" | "unstable";
  brainwaveConnected: boolean;
}

export function useBrainwaveConnection(): UseBrainwaveReturn {
  const [brainwaveMetrics, setBrainwaveMetrics] = useState<BrainwaveMetrics>({
    attention: 0,
    meditation: 0,
    signal: 200,
  });
  const [brainwaveState, setBrainwaveState] = useState<
    "focused" | "stable" | "unstable"
  >("stable");
  const [brainwaveConnected, setBrainwaveConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connectBrainwave = () => {
      try {
        const ws = new WebSocket("ws://bisang-production-747f.up.railway.app/");

        ws.onopen = () => {
          console.log("🧠 뇌파 센서 연결됨");
          if (isMounted) setBrainwaveConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (isMounted) {
              setBrainwaveMetrics({
                attention: data.attention || 0,
                meditation: data.meditation || 0,
                signal: data.signal || 200,
              });
              const newState = assessBrainwaveState({
                attention: data.attention || 0,
                meditation: data.meditation || 0,
                signal: data.signal || 200,
              });
              setBrainwaveState(newState);
              console.log(
                `🧠 뇌파 업데이트 - Attention: ${data.attention}, Meditation: ${data.meditation}, State: ${newState}`,
              );
            }
          } catch (err) {
            console.error("뇌파 데이터 파싱 실패:", err);
          }
        };

        ws.onerror = (err) => {
          console.warn("🧠 뇌파 센서 연결 오류:", err);
          if (isMounted) setBrainwaveConnected(false);
        };

        ws.onclose = () => {
          console.log("🧠 뇌파 센서 연결 끊김");
          if (isMounted) setBrainwaveConnected(false);
          // 3초 후 재연결 시도
          setTimeout(() => {
            if (isMounted) connectBrainwave();
          }, 3000);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("뇌파 연결 실패:", err);
        if (isMounted) setBrainwaveConnected(false);
      }
    };

    connectBrainwave();

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    brainwaveMetrics,
    brainwaveState,
    brainwaveConnected,
  };
}
