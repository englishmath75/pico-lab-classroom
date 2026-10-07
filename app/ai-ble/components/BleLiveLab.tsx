import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { usePicoBle } from "@/hooks/use-pico-ble";
export function BleLiveLab({ ble }: { ble: ReturnType<typeof usePicoBle> }) {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const entry = `${new Date().toLocaleTimeString()} ${ble.status} ${ble.error || ""} ${ble.latest ? JSON.stringify(ble.latest) : ""}`;
    setLogs(previous => [...previous, entry].slice(-30));
  }, [ble.latest, ble.status, ble.error]);
  const busy = [
    "requesting",
    "connecting",
    "subscribing",
    "waiting",
    "streaming",
    "stale",
  ].includes(ble.status);
  return (
    <section className="ai-card">
      <h2>BLE LIVE LAB</h2>
      <p className="text-xl font-bold">Pico 2 W · {busy ? "연결 / 수신 중" : "연결 대기"}</p>
      <p role="status" aria-live="polite">
        {ble.status.toUpperCase()} · {ble.kit || "연결된 키트 없음"} {ble.error}
      </p>
      <div className="flex flex-wrap gap-3 my-4">
        <Button
          disabled={busy || ble.status === "unsupported"}
          onClick={ble.connect}
        >
          Pico 2 W 연결
        </Button>
        <Button variant="outline" onClick={ble.disconnect} disabled={!busy}>
          연결 해제
        </Button>
      </div>
      <details>
        <summary>상세 데이터 보기</summary>
      <p>
        {ble.diagnostic !== null && (
          <strong>
            DIAGNOSTIC 카운터 {ble.diagnostic} · 실측 아님 / 수집 비활성
          </strong>
        )}
      </p>
      <p>
        완성 패킷 {ble.receivedCount}개 · 손실·파싱·중복 {ble.droppedCount}개
      </p>
      <h3>최근 BLE log</h3>
      <div role="log" aria-label="최근 BLE 로그"><pre>{logs.join("\n") || "아직 수신 기록이 없습니다."}</pre></div>
      <p>최근 30개 연결 상태 및 파싱된 수신 데이터를 표시합니다.</p>
      </details>
      <p>
        Galaxy Chrome에서 HTTPS로 열고 OS Bluetooth와 권한을 켜세요. 같은 보드는
        한 폰만 연결합니다. 끊긴 뒤에는 연결 버튼을 다시 누르고 새 측정 회차를
        시작하세요.
      </p>
      {ble.status === "unsupported" && (
        <p className="bg-amber-50 p-3">
          이 브라우저에서는 센서 직접 연결을 지원하지 않습니다. Galaxy
          Chrome에서 링크를 열거나 PC에서 CSV 실습을 계속하세요.
        </p>
      )}
      <details>
        <summary>연결 문제 해결</summary>
        <p>
          API가 있어도 어댑터 가용성은 보장되지 않습니다. Windows Chrome/Edge는
          어댑터·OS·학교 정책 확인이 필요합니다. iPhone/iPad Safari, Firefox,
          인앱 브라우저는 기능 탐지 결과를 따릅니다.
        </p>
        <p>
          WAITING: 연결됐지만 아직 유효 센서 패킷이 없습니다. STALE: 9초 이상
          수신 없음, 수집 중지. ERROR: 권한·서비스 UUID·DHT 오류 원인을
          확인합니다.
        </p>
        <p>
          BLE 자체는 인터넷 없이 동작하지만 첫 페이지 로딩과 Colab에는 인터넷이
          필요합니다.
        </p>
      </details>
    </section>
  );
}
