import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { lessons } from "../course-data";
import { rubric } from "../rubric";
import { preparation } from "../hardware";
export function TeacherGuide({
  checks,
  onCheck,
}: {
  checks: Record<string, boolean>;
  onCheck: (id: string, v: boolean) => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const started = Date.now() - seconds * 1000;
    const timer = setInterval(
      () =>
        setSeconds(Math.min(3000, Math.floor((Date.now() - started) / 1000))),
      1000,
    );
    return () => clearInterval(timer);
  }, [running]);
  return (
    <section className="ai-card ai-teacher">
      <h2>교사 공개 지도안</h2>
      <p>하드웨어 검증 NOT_RUN · QA status: 소프트웨어 검증과 실제 장치 검증을 구분합니다. 최신 실행 결과는 QA_REPORT_PICO2W_AI_BLE.md를 확인하세요.</p>
      <p>
        정적 페이지의 공개 자료입니다. 학생 숨김 UI이며 비밀번호·계정·서버
        접근통제가 아닙니다. 학생 답과 센서 로그를 서버로 전송하지 않습니다.
      </p>
      <p className="text-2xl font-bold">
        차시 타이머 {Math.floor(seconds / 60)}:
        {String(seconds % 60).padStart(2, "0")} / 50:00
      </p>
      <div className="flex gap-3">
        <Button onClick={() => setRunning((v) => !v)}>
          {running ? "정지" : "시작"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
        >
          타이머 초기화
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          지도안 인쇄
        </Button>
      </div>
      <h3>사전 준비·실제 데이터</h3>
      <ul>
        {preparation.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p>
        실제 교실 CSV: 미제공 / 학습 모델: 미학습 stub / 장비 실기: NOT_RUN. 네
        상태가 부족하면 보충 후 정식 학습으로 진행합니다. 2상태 예비 실습을 최종
        완료로 표시하지 않습니다.
      </p>
      <p>
        AI가 판단하는 규칙은 사람이 정한 것이 아니라, 학습 데이터로부터 모델이
        찾은 것이다. 다만 무엇을 정답이라고 부를지, 어떤 데이터를 모을지, 어떤
        특성을 쓸지는 사람이 정한다. 모델의 판단은 그 선택과 데이터의 한계를
        가진다.
      </p>
      {lessons.map((l) => (
        <details key={l.id} open>
          <summary>
            {l.id}차시 · {l.title}
          </summary>
          <ol>
            {l.timeline.map((t) => (
              <li key={t.start}>
                <strong>
                  {t.start}~{t.end}분 {t.title}
                </strong>{" "}
                {t.actions.join(" ")}
              </li>
            ))}
          </ol>
          <h3>발문·예상답</h3>
          {l.teacherPrompts.map((p) => (
            <p key={p.question}>
              <strong>{p.question}</strong> {p.expected}
            </p>
          ))}
          <h3>평가·채점 포인트</h3>
          {l.assessments.map((q) => (
            <p key={q.id}>
              {q.question} → {q.answer}
            </p>
          ))}
          <h3>오류 분기</h3>
          {l.failures.map((f) => (
            <p key={f.cause}>
              {f.cause} → {f.fix}
            </p>
          ))}
        </details>
      ))}
      <h3>100점 루브릭 · 모둠 70 + 개인 30</h3>
      {rubric.map((r) => (
        <div key={r.id}>
          <h3>
            {r.id}. {r.title} / {r.max}점 ({r.group})
          </h3>
          {r.levels.map((l) => (
            <p key={l.score}>
              {l.score}점: {l.description}
            </p>
          ))}
        </div>
      ))}
      <p>
        미제출·증거 없음은 해당 영역 0점. 모든 학생에게 같은 개인 질문 2개와
        후속 질문 1개를 줍니다. 임의 threshold·synthetic를 학습·실측으로
        제출하면 C의 학습 증거를 인정하지 않고 수정 기회를 줍니다. 학교
        평가계획의 기본점수는 사전 공지 후 환산합니다.
      </p>
      <h3>기기 검증 체크 (교사가 실기 후 표시)</h3>
      {[
        "UF2 버전·SHA256·aioble commit·sys.implementation 기록",
        "DHT11 3.3V SKU와 부저 드라이버 정격 확인",
        "Galaxy 5분 수신·오류·손실 개수 기록",
        "재연결 3회·DHT 분리 복구·출력 정지 확인",
        "model-tests 전체 일치·새 실측10회·CSV 전달 경로 확인",
      ].map((s, i) => (
        <label key={s} className="flex gap-3 items-center my-3">
          <Checkbox
            checked={!!checks["hardware-" + i]}
            onCheckedChange={(v) => onCheck("hardware-" + i, v === true)}
          />
          {s}
        </label>
      ))}
      <h3>교사용 10분 실기 준비 확인</h3>
      <ol>
        <li>0~2분: 전원 분리, 3.3V·핀·저항·SKU 확인</li>
        <li>
          2~4분: UF2 SHA256·aioble commit·sys.implementation 기록, LED·DHT 확인
        </li>
        <li>4~6분: Galaxy 연결·수신·끊기·재연결</li>
        <li>6~8분: 오류/null·출력 정지·모델 ID·selftest 확인</li>
        <li>8~10분: CSV 다운로드→PC 전달→Colab 업로드 경로 시연</li>
      </ol>
      <p>
        10분 점검은 정식 M5 수용 검사를 대체하지 않습니다. 5분 수신·재연결
        3회·새 입력 10회·전체 selftest를 별도 기록하세요.
      </p>
    </section>
  );
}
