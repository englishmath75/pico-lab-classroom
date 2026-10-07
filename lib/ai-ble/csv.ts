import { LABELS, type TrainingRow } from "../../app/ai-ble/types";
export const HEADER =
  "schema_version,source,session_id,sample_index,light,temperature,humidity,label";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function exportCsv(rows: TrainingRow[]) {
  return (
    HEADER +
    "\n" +
    rows
      .map((r) =>
        [
          r.schema_version,
          r.source,
          r.session_id,
          r.sample_index,
          r.light,
          r.temperature,
          r.humidity,
          r.label,
        ].join(","),
      )
      .join("\n") +
    "\n"
  );
}
export function importCsv(text: string) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/);
  const rows: TrainingRow[] = [];
  const errors: string[] = [];
  const seen = new Map<string, string>();
  const sessions = new Map<string, string>();
  const invalidSessions = new Set<string>();
  if (lines.shift() !== HEADER)
    return {
      rows,
      errors: ["CSV v1 헤더가 일치하지 않습니다."],
      duplicates: 0,
    };
  let duplicates = 0;
  lines.forEach((line, i) => {
    const c = line.split(",");
    const [version, source, session, index, l, t, h, label] = c;
    const nums = [index, l, t, h].map(Number);
    const valid =
      c.length === 8 &&
      version === "1" &&
      source === "real" &&
      uuid.test(session) &&
      [index, l, t, h].every((s) => /^\d+(\.\d)?$/.test(s)) &&
      nums.every(Number.isFinite) &&
      Number.isInteger(nums[0]) &&
      nums[0] >= 1 &&
      Number.isInteger(nums[1]) &&
      nums[1] >= 0 &&
      nums[1] <= 65535 &&
      nums[2] >= 0 &&
      nums[2] <= 50 &&
      nums[3] >= 0 &&
      nums[3] <= 100 &&
      LABELS.includes(label as TrainingRow["label"]);
    if (!valid) {
      errors.push(`${i + 2}행: 형식·범위·source·label 오류`);
      return;
    }
    if (sessions.has(session) && sessions.get(session) !== label) {
      invalidSessions.add(session);
      errors.push(`${i + 2}행: 회차 안 라벨 혼재 — 해당 회차 전체 제외`);
      return;
    }
    sessions.set(session, label);
    const key = session + ":" + index;
    if (seen.has(key)) {
      if (seen.get(key) !== line) {
        invalidSessions.add(session);
        errors.push(`${i + 2}행: 동일 회차/번호의 값 충돌 — 회차 전체 제외`);
      } else duplicates++;
      return;
    }
    seen.set(key, line);
    rows.push({
      schema_version: 1,
      source: "real",
      session_id: session,
      sample_index: nums[0],
      light: nums[1],
      temperature: nums[2],
      humidity: nums[3],
      label: label as TrainingRow["label"],
    });
  });
  return {
    rows: rows.filter((r) => !invalidSessions.has(r.session_id)),
    errors,
    duplicates,
  };
}
export function distribution(rows: TrainingRow[]) {
  return LABELS.map((label) => {
    const group = rows.filter((r) => r.label === label);
    const counts = new Map<string, number>();
    group.forEach((r) =>
      counts.set(r.session_id, (counts.get(r.session_id) || 0) + 1),
    );
    return {
      label,
      rows: group.length,
      sessions: counts.size,
      qualified: [...counts.values()].filter((n) => n >= 5).length,
    };
  });
}
export function download(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
