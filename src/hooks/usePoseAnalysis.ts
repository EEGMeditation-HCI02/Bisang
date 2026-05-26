import { useEffect, useRef, useCallback } from "react";

// ============================================================
// 타입 정의
// ============================================================
export interface PoseSessionResult {
  postureScore: number;      // 0~100 (높을수록 자세 좋음)
  eyeClosedMs: number;       // 눈 감은 총 시간 (ms) = 집중 시간
  eyeOpenMs: number;         // 눈 뜬 총 시간 (ms) = 방해 시간
  badPostureRatio: number;   // 0~1, 전체 시간 중 자세 불량 비율
  blinkCount: number;
  durationMs: number;        // 세션 총 시간
}

interface MetricValues {
  lateral: number;
  shoulder: number;
  headDrop: number;
  forward: number;
  motion: number;
}

interface EyeState {
  earSmoothed: number;
  closed: boolean;
  closedFrames: number;
  blinkCount: number;
  closedTotalFrames: number;
  totalFrames: number;
  faceDetected: boolean;
}

// ============================================================
// 설정 (meditation_posture.html과 동일)
// ============================================================
const CONFIG = {
  thresholds: {
    lateral:  0.18,
    shoulder: 0.12,
    headDrop: 0.45,
    forward:  0.30,
    motion:   0.025,
  },
  emaAlpha: 0.25,
  eye: {
    closedThreshold: 0.18,
    openThreshold:   0.24,
    blinkMinFrames:  1,
    blinkMaxFrames:  9,
    earEmaAlpha:     0.4,
  },
};

const LANDMARK = {
  NOSE: 0,
  LEFT_EAR: 7,  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_HIP: 23, RIGHT_HIP: 24,
};

const EYE_LM = {
  left:  { p1: 33,  p2: 160, p3: 158, p4: 133, p5: 153, p6: 144 },
  right: { p1: 362, p2: 385, p3: 387, p4: 263, p5: 373, p6: 380 },
};

// ============================================================
// 순수 계산 함수
// ============================================================
const mid = (a: {x:number;y:number;z:number}, b: {x:number;y:number;z:number}) =>
  ({ x: (a.x+b.x)/2, y: (a.y+b.y)/2, z: (a.z+b.z)/2 });

const dist2D = (a: {x:number;y:number}, b: {x:number;y:number}) =>
  Math.hypot(a.x - b.x, a.y - b.y);

function computePostureMetrics(
  lm: {x:number;y:number;z:number}[],
  prevLm: {x:number;y:number;z:number}[] | null
): { metrics: MetricValues; isBad: boolean } {
  const lS = lm[LANDMARK.LEFT_SHOULDER], rS = lm[LANDMARK.RIGHT_SHOULDER];
  const lH = lm[LANDMARK.LEFT_HIP],      rH = lm[LANDMARK.RIGHT_HIP];
  const lE = lm[LANDMARK.LEFT_EAR],      rE = lm[LANDMARK.RIGHT_EAR];

  const sMid   = mid(lS, rS);
  const hMid   = mid(lH, rH);
  const eMid   = mid(lE, rE);
  const sWidth = Math.max(0.01, Math.abs(lS.x - rS.x));

  const lateral  = Math.abs(sMid.x - hMid.x) / sWidth;
  const shoulder = Math.abs(lS.y - rS.y) / sWidth;
  const earShoulderY = Math.abs(eMid.y - sMid.y) / sWidth;
  const headDrop = Math.max(0, 1 - earShoulderY);
  const forward  = Math.max(0, (sMid.z - eMid.z) / sWidth);

  let motion = 0;
  if (prevLm) {
    const keys = [LANDMARK.NOSE, LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER,
                  LANDMARK.LEFT_EAR, LANDMARK.RIGHT_EAR];
    let sum = 0;
    for (const k of keys) sum += dist2D(lm[k], prevLm[k]);
    motion = sum / keys.length;
  }

  const t = CONFIG.thresholds;
  const isBad =
    lateral  > t.lateral  ||
    shoulder > t.shoulder ||
    headDrop > t.headDrop ||
    forward  > t.forward  ||
    motion   > t.motion;

  return { metrics: { lateral, shoulder, headDrop, forward, motion }, isBad };
}

