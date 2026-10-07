import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAiBleProgress } from "@/hooks/use-ai-ble-progress";
import { usePicoBle } from "@/hooks/use-pico-ble";
import { lessons } from "./ai-ble/course-data";
import { CourseHero } from "./ai-ble/components/CourseHero";
import { LessonRoadmap } from "./ai-ble/components/LessonRoadmap";
import { LessonPanel } from "./ai-ble/components/LessonPanel";
import { BleLiveLab } from "./ai-ble/components/BleLiveLab";
import { SensorDashboard } from "./ai-ble/components/SensorDashboard";
import { DataCollector } from "./ai-ble/components/DataCollector";
import { CodePanel } from "./ai-ble/components/CodePanel";
import { ColabPanel } from "./ai-ble/components/ColabPanel";
import { FinalProject } from "./ai-ble/components/FinalProject";
import { TeacherGuide } from "./ai-ble/components/TeacherGuide";

const sources = import.meta.glob(
  "../public/downloads/ai-ble/{firmware,diagnostics}/*.py",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;
const base = import.meta.env.BASE_URL + "downloads/ai-ble/";
export function AiBleCourse({ onBack }: { onBack: () => void }) {
  const progress = useAiBleProgress();
  const ble = usePicoBle();
  const [selected, setSelected] = useState(1);
  const [mode, setMode] = useState("student");
  const teacher = mode === "teacher";
  const show = (...ids: number[]) => teacher || ids.includes(selected);
  const selectLesson = (id: number) => {
    setSelected(id);
    requestAnimationFrame(() => document.getElementById("ai-current-lesson")?.scrollIntoView({ block: "start" }));
  };
  const [hidden, setHidden] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const dirtyRef = useRef(false);
  const dirtyParts = useRef({ training: false, validation: false });
  const budget = useRef({ training: 0, validation: 0 }).current;
  const setDirtyStable = useCallback((v: boolean) => {
    dirtyParts.current.training = v;
    dirtyRef.current = v || dirtyParts.current.validation;
    setDirty(dirtyRef.current);
  }, []);
  const setValidationDirty = useCallback((v: boolean) => {
    dirtyParts.current.validation = v;
    dirtyRef.current = v || dirtyParts.current.training;
    setDirty(dirtyRef.current);
  }, []);
  const exported = useCallback(() => setDirtyStable(false), [setDirtyStable]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, []);
  useEffect(() => {
    const guard = (e: Event) => {
      if (dirtyRef.current) {
        e.preventDefault();
        setLeaving(true);
      }
    };
    window.addEventListener("ai-before-leave", guard);
    return () => window.removeEventListener("ai-before-leave", guard);
  }, []);
  const leave = () => {
    ble.disconnect();
    onBack();
  };
  return (
    <main className="ai-ble-course max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      <CourseHero onBack={() => (dirty ? setLeaving(true) : leave())} />
      {leaving && (
        <section
          className="ai-card"
          role="dialog"
          aria-modal="true"
          aria-label="미저장 데이터"
        >
          <h2>이동 전에 CSV를 내보내세요</h2>
          <p>메모리의 센서 데이터는 과정 이동 시 사라집니다.</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => window.dispatchEvent(new Event("ai-export"))}
            >
              CSV 내보내기
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.dispatchEvent(new Event("ai-export-validation"))
              }
            >
              최종 검증 CSV 내보내기
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDirtyStable(false);
                leave();
              }}
            >
              이동
            </Button>
            <Button variant="outline" onClick={() => setLeaving(false)}>
              계속 학습
            </Button>
          </div>
        </section>
      )}
      {progress.blocked && (
        <p role="status">
          이 기기에서는 진도가 저장되지 않습니다. 현재 화면에서는 계속 학습할 수
          있습니다.
        </p>
      )}
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="h-auto">
          <TabsTrigger value="student">학생</TabsTrigger>
          <TabsTrigger value="teacher">교사</TabsTrigger>
        </TabsList>
        <TabsContent
          value="student"
          forceMount
          className="data-[state=inactive]:hidden space-y-6"
        >
          <LessonRoadmap
            selected={selected}
            completed={progress.progress.completedLessons}
            onSelect={selectLesson}
            onToggle={progress.toggle}
          />
          <LessonPanel
            key={selected}
            lesson={lessons[selected - 1]}
            checks={progress.progress.checks}
            onCheck={progress.check}
          />
        </TabsContent>
        <TabsContent value="teacher">
          <TeacherGuide checks={progress.progress.checks} onCheck={progress.check} />
        </TabsContent>
      </Tabs>
      <div className="space-y-6">
        <div hidden={!show(3, 4, 5, 8)}><BleLiveLab ble={ble} /></div>
        <div hidden={!show(4, 5, 8)}>
          <SensorDashboard
            sample={ble.latest}
            status={ble.status}
            hidden={selected === 5 && !teacher && hidden}
          />
        </div>
        <div hidden={!show(4, 5)}>
          <section className="ai-card"><h2>데이터와 정답</h2><p><strong>Feature = AI가 판단할 때 보는 값</strong></p><p>light · temperature · humidity</p><p><strong>Label = AI가 맞혀야 하는 정답</strong></p><p>GOOD · DARK · VENTILATE · HOT_HUMID</p><p>label은 관찰 후 사람이 정합니다. Pico의 예측 state를 정답으로 복사하지 않습니다.</p></section>
          <DataCollector
            active={show(4, 5)}
            latestLiveSample={ble.latest}
            connectionStatus={ble.status}
            onExport={exported}
            onDirtyChange={setDirtyStable}
            hidden={hidden}
            onHiddenChange={setHidden}
            budget={budget}
          />
        </div>
          <section className="ai-card" hidden={!teacher && selected === 6}>
            <h2>Pico Code</h2>
            <p>
              선택 차시 권장 파일:{" "}
              {lessons[selected - 1].codeFiles.join(", ") || "Colab notebook"}
            </p>
            <p>
              Thonny로 firmware 전체를 Pico 루트에 저장합니다. diagnostics는
              해당 차시에 따로 실행합니다. 기본 model.py는 미학습 stub이며 수집
              모드입니다.
            </p>
            {Object.entries(sources).filter(([path]) => teacher || lessons[selected - 1].codeFiles.includes(path.split("/ai-ble/")[1])).map(([path, content]) => {
              const relative = path.split("/ai-ble/")[1];
              return (
                <CodePanel
                  key={path}
                  title={relative}
                  language="MicroPython"
                  content={content}
                  downloadUrl={base + relative}
                  targetLocation="Pico 루트 (Thonny)"
                />
              );
            })}
          </section>
          <div hidden={!show(6)}><ColabPanel base={base} /></div>
          <div hidden={!show(8)}>
          <FinalProject
            active={show(8)}
            checks={progress.progress.checks}
            onCheck={progress.check}
            sample={ble.latest}
            status={ble.status}
            budget={budget}
            onDirtyChange={setValidationDirty}
          />
          </div>
      </div>
      {!teacher && <nav aria-label="차시 이동" className="ai-card flex items-center justify-between gap-2">
        <Button variant="outline" disabled={selected === 1} onClick={() => selectLesson(selected - 1)}>← 이전 차시</Button>
        <span aria-live="polite">{selected} / 8</span>
        <Button disabled={selected === 8} onClick={() => selectLesson(selected + 1)}>다음 차시 →</Button>
      </nav>}
      <footer className="ai-card">
        <p>
          저장되는 것은 새 과정 완료·체크뿐입니다. 새로고침·브라우저 강제종료 후
          센서 데이터 복구를 보장하지 않습니다.
        </p>
        <Button variant="outline" onClick={progress.reset}>
          새 과정 진도 초기화
        </Button>
        <div className="flex flex-wrap gap-4 mt-4">
          <a href={base + "classroom_schema.csv"} download>
            CSV 헤더
          </a>
          <a href={base + "classroom-environment.json"} download>
            환경 기록 양식
          </a>
        </div>
      </footer>
    </main>
  );
}
