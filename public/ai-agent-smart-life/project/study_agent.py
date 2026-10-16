"""AI AGENT SMART LIFE | 10~11차시 실습
실제 LLM을 호출하지 않는 규칙 기반 에이전트 교육용 예제입니다.
파이썬 3.10 이상, 표준 라이브러리만 필요합니다.
사용법: python study_agent.py [study_scores.csv]
"""
from __future__ import annotations

import csv
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Score:
    subject: str
    score: float


def load_scores(path: Path) -> list[Score]:
    """도구 1: CSV 파일을 읽고 0~100 범위의 가상 점수인지 검사합니다."""
    if not path.is_file():
        raise FileNotFoundError(f"CSV 파일을 찾을 수 없습니다: {path}")
    rows: list[Score] = []
    with path.open("r", encoding="utf-8-sig", newline="") as fp:
        reader = csv.DictReader(fp)
        if reader.fieldnames != ["subject", "score"]:
            raise ValueError("첫 줄은 subject,score 이어야 합니다.")
        for index, item in enumerate(reader, 2):
            subject = (item.get("subject") or "").strip()
            try:
                score = float(item.get("score", ""))
            except (ValueError, TypeError) as exc:
                raise ValueError(f"{index}행 점수는 숫자여야 합니다.") from exc
            if not subject or score != score or not 0 <= score <= 100:
                raise ValueError(f"{index}행: 과목명과 점수 범위를 확인하세요.")
            rows.append(Score(subject, score))
    if not rows:
        raise ValueError("CSV 파일에 학습 데이터가 없습니다.")
    return rows


def analyze_scores(rows: list[Score]) -> dict:
    """도구 2: 평균과 취약 과목을 구합니다."""
    average = sum(row.score for row in rows) / len(rows)
    ranked = sorted(rows, key=lambda row: row.score)
    return {"average": average, "weakest": ranked[0].subject, "ranking": ranked}


def make_plan(analysis: dict) -> list[dict]:
    """도구 3: 점수가 낮은 과목을 먼저 배치합니다."""
    return [
        {"priority": index, "subject": row.subject, "minutes": 30}
        for index, row in enumerate(analysis["ranking"], 1)
    ]


def check_plan(plan: list[dict], source: list[Score]) -> bool:
    """도구 4: 모든 과목을 한 번씩 포함하고 계획 시간이 양수인지 검증합니다."""
    return (
        len(plan) == len(source)
        and sorted(item["subject"] for item in plan)
        == sorted(item.subject for item in source)
        and all(item["minutes"] > 0 for item in plan)
    )


def run_agent(goal: str, csv_path: Path) -> None:
    """목표 파악 → 도구 선택/실행 → 결과 검증의 단계별 흐름."""
    print("=== AI STUDY MANAGER: 규칙 기반 도구 실행 실습 ===")
    print("목표:", goal)
    if not any(keyword in goal for keyword in ("복습", "학습", "분석", "계획")):
        print("지원하지 않는 목표입니다. 예: 학습 계획을 세워 줘")
        return

    print("[1단계] CSV 읽기 도구 호출")
    scores = load_scores(csv_path)
    print(f"        {len(scores)}개 과목 읽음")

    print("[2단계] 데이터 분석 도구 호출")
    analysis = analyze_scores(scores)
    print(f"        평균 {analysis['average']:.1f}점, 취약 과목 {analysis['weakest']}")

    print("[3단계] 학습 계획 도구 호출")
    plan = make_plan(analysis)

    print("[4단계] 도구 결과 검증")
    if not check_plan(plan, scores):
        raise RuntimeError("학습 계획 검증 실패 — 출력하지 않습니다.")
    print("        검증 통과")

    print("[최종 답변] 우선 복습 권장 순서 (연습 데이터 기반)")
    for item in plan:
        print(f"        {item['priority']}. {item['subject']} · {item['minutes']}분")
    print("※ 실제 성적 예측이 아니라 가상 자료에 적용한 규칙 기반 추천입니다.")


if __name__ == "__main__":
    filename = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("study_scores.csv")
    try:
        run_agent("내 학습 데이터를 분석하고 복습 계획을 세워 줘", filename)
    except (FileNotFoundError, ValueError, RuntimeError) as error:
        print("실행 오류:", error)
        sys.exit(1)
