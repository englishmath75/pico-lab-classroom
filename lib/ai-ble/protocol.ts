import { LABELS, type SensorPacket } from "../../app/ai-ble/types";
export const SERVICE_UUID = "7e57c001-6f5b-4c8a-9d2e-73b1a0c2d301";
export const TX_UUID = "7e57c002-6f5b-4c8a-9d2e-73b1a0c2d301";
export const SEQ_MOD = 2 ** 31;
// Course kit contract: a 3.3V-qualified DHT11 SKU rated 0..50 C. Confirm SKU before class.
export const TEMP_RANGE = [0, 50] as const;
const numberIn = (x: unknown, lo: number, hi: number): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= lo && x <= hi;
export function validatePacket(x: unknown): x is SensorPacket {
  if (!x || typeof x !== "object") return false;
  const p = x as SensorPacket;
  if (
    p.v !== 1 ||
    !Number.isInteger(p.seq) ||
    !numberIn(p.seq, 0, SEQ_MOD - 1) ||
    !Number.isInteger(p.uptime_ms) ||
    !numberIn(p.uptime_ms, 0, Number.MAX_SAFE_INTEGER)
  )
    return false;
  if (
    !(p.state === null || LABELS.includes(p.state)) ||
    !(
      p.model_id === null ||
      (typeof p.model_id === "string" && /^dt-[a-f0-9]{12}$/.test(p.model_id))
    )
  )
    return false;
  if (
    ![
      null,
      "DHT_READ",
      "MODEL_MISSING",
      "MODEL_ERROR",
      "OUT_OF_DOMAIN",
    ].includes(p.error)
  )
    return false;
  if (p.state !== null && (!p.model_id || p.error !== null)) return false;
  if (p.error === "DHT_READ")
    return (
      p.light === null &&
      p.temperature === null &&
      p.humidity === null &&
      p.state === null
    );
  return (
    numberIn(p.light, 0, 65535) &&
    Number.isInteger(p.light) &&
    numberIn(p.temperature, ...TEMP_RANGE) &&
    numberIn(p.humidity, 0, 100)
  );
}
export class PacketAssembler {
  errors = 0;
  lost = 0;
  duplicates = 0;
  diagnostic: number | null = null;
  private pending: {
    id: number;
    count: number;
    next: number;
    bytes: number[];
    started: number;
  } | null = null;
  private seq: number | null = null;
  reset() {
    this.pending = null;
    this.seq = null;
    this.diagnostic = null;
    this.errors = this.lost = this.duplicates = 0;
  }
  expire(now: number) {
    if (this.pending && now - this.pending.started >= 2000) {
      this.pending = null;
      this.errors++;
    }
  }
  feed(frame: Uint8Array, now: number): SensorPacket | null {
    this.expire(now);
    const [magic, id, index, count] = frame;
    if (
      frame.length < 4 ||
      frame.length > 20 ||
      magic !== 0xa1 ||
      count < 1 ||
      count > 32 ||
      index >= count
    ) {
      this.pending = null;
      this.errors++;
      return null;
    }
    if (index === 0) {
      if (this.pending) this.errors++;
      this.pending = { id, count, next: 0, bytes: [], started: now };
    }
    const b = this.pending;
    if (!b || b.id !== id || b.count !== count || b.next !== index) {
      this.pending = null;
      this.errors++;
      return null;
    }
    b.bytes.push(...frame.slice(4));
    b.next++;
    if (b.bytes.length > 512) {
      this.pending = null;
      this.errors++;
      return null;
    }
    if (b.next < count) return null;
    this.pending = null;
    try {
      const p: unknown = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(
          new Uint8Array(b.bytes),
        ),
      );
      // Lesson 3 uses a deliberately separate schema; never emit it as a SensorPacket.
      if (
        p &&
        typeof p === "object" &&
        "diagnostic" in p &&
        p.diagnostic === "counter" &&
        "count" in p &&
        Number.isSafeInteger(p.count) &&
        Number(p.count) >= 0
      ) {
        this.diagnostic = Number(p.count);
        return null;
      }
      if (!validatePacket(p)) throw new Error("schema");
      this.diagnostic = null;
      if (this.seq !== null) {
        const delta = (p.seq - this.seq + SEQ_MOD) % SEQ_MOD;
        if (delta === 0 || delta >= SEQ_MOD / 2) {
          this.duplicates++;
          return null;
        }
        this.lost += delta - 1;
      }
      this.seq = p.seq;
      return p;
    } catch {
      this.errors++;
      return null;
    }
  }
}
