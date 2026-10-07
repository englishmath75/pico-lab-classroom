import { useEffect, useState } from "react";
const notebookPath =
  "englishmath75/pico-lab-classroom/blob/main/public/downloads/ai-ble/PICO2W_AI_Classroom.ipynb";
const colabUrl = "https://colab.research.google.com/github/" + notebookPath;
const rawUrl =
  "https://raw.githubusercontent.com/englishmath75/pico-lab-classroom/main/public/downloads/ai-ble/PICO2W_AI_Classroom.ipynb";
export function ColabPanel({ base }: { base: string }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    // Resource availability only; no classroom data or identity is sent.
    void fetch(rawUrl, { signal: controller.signal, credentials: "omit" })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((notebook) => {
        if (!controller.signal.aborted)
          setAvailable(
            notebook?.nbformat === 4 && Array.isArray(notebook.cells),
          );
      })
      .catch(() => {});
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);
  return (
    <section className="ai-card">
      <h2>Colab Code · 실제 데이터로 학습</h2>
      <ol className="grid sm:grid-cols-2 gap-3 my-4" aria-label="Colab 학습 단계">
        {["CSV 검사", "CSV 업로드", "train/test 분리", "Decision Tree 학습", "accuracy 확인", "tree 규칙 확인 (export_text)", "predict() 자동 생성", "model.py 다운로드"].map((step,i) => <li className="rounded-xl bg-cyan-50 p-3" key={step}><strong>{String(i+1).padStart(2,"0")}</strong> {step}</li>)}
      </ol>
      <p>회차(session) 단위로 학습/평가 자료를 분리하고 accuracy를 baseline·혼동행렬과 함께 확인합니다.</p>
      <a
        className="inline-block py-3"
        href={base + "PICO2W_AI_Classroom.ipynb"}
        download
      >
        10셀 노트북 내려받기
      </a>
      <p>
        내려받은 ipynb를{" "}
        <a
          href="https://colab.research.google.com/"
          target="_blank"
          rel="noreferrer"
        >
          Colab
        </a>
        의 파일 → 노트북 업로드로 여세요. GitHub 실행 링크는 원격 notebook
        공개를 확인한 경우 활성화합니다.
      </p>
      {available ? (
        <a href={colabUrl} target="_blank" rel="noreferrer">
          GitHub 노트북을 Colab에서 실행
        </a>
      ) : (
        <p>
          GitHub 노트북 미공개 또는 네트워크 확인 불가 · 현재는
          내려받기/업로드로 실행하세요.
        </p>
      )}
      <p>
        model.py는 tree_에서 자동 생성한 추론 코드, model-meta.json은
        출처·평가·학습 범위, model-tests.json은 Pico 동등성 검사 입력입니다.
      </p>
      <p>
        라벨별 4개 독립 회차·각 5행·총80행 이상이 필요합니다. 부족하면 실제
        수집으로 보충합니다. 높은 정확도가 완료 조건은 아닙니다.
      </p>
    </section>
  );
}
