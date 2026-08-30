"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Code2,
  Cpu,
  ExternalLink,
  FlaskConical,
  Gauge,
  GraduationCap,
  Lightbulb,
  MonitorPlay,
  Play,
  RotateCcw,
  Sparkles,
  ThermometerSun,
  Volume2,
  Waves,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { arduinoLessons, arduinoPicoComparison } from "./arduino";

const lessonIcons: LucideIcon[] = [Lightbulb, Waves, ThermometerSun, Gauge, Volume2, Workflow];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SmallHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700">{eyebrow}</p>
        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h3>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

function CourseRoadmap() {
  const paths = [
    { number: "01", label: "Arduino 기초", note: "LED·센서·PWM", target: "arduino-lab", color: "bg-amber-400 text-slate-950" },
    { number: "02", label: "종합 제어", note: "입력→처리→출력", target: "arduino-lab", color: "bg-orange-400 text-slate-950" },
    { number: "03", label: "두 보드 비교", note: "C/C++↔Python", target: "arduino-pico-compare", color: "bg-violet-400 text-slate-950" },
    { number: "04", label: "Pico 실습", note: "Wokwi·Thonny", target: "lesson-0", color: "bg-cyan-400 text-slate-950" },
  ];

  return (
    <section id="course-roadmap" className="scroll-mt-20 overflow-hidden rounded-[30px] bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,.18)]">
      <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.15fr_.85fr] lg:p-11">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">통합 학습경로형</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-cyan-200">교재·실습·중간고사 연결</span>
          </div>
          <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-5xl">Arduino에서 원리를 익히고<br className="hidden sm:block" /> Raspberry Pi Pico로 확장합니다</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            같은 센서와 출력 장치를 두 보드에서 비교합니다. 먼저 코드를 예측하고 Tinkercad에서 확인한 뒤, Pico의 Wokwi·Thonny 실습으로 자연스럽게 넘어갑니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button onClick={() => scrollToId("arduino-lab")} className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300">
              <Play className="mr-1.5 size-4" /> Arduino부터 시작
            </Button>
            <Button onClick={() => scrollToId("arduino-pico-compare")} variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              Arduino↔Pico 비교표
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[
            ["교과서 필수", "피지컬 컴퓨팅·센서·액추에이터·마이크로컨트롤러"],
            ["실습 핵심", "회로 연결·코드 해석·값 변경·오류 진단"],
            ["시험 대비", "객관식·코드 추적·계산·회로 진단·서술형"],
          ].map(([title, body], index) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-xl bg-white/10 text-xs font-black text-amber-300">0{index + 1}</span>
                <p className="font-black text-white">{title}</p>
              </div>
              <p className="mt-2 pl-11 text-xs leading-5 text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid border-t border-white/10 sm:grid-cols-4">
        {paths.map((path) => (
          <button key={path.number} type="button" onClick={() => scrollToId(path.target)} className="group flex items-center gap-3 border-b border-white/10 px-5 py-4 text-left transition hover:bg-white/5 sm:border-b-0 sm:border-r last:border-r-0">
            <span className={"grid size-9 shrink-0 place-items-center rounded-xl text-xs font-black " + path.color}>{path.number}</span>
            <span><span className="block text-sm font-black text-white">{path.label}</span><span className="mt-0.5 block text-[11px] font-bold text-slate-500 group-hover:text-slate-300">{path.note}</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ArduinoJourney() {
  const moduleRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(1);
  const [activeTab, setActiveTab] = useState("concept");
  const [completed, setCompleted] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, number[]>>({});
  const [quizChoice, setQuizChoice] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const [draft, setDraft] = useState(arduinoLessons[0].code);
  const lesson = arduinoLessons[selected - 1];
  const LessonIcon = lessonIcons[selected - 1] ?? Cpu;
  const steps = checkedSteps[selected] ?? [];
  const quizIsCorrect = Number(quizChoice) === lesson.quiz.answer;
  const progress = Math.round((completed.length / arduinoLessons.length) * 100);
  const nextIncomplete = useMemo(
    () => arduinoLessons.find((item) => !completed.includes(item.id))?.id ?? arduinoLessons.length,
    [completed],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("arduino-lab-progress");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { completed?: number[]; checkedSteps?: Record<number, number[]> };
      setCompleted(parsed.completed ?? []);
      setCheckedSteps(parsed.checkedSteps ?? {});
    } catch {
      window.localStorage.removeItem("arduino-lab-progress");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("arduino-lab-progress", JSON.stringify({ completed, checkedSteps }));
  }, [completed, checkedSteps]);

  useEffect(() => {
    setActiveTab("concept");
    setQuizChoice("");
    setQuizChecked(false);
    setDraft(lesson.code);
  }, [lesson.code]);

  const selectLesson = (id: number) => {
    setSelected(id);
    window.requestAnimationFrame(() => moduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const toggleComplete = () => {
    const wasComplete = completed.includes(selected);
    setCompleted((current) => wasComplete ? current.filter((id) => id !== selected) : [...current, selected].sort((a, b) => a - b));
    toast.success(wasComplete ? "Arduino 모듈 완료 표시를 취소했습니다." : `Arduino ${selected}번 모듈을 완료했습니다.`);
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((current) => {
      const values = current[selected] ?? [];
      return { ...current, [selected]: values.includes(index) ? values.filter((value) => value !== index) : [...values, index] };
    });
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(draft);
    toast.success("Arduino 전체 코드를 복사했습니다. Tinkercad 텍스트 코드에 붙여 넣으세요.");
  };

  const stageCards = [
    ["01", "개념", "원리·시험 포인트", "concept"],
    ["02", "Tinkercad", "가상 회로", "tinkercad"],
    ["03", "실습", "배선·오류 점검", "practice"],
    ["04", "코드", "전체·줄별 해석", "code"],
    ["05", "평가", "중간고사 연결", "check"],
  ];

  return (
    <>
      <CourseRoadmap />

      <section id="arduino-lab" className="scroll-mt-20 pt-9">
        <div className="rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_18px_55px_rgba(245,158,11,.10)] sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2"><span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">PART A</span><span className="text-xs font-black text-amber-800">Arduino · Tinkercad 기초 교재</span></div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">여섯 가지 회로를 코드로 해석하세요</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">수업시간에는 핵심 모듈을 선택해 실습하고, 시험 전에는 여섯 모듈의 개념·회로·코드를 전자교재로 다시 학습합니다.</p>
            </div>
            <div className="min-w-48 rounded-2xl border border-amber-200 bg-white p-4">
              <div className="flex items-center justify-between text-xs font-black text-slate-700"><span>Arduino 진도</span><span className="text-amber-700">{completed.length}/6</span></div>
              <Progress value={progress} className="mt-3 h-2 bg-amber-100 [&>div]:bg-amber-400" />
              <button onClick={() => selectLesson(nextIncomplete)} className="mt-3 text-xs font-black text-amber-800 hover:text-amber-950">다음 미완료 모듈 열기 →</button>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            {arduinoLessons.map((item, index) => {
              const Icon = lessonIcons[index] ?? Cpu;
              const isActive = selected === item.id;
              const done = completed.includes(item.id);
              return (
                <button key={item.id} type="button" onClick={() => selectLesson(item.id)} aria-pressed={isActive} className={"rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 " + (isActive ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-amber-100 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-amber-300")}>
                  <div className="flex items-center justify-between"><span className={"grid size-8 place-items-center rounded-xl text-xs font-black " + (isActive ? "bg-amber-400 text-slate-950" : "bg-amber-100 text-amber-800")}>A{item.id}</span>{done ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Icon className={"size-4 " + (isActive ? "text-amber-300" : "text-amber-600")} />}</div>
                  <p className="mt-3 text-sm font-black">{item.shortTitle}</p>
                  <p className={"mt-1 text-[10px] font-bold " + (isActive ? "text-slate-400" : "text-slate-400")}>{item.input} → {item.output}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={moduleRef} id="arduino-module" className="scroll-mt-20 mt-6 overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,.15)]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">ARDUINO A{lesson.id}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">{lesson.duration}</span></div>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">{lesson.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{lesson.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={toggleComplete} className={completed.includes(selected) ? "rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300" : "rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300"}>{completed.includes(selected) ? <CheckCircle2 className="mr-1.5 size-4" /> : <Check className="mr-1.5 size-4" />}{completed.includes(selected) ? "학습 완료됨" : "이 모듈 완료 표시"}</Button>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300">실습 단계 {steps.length}/{lesson.steps.length}</div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-amber-400 text-slate-950"><LessonIcon className="size-6" /></div><div><p className="text-[10px] font-black tracking-[.15em] text-amber-300">INPUT → OUTPUT</p><p className="mt-1 text-sm font-black text-white">{lesson.input}</p></div></div>
            <div className="my-4 h-px bg-white/10" />
            <p className="text-xs font-bold text-slate-500">최종 출력</p><p className="mt-1 font-black text-cyan-300">{lesson.output}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Arduino 학습 순서">
        <div className="grid gap-2 sm:grid-cols-5">
          {stageCards.map(([number, label, note, value]) => {
            const isActive = activeTab === value;
            return (
              <button key={value} type="button" onClick={() => setActiveTab(value)} aria-pressed={isActive} className={"w-full rounded-2xl p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 " + (isActive ? "bg-amber-400 text-slate-950 shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-950")}>
                <div className="flex items-center gap-2"><span className={"grid size-7 place-items-center rounded-full text-[10px] font-black " + (isActive ? "bg-slate-950 text-amber-300" : "bg-white text-slate-500")}>{number}</span><p className="text-sm font-black">{label}</p></div>
                <p className="mt-1 pl-9 text-[11px] font-bold opacity-65">{note}</p>
              </button>
            );
          })}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-7">
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <TabsList variant="line" className="min-w-max gap-5 border-b border-slate-200 px-1">
            <TabsTrigger value="concept" className="px-1 pb-3 text-sm font-extrabold">개념·원리</TabsTrigger>
            <TabsTrigger value="tinkercad" className="px-1 pb-3 text-sm font-extrabold">Tinkercad 가상 실습</TabsTrigger>
            <TabsTrigger value="practice" className="px-1 pb-3 text-sm font-extrabold">회로·실습</TabsTrigger>
            <TabsTrigger value="code" className="px-1 pb-3 text-sm font-extrabold">전체 코드·줄별 해석</TabsTrigger>
            <TabsTrigger value="check" className="px-1 pb-3 text-sm font-extrabold">평가·시험 연결</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="concept" className="mt-6 space-y-5">
          <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SmallHeading icon={BookOpen} eyebrow="Digital Textbook" title="학습 목표와 핵심 개념" description="노란색 시험 포인트까지 읽으면 코드·회로형 문항을 준비할 수 있습니다." />
            <div className="grid gap-3 lg:grid-cols-3">
              {lesson.objectives.map((objective, index) => <div key={objective} className="flex gap-3 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-200"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-400 text-xs font-black text-slate-950">{index + 1}</span>{objective}</div>)}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {lesson.concepts.map((concept, index) => (
                <article key={concept.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
                  <div className="p-5"><div className="flex items-center justify-between"><h4 className="font-black text-slate-950">{concept.title}</h4><span className="text-xs font-black text-slate-300">0{index + 1}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{concept.body}</p></div>
                  <div className="border-t border-amber-100 bg-amber-50 px-5 py-3"><p className="text-[10px] font-black tracking-[.14em] text-amber-700">시험 포인트</p><p className="mt-1 text-xs leading-5 text-amber-950">{concept.exam}</p></div>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-[26px] border border-cyan-200 bg-cyan-50 p-5 sm:p-7"><SmallHeading icon={Workflow} eyebrow="Physical Computing" title="입력 → 처리 → 출력" /><div className="grid gap-3 sm:grid-cols-3">{[["입력", lesson.input], ["처리", "값 읽기·범위 변환·조건 판단"], ["출력", lesson.output]].map(([label, body], index) => <div key={label} className="rounded-2xl bg-white p-5 ring-1 ring-inset ring-cyan-100"><p className="text-xs font-black text-cyan-700">STEP {index + 1} · {label}</p><p className="mt-2 text-sm font-black leading-6 text-slate-950">{body}</p></div>)}</div></section>
        </TabsContent>

        <TabsContent value="tinkercad" className="mt-6 space-y-5">
          <section className="overflow-hidden rounded-[28px] border border-cyan-200 bg-gradient-to-br from-[#092635] via-[#0c3142] to-[#104b5e] text-white shadow-[0_18px_55px_rgba(14,116,144,.16)]">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_.95fr]">
              <div><div className="flex items-center gap-2"><span className="rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-black tracking-[.16em] text-cyan-950">TINKERCAD</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-cyan-100">Arduino 가상 회로</span></div><h3 className="mt-5 text-2xl font-black sm:text-3xl">실행 전에 출력 결과부터 예측하세요</h3><p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-50/75">공개 참고 회로를 연 뒤 부품과 전류 경로를 확인합니다. 핀·코드가 다르면 이 교재의 연결표와 전체 코드를 기준으로 수정하세요.</p><Button asChild className="mt-6 rounded-xl bg-cyan-300 text-cyan-950 hover:bg-cyan-200"><a href={lesson.simulatorUrl} target="_blank" rel="noreferrer"><MonitorPlay className="mr-1.5 size-4" />Tinkercad 예제 열기<ExternalLink className="ml-1.5 size-3.5" /></a></Button></div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5"><p className="text-xs font-black tracking-[.14em] text-cyan-200">예제 사용 기준</p><p className="mt-3 text-sm leading-7 text-cyan-50/85">{lesson.simulatorNote}</p><div className="mt-4 rounded-2xl bg-black/20 p-4 text-xs leading-5 text-cyan-100"><strong className="text-white">개인정보 주의:</strong> 공개 프로젝트 이름과 메모에는 학생 이름·학번·학교 계정을 입력하지 않습니다.</div></div>
            </div>
          </section>
          <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SmallHeading icon={Cpu} eyebrow="Virtual Wiring" title="가상 회로 연결표" /><div className="overflow-hidden rounded-2xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-950 text-white"><tr><th className="px-3 py-3">출발</th><th className="px-3 py-3">도착</th></tr></thead><tbody>{lesson.wiring.map((wire) => <tr key={wire.from + wire.to} className="border-t border-slate-100 align-top"><td className="px-3 py-3 font-bold text-slate-900">{wire.from}</td><td className="px-3 py-3 font-mono font-bold text-amber-700">{wire.to}<span className="mt-1 block font-sans text-xs font-normal leading-5 text-slate-500">{wire.note}</span></td></tr>)}</tbody></table></div></section>
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SmallHeading icon={FlaskConical} eyebrow="Simulation Steps" title="Tinkercad 따라 하기" /><div className="space-y-2.5">{lesson.steps.map((step, index) => <label key={step} className={"flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition " + (steps.includes(index) ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50/60 hover:border-amber-300")}><Checkbox checked={steps.includes(index)} onCheckedChange={() => toggleStep(index)} className="mt-0.5 size-5" /><span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-slate-500 shadow-sm">{index + 1}</span><span className={"text-sm leading-6 " + (steps.includes(index) ? "font-medium text-emerald-900 line-through decoration-emerald-400" : "text-slate-700")}>{step}</span></label>)}</div></section>
          </div>
        </TabsContent>

        <TabsContent value="practice" className="mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SmallHeading icon={Cpu} eyebrow="Parts" title="준비 부품" /><div className="flex flex-wrap gap-2">{lesson.parts.map((part) => <span key={part} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{part}</span>)}</div><div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>안전 원칙:</strong> 실물 배선을 바꿀 때는 USB와 전원을 분리합니다. 모터는 GPIO 핀에서 직접 전원을 공급하지 않습니다.</div></section>
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SmallHeading icon={AlertTriangle} eyebrow="Debug" title="오류를 근거로 찾기" description="전원 → GND → 핀 번호 → 부품 종류 → 코드 순서로 확인하세요." /><div className="grid gap-3 sm:grid-cols-2">{lesson.errors.map((error) => <div key={error.symptom} className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4"><p className="font-black text-rose-900">{error.symptom}</p><p className="mt-2 text-sm text-slate-600"><strong className="text-slate-900">원인:</strong> {error.cause}</p><p className="mt-1 text-sm text-slate-600"><strong className="text-slate-900">해결:</strong> {error.fix}</p></div>)}</div></section>
          </div>
          <section className="rounded-[26px] border border-violet-200 bg-violet-50 p-5 sm:p-7"><SmallHeading icon={Sparkles} eyebrow="Change One Thing" title="코드 바꾸기 미션" /><p className="rounded-2xl bg-white p-5 text-sm font-bold leading-7 text-violet-950 ring-1 ring-inset ring-violet-100">{lesson.challenge}</p><p className="mt-4 text-xs leading-5 text-violet-800">바꾼 줄, 실행 전 예상, 실제 결과, 예상과 달랐다면 그 이유를 함께 기록합니다.</p></section>
        </TabsContent>

        <TabsContent value="code" className="mt-6 space-y-5">
          <section className="overflow-hidden rounded-[26px] border border-slate-800 bg-[#0b1220] shadow-[0_18px_55px_rgba(15,23,42,.18)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><div className="flex items-center gap-3"><div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-rose-400" /><span className="size-2.5 rounded-full bg-amber-300" /><span className="size-2.5 rounded-full bg-emerald-400" /></div><span className="font-mono text-xs font-bold text-slate-400">Arduino C/C++ · 전체 실행 코드</span></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setDraft(lesson.code)} className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"><RotateCcw className="mr-1.5 size-3.5" />초기화</Button><Button size="sm" onClick={copyCode} className="bg-amber-400 text-slate-950 hover:bg-amber-300"><Clipboard className="mr-1.5 size-3.5" />전체 코드 복사</Button></div></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} aria-label={`Arduino A${lesson.id} 코드 편집기`} className="min-h-[460px] w-full resize-y bg-transparent px-5 py-5 font-mono text-[13px] leading-7 text-cyan-50 outline-none sm:px-7" /><div className="border-t border-white/10 bg-emerald-400/10 p-5 text-sm leading-6 text-emerald-100"><strong className="text-emerald-300">예상 결과:</strong> {lesson.expected}</div></section>
          <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SmallHeading icon={Code2} eyebrow="Read the Code" title="핵심 코드 줄별 해석" description="함수 이름만 외우지 말고 이 줄이 입력·처리·출력 중 무엇을 담당하는지 말해 보세요." /><div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[680px] w-full text-left text-sm"><thead className="bg-slate-950 text-white"><tr><th className="px-4 py-3">코드</th><th className="px-4 py-3">의미</th></tr></thead><tbody>{lesson.lineNotes.map((line) => <tr key={line.code} className="border-t border-slate-100 align-top"><td className="px-4 py-4 font-mono text-xs font-bold text-amber-700">{line.code}</td><td className="px-4 py-4 leading-6 text-slate-600">{line.meaning}</td></tr>)}</tbody></table></div></section>
        </TabsContent>

        <TabsContent value="check" className="mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SmallHeading icon={CheckCircle2} eyebrow="Formative Quiz" title="형성평가" /><p className="rounded-2xl bg-slate-950 p-5 text-base font-bold leading-7 text-white">Q. {lesson.quiz.question}</p><RadioGroup value={quizChoice} onValueChange={(value) => { setQuizChoice(value); setQuizChecked(false); }} className="mt-5 space-y-2">{lesson.quiz.options.map((option, index) => <label key={option} className={"flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition " + (quizChoice === String(index) ? "border-amber-400 bg-amber-50 font-bold text-amber-950" : "border-slate-200 hover:border-slate-300")}><RadioGroupItem value={String(index)} id={`arduino-q-${selected}-${index}`} /><span className="grid size-6 place-items-center rounded-full bg-white text-xs font-black text-slate-500 shadow-sm">{index + 1}</span>{option}</label>)}</RadioGroup><Button disabled={quizChoice === ""} onClick={() => setQuizChecked(true)} className="mt-5 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800">정답과 해설 확인</Button>{quizChecked && <div className={"mt-4 rounded-2xl p-4 text-sm leading-6 " + (quizIsCorrect ? "bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-950 ring-1 ring-rose-200")}><p className="font-black">{quizIsCorrect ? "정답입니다." : "코드와 원리를 다시 확인하세요."}</p><p className="mt-1">{lesson.quiz.explanation}</p></div>}</section>
            <section className="rounded-[26px] border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-7"><SmallHeading icon={GraduationCap} eyebrow="Midterm Practice" title="중간고사형 연습" description="실제 시험문제와 정답은 교사용 자료에서 별도로 관리합니다." /><div className="space-y-3">{lesson.examPrompts.map((item, index) => <div key={item.prompt} className="rounded-2xl bg-white p-4 ring-1 ring-inset ring-amber-100"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-amber-400 text-xs font-black text-slate-950">{index + 1}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">{item.type}</span></div><p className="mt-3 text-sm font-bold leading-6 text-slate-800">{item.prompt}</p></div>)}</div></section>
          </div>
          <section className="rounded-[26px] border border-cyan-200 bg-cyan-50 p-5 sm:p-7"><SmallHeading icon={GraduationCap} eyebrow="Teacher Guide" title="교사 운영 포인트" /><p className="rounded-2xl bg-white p-5 text-sm leading-7 text-cyan-950 ring-1 ring-inset ring-cyan-100">{lesson.teacher}</p></section>
        </TabsContent>
      </Tabs>

      <nav className="mt-7 flex items-center justify-between gap-3" aria-label="Arduino 모듈 이동"><Button variant="outline" disabled={selected === 1} onClick={() => selectLesson(selected - 1)} className="rounded-xl bg-white"><ChevronLeft className="mr-1.5 size-4" />이전 모듈</Button><div className="hidden items-center gap-1 sm:flex">{arduinoLessons.map((item) => <button key={item.id} onClick={() => selectLesson(item.id)} aria-label={`Arduino ${item.id}번 모듈로 이동`} className={"h-2 rounded-full transition-all " + (selected === item.id ? "w-8 bg-amber-500" : completed.includes(item.id) ? "w-2 bg-emerald-400" : "w-2 bg-slate-300")} />)}</div><Button disabled={selected === arduinoLessons.length} onClick={() => selectLesson(selected + 1)} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">다음 모듈<ChevronRight className="ml-1.5 size-4" /></Button></nav>

      <section id="arduino-pico-compare" className="scroll-mt-20 mt-10 overflow-hidden rounded-[28px] border border-violet-200 bg-white shadow-[0_18px_55px_rgba(124,58,237,.10)]">
        <div className="grid gap-6 bg-gradient-to-r from-amber-400 via-orange-300 to-cyan-300 p-6 sm:p-8 lg:grid-cols-[1fr_300px]">
          <div><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">PART B · BRIDGE</span><h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Arduino 원리를 Pico의 MicroPython으로 옮기기</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-800">보드·전압·언어와 함수 이름은 달라도 센서가 입력하고, 프로그램이 처리하며, 액추에이터가 출력하는 구조는 같습니다.</p></div>
          <div className="rounded-3xl bg-slate-950 p-5 text-white"><p className="text-xs font-black tracking-[.15em] text-cyan-300">핵심 한 문장</p><p className="mt-3 text-lg font-black leading-7">문법을 비교하고<br />원리는 연결한다.</p><Button onClick={() => scrollToId("lesson-0")} className="mt-5 w-full rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300">Pico 준비로 이동</Button></div>
        </div>
        <div className="overflow-x-auto p-5 sm:p-7"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-slate-950 text-white"><tr><th className="rounded-l-xl px-4 py-3">비교 항목</th><th className="px-4 py-3 text-amber-300">Arduino Uno</th><th className="px-4 py-3 text-cyan-300">Raspberry Pi Pico</th><th className="rounded-r-xl px-4 py-3">공통 원리·주의</th></tr></thead><tbody>{arduinoPicoComparison.map((row) => <tr key={row.item} className="border-b border-slate-100 align-top"><th className="px-4 py-4 font-black text-slate-950">{row.item}</th><td className="px-4 py-4 font-mono text-xs font-bold text-amber-700">{row.arduino}</td><td className="px-4 py-4 font-mono text-xs font-bold text-cyan-700">{row.pico}</td><td className="px-4 py-4 leading-6 text-slate-600">{row.meaning}</td></tr>)}</tbody></table></div>
        <div className="grid gap-4 border-t border-slate-100 bg-slate-50 p-5 sm:p-7 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-mono text-xs font-black text-amber-800">Arduino C/C++</p><pre className="mt-3 overflow-auto font-mono text-xs leading-6 text-slate-800"><code>{`pinMode(9, OUTPUT);\ndigitalWrite(9, HIGH);\ndelay(1000);`}</code></pre></div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="font-mono text-xs font-black text-cyan-800">Pico MicroPython</p><pre className="mt-3 overflow-auto font-mono text-xs leading-6 text-slate-800"><code>{`led = Pin(9, Pin.OUT)\nled.value(1)\nsleep(1)`}</code></pre></div>
        </div>
      </section>

      <div className="my-9 flex items-center gap-3" aria-hidden="true"><div className="h-px flex-1 bg-slate-200" /><span className="rounded-full bg-slate-200 px-4 py-1.5 text-xs font-black text-slate-600">Arduino 완료 → Raspberry Pi Pico 시작</span><div className="h-px flex-1 bg-slate-200" /></div>
    </>
  );
}
