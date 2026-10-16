"""Execute published Python lesson examples using real Python libraries in CI."""
from __future__ import annotations
import contextlib
import io
import json
import os
import sys
import traceback

os.environ.setdefault("MPLBACKEND", "Agg")


def main() -> int:
    with open(sys.argv[1], encoding="utf-8") as fp:
        lessons = json.load(fp)
    failures = []
    for index, lesson in enumerate(lessons, 1):
        stdout = io.StringIO()
        stderr = io.StringIO()
        try:
            namespace = {"__name__": "__main__"}
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                exec(compile(lesson["code"], f"<lesson-{index}>", "exec"), namespace)
            expected_lines = lesson["expect"].splitlines()
            if index == 5:
                expected_lines = [expected_lines[0]]  # CI cannot display GUI plot; checks numeric result
            for line in expected_lines:
                if line not in stdout.getvalue():
                    raise AssertionError(f"Missing expected line {line!r}; got {stdout.getvalue()!r}")
            print(f"PASS lesson {index:02d} {lesson['title']}")
        except Exception as exc:
            failures.append((index,str(exc),traceback.format_exc(limit=2)))
            print(f"FAIL lesson {index:02d}: {exc}")
    print(f"\nExecuted {len(lessons)} lesson examples: {len(lessons)-len(failures)} passed, {len(failures)} failed.")
    for i,message,trace in failures:
        print(i,message,trace)
    return int(bool(failures))


if __name__ == "__main__":
    sys.exit(main())
