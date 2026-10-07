import {
  LABELS,
  type ConnectionStatus,
  type LiveSample,
  type StateLabel,
  type RowBudget,
} from "../../app/ai-ble/types";
import { validatePacket } from "./protocol";
export type VerificationRow = {
  sample: LiveSample;
  label: StateLabel;
  session_id: string;
};
export class VerificationRecorder {
  rows: VerificationRow[] = [];
  armed: { label: StateLabel; after: number; session_id: string } | null = null;
  arm(label: StateLabel, now: number, id: string) {
    if (!LABELS.includes(label)) throw Error("label");
    this.armed = { label, after: now, session_id: id };
  }
  stop() {
    this.armed = null;
  }
  accept(
    p: LiveSample | null,
    status: ConnectionStatus,
    now: number,
    budget: RowBudget,
  ) {
    if (!this.armed) return false;
    if (
      status !== "streaming" ||
      !p ||
      p.source !== "real" ||
      !validatePacket(p) ||
      now - p.receivedAt >= 9000
    ) {
      this.stop();
      return false;
    }
    if (p.receivedAt <= this.armed.after) return false;
    if (this.rows.length >= 30 || budget.training + budget.validation >= 3000) {
      this.stop();
      return false;
    }
    this.rows.push({
      sample: p,
      label: this.armed.label,
      session_id: this.armed.session_id,
    });
    budget.validation = this.rows.length;
    this.stop();
    return true;
  }
  csv() {
    return (
      "schema_version,source,session_id,sample_index,light,temperature,humidity,label,state,model_id,error\n" +
      this.rows
        .map((r, i) =>
          [
            1,
            "real",
            r.session_id,
            i + 1,
            r.sample.light ?? "",
            r.sample.temperature ?? "",
            r.sample.humidity ?? "",
            r.label,
            r.sample.state ?? "",
            r.sample.model_id ?? "",
            r.sample.error ?? "",
          ].join(","),
        )
        .join("\n") +
      "\n"
    );
  }
}
