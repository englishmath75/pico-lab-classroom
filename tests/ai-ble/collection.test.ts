import test from "node:test";
import assert from "node:assert/strict";
import { Collector } from "../../lib/ai-ble/collection";
import {
  HEADER,
  exportCsv,
  importCsv,
  distribution,
} from "../../lib/ai-ble/csv";
import type { LiveSample } from "../../app/ai-ble/types";
import { lessons } from "../../app/ai-ble/course-data";
import { rubric } from "../../app/ai-ble/rubric";
import { parseProgress } from "../../hooks/use-ai-ble-progress";
import { VerificationRecorder } from "../../lib/ai-ble/verification";
const id = "00000000-0000-4000-8000-000000000001";
test("final verification records only future real inputs, keeps errors, uses separate CSV and shared row budget", () => {
  const recorder = new VerificationRecorder();
  const budget = { training: 2998, validation: 0 };
  recorder.arm("GOOD", 4000, id);
  assert.equal(recorder.accept(sample(1), "streaming", 4000, budget), false);
  assert.equal(
    recorder.accept(
      { ...sample(2), state: "GOOD", model_id: "dt-123456789abc" },
      "streaming",
      7000,
      budget,
    ),
    true,
  );
  recorder.arm("DARK", 7000, id);
  assert.equal(
    recorder.accept(
      {
        ...sample(3),
        light: null,
        temperature: null,
        humidity: null,
        error: "DHT_READ",
      },
      "streaming",
      10000,
      budget,
    ),
    true,
  );
  recorder.arm("GOOD", 10000, id);
  assert.equal(recorder.accept(sample(4), "streaming", 13000, budget), false);
  assert.equal(recorder.rows.length, 2);
  assert.equal(budget.training + budget.validation, 3000);
  assert.ok(recorder.csv().includes("state,model_id,error"));
  assert.equal(importCsv(recorder.csv()).rows.length, 0);
  const c = new Collector();
  c.start("GOOD", 0, id);
  c.arm();
  assert.equal(c.accept(sample(1), "streaming", 4000, 0), false);
});
const sample = (seq: number): LiveSample => ({
  v: 1,
  seq,
  uptime_ms: 3000 * seq,
  source: "real",
  receivedAt: 1000 + seq * 3000,
  light: 12,
  temperature: 25,
  humidity: 50,
  state: null,
  model_id: null,
  error: null,
});
test("progress JSON/schema recovery stores only progress fields", () => {
  for (const raw of [
    "{",
    "null",
    '{"version":2}',
    '{"version":1,"completedLessons":[9],"checks":{}}',
  ])
    assert.deepEqual(parseProgress(raw), {
      version: 1,
      completedLessons: [],
      checks: {},
    });
  assert.deepEqual(
    parseProgress(
      JSON.stringify({
        version: 1,
        completedLessons: [1, 1],
        checks: { "L1-usb": true },
        sensor: 123,
      }),
    ),
    { version: 1, completedLessons: [1], checks: { "L1-usb": true } },
  );
});
test("manual start + arm, future samples, 5 unique values then automatic stop", () => {
  const c = new Collector();
  c.start("GOOD", 1000, id);
  assert.equal(c.accept(sample(1), "streaming", 4000), false);
  c.arm();
  assert.equal(c.accept(sample(0), "streaming", 1000), false);
  for (let i = 1; i <= 5; i++) {
    assert.ok(c.accept(sample(i), "streaming", 1000 + i * 3000));
    assert.equal(c.accept(sample(i), "streaming", 1000 + i * 3000), false);
  }
  assert.equal(c.rows.length, 5);
  assert.equal(c.active, false);
  assert.deepEqual(
    c.rows.map((r) => r.sample_index),
    [1, 2, 3, 4, 5],
  );
});
test("demo, error, stale, null, disconnected cannot be collected", () => {
  for (const p of [
    { ...sample(1), source: "demo" },
    {
      ...sample(1),
      error: "DHT_READ",
      light: null,
      temperature: null,
      humidity: null,
    },
    { ...sample(1), temperature: null },
  ]) {
    const c = new Collector();
    c.start("GOOD", 0, id);
    c.arm();
    assert.equal(c.accept(p as LiveSample, "streaming", 4000), false);
    assert.equal(c.rows.length, 0);
    assert.equal(c.active, false);
  }
  for (const status of ["stale", "disconnected", "waiting"] as const) {
    const c = new Collector();
    c.start("GOOD", 0, id);
    c.arm();
    assert.equal(c.accept(sample(1), status, 4000), false);
    assert.equal(c.session, null);
  }
});
test("stop or reconnection requires a fresh session; last sample is not reused", () => {
  const c = new Collector();
  c.start("DARK", 0, id);
  c.arm();
  c.accept(sample(1), "streaming", 4000);
  c.stop();
  c.arm();
  assert.equal(c.accept(sample(2), "streaming", 7000), false);
  c.start("GOOD", 7000, id + "x");
  c.arm();
  assert.equal(c.accept(sample(2), "streaming", 7000), false);
});
test("CSV roundtrip, duplicate upload, conflicts and malformed data", () => {
  const row = {
    schema_version: 1 as const,
    source: "real" as const,
    session_id: id,
    sample_index: 1,
    light: 12,
    temperature: 25.1,
    humidity: 50,
    label: "GOOD" as const,
  };
  const csv = exportCsv([row]);
  assert.equal(csv.split("\n")[0], HEADER);
  assert.ok(!csv.includes("state"));
  assert.deepEqual(importCsv(csv).rows, [row]);
  assert.equal(importCsv(exportCsv([row, row])).duplicates, 1);
  const conflict = importCsv(exportCsv([row, { ...row, light: 13 }]));
  assert.equal(conflict.rows.length, 0);
  assert.equal(conflict.errors.length, 1);
  for (const change of [
    { source: "demo" },
    { temperature: 25.11 },
    { light: 65536 },
    { label: "UNKNOWN" },
    { session_id: "=formula" },
    { humidity: Infinity },
  ])
    assert.equal(
      importCsv(exportCsv([{ ...row, ...change } as typeof row])).errors.length,
      1,
    );
  assert.equal(importCsv("wrong\n").errors.length, 1);
});
test("mixed labels exclude entire session with visible reason", () => {
  const csv =
    HEADER + `\n1,real,${id},1,12,25,50,GOOD\n1,real,${id},2,12,25,50,DARK`;
  const result = importCsv(csv);
  assert.equal(result.rows.length, 0);
  assert.equal(result.errors.length, 1);
});
test("qualified distribution requires at least 5 valid rows per session", () => {
  const c = new Collector();
  c.start("GOOD", 0, id);
  c.arm();
  for (let i = 1; i <= 5; i++)
    c.accept(sample(i), "streaming", sample(i).receivedAt);
  assert.equal(distribution(c.rows)[0].qualified, 1);
  assert.equal(distribution(c.rows)[1].qualified, 0);
});
test("all 8 lessons have uninterrupted 0-50 timeline, assessments, prompts; rubric sums 100", () => {
  assert.equal(lessons.length, 8);
  for (const l of lessons) {
    let end = 0;
    for (const t of l.timeline) {
      assert.equal(t.start, end, `lesson ${l.id}`);
      assert.ok(t.end > t.start);
      end = t.end;
    }
    assert.equal(end, 50);
    assert.equal(l.assessments.length, 3);
    assert.ok(l.teacherPrompts.length >= 2);
    assert.ok(l.assessments.every((q) => q.question && q.answer));
  }
  assert.equal(
    rubric.reduce((sum, r) => sum + r.max, 0),
    100,
  );
});
