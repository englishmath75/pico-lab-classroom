import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LABELS,
  type ConnectionStatus,
  type LiveSample,
  type StateLabel,
  type TrainingRow,
} from "../types";
import { Collector } from "@/lib/ai-ble/collection";
import type { RowBudget } from "../types";
import { distribution, download, exportCsv, importCsv } from "@/lib/ai-ble/csv";
export function DataCollector({
  active = true,
  latestLiveSample,
  connectionStatus,
  onExport,
  onDirtyChange,
  hidden,
  onHiddenChange,
  budget,
}: {
  active?: boolean;
  latestLiveSample: LiveSample | null;
  connectionStatus: ConnectionStatus;
  onExport: () => void;
  onDirtyChange: (dirty: boolean) => void;
  hidden: boolean;
  onHiddenChange: (v: boolean) => void;
  budget: RowBudget;
}) {
  const collector = useRef(new Collector());
  const [label, setLabel] = useState<StateLabel | "">("");
  const [revision, redraw] = useState(0);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<ReturnType<typeof importCsv> | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const refresh = () => redraw((n) => n + 1);
  const c = collector.current;
  useEffect(() => {
    if (!active) { c.stop(); redraw(n => n + 1); return; }
    const wasActive = c.active;
    if (
      c.accept(
        latestLiveSample,
        connectionStatus,
        Date.now(),
        3000 - budget.validation,
      )
    ) {
      budget.training = c.rows.length;
      onDirtyChange(true);
      redraw((n) => n + 1);
    } else if (
      connectionStatus !== "streaming" ||
      latestLiveSample?.error ||
      (wasActive && !c.active)
    ) {
      c.stop();
      redraw((n) => n + 1);
    }
  }, [active, latestLiveSample, connectionStatus, c, onDirtyChange, budget]);
  const exportRows = () => {
    download("classroom_real.csv", exportCsv(c.rows), "text/csv;charset=utf-8");
    onExport();
    setMessage(
      "CSV 다운로드를 요청했습니다. 다운로드 폴더에서 파일을 확인하세요.",
    );
  };
  useEffect(() => {
    const handler = () => exportRows();
    window.addEventListener("ai-export", handler);
    return () => window.removeEventListener("ai-export", handler);
  });
  const addImported = (rows: TrainingRow[]) => {
    const merged = importCsv(exportCsv([...c.rows, ...rows]));
    if (merged.errors.length || merged.rows.length + budget.validation > 3000) {
      setMessage("병합 오류 또는 3000행 초과: " + merged.errors.join(" / "));
      return;
    }
    c.rows = merged.rows;
    budget.training = c.rows.length;
    setPending(null);
    onDirtyChange(true);
    refresh();
  };
  return (
    <section className="ai-card">
      <h2>데이터·CSV</h2>
      <p>
        관찰한 행동을 먼저 합의하세요. 예측 state를 label로 복사하지 않습니다.
        합의되지 않으면 저장하지 않습니다.
      </p>
      <label className="flex gap-3 items-center my-3">
        <input
          type="checkbox"
          checked={hidden}
          onChange={(e) => onHiddenChange(e.target.checked)}
        />
        라벨 선택 중 센서 수치 가리기 (기본)
      </label>
      <label htmlFor="ai-label">행동 라벨</label>
      <select
        id="ai-label"
        value={label}
        disabled={c.active}
        onChange={(e) => {
          c.stop();
          setLabel(e.target.value as StateLabel | "");
          refresh();
        }}
      >
        <option value="">미선택 / unlabeled</option>
        {LABELS.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      <p className="text-sm">
        GOOD: 별도 조치 불필요 · DARK: 조명 보완 · VENTILATE: 환기 권고 사례 ·
        HOT_HUMID: 냉방/제습 검토
      </p>
      <p>
        CO₂·공기질 측정이나 건강·안전 보장이 아닙니다. 같은 키트·배선·저항으로
        조건/시간을 새로 준비한 회차만 독립으로 셉니다.
      </p>
      <div className="flex flex-wrap gap-3 my-4">
        <Button
          disabled={
            !label ||
            c.active ||
            connectionStatus !== "streaming" ||
            !!latestLiveSample?.error
          }
          onClick={() => {
            c.start(label as StateLabel, Date.now(), crypto.randomUUID());
            refresh();
          }}
        >
          새 측정 회차 시작
        </Button>
        <Button
          disabled={!c.session || c.active || connectionStatus !== "streaming"}
          onClick={() => {
            c.arm();
            refresh();
          }}
        >
          5개 저장
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            c.stop();
            refresh();
          }}
        >
          중지
        </Button>
        <Button
          variant="outline"
          disabled={!c.rows.length}
          onClick={exportRows}
        >
          CSV 내려받기
        </Button>
      </div>
      <p role="status">
        {c.active
          ? "수집 중: 유효 실측 5개 후 자동 정지"
          : c.session
            ? "회차 준비됨: 5개 저장을 누르세요"
            : "수집 정지"}{" "}
        · {c.rows.length}/3000행 · {message}
      </p>
      <p>
        오류·끊김·STALE이면 회차가 종료됩니다. 새 회차 버튼을 다시 누르세요.
        데이터는 메모리에만 있으며 새로고침 전에 CSV를 내보내세요.
      </p>
      <div className="grid sm:grid-cols-4 gap-3">
        {distribution(c.rows).map((d) => (
          <div key={d.label} className="bg-slate-50 rounded-xl p-3">
            <strong>{d.label}</strong>
            <p>
              {d.rows}행 / {d.sessions}회차
            </p>
            <progress max={4} value={d.qualified} className="w-full" />
            <p>
              5행 이상 회차 {d.qualified}/4 {d.qualified < 4 ? "부족" : "확보"}
            </p>
          </div>
        ))}
      </div>
      <details>
        <summary>회차 검토·삭제</summary>
        <p>
          정정은 사유를 기록해 회차 전체를 삭제한 뒤 새 조건에서 수집합니다.
          사유는 메모리에서만 유지합니다.
        </p>
        <label htmlFor="delete-reason">삭제 사유 (개인정보 금지)</label>
        <input
          id="delete-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={160}
        />
        {[...new Set(c.rows.map((r) => r.session_id))].map((id) => (
          <div className="flex flex-wrap gap-2 items-center" key={id}>
            <span className="break-all text-xs">
              {id} · {c.rows.filter((r) => r.session_id === id).length}행
            </span>
            <Button
              variant="outline"
              disabled={!reason.trim() || c.active}
              onClick={() => {
                c.remove(id, reason);
                budget.training = c.rows.length;
                onDirtyChange(true);
                refresh();
              }}
            >
              회차 삭제
            </Button>
          </div>
        ))}
      </details>
      <details>
        <summary>실제 CSV 검사·병합</summary>
        <label htmlFor="ai-import">CSV 파일 (최대 2MB, 3000행)</label>
        <input
          id="ai-import"
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 2_000_000) {
              setMessage("파일 크기 초과");
              return;
            }
            setPending(importCsv(await f.text()));
            e.target.value = "";
          }}
        />
        {pending && (
          <div>
            <p>
              유효 {pending.rows.length}행 · 중복 {pending.duplicates}행 · 오류{" "}
              {pending.errors.length}개
            </p>
            <ul>
              {pending.errors.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            <Button
              disabled={!pending.rows.length || c.active}
              onClick={() => addImported(pending.rows)}
            >
              {pending.errors.length
                ? "오류행 제외를 확인하고 병합"
                : "검사한 실측 자료 병합"}
            </Button>
            <Button variant="outline" onClick={() => setPending(null)}>
              취소
            </Button>
          </div>
        )}
      </details>
      <span hidden>{revision}</span>
    </section>
  );
}
