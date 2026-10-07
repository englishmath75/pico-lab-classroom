import {
  LABELS,
  type ConnectionStatus,
  type LiveSample,
  type StateLabel,
  type TrainingRow,
} from "../../app/ai-ble/types";
import { validatePacket } from "./protocol";
export class Collector {
  rows: TrainingRow[] = [];
  reasons: string[] = [];
  active = false;
  session: string | null = null;
  label: StateLabel | null = null;
  private after = 0;
  private seen = new Set<number>();
  private count = 0;
  start(label: StateLabel, now: number, id: string) {
    if (!LABELS.includes(label)) throw Error("label");
    this.label = label;
    this.session = id;
    this.after = now;
    this.count = 0;
    this.seen.clear();
    this.active = false;
  }
  arm() {
    if (this.session && this.count === 0) this.active = true;
  }
  stop() {
    this.active = false;
    this.session = null;
  }
  accept(
    p: LiveSample | null,
    status: ConnectionStatus,
    now: number,
    capacity = 3000,
  ) {
    if (!this.active) return false;
    if (
      status !== "streaming" ||
      !p ||
      p.source !== "real" ||
      !validatePacket(p) ||
      p.error ||
      p.light === null ||
      p.temperature === null ||
      p.humidity === null ||
      now - p.receivedAt >= 9000
    ) {
      this.stop();
      return false;
    }
    if (
      Math.abs(p.temperature * 10 - Math.round(p.temperature * 10)) > 1e-7 ||
      Math.abs(p.humidity * 10 - Math.round(p.humidity * 10)) > 1e-7
    ) {
      this.stop();
      return false;
    }
    if (
      p.receivedAt <= this.after ||
      this.seen.has(p.seq) ||
      !this.session ||
      !this.label
    )
      return false;
    if (this.rows.length >= capacity) {
      this.stop();
      return false;
    }
    this.seen.add(p.seq);
    this.rows.push({
      schema_version: 1,
      source: "real",
      session_id: this.session,
      sample_index: ++this.count,
      light: p.light,
      temperature: p.temperature,
      humidity: p.humidity,
      label: this.label,
    });
    if (this.count === 5) this.stop();
    return true;
  }
  remove(id: string, reason: string) {
    if (!reason.trim()) return;
    this.rows = this.rows.filter((r) => r.session_id !== id);
    this.reasons.push(reason);
  }
}
