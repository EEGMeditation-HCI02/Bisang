import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./css/TestGuidePage.module.css";

// MindWaveParser 클래스
class MindWaveParser {
  syncCount: number = 0;
  state: string = "SYNC";
  payloadLength: number = 0;
  payload: Uint8Array = new Uint8Array(256);
  payloadIndex: number = 0;
  checksum: number = 0;
  onData: (data: Record<string, unknown>) => void = () => {};

  parse(buffer: Uint8Array) {
    for (let i = 0; i < buffer.length; i++) {
      this.processByte(buffer[i]);
    }
  }

  processByte(byte: number) {
    switch (this.state) {
      case "SYNC":
        if (byte === 0xaa) {
          this.syncCount++;
          if (this.syncCount === 2) {
            this.state = "LENGTH";
            this.syncCount = 0;
          }
        } else {
          this.syncCount = 0;
        }
        break;

      case "LENGTH":
        if (byte > 169 || byte === 0xaa) {
          this.state = "SYNC";
        } else {
          this.payloadLength = byte;
          this.payloadIndex = 0;
          this.checksum = 0;
          this.state = "PAYLOAD";
        }
        break;

      case "PAYLOAD":
        this.payload[this.payloadIndex++] = byte;
        this.checksum = (this.checksum + byte) & 0xff;
        if (this.payloadIndex === this.payloadLength) {
          this.state = "CHECKSUM";
        }
        break;

      case "CHECKSUM": {
        const expectedChecksum = ~this.checksum & 0xff;
        if (byte === expectedChecksum) {
          this.parsePayload();
        }
        this.state = "SYNC";
        break;
      }
    }
  }

  parsePayload() {
    let index = 0;
    const data: Record<string, unknown> = {};

    while (index < this.payloadLength) {
      while (this.payload[index] === 0x55) {
        index++;
      }

      const code = this.payload[index++];

      if (code >= 0x80) {
        const length = this.payload[index++];
        const value = this.payload.slice(index, index + length);
        index += length;
        this.handleMultiByteCode(code, value, data);
      } else {
        const value = this.payload[index++];
        this.handleSingleByteCode(code, value, data);
      }
    }

    if (Object.keys(data).length > 0) {
      this.onData(data);
    }
  }

  handleSingleByteCode(
    code: number,
    value: number,
    data: Record<string, unknown>,
  ) {
    switch (code) {
      case 0x02:
        data.poorSignal = value;
        break;
      case 0x04:
        data.attention = value;
        break;
      case 0x05:
        data.meditation = value;
        break;
      case 0x16:
        data.blinkStrength = value;
        break;
    }
  }

  handleMultiByteCode(
    code: number,
    value: Uint8Array,
    data: Record<string, unknown>,
  ) {
    const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
    switch (code) {
      case 0x80:
        data.raw = view.getInt16(0, false);
        break;
      case 0x83:
        data.eegPower = {
          delta: this.readUint24(value, 0),
          theta: this.readUint24(value, 3),
          lowAlpha: this.readUint24(value, 6),
          highAlpha: this.readUint24(value, 9),
          lowBeta: this.readUint24(value, 12),
          highBeta: this.readUint24(value, 15),
          lowGamma: this.readUint24(value, 18),
          midGamma: this.readUint24(value, 21),
        };
        break;
    }
  }

  readUint24(buffer: Uint8Array, offset: number) {
    return (
      (buffer[offset] << 16) | (buffer[offset + 1] << 8) | buffer[offset + 2]
    );
  }
}

function getSignalBadge(poorSignal: number) {
  const quality = 100 - (poorSignal / 200) * 100;
  if (quality < 20) return "Poor";
  if (quality < 70) return "Fair";
  return "Excellent";
}

// Brain / psychology icon as inline SVG
function BrainIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2a4.5 4.5 0 0 1 4.5 4.5v.5h.5a3.5 3.5 0 0 1 0 7H9a5 5 0 0 1 0-10h.5V4A2 2 0 0 0 7.5 2z" />
      <path d="M14.5 2a4.5 4.5 0 0 0-4.5 4.5v.5h-.5a3.5 3.5 0 0 0 0 7H15a5 5 0 0 0 0-10h-.5V4A2 2 0 0 1 16.5 2z" />
      <path d="M9 14v7M15 14v7M12 14v7" />
    </svg>
  );
}

