import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import {
  LABELS,
  type LiveSample,
  type ConnectionStatus,
  type StateLabel,
  type RowBudget,
} from "../types";
import { VerificationRecorder } from "@/lib/ai-ble/verification";
import { download } from "@/lib/ai-ble/csv";
export const finalChecks = [
  "센서 → Pico predict → LED/부저 → BLE → 폰 실기 시연",
  "MicroPython model-tests 전체 일치와 model_id 기록",
  "다른 시간/조건의 새 실측 10회 이상 검증",
  "DHT 오류·영역 밖 출력 정지·끊김·재연결 확인",
  "CSV / ipynb / model.py / meta / tests / 최종 새 검증 결과 제출",
  "실제 오분류·센서 한계·다음 수집 조건을 3문장으로 설명",
];
export function FinalProject({
  active = true,
  checks,
  onCheck,
  sample,
  status,
  budget,
  onDirtyChange,
}: {
  active?: boolean;
  checks: Record<string, boolean>;
  onCheck: (id: string, v: boolean) => void;
  sample: LiveSample | null;
  status: ConnectionStatus;
  budget: RowBudget;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const recorder = useRef(new VerificationRecorder()).current;
  const [label, setLabel] = useState<StateLabel | "">("");
  const [, redraw] = useState(0);
  const [exported, setExported] = useState(false);
  useEffect(() => {
    if (!active) { recorder.stop(); redraw(n => n + 1); return; }
    if (recorder.accept(sample, status, Date.now(), budget)) {
      onDirtyChange(true);
      setExported(false);
    }
    redraw((n) => n + 1);
  }, [active, sample, status, recorder, budget, onDirtyChange]);
  const exportRows = () => {
    if (recorder.rows.length) {
      download(
        "final_validation.csv",
        recorder.csv(),
        "text/csv;charset=utf-8",
      );
      onDirtyChange(false);
      setExported(true);
    }
  };
  useEffect(() => {
    window.addEventListener("ai-export-validation", exportRows);
    return () => window.removeEventListener("ai-export-validation", exportRows);
  });
  const valid = recorder.rows.filter(
    (r) => r.sample.error === null && r.sample.state !== null,
  );
  const matches = valid.filter((r) => r.label === r.sample.state).length;
  return (
    <section className="ai-card">
      <h2>Final Project</h2>
      <div className="ai-project-flow" aria-label="최종 프로젝트 흐름">
        <div>CDS + DHT11</div><div aria-hidden="true">↓</div><div>Pico 2 W</div><div aria-hidden="true">↓</div><div>Decision Tree</div>
        <div className="grid grid-cols-2 gap-4"><div>↙<br />LED / 부저</div><div>↘<br />BLE<br />↓<br />스마트폰</div></div>
      </div>
      <h3>새 조건·시간의 최종 실측 검증</h3>
      <p>
        관찰 라벨을 먼저 고르고 다음 실측 1회를 예약하세요. 예약 전 화면에 남아
        있던 값은 재사용하지 않습니다. 오류도 별도로 기록하며 학습 CSV와 합치지
        않습니다.
      </p>
      <label htmlFor="validation-label">새 관찰 라벨</label>
      <select
        id="validation-label"
        value={label}
        disabled={!!recorder.armed}
        onChange={(e) => setLabel(e.target.value as StateLabel | "")}
      >
        <option value="">미선택</option>
        {LABELS.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      <div className="flex flex-wrap gap-3 my-3">
        <Button
          disabled={
            !label ||
            !!recorder.armed ||
            status !== "streaming" ||
            recorder.rows.length >= 30 ||
            budget.training + budget.validation >= 3000
          }
          onClick={() => {
            recorder.arm(label as StateLabel, Date.now(), crypto.randomUUID());
            redraw((n) => n + 1);
          }}
        >
          다음 실측 1회 기록
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            recorder.stop();
            redraw((n) => n + 1);
          }}
        >
          예약 취소
        </Button>
        <Button
          variant="outline"
          disabled={!recorder.rows.length}
          onClick={exportRows}
        >
          최종 검증 CSV 내려받기
        </Button>
      </div>
      <p role="status">
        {recorder.armed ? "다음 새 실측 대기" : "기록 정지"} · 최종 검증{" "}
        {recorder.rows.length}/30행 · 유효 추론 {valid.length}/10회 이상 ·
        관찰/예측 일치 {matches}/{valid.length}
        {exported ? " · 다운로드 요청 완료" : ""}
      </p>
      <p>
        학습·최종 검증 CSV를 합쳐 최대3000행까지 메모리에 보관합니다. 높은
        일치율만으로 성공을 판단하지 않습니다.
      </p>
      {recorder.rows.length > 0 && (
        <div className="ai-table">
          <table>
            <thead>
              <tr>
                <th>회</th>
                <th>관찰 label</th>
                <th>Pico state</th>
                <th>오류</th>
                <th>모델 ID</th>
              </tr>
            </thead>
            <tbody>
              {recorder.rows.map((r, i) => (
                <tr key={r.session_id}>
                  <td>{i + 1}</td>
                  <td>{r.label}</td>
                  <td>{r.sample.state || "모델 미적용"}</td>
                  <td>{r.sample.error || "없음"}</td>
                  <td>{r.sample.model_id || "없음"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {finalChecks.map((s, i) => (
        <label key={s} className="flex gap-3 items-start my-4">
          <Checkbox
            checked={!!checks["final-" + i]}
            onCheckedChange={(v) => onCheck("final-" + i, v === true)}
          />
          <span>{s}</span>
        </label>
      ))}
      <p>
        GOOD도 건강·안전 보장이 아닌 수업 라벨입니다. 실측 검증 CSV는 학습 CSV와
        분리합니다. 통신 장애 자체로 개인 이해 점수를 감점하지 않습니다.
      </p>
    </section>
  );
}
