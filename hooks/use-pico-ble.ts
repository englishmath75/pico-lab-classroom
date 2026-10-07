import { useCallback, useEffect, useRef, useState } from "react";
import { PacketAssembler, SERVICE_UUID, TX_UUID } from "../lib/ai-ble/protocol";
import type { ConnectionStatus, LiveSample } from "../app/ai-ble/types";
interface Characteristic extends EventTarget {
  value?: DataView;
  startNotifications(): Promise<Characteristic>;
  stopNotifications(): Promise<Characteristic>;
}
interface Device extends EventTarget {
  name?: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<{
      getPrimaryService(
        uuid: string,
      ): Promise<{ getCharacteristic(uuid: string): Promise<Characteristic> }>;
    }>;
    disconnect(): void;
  };
}
interface Bluetooth {
  requestDevice(options: {
    filters: { services: string[] }[];
  }): Promise<Device>;
}
export function usePicoBle() {
  const bluetooth = (navigator as Navigator & { bluetooth?: Bluetooth })
    .bluetooth;
  const supported = !!bluetooth && window.isSecureContext;
  const [status, setStatus] = useState<ConnectionStatus>(
    supported ? "idle" : "unsupported",
  );
  const [latest, setLatest] = useState<LiveSample | null>(null);
  const [error, setError] = useState("");
  const [receivedCount, setReceived] = useState(0);
  const [droppedCount, setDropped] = useState(0);
  const [kit, setKit] = useState("");
  const [diagnostic, setDiagnostic] = useState<number | null>(null);
  const gen = useRef(0);
  const busy = useRef(false);
  const last = useRef(0);
  const connectedAt = useRef(0);
  const owners = useRef(new WeakMap<Device, number>());
  const parser = useRef(new PacketAssembler());
  const release = useRef<() => void>(() => {});
  const disconnect = useCallback(() => {
    ++gen.current;
    busy.current = false;
    release.current();
    release.current = () => {};
    parser.current.reset();
    last.current = 0;
    connectedAt.current = 0;
    setLatest(null);
    setDiagnostic(null);
    setKit("");
    setStatus(supported ? "disconnected" : "unsupported");
  }, [supported]);
  const connect = useCallback(async () => {
    if (!bluetooth || !supported || busy.current) return;
    disconnect();
    const token = ++gen.current;
    busy.current = true;
    setStatus("requesting");
    setError("");
    setReceived(0);
    setDropped(0);
    let device: Device | undefined;
    let tx: Characteristic | undefined;
    let selecting = true;
    const current = () => gen.current === token;
    const onValue = () => {
      if (!current() || !tx?.value) return;
      const d = tx.value;
      const p = parser.current.feed(
        new Uint8Array(d.buffer, d.byteOffset, d.byteLength),
        Date.now(),
      );
      setDiagnostic(parser.current.diagnostic);
      setDropped(
        parser.current.errors + parser.current.lost + parser.current.duplicates,
      );
      if (parser.current.diagnostic !== null) {
        setLatest(null);
        last.current = 0;
        setStatus("waiting");
      }
      if (p) {
        last.current = Date.now();
        setLatest({ ...p, source: "real", receivedAt: last.current });
        setReceived((n) => n + 1);
        setStatus("streaming");
      }
    };
    const onDisconnect = () => {
      if (current()) disconnect();
    };
    const cleanup = () => {
      tx?.removeEventListener("characteristicvaluechanged", onValue);
      device?.removeEventListener("gattserverdisconnected", onDisconnect);
      // An old async attempt must not disconnect a newer lease of the same device.
      const owner = device ? owners.current.get(device) : undefined;
      if (device?.gatt?.connected && (owner === undefined || owner === token)) {
        void tx?.stopNotifications().catch(() => {});
        device.gatt.disconnect();
      }
      if (device && owner === token) owners.current.delete(device);
    };
    release.current = cleanup;
    try {
      // Must remain before any other await: called directly from the click gesture.
      device = await bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
      });
      selecting = false;
      if (!current()) {
        cleanup();
        return;
      }
      setKit(device.name || "선택한 키트");
      owners.current.set(device, token);
      device.addEventListener("gattserverdisconnected", onDisconnect);
      setStatus("connecting");
      const server = await device.gatt!.connect();
      if (!current()) {
        cleanup();
        return;
      }
      const service = await server.getPrimaryService(SERVICE_UUID);
      if (!current()) {
        cleanup();
        return;
      }
      tx = await service.getCharacteristic(TX_UUID);
      if (!current()) {
        cleanup();
        return;
      }
      setStatus("subscribing");
      tx.addEventListener("characteristicvaluechanged", onValue);
      await tx.startNotifications();
      if (!current()) {
        cleanup();
        return;
      }
      if (!last.current) setStatus("waiting");
      connectedAt.current = Date.now();
    } catch (e) {
      cleanup();
      if (current()) {
        busy.current = false;
        const name = (e as Error).name;
        const cancelled = selecting && name === "NotFoundError";
        release.current = () => {};
        setStatus(cancelled ? "idle" : "error");
        setError(
          cancelled
            ? "기기 선택을 취소했습니다."
            : name === "SecurityError" || name === "NotAllowedError"
              ? "HTTPS와 Bluetooth 권한을 확인하세요."
              : name === "NetworkError"
                ? "GATT 연결 실패: 다른 폰 연결을 해제하고 다시 연결하세요."
                : "서비스 또는 알림 연결 실패: Pico UUID와 펌웨어를 확인하세요.",
        );
      }
    }
  }, [bluetooth, supported, disconnect]);
  useEffect(() => {
    const timer = setInterval(() => {
      parser.current.expire(Date.now());
      setDropped(
        parser.current.errors + parser.current.lost + parser.current.duplicates,
      );
      const heartbeat = last.current || connectedAt.current;
      if (
        parser.current.diagnostic === null &&
        heartbeat &&
        Date.now() - heartbeat >= 9000
      )
        setStatus((s) => (s === "streaming" || s === "waiting" ? "stale" : s));
    }, 500);
    return () => {
      clearInterval(timer);
      ++gen.current;
      busy.current = false;
      release.current();
      parser.current.reset();
    };
  }, []);
  return {
    status,
    latest,
    error,
    receivedCount,
    droppedCount,
    kit,
    diagnostic,
    connect,
    disconnect,
  };
}