export default function TestGuidePage() {
  type ConnectionStatus = "disconnected" | "connecting" | "connected";
  
  const navigate = useNavigate();

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [isMocking, setIsMocking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mindwaveData, setMindwaveData] = useState({
    attention: 0,
    meditation: 0,
    poorSignal: 200,
    eegPower: null as Record<string, number> | null,
  });
  const [chartData, setChartData] = useState<Array<{ time: string; attention: number; meditation: number }>>(
    Array(50).fill(null).map((_, i) => ({ 
      time: `${i}s`, 
      attention: 0, 
      meditation: 0 
    }))
  );

  const parserRef = useRef<MindWaveParser | null>(null);
  const portRef = useRef<{
    readable: ReadableStream<Uint8Array>;
    open: (options: { baudRate: number }) => Promise<void>;
    close: () => Promise<void>;
  } | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null,
  );
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dataCountRef = useRef(0);

  useEffect(() => {
    parserRef.current = new MindWaveParser();
    parserRef.current.onData = (data: Record<string, unknown>) => {
      const attention = (data.attention as number) ?? 0;
      const meditation = (data.meditation as number) ?? 0;
      
      setMindwaveData((prev) => ({
        attention,
        meditation,
        poorSignal: (data.poorSignal as number) ?? prev.poorSignal,
        eegPower: (data.eegPower as Record<string, number>) ?? prev.eegPower,
      }));

      // Update chart data
      setChartData((prev) => {
        const newData = [...prev.slice(1)];
        dataCountRef.current += 1;
        newData.push({
          time: `${dataCountRef.current * 0.5}s`,
          attention,
          meditation,
        });
        return newData;
      });
    };

    return () => {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
      if (readerRef.current) readerRef.current.cancel();
      if (portRef.current) portRef.current.close();
    };
  }, []);

  // 연결 완료 후 MeditationSetupPage로 이동
  useEffect(() => {
    if (connectionStatus === "connected") {
      const timer = setTimeout(() => {
        navigate("/meditationsetup");
      }, 2000); // 2초 후 이동

      return () => clearTimeout(timer);
    }
  }, [connectionStatus, navigate]);

  const handleConnect = async () => {
    if (connectionStatus === "connected") {
      setConnectionStatus("disconnected");
      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
        } catch {
          // ignore
        }
      }
      if (portRef.current) {
        try {
          await portRef.current.close();
        } catch {
          // ignore
        }
      }
      return;
    }

    if (!("serial" in navigator)) {
      alert(
        "이 브라우저는 Web Serial API를 지원하지 않습니다. Chrome 또는 Edge 브라우저를 사용해 주세요.",
      );
      return;
    }

    try {
      setConnectionStatus("connecting");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serial = navigator.serial as any;
      const port = await serial.requestPort();
      await port.open({ baudRate: 57600 });
      portRef.current = port;

      setConnectionStatus("connected");
      setLoading(true);

      const reader = port.readable.getReader();
      readerRef.current = reader;

      while (port.readable) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (parserRef.current) {
              parserRef.current.parse(value);
            }
          }
        } catch (error: unknown) {
          const err = error as { name?: string };
          if (err.name !== "NotAllowedError") {
            console.error(error);
          }
          break;
        } finally {
          reader.releaseLock();
        }
      }

      setConnectionStatus("disconnected");
      setLoading(false);
    } catch (error: unknown) {
      console.error("Connection failed:", error);
      setConnectionStatus("disconnected");
      setLoading(false);
    }
  };

  const handleMockMode = () => {
    if (isMocking) {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
      setIsMocking(false);
      setLoading(false);
      return;
    }

    setIsMocking(true);
    setLoading(true);

    mockIntervalRef.current = setInterval(() => {
      if (parserRef.current) {
        parserRef.current.onData({
          attention: Math.floor(Math.random() * 100),
          meditation: Math.floor(Math.random() * 100),
          poorSignal: Math.floor(Math.random() * 50),
          eegPower: {
            delta: Math.random() * 1000,
            theta: Math.random() * 800,
            lowAlpha: Math.random() * 600,
            highAlpha: Math.random() * 600,
            lowBeta: Math.random() * 400,
            highBeta: Math.random() * 400,
            lowGamma: Math.random() * 200,
            midGamma: Math.random() * 200,
          },
          raw: (Math.random() - 0.5) * 400,
        });
      }
    }, 500);
  };

  const signalQuality = 100 - (mindwaveData.poorSignal / 200) * 100;
  const signalBadge = getSignalBadge(mindwaveData.poorSignal);

  const STATUS_ITEMS = [
    {
      id: "signal",
      badge: signalBadge,
      title: "Signal Strength",
      desc: `${Math.round(signalQuality)}% Connection Quality`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>
      ),
    },
    {
      id: "attention",
      badge: "Active",
      title: "Attention Level",
      desc: `${mindwaveData.attention}%`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      ),
    },
    {
      id: "meditation",
      badge: "Calm",
      title: "Meditation Level",
      desc: `${mindwaveData.meditation}%`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <main className={styles.root}>
      {/* Central content */}
      <div className={styles.content}>
        {/* Heading */}
        <div className={styles.heading}>
          <h1 className={styles.title}>
            {connectionStatus === "connected"
              ? "Connected to MindWave"
              : connectionStatus === "connecting"
                ? "Connecting..."
                : "Connect a device"}
          </h1>
          <p className={styles.subtitle}>
            {connectionStatus === "connected"
              ? "Receiving real-time brainwave data from your sanctuary."
              : isMocking
                ? "Demo mode active - showing simulated data."
                : "Choose to connect a device or enter demo mode."}
          </p>
        </div>

        {/* Orb */}
        <div className={styles.orbWrap}>
          {(loading || connectionStatus === "connected") && (
            <>
              <div className={styles.orbPing} />
              <div className={styles.orbPulse} />
            </>
          )}
          <div className={styles.orb}>
            <BrainIcon />
          </div>
          <div className={styles.orbBadge}>
            {connectionStatus === "connected" ? "Active" : "Idle"}
          </div>
        </div>

        {/* Chart */}
        {(loading || connectionStatus === "connected" || isMocking) && (
          <div className={styles.chartContainer}>
            <h2 className={styles.chartTitle}>Brain Activity</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(117, 92, 28, 0.1)" />
                <XAxis dataKey="time" stroke="rgba(117, 92, 28, 0.5)" height={20} />
                <YAxis stroke="rgba(117, 92, 28, 0.5)" domain={[0, 100]} width={35} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(254, 249, 243, 0.95)",
                    border: "1px solid rgba(117, 92, 28, 0.2)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "rgba(117, 92, 28, 0.8)" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attention"
                  stroke="#755C1C"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                  name="Attention"
                />
                <Line
                  type="monotone"
                  dataKey="meditation"
                  stroke="#FFB84D"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                  name="Meditation"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Cards */}
        <div className={styles.statusGrid}>
          {STATUS_ITEMS.map((item) => (
            <div key={item.id} className={styles.statusCard}>
              <div className={styles.statusCardTop}>
                <span className={styles.statusIcon}>{item.icon}</span>
                <span className={styles.statusBadge}>{item.badge}</span>
              </div>
              <div>
                <h3 className={styles.statusTitle}>{item.title}</h3>
                <p className={styles.statusDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={handleConnect}
            disabled={isMocking}
          >
            {connectionStatus === "connecting"
              ? "Connecting..."
              : connectionStatus === "connected"
                ? "Disconnect"
                : "Connect Device"}
          </button>
          <button className={styles.btnGhost} onClick={handleMockMode}>
            {isMocking ? "Exit Demo Mode" : "Start Demo Mode"}
          </button>
        </div>
      </div>
    </main>
  );
}
