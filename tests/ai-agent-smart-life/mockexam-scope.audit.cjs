/* Public study mock-exam scope audit. Does not read student data or change exam content. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "../..");
const courseRoot = path.join(repoRoot, "public/ai-agent-smart-life");
const context = { window: {} };
for (const file of ["lessons.js", "enrichment.js"]) {
  vm.runInNewContext(fs.readFileSync(path.join(courseRoot, file), "utf8"), context, { filename: file });
}

const lessons = context.window.AASL_LESSONS;
const enrichment = context.window.AASL_DEEP_DIVE;
assert.equal(lessons.length, 12, "Expected 12 public lessons");
assert.equal(enrichment.length, 12, "Expected 12 public enrichment units");
const counts = lessons.map((lesson, i) => {
  assert.ok(Array.isArray(lesson.questions), "Missing lesson quiz at " + (i + 1));
  assert.ok(Array.isArray(enrichment[i].extraQuestions), "Missing enrichment quiz at " + (i + 1));
  const questions = lesson.questions.concat(enrichment[i].extraQuestions);
  for (const [j, q] of questions.entries()) {
    assert.ok(Array.isArray(q) && q.length === 4, "Invalid question format L" + (i + 1) + " Q" + (j + 1));
    assert.ok(Array.isArray(q[1]) && q[1].length >= 2, "Missing options L" + (i + 1) + " Q" + (j + 1));
    assert.ok(Number.isInteger(q[2]) && q[2] >= 0 && q[2] < q[1].length,
      "Invalid correct-choice index L" + (i + 1) + " Q" + (j + 1));
  }
  return questions.length;
});
const total = counts.reduce((sum, x) => sum + x, 0);
assert.equal(total, 60, "Public mock-exam bank should have 60 questions");

const exam = fs.readFileSync(path.join(courseRoot, "exam.js"), "utf8");
assert.match(exam, /lessons\.flatMap\(/, "Find the mock exam's question bank");
const unscopedRandom20 = /shuffle\(bank\)\.slice\(0,\s*20\)/.test(exam);
const shortAnswerCount = (exam.match(/\{title:/g) || []).length;

const expectedIn20 = lessonsToCount => {
  const sum = lessonsToCount.reduce((sum, lessonNo) => sum + counts[lessonNo - 1], 0);
  return Number((20 * sum / total).toFixed(3));
};
const noQuestionProbability = (nPool, nCategory, nSample) => {
  let p = 1;
  for (let i = 0; i < nSample; i++) p *= (nPool - nCategory - i) / (nPool - i);
  return p;
};
const unitMapping = {
  "unit3_data_partial": [3, 4, 5],
  "unit4_simulation_partial": [8],
  "unit5_value_creation_partial": [10, 11],
};
const report = {
  source: "public study materials; not the officially approved examination blueprint",
  lesson_count: lessons.length,
  item_count: total,
  short_answer_count: shortAnswerCount,
  unscoped_random_20_question_draw: unscopedRandom20,
  curriculum_topic_proxies: Object.fromEntries(
    Object.entries(unitMapping).map(([name, lessonNos]) =>
      [name, { lesson_numbers: lessonNos, question_count: lessonNos.reduce((s, n) => s + counts[n - 1], 0),
        expected_items_in_random_20: expectedIn20(lessonNos) }])
  ),
  probability_no_lesson8_item_in_random20: Number(noQuestionProbability(total, counts[7], 20).toFixed(6)),
  official_exam_alignment_verified: false,
  actual_school_computers_verified: false,
};
assert.equal(shortAnswerCount, 8, "Expected eight public mock-exam short answer items");
if (unscopedRandom20) {
  console.warn("SCOPE WARNING: the study mock exam randomly draws from all 12 lessons; "
    + "it is NOT a verified 3–5 unit exam blueprint.");
}
console.log(JSON.stringify(report, null, 2));
