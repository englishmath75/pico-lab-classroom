import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { LessonPlan } from "../types";
import { HardwareBoard } from "./HardwareBoard";
import { pins, hardwareNotes } from "../hardware";
export function LessonPanel({
  lesson,
  checks,
  onCheck,
}: {
  lesson: LessonPlan;
  checks: Record<string, boolean>;
  onCheck: (id: string, value: boolean) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <section id="ai-current-lesson" className="ai-card">
      <p className="text-cyan-700 font-bold">선택 차시 · {lesson.id}/8</p>
      <h2 className="ai-lesson-title">{lesson.title}</h2>
      <h3>오늘의 질문</h3>
      <p className="p-4 rounded-xl bg-amber-50">{[
        "Pico 2 W는 어떤 보드일까요? MicroPython으로 LED를 어떻게 켤까요?",
        "어두움이라는 말을 센서는 어떻게 숫자로 바꿀까요?",
        "선이 없는데 스마트폰은 어느 Pico의 데이터를 받는지 어떻게 알까요?",
        "테스트 카운터 대신 실제 센서값을 받으면 무엇을 알 수 있을까요?",
        "같은 환경에 서로 다른 정답을 붙이면 AI는 무엇을 배울까요?",
        "처음 보는 데이터에도 AI가 잘 판단하는지 어떻게 확인할까요?",
        "인터넷을 끊어도 Pico는 학습한 모델로 판단할 수 있을까요?",
        "센서에서 스마트폰까지 데이터와 판단은 어떤 경로로 전달될까요?",
      ][lesson.id - 1]}</p>
      <h3>학습 목표</h3><ul className="list-disc pl-6">{lesson.objectives.map(o => <li key={o}>{o}</li>)}</ul>
      {lesson.concepts.map((c) => (
        <p key={c.term} className="mt-4">
          <strong>{c.term}:</strong> {c.body}
        </p>
      ))}
      {lesson.id === 1 && (
        <div>
          <h3>준비 체크 4개</h3>
          {[
            ["L1-usb", "데이터 USB와 Thonny 인터프리터/COM 확인"],
            ["L1-voltage", "3.3V·GND·GP26 위치 지목"],
            ["L1-led", 'Pin("LED") 토글 확인'],
            ["L1-reboot", "Pico main.py 저장 후 재부팅 실행"],
          ].map(([id, text]) => (
            <label key={id} className="flex items-center gap-3 my-3">
              <Checkbox
                checked={!!checks[id]}
                onCheckedChange={(v) => onCheck(id, v === true)}
              />
              {text}
            </label>
          ))}
        </div>
      )}
      <h3>미션</h3>
      <ol className="list-decimal pl-6">
        {lesson.practice.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <details>
        <summary>함수 힌트</summary>
        <p>{[
          'Pin("LED")로 내장 LED를 준비하고 value() 또는 toggle()로 출력을 바꿉니다.',
          'ADC.read_u16()은 조도 raw 값을 읽고, DHT11.measure() 뒤 temperature()·humidity()로 온습도를 읽습니다.',
          'advertise는 보드의 존재를 알리고 notify는 연결된 스마트폰에 카운터 갱신을 알립니다.',
          'read_sensors() → BLE publish(packet) → 스마트폰의 세 센서 카드를 확인합니다.',
          'label은 관찰로 먼저 정하고 light·temperature·humidity를 CSV의 feature로 저장합니다.',
          'fit() → predict() → accuracy_score() → export_text() 순서로 학습 결과를 확인합니다. 아래 Colab에서 시작하세요.',
          'model.predict(light, temperature, humidity)의 결과를 update(state)에 전달합니다. 모델 ID와 selftest도 확인하세요.',
          'read_sensors() → model.predict() → update(state) → BLE publish(packet)의 전체 흐름을 확인합니다.',
        ][lesson.id - 1]}</p>
      </details>
      {lesson.wiringIds.length > 0 && <details>
        <summary>배선·부품·전압</summary>
        <a
          href="https://datasheets.raspberrypi.com/picow/pico-2-w-pinout.pdf"
          target="_blank"
          rel="noreferrer"
        >
          공식 Pico 2 W 핀맵 열기 (USB 위)
        </a>
        <HardwareBoard />
        <div className="ai-table">
          <table>
            <thead>
              <tr>
                <th>부품</th>
                <th>GPIO / API</th>
                <th>물리 핀</th>
                <th>연결</th>
              </tr>
            </thead>
            <tbody>
              {pins.map((p) => (
                <tr key={p.id}>
                  <td>{p.part}</td>
                  <td>{p.gpio}</td>
                  <td>{p.physical}</td>
                  <td>{p.connection}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hardwareNotes.map((n) => (
          <p key={n}>{n}</p>
        ))}
      </details>}
      <details>
        <summary>실패·회복</summary>
        {lesson.failures.map((f) => (
          <div key={f.symptom}>
            <p>
              <strong>{f.symptom}</strong>
            </p>
            <p>{f.cause}</p>
            <p>{f.fix}</p>
          </div>
        ))}
      </details>
      <h3>평가 · 먼저 내 말로 답하기</h3>
      {lesson.assessments.map((q) => (
        <div key={q.id} className="my-4">
          <label htmlFor={q.id}>{q.question}</label>
          <textarea
            id={q.id}
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            className="w-full border rounded-xl p-3"
            placeholder="이름·학번 등 개인정보는 적지 마세요"
          />
          {submitted && (
            <p className="bg-cyan-50 p-3">정답·채점 포인트: {q.answer}</p>
          )}
        </div>
      ))}
      <Button
        disabled={!lesson.assessments.every((q) => answers[q.id]?.trim())}
        onClick={() => setSubmitted(true)}
      >
        답 제출 후 해설 보기
      </Button>
      <h3>성공 기준과 산출물</h3>
      {[...lesson.successCriteria, ...lesson.deliverables].map((s, i) => (
        <p key={i}>{s}</p>
      ))}
    </section>
  );
}
