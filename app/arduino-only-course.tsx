"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
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
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { arduinoCourseLessons } from "./arduino-only-data";
import { ArduinoFoundations } from "./arduino-foundations";

const stageCards: { number: string; label: string; note: string; value: string }[] = [
  { number: "01", label: "개념", note: "원리·시험", value: "concept" },
  { number: "02", label: "Tinkercad", note: "가상 실습", value: "tinkercad" },
  { number: "03", label: "회로", note: "배선·실습", value: "circuit" },
  { number: "04", label: "코드", note: "해석·수정", value: "code" },
  { number: "05", label: "평가", note: "중간고사", value: "assessment" },
];

function Heading({ icon: Icon, eyebrow, title, description }: { icon: LucideIcon; eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white"><Icon className="size-5" /></div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-2 text-base leading-7 text-slate-600">{description}</p>}
      </div>
    </div>
  );
}

function FlowCard({ label, body, tone }: { label: string; body: string; tone: string }) {
  return (
    <div className={`rounded-2xl p-5 ${tone}`}>
      <p className="text-sm font-black uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-lg font-black leading-7">{body}</p>
    </div>
  );
}

export function ArduinoOnlyCourse({ onBack, onGoPico }: { onBack: () => void; onGoPico: () => void }) {
  const [selected, setSelected] = useState(1);
  const [activeTab, setActiveTab] = useState("concept");
  const [completed, setCompleted] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, number[]>>({});
  const [quizChoice, setQuizChoice] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const [draft, setDraft] = useState(arduinoCourseLessons[0].code);
  const lesson = arduinoCourseLessons[selected - 1];
  const steps = checkedSteps[selected] ?? [];
  const quizIsCorrect = Number(quizChoice) === lesson.quiz.answer;
  const progress = Math.round((completed.length / arduinoCourseLessons.length) * 100);
  const nextIncomplete = useMemo(
    () => arduinoCourseLessons.find((item) => !completed.includes(item.id))?.id ?? 3,
    [completed],
  );

  useEffect(() => {
    const raw = window.localStorage.getItem("arduino-3lesson-progress");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { completed?: number[]; checkedSteps?: Record<number, number[]> };
      setCompleted(data.completed ?? []);
      setCheckedSteps(data.checkedSteps ?? {});
    } catch {
      window.localStorage.removeItem("arduino-3lesson-progress");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("arduino-3lesson-progress", JSON.stringify({ completed, checkedSteps }));
  }, [completed, checkedSteps]);

  useEffect(() => {
    setDraft(lesson.code);
    setActiveTab("concept");
    setQuizChoice("");
    setQuizChecked(false);
  }, [lesson.code]);

  const selectLesson = (id: number) => {
    setSelected(id);
    window.requestAnimationFrame(() => document.getElementById("arduino-lesson")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const toggleComplete = () => {
    const wasDone = completed.includes(selected);
    setCompleted((current) => wasDone ? current.filter((id) => id !== selected) : [...current, selected].sort());
    toast.success(wasDone ? "완료 표시를 취소했습니다." : `${selected}차시를 완료했습니다.`);
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((current) => {
      const currentSteps = current[selected] ?? [];
      return {
        ...current,
        [selected]: currentSteps.includes(index) ? currentSteps.filter((item) => item !== index) : [...currentSteps, index].sort(),
      };
    });
  };

  const copyCode = async (code: string, label: string) => {
    await navigator.clipboard.writeText(code);
    toast.success(`${label}를 복사했습니다.`);
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-amber-200/80 bg-[#fffdf8]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-7">
          <button onClick={onBack} className="flex items-center gap-3 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-amber-300"><ArrowLeft className="size-5" /></span>
            <span><span className="block text-xs font-black tracking-[0.14em] text-amber-700">ARDUINO ONLY CLASS</span><span className="block text-base font-black">통합 홈페이지로 돌아가기</span></span>
          </button>
          <Button onClick={() => selectLesson(nextIncomplete)} className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300">
            이어서 학습 <ArrowRight className="ml-1.5 size-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] px-4 py-7 sm:px-7 sm:py-10">
        <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,.18)]">
          <div className="grid gap-8 bg-[radial-gradient(circle_at_80%_10%,rgba(251,191,36,.22),transparent_32%)] p-6 sm:p-9 lg:grid-cols-[1.2fr_.8fr] lg:p-12">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-amber-400 px-3 py-1.5 text-sm font-black text-slate-950">아두이노 전용 교실</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-bold text-cyan-200">입력 → 처리 → 출력</span>
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Arduino에서 원리를 배우고<br className="hidden sm:block" /> Pico로 이동합니다</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                학교에서 자주 사용하는 Arduino Uno로 디지털·아날로그 입력과 출력을 먼저 익힙니다. Tinkercad에서 회로를 실행하고, 코드를 해석하고, 값을 바꾸고, 시험형 문제로 정리합니다.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                  <a href="https://www.tinkercad.com/classrooms/dky0pTDB1Aj/activities" target="_blank" rel="noreferrer"><FlaskConical className="mr-1.5 size-4" />Tinkercad 실습 열기<ExternalLink className="ml-1.5 size-3.5" /></a>
                </Button>
                <Button onClick={() => selectLesson(1)} variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  1차시 시작 <Play className="ml-1.5 size-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 sm:p-6">
              <div className="flex items-center justify-between"><p className="font-black">나의 Arduino 진도</p><p className="text-lg font-black text-amber-300">{completed.length}/3</p></div>
              <Progress value={progress} className="mt-3 h-2 bg-white/10 [&>div]:bg-amber-400" />
              <div className="mt-6 space-y-3">
                {arduinoCourseLessons.map((item) => {
                  const done = completed.includes(item.id);
                  return (
                    <button key={item.id} onClick={() => selectLesson(item.id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 text-left transition hover:border-amber-300/50 hover:bg-white/10">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-black ${done ? "bg-emerald-400 text-emerald-950" : "bg-amber-400 text-slate-950"}`}>{done ? <Check className="size-5" /> : item.id}</span>
                      <span className="min-w-0"><span className="block text-base font-black leading-7 text-white">{item.title}</span></span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <ArduinoFoundations />

        <section className="mt-7 grid gap-3 md:grid-cols-3" aria-label="아두이노 수업 개요">
          {arduinoCourseLessons.map((item) => {
            const isActive = item.id === selected;
            const done = completed.includes(item.id);
            return (
              <button key={item.id} onClick={() => selectLesson(item.id)} className={`rounded-[24px] border p-5 text-left transition ${isActive ? "border-amber-400 bg-amber-50 shadow-sm" : "border-slate-200 bg-white hover:border-amber-300"}`}>
                <div className="flex items-center justify-between"><span className={`grid size-10 place-items-center rounded-xl font-black ${isActive ? "bg-slate-950 text-amber-300" : "bg-slate-100 text-slate-600"}`}>0{item.id}</span>{done && <CheckCircle2 className="size-5 text-emerald-500" />}</div>
                <p className="mt-4 text-lg font-black">{item.title}</p>
                <p className="mt-2 text-base leading-7 text-slate-600">{item.input} → {item.output}</p>
              </button>
            );
          })}
        </section>

        <section id="arduino-lesson" className="mt-8 scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-6 sm:p-9 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="flex flex-wrap gap-2"><span className="rounded-full bg-slate-950 px-3 py-1.5 text-sm font-black text-amber-300">ARDUINO 0{lesson.id}</span></div>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{lesson.title}</h2>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">{lesson.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={toggleComplete} className={completed.includes(selected) ? "rounded-xl bg-emerald-500 text-white hover:bg-emerald-400" : "rounded-xl bg-slate-950 text-white hover:bg-slate-800"}>
                  <CheckCircle2 className="mr-1.5 size-4" />{completed.includes(selected) ? "학습 완료됨" : "이 차시 완료 표시"}
                </Button>
                <span className="flex items-center rounded-xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-600">실습 단계 {steps.length}/{lesson.steps.length}</span>
              </div>
            </div>
            <div className="grid gap-2">
              <FlowCard label="INPUT · 입력" body={lesson.input} tone="bg-white text-slate-950 ring-1 ring-slate-200" />
              <FlowCard label="PROCESS · 처리" body={lesson.process} tone="bg-amber-100 text-amber-950" />
              <FlowCard label="OUTPUT · 출력" body={lesson.output} tone="bg-slate-950 text-cyan-200" />
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm" aria-label="학습 순서">
          <div className="grid gap-2 sm:grid-cols-5">
            {stageCards.map((stage) => {
              const isActive = activeTab === stage.value;
              return (
                <button key={stage.value} onClick={() => setActiveTab(stage.value)} aria-pressed={isActive} className={`rounded-2xl p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isActive ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-700 hover:bg-amber-50"}`}>
                  <div className="flex items-center gap-2"><span className={`grid size-8 place-items-center rounded-full text-sm font-black ${isActive ? "bg-slate-950 text-amber-300" : "bg-white text-slate-500"}`}>{stage.number}</span><span className="font-black">{stage.label}</span></div>
                  <p className="mt-1 pl-10 text-sm font-bold opacity-65">{stage.note}</p>
                </button>
              );
            })}
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-7">
          <div className="overflow-x-auto pb-1 scrollbar-none">
            <TabsList variant="line" className="min-w-max gap-6 border-b border-slate-200 px-1">
              <TabsTrigger value="concept" className="px-1 pb-3 text-base font-extrabold">개념·원리</TabsTrigger>
              <TabsTrigger value="tinkercad" className="px-1 pb-3 text-base font-extrabold">Tinkercad 실습</TabsTrigger>
              <TabsTrigger value="circuit" className="px-1 pb-3 text-base font-extrabold">회로·실습</TabsTrigger>
              <TabsTrigger value="code" className="px-1 pb-3 text-base font-extrabold">전체 코드·해석</TabsTrigger>
              <TabsTrigger value="assessment" className="px-1 pb-3 text-base font-extrabold">평가·시험</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="concept" className="mt-6 space-y-5">
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <Heading icon={BookOpen} eyebrow="Learning Goals" title="이번 차시에서 설명할 수 있어야 하는 것" />
              <div className="grid gap-3 lg:grid-cols-3">
                {lesson.objectives.map((objective, index) => <div key={objective} className="flex gap-3 rounded-2xl bg-slate-950 p-5 text-base leading-7 text-slate-200"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-400 font-black text-slate-950">{index + 1}</span>{objective}</div>)}
              </div>
            </section>
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <Heading icon={Cpu} eyebrow="Core Concepts" title="핵심 개념과 시험 포인트" description="용어를 코드와 실제 동작에 연결해 이해하세요." />
              <div className="grid gap-4 sm:grid-cols-2">
                {lesson.concepts.map((concept, index) => <article key={concept.title} className="overflow-hidden rounded-2xl border border-slate-200"><div className="p-5"><div className="flex items-center justify-between"><h3 className="text-lg font-black">{concept.title}</h3><span className="font-black text-slate-300">0{index + 1}</span></div><p className="mt-3 text-base leading-7 text-slate-700">{concept.body}</p></div><div className="border-t border-amber-100 bg-amber-50 p-4"><p className="text-sm font-black text-amber-800">중간고사 포인트</p><p className="mt-1 text-base leading-7 text-amber-950">{concept.exam}</p></div></article>)}
              </div>
            </section>
            <section className="rounded-[26px] border border-cyan-200 bg-cyan-50 p-5 sm:p-7">
              <Heading icon={Workflow} eyebrow="50 Minute Class" title="50분 수업 흐름" />
              <div className="grid gap-3 sm:grid-cols-5">{[["5분","결과 예측"],["12분","Tinkercad"],["15분","회로·실행"],["10분","코드 수정"],["8분","평가·정리"]].map(([time, task]) => <div key={time} className="rounded-2xl bg-white p-4 text-center ring-1 ring-cyan-100"><p className="text-xl font-black text-cyan-700">{time}</p><p className="mt-1 font-bold text-slate-700">{task}</p></div>)}</div>
            </section>
          </TabsContent>

          <TabsContent value="tinkercad" className="mt-6 space-y-5">
            <section className="rounded-[28px] bg-slate-950 p-5 text-white shadow-sm sm:p-7">
              <Heading icon={FlaskConical} eyebrow="Tinkercad Practice" title="가상 회로에서 먼저 실행하세요" description="실행 전에 결과를 예상하고, 핀·함수·입력값·출력 결과를 기록합니다." />
              {lesson.tinkercad ? (
                <article className="rounded-3xl border border-cyan-300/20 bg-white/[0.06] p-5 sm:p-7">
                  <p className="text-sm font-black text-cyan-300">학교 Tinkercad 수업 활동</p>
                  <h3 className="mt-2 text-2xl font-black">{lesson.tinkercad.title}</h3>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{lesson.tinkercad.description}</p>
                  <Button asChild className="mt-5 rounded-xl bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300">
                    <a href={lesson.tinkercad.url} target="_blank" rel="noreferrer">활동 회로 열기 <ExternalLink className="ml-1.5 size-4" /></a>
                  </Button>
                </article>
              ) : (
                <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-base leading-7 text-amber-50">
                  이 수업의 활동 링크가 등록되기 전에는 아래 회로 연결표를 보고 결과를 먼저 예측합니다.
                </div>
              )}
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-base leading-7 text-amber-50"><strong className="text-amber-300">실습 규칙:</strong> 회로를 실행하기 전에 결과를 예측하고, 실행 후에는 코드에서 바꾼 값과 달라진 결과를 한 문장으로 기록합니다.</div>
            </section>
          </TabsContent>

          <TabsContent value="circuit" className="mt-6 space-y-5">
            <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <Heading icon={Cpu} eyebrow="Parts & Safety" title="준비 부품과 안전" />
                <div className="flex flex-wrap gap-2">{lesson.parts.map((part) => <span key={part} className="rounded-full bg-slate-100 px-3 py-2 text-base font-bold text-slate-700">{part}</span>)}</div>
                <div className="mt-5 space-y-2">{lesson.safety.map((item) => <div key={item} className="flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-base leading-7 text-rose-950"><AlertTriangle className="mt-1 size-5 shrink-0 text-rose-500" />{item}</div>)}</div>
              </section>
              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <Heading icon={Workflow} eyebrow="Wiring Table" title="회로 연결표" description="첨부 회로를 배선 근거까지 읽을 수 있도록 표로 다시 정리했습니다." />
                <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[620px] w-full text-left text-base"><thead className="bg-slate-950 text-white"><tr><th className="px-4 py-3">출발</th><th className="px-4 py-3">도착</th><th className="px-4 py-3">이유</th></tr></thead><tbody>{lesson.wiring.map((wire) => <tr key={wire.from + wire.to} className="border-t border-slate-100 align-top"><td className="px-4 py-4 font-mono font-bold text-amber-700">{wire.from}</td><td className="px-4 py-4 font-mono font-bold text-cyan-700">{wire.to}</td><td className="px-4 py-4 leading-7 text-slate-700">{wire.note}</td></tr>)}</tbody></table></div>
              </section>
            </div>
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <Heading icon={FlaskConical} eyebrow="Hands-on" title="실습 체크리스트" description="배선부터 코드 변경까지 순서대로 완료 표시하세요." />
              <div className="grid gap-3 lg:grid-cols-2">{lesson.steps.map((step, index) => { const checked = steps.includes(index); return <label key={step} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${checked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-amber-300"}`}><Checkbox checked={checked} onCheckedChange={() => toggleStep(index)} className="mt-1 size-5" /><span className="grid size-8 shrink-0 place-items-center rounded-full bg-white font-black text-slate-500 shadow-sm">{index + 1}</span><span className={`text-base leading-7 ${checked ? "font-medium text-emerald-900 line-through decoration-emerald-400" : "text-slate-700"}`}>{step}</span></label>; })}</div>
            </section>
          </TabsContent>

          <TabsContent value="code" className="mt-6 space-y-5">
            <section className="overflow-hidden rounded-[26px] border border-slate-800 bg-[#0b1220] text-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><div><p className="font-mono text-base font-bold text-amber-300">Arduino C/C++ · 0{lesson.id}차시 전체 코드</p><p className="mt-1 text-sm text-slate-400">첨부 예제의 문법을 점검하고 수업용으로 정리한 실행 코드입니다.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setDraft(lesson.code)} className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"><RotateCcw className="mr-1.5 size-4" />초기화</Button><Button size="sm" onClick={() => copyCode(draft, "전체 코드")} className="bg-amber-400 text-slate-950 hover:bg-amber-300"><Clipboard className="mr-1.5 size-4" />복사</Button></div></div>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} aria-label={`${lesson.id}차시 Arduino 코드 편집기`} className="min-h-[500px] w-full resize-y bg-transparent p-6 font-mono text-base leading-8 text-cyan-50 outline-none" />
              <div className="border-t border-white/10 bg-emerald-400/10 p-5 text-base leading-7 text-emerald-100"><strong className="text-emerald-300">성공 결과:</strong> {lesson.expected}</div>
            </section>
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <Heading icon={Code2} eyebrow="Read the Code" title="핵심 코드 줄별 해석" description="각 줄이 입력·처리·출력 중 어떤 역할인지 설명해 보세요." />
              <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[760px] w-full text-left text-base"><thead className="bg-slate-950 text-white"><tr><th className="px-4 py-3">역할</th><th className="px-4 py-3">코드</th><th className="px-4 py-3">의미</th></tr></thead><tbody>{lesson.lineNotes.map((line) => <tr key={line.code} className="border-t border-slate-100 align-top"><td className="px-4 py-4"><span className="rounded-full bg-amber-100 px-3 py-1.5 font-black text-amber-800">{line.role}</span></td><td className="px-4 py-4 font-mono font-bold text-cyan-700">{line.code}</td><td className="px-4 py-4 leading-7 text-slate-700">{line.meaning}</td></tr>)}</tbody></table></div>
            </section>
            {lesson.extension && <section className="overflow-hidden rounded-[26px] border border-violet-200 bg-violet-50"><div className="flex flex-wrap items-start justify-between gap-3 p-5 sm:p-7"><div><p className="text-sm font-black text-violet-700">EXTENSION</p><h3 className="mt-1 text-2xl font-black text-violet-950">{lesson.extension.title}</h3><p className="mt-2 max-w-3xl text-base leading-7 text-violet-900">{lesson.extension.description}</p></div><Button onClick={() => copyCode(lesson.extension!.code, "확장 코드")} className="bg-violet-600 text-white hover:bg-violet-500"><Clipboard className="mr-1.5 size-4" />확장 코드 복사</Button></div><pre className="max-h-[480px] overflow-auto border-t border-violet-200 bg-slate-950 p-6 font-mono text-base leading-8 text-cyan-50"><code>{lesson.extension.code}</code></pre></section>}
            <section className="rounded-[26px] border border-amber-200 bg-amber-50 p-5 sm:p-7"><Heading icon={Sparkles} eyebrow="Change One Thing" title="코드 바꾸기 미션" /><p className="rounded-2xl bg-white p-5 text-lg font-bold leading-8 text-amber-950 ring-1 ring-amber-100">{lesson.challenge}</p></section>
          </TabsContent>

          <TabsContent value="assessment" className="mt-6 space-y-5">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <Heading icon={CheckCircle2} eyebrow="Formative Quiz" title="형성평가" />
                <p className="rounded-2xl bg-slate-950 p-5 text-lg font-bold leading-8 text-white">Q. {lesson.quiz.question}</p>
                <RadioGroup value={quizChoice} onValueChange={(value) => { setQuizChoice(value); setQuizChecked(false); }} className="mt-5 space-y-2">{lesson.quiz.options.map((option, index) => <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-base transition ${quizChoice === String(index) ? "border-amber-400 bg-amber-50 font-bold" : "border-slate-200 hover:border-slate-300"}`}><RadioGroupItem value={String(index)} id={`arduino-only-${selected}-${index}`} /><span className="grid size-8 place-items-center rounded-full bg-white font-black text-slate-500 shadow-sm">{index + 1}</span>{option}</label>)}</RadioGroup>
                <Button disabled={quizChoice === ""} onClick={() => setQuizChecked(true)} className="mt-5 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800">정답과 해설 확인</Button>
                {quizChecked && <div className={`mt-4 rounded-2xl p-5 text-base leading-7 ${quizIsCorrect ? "bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-950 ring-1 ring-rose-200"}`}><p className="font-black">{quizIsCorrect ? "정답입니다." : "개념과 코드를 다시 확인하세요."}</p><p className="mt-2">{lesson.quiz.explanation}</p></div>}
              </section>
              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <Heading icon={GraduationCap} eyebrow="Midterm Practice" title="중간고사형 연습" description="답을 먼저 말하거나 쓴 뒤 예시 답안을 확인하세요." />
                <div className="space-y-3">{lesson.examPrompts.map((item, index) => <details key={item.prompt} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 open:bg-amber-50"><summary className="cursor-pointer list-none text-base font-bold leading-7"><span className="mr-2 rounded-full bg-slate-950 px-2.5 py-1 text-sm font-black text-white">{index + 1}</span><span className="mr-2 text-amber-700">[{item.type}]</span>{item.prompt}</summary><div className="mt-4 border-t border-amber-200 pt-4 text-base leading-7 text-amber-950"><strong>예시 답안:</strong> {item.answer}</div></details>)}</div>
              </section>
            </div>
            {selected === 3 && <section className="rounded-[28px] bg-gradient-to-r from-slate-950 to-cyan-950 p-6 text-white sm:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_300px]"><div><p className="text-sm font-black tracking-[0.15em] text-cyan-300">NEXT · RASPBERRY PI PICO</p><h3 className="mt-3 text-3xl font-black">원리는 그대로, 보드·전압·언어를 바꿉니다</h3><p className="mt-3 text-lg leading-8 text-slate-300">Arduino의 5V·C/C++·0~1023 ADC를 Pico의 3.3V·MicroPython·read_u16() 방식으로 옮겨 비교합니다.</p></div><Button onClick={onGoPico} className="h-auto min-h-14 self-center rounded-2xl bg-cyan-400 text-lg font-black text-slate-950 hover:bg-cyan-300">Pico 0차시로 이동 <ArrowRight className="ml-2 size-5" /></Button></div></section>}
          </TabsContent>
        </Tabs>

        <nav className="mt-8 flex items-center justify-between gap-3" aria-label="Arduino 차시 이동">
          <Button variant="outline" disabled={selected === 1} onClick={() => selectLesson(selected - 1)} className="rounded-xl bg-white"><ChevronLeft className="mr-1.5 size-4" />이전 차시</Button>
          <div className="hidden items-center gap-2 sm:flex">{arduinoCourseLessons.map((item) => <button key={item.id} onClick={() => selectLesson(item.id)} aria-label={`${item.id}차시로 이동`} className={`h-2.5 rounded-full transition-all ${selected === item.id ? "w-10 bg-amber-500" : completed.includes(item.id) ? "w-2.5 bg-emerald-400" : "w-2.5 bg-slate-300"}`} />)}</div>
          {selected < 3 ? <Button onClick={() => selectLesson(selected + 1)} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">다음 차시<ChevronRight className="ml-1.5 size-4" /></Button> : <Button onClick={onGoPico} className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400">Pico로 이동<ArrowRight className="ml-1.5 size-4" /></Button>}
        </nav>

        <footer className="mt-10 border-t border-slate-200 py-7 text-center text-base leading-7 text-slate-500">
          이 페이지의 개념 설명·Tinkercad 활동·배선표·실습 코드·평가 문항은 교실 수업용으로 구성했습니다.
        </footer>
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
