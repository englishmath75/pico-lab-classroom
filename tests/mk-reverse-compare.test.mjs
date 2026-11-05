import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparisonStage, reverseExamples, reverseCompareMarkup } from '../mk/src/reverse-compare.js';

test('both methods start from same original list', () => {
  const state = comparisonStage(0);
  assert.deepEqual(state.slice.original, [10,20,30,40,50]);
  assert.deepEqual(state.method.original, [10,20,30,40,50]);
  assert.equal(state.slice.result, null);
  assert.equal(state.method.result, null);
  assert.equal(state.slice.output, '');
  assert.equal(state.method.output, '');
});

test('slice keeps a intact and returns a distinct reversed list', () => {
  const state = comparisonStage(1);
  assert.deepEqual(state.slice.original, [10,20,30,40,50]);
  assert.deepEqual(state.slice.result, [50,40,30,20,10]);
  assert.notStrictEqual(state.slice.original, state.slice.result);
  assert.match(state.slice.memory, /새 리스트 B/);
});

test('reverse modifies a and returns None, not a list', () => {
  const state = comparisonStage(1);
  assert.deepEqual(state.method.original, [50,40,30,20,10]);
  assert.equal(state.method.result, 'None');
  assert.match(state.method.memory, /제자리에서 변경/);
});

test('outputs match real Python semantics', () => {
  const state = comparisonStage(2);
  assert.equal(state.slice.output, '[50, 40, 30, 20, 10]\n[10, 20, 30, 40, 50]');
  assert.equal(state.method.output, 'None\n[50, 40, 30, 20, 10]');
  assert.match(reverseExamples.slice, /result = a\[::-1\]/);
  assert.match(reverseExamples.method, /result = a\.reverse\(\)/);
});

test('all stages are clamped, independent, and answer is visible in markup', () => {
  assert.equal(comparisonStage(-100).step, 0);
  assert.equal(comparisonStage(999).step, 3);
  const one = comparisonStage(1);
  one.slice.original[0] = 999;
  assert.equal(comparisonStage(1).slice.original[0], 10);
  const html = reverseCompareMarkup();
  assert.match(html, /리스트 뒤집기 비교 실험실/);
  assert.match(html, /data-reverse-control="auto"/);
  assert.match(html, /data-reverse-apply="method"/);
  assert.match(html, /원본을 바꿉니다/);
});