function eyeAspectRatio(
  lm: {x:number;y:number}[],
  eye: { p1:number; p2:number; p3:number; p4:number; p5:number; p6:number }
): number {
  const v1 = Math.hypot(lm[eye.p2].x - lm[eye.p6].x, lm[eye.p2].y - lm[eye.p6].y);
  const v2 = Math.hypot(lm[eye.p3].x - lm[eye.p5].x, lm[eye.p3].y - lm[eye.p5].y);
  const h  = Math.hypot(lm[eye.p1].x - lm[eye.p4].x, lm[eye.p1].y - lm[eye.p4].y);
  if (h < 1e-6) return 0;
  return (v1 + v2) / (2 * h);
}

// ============================================================
// 훅
// ============================================================
export function usePoseAnalysis() {
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number | null>(null);
  const runningRef = useRef(false);

  // MediaPipe 인스턴스
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poseLandmarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faceLandmarkerRef = useRef<any>(null);

  // 세션 통계 (ref로 관리 → re-render 없이 매 프레임 업데이트)
  const statsRef = useRef({
    totalFrames:      0,
    badPostureFrames: 0,
    eyeClosedMs:      0,
    eyeOpenMs:        0,
    blinkCount:       0,
    sessionStartMs:   0,
    lastTickMs:       0,
  });

  // EMA 상태
  const emaRef = useRef<MetricValues>({ lateral:0, shoulder:0, headDrop:0, forward:0, motion:0 });

  // 눈 상태
  const eyeStateRef = useRef<EyeState>({
    earSmoothed: 0.3, closed: false, closedFrames: 0,
    blinkCount: 0, closedTotalFrames: 0, totalFrames: 0, faceDetected: false,
  });

  // 이전 랜드마크 (motion 계산용)
  const prevLmRef = useRef<{x:number;y:number;z:number}[] | null>(null);
  const lastVideoTimeRef = useRef(-1);

  // ── MediaPipe CDN 동적 로드 ──
  const loadMediaPipe = useCallback(async () => {
    if (poseLandmarkerRef.current) return; // 이미 로드됨

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mediaPipeUrl = "https://esm.sh/@mediapipe/tasks-vision@0.10.3";
    const { PoseLandmarker, FaceLandmarker, FilesetResolver } = await (
      import(/* @vite-ignore */ mediaPipeUrl)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;

    const fileset = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputFaceBlendshapes: false,
    });
  }, []);

  // ── 분석 루프 ──
  const loop = useCallback(() => {
    if (!runningRef.current) return;

    const video = videoRef.current;
    const pose  = poseLandmarkerRef.current;
    const face  = faceLandmarkerRef.current;

    if (video && pose && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const ts  = performance.now();
      const now = Date.now();

      // ── Pose ──
      const poseResult = pose.detectForVideo(video, ts);
      if (poseResult.landmarks?.length > 0) {
        const lm = poseResult.landmarks[0];
        const { isBad } = computePostureMetrics(lm, prevLmRef.current);

        // EMA 적용 (통계용 isBad는 raw 값 기반으로도 충분)
        const a = CONFIG.emaAlpha;
        const ema = emaRef.current;
        const { metrics } = computePostureMetrics(lm, prevLmRef.current);
        for (const k of Object.keys(ema) as (keyof MetricValues)[]) {
          ema[k] = a * metrics[k] + (1 - a) * ema[k];
        }

        statsRef.current.totalFrames++;
        if (isBad) statsRef.current.badPostureFrames++;
        prevLmRef.current = lm.map((p: {x:number;y:number;z:number}) =>
          ({ x: p.x, y: p.y, z: p.z })
        );
      }

      // ── Face / Eye ──
      if (face) {
        const faceResult = face.detectForVideo(video, ts);
        const faceLm = faceResult.faceLandmarks?.[0] ?? null;
        const eyeState = eyeStateRef.current;

        if (faceLm) {
          const earL = eyeAspectRatio(faceLm, EYE_LM.left);
          const earR = eyeAspectRatio(faceLm, EYE_LM.right);
          const earRaw = (earL + earR) / 2;
          const ea = CONFIG.eye.earEmaAlpha;
          eyeState.earSmoothed = ea * earRaw + (1 - ea) * eyeState.earSmoothed;
          const ear = eyeState.earSmoothed;

          const wasClosed = eyeState.closed;
          if (!wasClosed && ear < CONFIG.eye.closedThreshold) {
            eyeState.closed = true;
            eyeState.closedFrames = 1;
          } else if (wasClosed && ear > CONFIG.eye.openThreshold) {
            if (eyeState.closedFrames >= CONFIG.eye.blinkMinFrames &&
                eyeState.closedFrames <= CONFIG.eye.blinkMaxFrames) {
              eyeState.blinkCount++;
              statsRef.current.blinkCount++;
            }
            eyeState.closed = false;
            eyeState.closedFrames = 0;
          } else if (eyeState.closed) {
            eyeState.closedFrames++;
          }
        }

        // 시간 누적 (눈 감음 / 뜸)
        const dt = statsRef.current.lastTickMs > 0
          ? now - statsRef.current.lastTickMs
          : 0;
        if (eyeStateRef.current.closed) {
          statsRef.current.eyeClosedMs += dt;
        } else {
          statsRef.current.eyeOpenMs += dt;
        }
        statsRef.current.lastTickMs = now;
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // ── 세션 시작 ──
  const startSession = useCallback(async () => {
    await loadMediaPipe();

    // 숨김 video 엘리먼트 생성
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;left:-9999px;";
    document.body.appendChild(video);
    videoRef.current = video;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false,
    });
    streamRef.current = stream;
    video.srcObject = stream;
    await new Promise<void>((r) => { video.onloadedmetadata = () => r(); });
    await video.play();

    // 통계 초기화
    const now = Date.now();
    statsRef.current = {
      totalFrames: 0, badPostureFrames: 0,
      eyeClosedMs: 0, eyeOpenMs: 0, blinkCount: 0,
      sessionStartMs: now, lastTickMs: now,
    };
    eyeStateRef.current = {
      earSmoothed: 0.3, closed: false, closedFrames: 0,
      blinkCount: 0, closedTotalFrames: 0, totalFrames: 0, faceDetected: false,
    };
    prevLmRef.current = null;
    lastVideoTimeRef.current = -1;
    emaRef.current = { lateral:0, shoulder:0, headDrop:0, forward:0, motion:0 };

    runningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
  }, [loadMediaPipe, loop]);

  // ── 세션 종료 → 결과 반환 ──
  const stopSession = useCallback((): PoseSessionResult => {
    runningRef.current = false;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.remove();
      videoRef.current = null;
    }

    const s = statsRef.current;
    const durationMs = Date.now() - s.sessionStartMs;
    const badPostureRatio = s.totalFrames > 0
      ? s.badPostureFrames / s.totalFrames
      : 0;
    // 자세 점수: bad 비율이 0이면 100점, 1이면 0점
    const postureScore = Math.round((1 - badPostureRatio) * 100);

    return {
      postureScore,
      eyeClosedMs:    s.eyeClosedMs,
      eyeOpenMs:      s.eyeOpenMs,
      badPostureRatio,
      blinkCount:     s.blinkCount,
      durationMs,
    };
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (runningRef.current) stopSession();
    };
  }, [stopSession]);

  return { startSession, stopSession };
}
