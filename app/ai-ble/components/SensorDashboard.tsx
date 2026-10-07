import { useEffect, useState } from "react";
import type { ConnectionStatus, LiveSample } from "../types";
import { demoSample } from "@/lib/ai-ble/demo";
export function SensorDashboard({
  sample,
  status,
  hidden,
}: {
  sample: LiveSample | null;
  status: ConnectionStatus;
  hidden: boolean;
}) {
  const [now, setNow] = useState(Date.now());
  const [demo, setDemo] = useState(false);
  const [history, setHistory] = useState<LiveSample[]>([]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (sample) setHistory((h) => [...h, sample].slice(-60));
    else setHistory([]);
  }, [sample]);
  const source = demo ? demoSample : sample;
  const badge = demo
    ? "DEMO"
    : sample?.error
      ? "ERROR"
      : status === "streaming"
        ? "LIVE"
        : status === "stale"
          ? "STALE"
          : "WAITING";
  return (
    <section className="ai-card">
      <h2>
        Sensor Dashboard{" "}
        <span className="text-sm rounded-full bg-slate-100 p-2">{badge}</span>
      </h2>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={demo}
          onChange={(e) => setDemo(e.target.checked)}
        />
        DEMO 예시 보기 (수집·CSV와 분리)
      </label>
      <p>
        마지막 실측 수신:{" "}
        {sample
          ? Math.max(0, Math.floor((now - sample.receivedAt) / 1000)) + "초 전"
          : "없음"}
      </p>
      <div className="grid sm:grid-cols-3 gap-3 my-4">
        {(
          [
            ["조도", "light", "raw"],
            ["온도", "temperature", "°C"],
            ["습도", "humidity", "%"],
          ] as const
        ).map(([title, key, unit]) => (
          <div className="rounded-2xl bg-slate-950 text-white p-5" key={key}>
            <p>{title}</p>
            <p className="text-3xl font-black mt-3">
              {!source ? "--" : hidden ? "가림" : source[key]?.toLocaleString("en-US") ?? "--"}{" "}
              <small className="text-sm">{unit}</small>
            </p>
          </div>
        ))}
      </div>
      <p>
        AI 판단:{" "}
        {!source ? "연결 대기" : demo ? "모델 미적용" : sample?.error || sample?.state || "모델 미적용"}{" "}
        · model_id: {demo ? "없음" : sample?.model_id || "없음"}
      </p>
      {sample?.state && !sample.error && !demo && <p className="text-lg font-bold">{{GOOD: "쾌적", DARK: "조명이 필요합니다", VENTILATE: "환기가 필요합니다", HOT_HUMID: "냉방/제습을 검토하세요"}[sample.state]}</p>}
      <p>
        BLE state는 현재 입력의 원시 예측입니다. LED·부저는 3회 연속 일치 후
        바뀌며 사람이 정한 출력 정책입니다.
      </p>
      {!hidden && history.length > 1 && (
        <figure>
          <svg
            viewBox="0 0 600 110"
            role="img"
            aria-label="최근 60개 이내 실측 조도 raw 추이"
            className="w-full h-28"
          >
            <polyline
              fill="none"
              stroke="#0891b2"
              strokeWidth="2"
              points={history
                .filter((p) => p.light !== null)
                .map(
                  (p, i) =>
                    `${(i * 600) / Math.max(1, history.length - 1)},${100 - ((p.light || 0) / 65535) * 95}`,
                )
                .join(" ")}
            />
          </svg>
          <figcaption>
            최근 {history.length}개 패킷 · 조도 raw (센서 오류값 제외)
          </figcaption>
        </figure>
      )}
    </section>
  );
}
