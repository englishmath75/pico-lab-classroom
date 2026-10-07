import test from "node:test";
import assert from "node:assert/strict";
import {
  PacketAssembler,
  SEQ_MOD,
  validatePacket,
} from "../../lib/ai-ble/protocol";
export const packet = {
  v: 1 as const,
  seq: 0,
  uptime_ms: 0,
  light: 12345,
  temperature: 25.1,
  humidity: 52,
  state: null,
  model_id: null,
  error: null,
};
export function frames(value: unknown, id = 1) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return Array.from(
    { length: Math.ceil(bytes.length / 16) },
    (_, i) =>
      new Uint8Array([
        0xa1,
        id,
        i,
        Math.ceil(bytes.length / 16),
        ...bytes.slice(i * 16, i * 16 + 16),
      ]),
  );
}
function send(p: PacketAssembler, value: unknown, now = 0) {
  let result = null;
  for (const f of frames(value)) result = p.feed(f, now);
  return result;
}
test("20-byte fragments yield exactly one complete sample", () => {
  const p = new PacketAssembler();
  const fs = frames(packet);
  assert.ok(fs.every((f) => f.length <= 20));
  for (const f of fs.slice(0, -1)) assert.equal(p.feed(f, 0), null);
  assert.deepEqual(p.feed(fs.at(-1)!, 0), packet);
});
test("multiple messages, duplicates, older seq, wrap and missing samples", () => {
  const p = new PacketAssembler();
  assert.ok(send(p, { ...packet, seq: SEQ_MOD - 1 }));
  assert.ok(send(p, packet));
  assert.equal(send(p, packet), null);
  assert.equal(send(p, { ...packet, seq: SEQ_MOD - 1 }), null);
  assert.ok(send(p, { ...packet, seq: 3 }));
  assert.equal(p.lost, 2);
  assert.equal(p.duplicates, 2);
  p.reset();
  assert.ok(send(p, packet));
});
test("missing/out-of-order/mismatching/new first chunk recover", () => {
  for (const kind of ["missing", "order", "id", "count", "restart"]) {
    const p = new PacketAssembler();
    const fs = frames(packet);
    p.feed(fs[0], 0);
    if (kind === "missing") fs.splice(1, 1);
    if (kind === "order") [fs[1], fs[2]] = [fs[2], fs[1]];
    if (kind === "id") fs[1][1]++;
    if (kind === "count") fs[1][3]--;
    if (kind === "restart") p.feed(fs[0], 1);
    for (const f of fs.slice(1)) p.feed(f, 2);
    assert.ok(p.errors > 0);
    assert.ok(send(p, { ...packet, seq: 1 }, 100));
  }
});
test("timeout expires even with no subsequent notification", () => {
  const p = new PacketAssembler();
  p.feed(frames(packet)[0], 0);
  p.expire(2000);
  assert.equal(p.errors, 1);
  assert.ok(send(p, packet, 2001));
});
test("UTF-8 decoded once after reassembly, invalid UTF-8 rejected", () => {
  const p = new PacketAssembler();
  assert.ok(
    send(p, { ...packet, note: "가나다라마바사아자차카타파하".repeat(4) }),
  );
  p.feed(new Uint8Array([0xa1, 2, 0, 1, 0xff]), 0);
  assert.equal(p.errors, 1);
});
test("malformed headers, count and schema rejected with recovery", () => {
  const p = new PacketAssembler();
  for (const f of [
    [],
    [0xa1],
    [0, 0, 0, 1],
    [0xa1, 1, 0, 0],
    [0xa1, 1, 0, 33],
    [0xa1, 1, 1, 1],
    Array(21).fill(1),
  ])
    p.feed(new Uint8Array(f), 0);
  for (const bad of [
    { ...packet, v: 2 },
    { ...packet, temperature: null },
    { ...packet, light: 1.1 },
    { ...packet, humidity: 101 },
    { ...packet, state: "GOOD" },
    { ...packet, seq: -1 },
    { ...packet, error: "x" },
  ])
    assert.equal(send(p, bad), null);
  assert.ok(p.errors >= 14);
  assert.ok(send(p, packet));
});
test("512 byte maximum succeeds; larger than 32 chunks fails", () => {
  const base = JSON.stringify({ ...packet, padding: "" });
  const value = {
    ...packet,
    padding: " ".repeat(512 - new TextEncoder().encode(base).length),
  };
  const p = new PacketAssembler();
  assert.equal(frames(value).length, 32);
  assert.ok(send(p, value));
  assert.equal(send(p, { ...value, padding: value.padding + "x" }), null);
});
test("DHT null, collection mode and diagnostic counter cannot invent GOOD", () => {
  assert.ok(validatePacket(packet));
  assert.ok(
    validatePacket({
      ...packet,
      light: null,
      temperature: null,
      humidity: null,
      error: "DHT_READ",
    }),
  );
  assert.equal(validatePacket({ ...packet, light: null, error: null }), false);
  const p = new PacketAssembler();
  assert.equal(send(p, { diagnostic: "counter", count: 12 }), null);
  assert.equal(p.diagnostic, 12);
  assert.equal(p.errors, 0);
  assert.ok(send(p, packet));
  assert.equal(p.diagnostic, null);
});
