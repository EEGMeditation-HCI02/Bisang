/**
 * 뇌파 센서 시뮬레이션 서버
 * localhost:8080에서 WebSocket으로 뇌파 데이터 전송
 * 실제 센서: MindWave 헤드밴드 연결 가능
 */
import { WebSocketServer } from "ws";

// const PORT = 8080;
const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`🧠 뇌파 센서 서버 시작: ws://localhost:${PORT}`);

// 뇌파 시뮬레이션 상태
let simulationState = "focus"; // focus, relax, distracted
let attention = 50;
let meditation = 40;
let signal = 100;

// 주기적으로 뇌파 데이터 생성 및 전송
setInterval(() => {
  // 상태 변경 (30% 확률)
  if (Math.random() < 0.3) {
    simulationState = ["focus", "relax", "distracted"][
      Math.floor(Math.random() * 3)
    ];
  }

  // 상태에 따라 뇌파 값 조정
  switch (simulationState) {
    case "focus":
      attention = 50 + Math.random() * 50; // 50-100
      meditation = 30 + Math.random() * 30; // 30-60
      signal = Math.random() * 50; // 0-50 (좋은 신호)
      break;
    case "relax":
      attention = 20 + Math.random() * 40; // 20-60
      meditation = 50 + Math.random() * 50; // 50-100
      signal = Math.random() * 80; // 0-80
      break;
    case "distracted":
      attention = 10 + Math.random() * 30; // 10-40
      meditation = 10 + Math.random() * 30; // 10-40
      signal = 100 + Math.random() * 100; // 100-200 (약한 신호)
      break;
  }

  const data = {
    attention: Math.round(attention),
    meditation: Math.round(meditation),
    signal: Math.round(signal),
    timestamp: Date.now(),
    state: simulationState,
  };

  // 모든 클라이언트에 전송
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });

  console.log(`📊 전송: ${JSON.stringify(data)}`);
}, 1000); // 1초마다 업데이트

wss.on("connection", (ws) => {
  console.log("✅ 클라이언트 연결됨");

  ws.on("message", (message) => {
    console.log("📨 메시지 수신:", message);
  });

  ws.on("close", () => {
    console.log("❌ 클라이언트 연결 끊김");
  });

  ws.on("error", (error) => {
    console.error("❌ 에러:", error);
  });
});
