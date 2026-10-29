#!/usr/bin/env python3
"""Public AI AGENT SMART LIFE course content checks. No external dependencies."""
from __future__ import annotations

import ast
import contextlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
source = (ROOT / "public/ai-agent-course-data.js").read_text(encoding="utf-8")
marker = "window.AGENT_COURSE_DATA = "
assert marker in source, "course data declaration missing"
data = json.loads(source.split(marker, 1)[1].strip().removesuffix(";"))
lessons = data["lessons"]
assert len(lessons) == 12, "exactly 12 lessons required"
assert data["durationMinutes"] == 50, "50 min lesson required"
csv_rows = data["sampleCSV"].strip().splitlines()
assert len(csv_rows) == 19, "18 rows of synthetic sample data required"
assert csv_rows[0] == "day,subject,minutes,correct,total,sleep"

for i, lesson in enumerate(lessons, 1):
    assert lesson["id"] == i
    assert len(lesson["objectives"]) == 3
    assert len(lesson["flow"]) == 5
    assert len(lesson["tasks"]) == 3
    assert len(lesson["quiz"]["a"]) == 4
    assert 0 <= lesson["quiz"]["correct"] <= 3
    assert lesson["prompt"] and lesson["teacher"] and lesson["written"]
    code = (data["pythonPrelude"] + "\n\n" if lesson["usesData"] else "") + "\n".join(lesson["code"])
    ast.parse(code, filename=f"lesson-{i}.py")
    if i in {1, 2, 9, 10, 11}:
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            exec(compile(code, f"lesson-{i}.py", "exec"), {"__name__": "__main__"})
        assert output.getvalue().strip(), f"missing Python console output in lesson {i}"

html = (ROOT / "public/ai-agent-smart-life.html").read_text(encoding="utf-8")
main = (ROOT / "app/page.tsx").read_text(encoding="utf-8")
for name in ("ai-agent-smart-life.js", "ai-agent-smart-life.css", "ai-agent-course-data.js"):
    assert name in html, f"{name} not referenced"
assert "ai-agent-smart-life.html" in main, "course entry missing from PICO LAB"
assert (ROOT / "public/ai-agent-python-worker.js").exists()
assert (ROOT / "public/ai-agent-smart-life.js").exists()
assert "실제 기말시험 원안 아님" in html, "student website must not present real exam"
print("PASS: 12 lessons / 50 minutes / 18 sample rows / Python syntax and sample execution / navigation")
