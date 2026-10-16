#!/usr/bin/env python3
"""실제 생성형 AI 도구 호출: 교사용 선택 실습.
외부 서비스 사용료가 발생할 수 있습니다. 학생에게 API 키를 배포하지 마세요.
- python agent_live_teacher.py --dry-run : API 연결 없이 호출 구조 연습
- OPENAI_API_KEY=... python agent_live_teacher.py --live : 승인 후 실제 API 사용

Responses API function_call/function_call_output를 순차 실행하며, 네트워크·파일쓰기·셸 명령 도구를 노출하지 않습니다.
Python 3.10+ 표준 라이브러리만 사용합니다. 유료 API 구독은 ChatGPT 구독과 별개입니다.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Callable

DATA_FILE = Path(__file__).with_name("study_scores.csv")
API_URL = "https://api.openai.com/v1/responses"
SYSTEM = (
    "당신은 고등학생의 가상 점수 데이터를 분석하는 도구 사용 에이전트입니다. "
    "도구를 실제 호출하여 근거를 확인한 후 짧고 명확한 한국어로 결과를 설명하세요. "
    "허용되지 않은 도구를 호출하지 마세요. 실제 학생 개인정보를 요구하거나 "
    "성적·합격을 예측하지 마세요. 점수 데이터와 도구 응답 외의 사실은 추측하지 마세요. "
    "필요하면 read_scores, score_stats, study_plan을 차례로 사용하세요."
)
TOOL_NAMES = ("read_scores", "score_stats", "study_plan")
TOOLS = [
    {
        "type": "function",
        "name": "read_scores",
        "description": "교사가 제공한 가상의 과목별 점수 CSV를 읽습니다.",
        "strict": True,
        "parameters": {"type": "object", "properties": {}, "required": [], "additionalProperties": False},
    },
    {
        "type": "function",
        "name": "score_stats",
        "description": "가상 데이터의 평균, 최저점 과목, 과목별 오름차순 순위를 계산합니다.",
        "strict": True,
        "parameters": {"type": "object", "properties": {}, "required": [], "additionalProperties": False},
    },
    {
        "type": "function",
        "name": "study_plan",
        "description": "점수가 낮은 과목부터 30분씩 복습하는 일정을 만듭니다.",
        "strict": True,
        "parameters": {"type": "object", "properties": {}, "required": [], "additionalProperties": False},
    },
]


def read_data(path: Path = DATA_FILE) -> list[dict]:
    if path.stat().st_size > 10000:
        raise ValueError("데이터 파일은 10KB 이하의 가상 자료만 사용하세요.")
    with path.open(encoding="utf-8-sig", newline="") as fp:
        reader = csv.DictReader(fp)
        if reader.fieldnames != ["subject", "score"]:
            raise ValueError("CSV 첫 행은 subject,score여야 합니다.")
        rows = []
        for i, row in enumerate(reader, 2):
            subject = (row.get("subject") or "").strip()
            if not subject or len(subject) > 40:
                raise ValueError(f"{i}행: 과목명 오류")
            raw = (row.get("score") or "").strip()
            try:
                score = float(raw)
            except ValueError as exc:
                raise ValueError(f"{i}행: 숫자 점수를 입력하세요.") from exc
            if not math.isfinite(score) or not 0 <= score <= 100:
                raise ValueError(f"{i}행: 점수는 0~100 사이여야 합니다.")
            rows.append({"subject": subject, "score": score})
            if len(rows) > 50:
                raise ValueError("최대 50개 과목만 허용합니다.")
    if not rows:
        raise ValueError("입력할 학습 자료가 없습니다.")
    if len(set(row["subject"].lower() for row in rows)) != len(rows):
        raise ValueError("중복 과목 이름을 사용하지 마세요.")
    return rows


def call_tool(name: str, args: dict, path: Path = DATA_FILE) -> dict:
    if name not in TOOL_NAMES:
        raise ValueError("허용되지 않은 도구 호출입니다.")
    if args:
        raise ValueError("이 수업에서는 모델에 파일 경로나 추가 매개변수를 허용하지 않습니다.")
    rows = read_data(path)
    if name == "read_scores":
        return {"count": len(rows), "rows": rows}
    ranked = sorted(rows, key=lambda row: (row["score"], row["subject"]))
    average = sum(row["score"] for row in rows) / len(rows)
    if name == "score_stats":
        return {"count": len(rows), "average": round(average, 2),
                "lowest": ranked[0], "ranked": ranked}
    if name == "study_plan":
        plan = [{"priority": index, "subject": item["subject"], "minutes": 30}
                for index, item in enumerate(ranked, 1)]
        if len(plan) != len(rows) or any(p["minutes"] <= 0 for p in plan):
            raise ValueError("복습 계획 검증 실패")
        return {"average": round(average, 2), "plan": plan, "verified": True}
    raise AssertionError("unreachable")


def extract_text(response: dict) -> str:
    parts = []
    for item in response.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                parts.append(content.get("text", ""))
    return "\n".join(parts).strip()


def real_request(payload: dict) -> dict:
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다. --dry-run은 키 없이 실행할 수 있습니다.")
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        API_URL, data=data, method="POST",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            return json.loads(response.read(500000).decode("utf-8"))
    except urllib.error.HTTPError as err:
        # API 키, 내부 HTTP 헤더를 출력하지 않습니다.
        raise RuntimeError(f"모델 서버가 HTTP {err.code}를 반환했습니다. 모델 및 API 요금제·잔액을 확인하세요.") from None


def fake_client() -> Callable[[dict], dict]:
    output_sequences = [
        [{"type":"function_call","name":"read_scores","arguments":"{}","call_id":"demo_1"}],
        [{"type":"function_call","name":"score_stats","arguments":"{}","call_id":"demo_2"}],
        [{"type":"function_call","name":"study_plan","arguments":"{}","call_id":"demo_3"}],
        [{"type":"message","content":[{"type":"output_text","text":"가상 자료 분석 완료. 점수가 가장 낮은 과목부터 30분씩 복습하는 계획을 세웠습니다."}]}],
    ]
    index = 0
    def invoke(payload: dict) -> dict:
        nonlocal index
        assert payload.get("store") is False
        assert payload.get("tools")
        response = {"output": output_sequences[min(index, len(output_sequences)-1)]}
        index += 1
        return response
    return invoke


def run_agent(client: Callable[[dict], dict], path: Path = DATA_FILE,
              model: str = "gpt-4.1-mini") -> dict:
    """실제 에이전트 루프. 응답을 이어붙여 도구 결과를 모델에 전달합니다."""
    read_data(path)  # 도구 실행 전 파일·점수 유효성 검사
    context: list[dict] = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": "가상 점수를 읽고 평균과 가장 부족한 과목을 찾은 다음, 30분씩 복습할 순서를 만들어 줘."},
    ]
    traces: list[dict] = []
    for round_number in range(1, 7):
        payload = {
            "model": model,
            "input": context,
            "tools": TOOLS,
            "tool_choice": "required" if round_number == 1 else "auto",
            "store": False,
            "max_output_tokens": 650,
        }
        response = client(payload)
        output = response.get("output", [])
        if not isinstance(output, list):
            raise ValueError("API 응답에 출력 목록이 없습니다.")
        context.extend(output)
        calls = [item for item in output if item.get("type") == "function_call"]
        if not calls:
            final = extract_text(response)
            if not traces:
                raise RuntimeError("모델이 데이터 도구를 사용하지 않아 결과를 신뢰할 수 없습니다.")
            if not final:
                raise RuntimeError("모델 응답이 비어 있습니다.")
            return {"answer": final, "traces": traces, "rounds": round_number}
        if len(calls) > 5:
            raise RuntimeError("한 번에 실행한 도구가 5개를 초과했습니다.")
        for item in calls:
            name = item.get("name", "")
            call_id = item.get("call_id", "")
            if not isinstance(call_id,str) or not call_id:
                raise RuntimeError("잘못된 도구 호출 ID입니다.")
            try:
                args = json.loads(item.get("arguments", "{}"))
                if not isinstance(args, dict):
                    raise ValueError("도구 인자는 객체여야 합니다.")
                result = call_tool(name, args, path)
            except (ValueError, json.JSONDecodeError) as exc:
                result = {"error": str(exc)}
            traces.append({"round":round_number,"tool":name,"result":result})
            context.append({
                "type":"function_call_output",
                "call_id":call_id,
                "output":json.dumps(result, ensure_ascii=False),
            })
    raise RuntimeError("최대 6차례 반복을 초과했습니다. 자동 호출을 중단했습니다.")


def main() -> int:
    parser = argparse.ArgumentParser(description="AI AGENT SMART LIFE — 교사용 실제 도구 호출 실습")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true", help="무료 모의 모델로 전체 도구 흐름 연습")
    group.add_argument("--live", action="store_true", help="실제 모델 호출(별도 유료 API 계정 필요)")
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"), help="계정에서 사용 가능한 모델")
    args = parser.parse_args()

    if args.live:
        if not os.getenv("OPENAI_API_KEY"):
            print("오류: OPENAI_API_KEY가 필요합니다. 별도 비용이 발생할 수 있습니다.")
            return 2
        print("이 실습은 별도 API 비용이 발생할 수 있으며 가상 데이터만 전송합니다.")
        consent = input("실제 모델 호출을 승인하려면 '실행'을 입력하세요: ").strip()
        if consent != "실행":
            print("승인되지 않아 실제 API를 호출하지 않았습니다.")
            return 0
    client = real_request if args.live else fake_client()
    try:
        result = run_agent(client, model=args.model)
    except (RuntimeError, ValueError, FileNotFoundError, OSError) as exc:
        print("오류:", exc)
        return 1
    print("\n[실행 기록]")
    for i,item in enumerate(result["traces"],1):
        print(f"{i}. 도구 {item['tool']} → {json.dumps(item['result'],ensure_ascii=False)}")
    print("\n[AI 최종 응답]\n"+result["answer"])
    print("\n주의: 도구 실행 결과와 자연어 설명이 일치하는지 최종 확인하세요.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
