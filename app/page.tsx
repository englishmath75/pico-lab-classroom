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
  Download,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  MonitorPlay,
  Play,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  Terminal,
  Usb,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { lessons, phaseColors } from "./lessons";
import { wokwiLessons } from "./wokwi";
import { ArduinoJourney } from "./arduino-lab";

function SectionTitle({
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
      <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

const thonnySetupSteps = [
  "컴퓨터실 PC에서 Thonny가 실행되는지 확인한다.",
  "데이터 통신이 되는 USB 케이블로 Pico를 연결한다.",
  "Thonny의 인터프리터를 MicroPython (Raspberry Pi Pico)로 선택한다.",
  "포트를 자동 검색 또는 연결된 COM 포트로 선택한다.",
  "Shell에서 neopixel과 dht 모듈을 불러와 준비 상태를 확인한다.",
  "테스트 코드를 Pico의 main.py로 저장하고 실행한다.",
];

const thonnyCheckCode = [
  "import sys",
  "import neopixel",
  "import dht",
  "",
  "print(sys.implementation)",
  "print('Pico 준비 완료')",
].join("\n");

function ThonnySetup({
  checked,
  onToggle,
  onCopy,
}: {
  checked: number[];
  onToggle: (index: number) => void;
  onCopy: () => void;
}) {
  const isComplete = checked.length === thonnySetupSteps.length;

  return (
    <section id="lesson-0" className="scroll-mt-24 overflow-hidden rounded-[28px] border border-indigo-200 bg-white shadow-[0_20px_60px_rgba(79,70,229,.12)]">
      <div className="grid gap-6 bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950 p-6 text-white sm:p-8 lg:grid-cols-[1.2fr_.8fr] lg:p-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-400 px-3 py-1 text-xs font-black text-indigo-950">0차시</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-cyan-200">수업 시작 전 필수 준비</span>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Thonny와 Pico 준비하기</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            웹앱에서 원리를 배우고 Wokwi에서 가상으로 확인한 뒤, Thonny로 코드를 실제 Pico에 저장해 실행합니다. 아래 준비를 한 번만 마치면 1~10차시에서 같은 순서로 실습할 수 있습니다.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {[
              ["웹앱", "개념·회로·평가"],
              ["Wokwi", "가상 회로 시험"],
              ["Thonny", "실제 Pico 실행"],
            ].map(([tool, role], index) => (
              <div key={tool} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-[10px] font-black tracking-[0.16em] text-cyan-300">STEP {index + 1}</p>
                <p className="mt-1 font-black text-white">{tool}</p>
                <p className="mt-1 text-xs text-slate-400">{role}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-cyan-300">준비 진행률</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-4xl font-black">{checked.length}<span className="text-lg text-slate-500">/{thonnySetupSteps.length}</span></p>
            <span className={"rounded-full px-3 py-1 text-xs font-black " + (isComplete ? "bg-emerald-400 text-emerald-950" : "bg-amber-300 text-amber-950")}>
              {isComplete ? "준비 완료" : "준비 중"}
            </span>
          </div>
          <Progress value={(checked.length / thonnySetupSteps.length) * 100} className="mt-4 h-2 bg-white/10 [&>div]:bg-cyan-400" />
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-xl bg-white text-slate-950 hover:bg-cyan-100">
              <a href="https://thonny.org/" target="_blank" rel="noreferrer"><Download className="mr-1.5 size-4" />Thonny 공식 다운로드</a>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <a href="https://www.raspberrypi.com/documentation/microcontrollers/micropython.html" target="_blank" rel="noreferrer">MicroPython 공식 안내 <ExternalLink className="ml-1.5 size-3.5" /></a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.05fr_.95fr] lg:p-8">
        <div>
          <SectionTitle icon={Usb} eyebrow="Setup Checklist" title="준비 체크리스트" description="선생님의 안내에 따라 한 단계씩 완료 표시하세요." />
          <div className="space-y-2.5">
            {thonnySetupSteps.map((step, index) => {
              const isChecked = checked.includes(index);
              return (
                <label key={step} className={"flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition " + (isChecked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50/70 hover:border-indigo-300")}>
                  <Checkbox checked={isChecked} onCheckedChange={() => onToggle(index)} className="mt-0.5 size-5" />
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-indigo-700 shadow-sm">{index + 1}</span>
                  <span className={"text-sm leading-6 " + (isChecked ? "font-medium text-emerald-900" : "text-slate-700")}>{step}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-[24px] border border-indigo-200 bg-indigo-50/70 p-5">
            <SectionTitle icon={Settings2} eyebrow="Interpreter" title="Thonny 설정" description="도구 → 옵션 → 인터프리터에서 아래처럼 선택합니다." />
            <dl className="space-y-3 text-sm">
              <div className="rounded-2xl bg-white p-4"><dt className="text-xs font-black text-indigo-600">인터프리터</dt><dd className="mt-1 font-black text-slate-950">MicroPython (Raspberry Pi Pico)</dd></div>
              <div className="rounded-2xl bg-white p-4"><dt className="text-xs font-black text-indigo-600">포트</dt><dd className="mt-1 font-black text-slate-950">자동으로 검색 또는 연결된 COM 포트</dd></div>
            </dl>
          </section>

          <section className="overflow-hidden rounded-[24px] border border-slate-800 bg-[#0b1220] text-white">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div><p className="font-mono text-xs font-bold text-cyan-300">Thonny Shell · 모듈 확인</p><p className="mt-1 text-xs text-slate-500">오류가 나면 임의로 설치하지 말고 선생님께 알립니다.</p></div>
              <Button size="sm" onClick={onCopy} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Clipboard className="mr-1.5 size-3.5" />확인 코드 복사</Button>
            </div>
            <pre className="overflow-auto p-5 font-mono text-[13px] leading-7 text-cyan-50"><code>{thonnyCheckCode}</code></pre>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p><strong>연결이 안 될 때:</strong> 충전 전용 케이블일 수 있습니다. 데이터 통신 USB 케이블과 다른 USB 포트를 먼저 확인하세요.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppSidebar({
  selected,
  completed,
  onSelect,
  onArduino,
  onCompare,
  onSetup,
}: {
  selected: number;
  completed: number[];
  onSelect: (id: number) => void;
  onArduino: () => void;
  onCompare: () => void;
  onSetup: () => void;
}) {
  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="border-b border-white/10 bg-slate-950 p-5 text-white">
        <button className="flex items-center gap-3 text-left" onClick={onArduino} aria-label="통합 학습경로 처음으로 이동">
          <div className="relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,.25)]">
            <Cpu className="size-6" />
            <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-slate-950 bg-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-cyan-300">SOFTWARE &amp; LIFE</p>
            <p className="text-lg font-black tracking-tight">ARDUINO → PICO</p>
          </div>
        </button>
      </SidebarHeader>
      <SidebarContent className="bg-slate-950 text-white">
        <SidebarGroup className="px-3 py-5">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold tracking-[0.15em] text-slate-500">
            통합 학습경로
          </SidebarGroupLabel>
          <div className="mt-2 grid gap-2">
            <button onClick={onArduino} className="flex w-full items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/15 px-3 py-3 text-left text-amber-100 transition hover:bg-amber-400/25">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-400 text-xs font-black text-slate-950">A</span>
              <span className="min-w-0"><span className="block text-[10px] font-bold text-amber-300">PART A · 6개 모듈</span><span className="block truncate text-sm font-black">Arduino·Tinkercad</span></span>
              <FlaskConical className="ml-auto size-4 text-amber-300" />
            </button>
            <button onClick={onCompare} className="flex w-full items-center gap-3 rounded-2xl border border-violet-400/30 bg-violet-400/15 px-3 py-3 text-left text-violet-100 transition hover:bg-violet-400/25">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-400 text-xs font-black text-slate-950">↔</span>
              <span className="min-w-0"><span className="block text-[10px] font-bold text-violet-300">PART B · BRIDGE</span><span className="block truncate text-sm font-black">Arduino·Pico 비교</span></span>
              <Code2 className="ml-auto size-4 text-violet-300" />
            </button>
          </div>
          <button onClick={onSetup} className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-indigo-400/30 bg-indigo-400/15 px-3 py-3 text-left text-indigo-100 transition hover:bg-indigo-400/25">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-400 text-sm font-black text-indigo-950">0</span>
            <span className="min-w-0"><span className="block text-[10px] font-bold text-indigo-300">PART C · 시작 전 필수</span><span className="block truncate text-sm font-black">Thonny와 Pico 준비</span></span>
            <Usb className="ml-auto size-4 text-indigo-300" />
          </button>
          <SidebarGroupLabel className="px-3 text-[11px] font-bold tracking-[0.15em] text-slate-500">
            10차시 실습 로드맵
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-2 gap-1.5">
              {lessons.map((lesson) => {
                const Icon = lesson.icon;
                const done = completed.includes(lesson.id);
                return (
                  <SidebarMenuItem key={lesson.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={selected === lesson.id}
                      className="h-auto rounded-xl p-0 text-slate-300 hover:bg-white/10 hover:text-white data-[active=true]:bg-cyan-400 data-[active=true]:text-slate-950"
                    >
                      <button className="flex w-full items-center gap-3 px-3 py-2.5 text-left" onClick={() => onSelect(lesson.id)}>
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-xs font-black">
                          {done ? <Check className="size-4" /> : lesson.id}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-bold opacity-60">{lesson.phase}</span>
                          <span className="block truncate text-sm font-bold">{lesson.title}</span>
                        </span>
                        <Icon className="size-4 shrink-0 opacity-60" />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 bg-slate-950 p-4 text-white">
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>나의 진도</span><span className="text-cyan-300">{completed.length}/10</span>
          </div>
          <Progress value={completed.length * 10} className="mt-2.5 h-1.5 bg-white/10 [&>div]:bg-cyan-400" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Home() {
  const lessonSectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [simCompleted, setSimCompleted] = useState<number[]>([]);
  const [setupSteps, setSetupSteps] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, number[]>>({});
  const [activeTab, setActiveTab] = useState("learn");
  const [quizChoice, setQuizChoice] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const [draft, setDraft] = useState(lessons[0].code);
  const [preview, setPreview] = useState("");
  const lesson = lessons[selected - 1];
  const wokwi = wokwiLessons[selected];
  const lessonSteps = checkedSteps[selected] ?? [];
  const quizIsCorrect = Number(quizChoice) === lesson.quiz.answer;
  const completedPercent = completed.length * 10;
  const nextIncomplete = useMemo(
    () => lessons.find((item) => !completed.includes(item.id))?.id ?? 10,
    [completed],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("pico-lab-progress");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        completed?: number[];
        simCompleted?: number[];
        setupSteps?: number[];
        checkedSteps?: Record<number, number[]>;
      };
      setCompleted(parsed.completed ?? []);
      setSimCompleted(parsed.simCompleted ?? []);
      setSetupSteps(parsed.setupSteps ?? []);
      setCheckedSteps(parsed.checkedSteps ?? {});
    } catch {
      window.localStorage.removeItem("pico-lab-progress");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("pico-lab-progress", JSON.stringify({ completed, simCompleted, setupSteps, checkedSteps }));
  }, [completed, simCompleted, setupSteps, checkedSteps]);

  useEffect(() => {
    setDraft(lesson.code);
    setQuizChoice("");
    setQuizChecked(false);
    setPreview("");
    setActiveTab("learn");
  }, [lesson.code]);

  const selectLesson = (id: number) => {
    setSelected(id);
    window.requestAnimationFrame(() => {
      lessonSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((current) => {
      const values = current[selected] ?? [];
      return {
        ...current,
        [selected]: values.includes(index)
          ? values.filter((value) => value !== index)
          : [...values, index],
      };
    });
  };

  const toggleSetupStep = (index: number) => {
    setSetupSteps((current) => current.includes(index)
      ? current.filter((value) => value !== index)
      : [...current, index].sort((a, b) => a - b));
  };

  const openSetup = () => {
    document.getElementById("lesson-0")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openArduino = () => {
    document.getElementById("course-roadmap")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openCompare = () => {
    document.getElementById("arduino-pico-compare")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const toggleLessonComplete = () => {
    const wasCompleted = completed.includes(selected);
    setCompleted((current) =>
      wasCompleted
        ? current.filter((id) => id !== selected)
        : [...current, selected].sort((a, b) => a - b),
    );
    toast.success(wasCompleted ? "완료 표시를 취소했습니다." : selected + "차시 학습을 완료했습니다.");
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(draft);
    toast.success("코드를 복사했습니다. Thonny에 붙여 넣고 Pico의 main.py로 저장하세요.");
  };

  const copySetupCode = async () => {
    await navigator.clipboard.writeText(thonnyCheckCode);
    toast.success("확인 코드를 복사했습니다. Thonny Shell에 붙여 넣으세요.");
  };

  const copyWokwiCode = async () => {
    await navigator.clipboard.writeText(wokwi.code);
    toast.success("Wokwi용 코드를 복사했습니다. main.py에 붙여 넣으세요.");
  };

  const toggleSimComplete = () => {
    const wasCompleted = simCompleted.includes(selected);
    setSimCompleted((current) =>
      wasCompleted
        ? current.filter((id) => id !== selected)
        : [...current, selected].sort((a, b) => a - b),
    );
    toast.success(wasCompleted ? "가상 실습 완료 표시를 취소했습니다." : "Wokwi 가상 실습을 완료했습니다.");
  };

  return (
    <SidebarProvider>
      <AppSidebar selected={selected} completed={completed} onSelect={selectLesson} onArduino={openArduino} onCompare={openCompare} onSetup={openSetup} />
      <SidebarInset className="min-w-0 bg-[#f5f7f8]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="size-9 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm" />
            <div>
              <p className="hidden text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 sm:block">
                2단원 · 소프트웨어로 만드는 생활
              </p>
              <p className="text-sm font-black text-slate-900">Arduino·Raspberry Pi Pico 통합 실습실</p>
            </div>
          </div>
          <button
            onClick={() => selectLesson(nextIncomplete)}
            className="flex items-center gap-2 rounded-full bg-slate-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <span className="size-2 rounded-full bg-cyan-400" /> 이어서 학습
          </button>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-7 sm:py-9">
          <ArduinoJourney />

          <ThonnySetup checked={setupSteps} onToggle={toggleSetupStep} onCopy={copySetupCode} />

          <div className="my-8 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="rounded-full bg-slate-200 px-4 py-1.5 text-xs font-black text-slate-600">이제 1~10차시 실습을 시작합니다</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <section id="pico-lesson-content" ref={lessonSectionRef} className="scroll-mt-20 overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,.14)]">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:p-10">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={"rounded-full px-3 py-1 text-xs font-extrabold ring-1 ring-inset " + phaseColors[lesson.phase]}>
                    {lesson.phase}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                    {lesson.id}차시 · {lesson.duration}
                  </span>
                </div>
                <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">{lesson.title}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{lesson.subtitle}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    onClick={toggleLessonComplete}
                    className={completed.includes(selected)
                      ? "rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                      : "rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"}
                  >
                    {completed.includes(selected)
                      ? <CheckCircle2 className="mr-1.5 size-4" />
                      : <Check className="mr-1.5 size-4" />}
                    {completed.includes(selected) ? "학습 완료됨" : "이 차시 완료 표시"}
                  </Button>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300">
                    Wokwi {simCompleted.includes(selected) ? "완료" : "대기"} · Thonny 실물 {lessonSteps.length}/{lesson.steps.length}
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="absolute -right-12 -top-12 size-40 rounded-full bg-cyan-400/15 blur-2xl" />
                <div className="relative">
                  <p className="text-xs font-extrabold tracking-[0.14em] text-cyan-300">TODAY&apos;S TARGET</p>
                  <ul className="mt-4 space-y-3">
                    {lesson.objectives.map((objective, index) => (
                      <li key={objective} className="flex gap-3 text-sm leading-6 text-slate-200">
                        <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-cyan-400/15 text-[10px] font-black text-cyan-300">
                          {index + 1}
                        </span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-white/10 bg-white/[0.03]">
              <div className="px-5 py-4 text-center"><p className="text-xl font-black text-cyan-300">{lesson.id}/10</p><p className="text-[10px] font-bold text-slate-500">현재 차시</p></div>
              <div className="border-x border-white/10 px-5 py-4 text-center"><p className="text-xl font-black text-white">{lesson.parts.length}</p><p className="text-[10px] font-bold text-slate-500">준비물</p></div>
              <div className="px-5 py-4 text-center"><p className="text-xl font-black text-white">{completedPercent}%</p><p className="text-[10px] font-bold text-slate-500">전체 진도</p></div>
            </div>
          </section>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p><strong>안전 확인:</strong> 배선을 바꿀 때는 USB 케이블을 먼저 분리하세요. 전원 핀과 GND를 확인한 뒤 짝과 서로 점검합니다.</p>
          </div>

          <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="차시 학습 순서">
            <div className="grid gap-2 sm:grid-cols-5">
              {[
                ["01", "개념", "원리 이해", "learn"],
                ["02", "Wokwi", "가상 시험", "wokwi"],
                ["03", "Thonny 실물", "Pico 실행", "practice"],
                ["04", "코드", "수정·실험", "code"],
                ["05", "평가", "설명·확인", "check"],
              ].map(([number, label, note, value]) => {
                const isActive = activeTab === value;
                return (
                <button key={number} type="button" aria-label={`${number} ${label} ${note}`} aria-pressed={isActive} onClick={() => setActiveTab(value)} className={"w-full rounded-2xl p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 " + (isActive ? "bg-cyan-400 text-slate-950 shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-950")}>
                  <div className="flex items-center gap-2">
                    <span className={"grid size-7 place-items-center rounded-full text-[10px] font-black " + (isActive ? "bg-slate-950 text-cyan-300" : "bg-white text-slate-500")}>{number}</span>
                    <p className="text-sm font-black">{label}</p>
                  </div>
                  <p className="mt-1 pl-9 text-[11px] font-bold opacity-65">{note}</p>
                </button>
              )})}
            </div>
          </section>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-7">
            <div className="overflow-x-auto pb-1 scrollbar-none">
              <TabsList variant="line" className="min-w-max gap-5 border-b border-slate-200 px-1">
                <TabsTrigger value="learn" className="px-1 pb-3 text-sm font-extrabold">개념 학습</TabsTrigger>
                <TabsTrigger value="wokwi" className="px-1 pb-3 text-sm font-extrabold">Wokwi 가상 실습</TabsTrigger>
                <TabsTrigger value="practice" className="px-1 pb-3 text-sm font-extrabold">Thonny로 실제 Pico 실행</TabsTrigger>
                <TabsTrigger value="code" className="px-1 pb-3 text-sm font-extrabold">코드 작성</TabsTrigger>
                <TabsTrigger value="check" className="px-1 pb-3 text-sm font-extrabold">평가</TabsTrigger>
                <TabsTrigger value="teacher" className="px-1 pb-3 text-sm font-extrabold">교사용 안내</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="learn" className="mt-6">
              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle icon={BookOpen} eyebrow="Concept" title="핵심 개념 네 가지" description="용어를 외우기보다 장치가 움직이는 흐름과 연결해 이해하세요." />
                <div className="grid gap-3 sm:grid-cols-2">
                  {lesson.concepts.map((item, index) => (
                    <article key={item.title} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-950">{item.title}</h3>
                        <span className="text-xs font-black text-slate-300">0{index + 1}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-cyan-50 p-5 ring-1 ring-inset ring-cyan-100">
                  <p className="flex items-center gap-2 text-sm font-black text-cyan-900"><Sparkles className="size-4" /> 생각 열기</p>
                  <p className="mt-2 text-sm leading-6 text-cyan-950/80">{lesson.challenge}</p>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="wokwi" className="mt-6 space-y-5">
              <section className="overflow-hidden rounded-[28px] border border-[#7237ff]/20 bg-[#171326] text-white shadow-[0_18px_55px_rgba(46,25,98,.16)]">
                <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.15fr_.85fr] lg:p-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#7c4dff] px-3 py-1 text-[11px] font-black tracking-[0.16em] text-white">WOKWI</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-violet-200">먼저 가상으로 시험</span>
                    </div>
                    <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">{lesson.id}차시 가상 회로를 먼저 실행하세요</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100/75">
                      사이트 안에서 회로·코드·확인 순서를 읽고, Wokwi는 새 창의 넓은 화면에서 실행합니다. 가상 실습이 성공한 뒤 같은 핀맵으로 배선하고 Thonny에서 실제 Pico를 실행하세요.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild className="rounded-xl bg-[#7c4dff] text-white hover:bg-[#6d3df1]">
                        <a href={wokwi.projectUrl} target="_blank" rel="noreferrer">
                          <MonitorPlay className="mr-1.5 size-4" /> Wokwi 전체 화면 열기 <ExternalLink className="ml-1.5 size-3.5" />
                        </a>
                      </Button>
                      <Button
                        onClick={toggleSimComplete}
                        variant="outline"
                        className={simCompleted.includes(selected)
                          ? "rounded-xl border-emerald-300/30 bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                          : "rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"}
                      >
                        <CheckCircle2 className="mr-1.5 size-4" />
                        {simCompleted.includes(selected) ? "가상 실습 완료됨" : "가상 실습 완료 표시"}
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-300">이번 차시의 변환</p>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="rounded-2xl bg-white/[0.06] p-4">
                        <p className="text-xs font-bold text-violet-300">Wokwi 가상 부품</p>
                        <p className="mt-1 font-black text-white">{wokwi.virtualPart}</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.06] p-4">
                        <p className="text-xs font-bold text-cyan-300">교실 실물 부품</p>
                        <p className="mt-1 font-black text-white">{wokwi.realPart}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-[.88fr_1.12fr]">
                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle icon={Cpu} eyebrow="Virtual Wiring" title="가상 회로 연결표" description="Wokwi 부품의 핀 이름을 기준으로 연결하세요." />
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#171326] text-white"><tr><th className="px-3 py-2.5 font-bold">가상 부품 핀</th><th className="px-3 py-2.5 font-bold">Pico 핀</th></tr></thead>
                      <tbody>
                        {wokwi.wiring.map((wire) => (
                          <tr key={wire.part + wire.pico} className="border-t border-slate-100 align-top">
                            <td className="px-3 py-3 font-bold text-slate-900">{wire.part}<span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{wire.note}</span></td>
                            <td className="px-3 py-3 font-mono font-bold text-violet-700">{wire.pico}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">가상 ↔ 실물 차이</p>
                    <p className="mt-2 text-sm leading-6 text-amber-950">{wokwi.substitute}</p>
                  </div>
                </section>

                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle icon={FlaskConical} eyebrow="Simulator Steps" title="Wokwi 따라 하기" description="새 창을 옆에 두고 1번부터 차례로 진행하세요." />
                  <div className="space-y-3">
                    {wokwi.steps.map((step, index) => (
                      <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-black text-violet-700">{index + 1}</span>
                        <p className="text-sm leading-6 text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl bg-cyan-50 p-4 ring-1 ring-inset ring-cyan-100">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-800">조작 미션</p>
                    <p className="mt-2 text-sm leading-6 text-cyan-950">{wokwi.interaction}</p>
                  </div>
                </section>
              </div>

              <section className="overflow-hidden rounded-[26px] border border-slate-800 bg-[#0b1220] shadow-[0_18px_55px_rgba(15,23,42,.16)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-violet-300">main.py · Wokwi MicroPython</p>
                    <p className="mt-1 text-xs text-slate-500">가상 부품에 맞춘 코드입니다. 실물용 코드는 ‘코드 작성’ 탭에서 확인하세요.</p>
                  </div>
                  <Button size="sm" onClick={copyWokwiCode} className="bg-[#7c4dff] text-white hover:bg-[#6d3df1]"><Clipboard className="mr-1.5 size-3.5" />Wokwi 코드 복사</Button>
                </div>
                <pre className="max-h-[480px] overflow-auto p-5 font-mono text-[13px] leading-7 text-cyan-50 sm:p-7"><code>{wokwi.code}</code></pre>
                <div className="border-t border-white/10 bg-emerald-400/10 p-5 text-sm leading-6 text-emerald-100">
                  <strong className="text-emerald-300">성공 기준:</strong> {wokwi.expected}
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
                  <p className="text-sm font-black text-violet-900">교사 운영 포인트</p>
                  <p className="mt-2 text-sm leading-6 text-violet-950/80">{wokwi.teacherTip}</p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <p className="text-sm font-black text-rose-900">공개 프로젝트 주의</p>
                  <p className="mt-2 text-sm leading-6 text-rose-950/80">Wokwi에 로그인해 저장한 무료 프로젝트는 공개될 수 있습니다. 프로젝트 이름·코드·메모에 학생 이름, 학교 계정, 연락처 같은 개인정보를 넣지 마세요.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="practice" className="mt-6 space-y-5">
              <section className="overflow-hidden rounded-[26px] border border-indigo-200 bg-gradient-to-r from-indigo-950 via-slate-950 to-cyan-950 text-white shadow-[0_18px_55px_rgba(30,41,59,.16)]">
                <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[.72fr_1.28fr] lg:p-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-400 px-3 py-1 text-[11px] font-black tracking-[0.14em] text-indigo-950">THONNY</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-cyan-200">실제 Pico 실행 단계</span>
                    </div>
                    <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">Wokwi 결과를 실제 장치로 옮기세요</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">가상 실습에 성공했더라도 실물에서는 전원·GND·핀 번호·부품 종류를 다시 확인해야 합니다. 배선 후 Thonny에서 코드를 Pico의 main.py로 저장합니다.</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-5">
                    {[
                      { icon: Usb, number: "1", title: "USB 분리", note: "안전하게 배선" },
                      { icon: Usb, number: "2", title: "Pico 연결", note: "데이터 케이블" },
                      { icon: Settings2, number: "3", title: "인터프리터", note: "MicroPython Pico" },
                      { icon: Save, number: "4", title: "main.py 저장", note: "Pico 장치 선택" },
                      { icon: Terminal, number: "5", title: "실행·확인", note: "Shell과 부품" },
                    ].map(({ icon: StepIcon, number, title, note }) => {
                      return (
                        <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                          <div className="flex items-center justify-between"><span className="text-[10px] font-black text-cyan-300">{number.padStart(2, "0")}</span><StepIcon className="size-4 text-indigo-300" /></div>
                          <p className="mt-3 text-xs font-black text-white">{title}</p>
                          <p className="mt-1 text-[10px] leading-4 text-slate-400">{note}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle icon={Cpu} eyebrow="Thonny Hardware" title="실물 준비물과 배선" description="USB를 분리한 상태에서 배선하고, 짝과 확인한 뒤 다시 연결하세요." />
                  <div className="flex flex-wrap gap-2">
                    {lesson.parts.map((part) => <span key={part} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{part}</span>)}
                  </div>
                  <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-white"><tr><th className="px-3 py-2.5 font-bold">부품 핀</th><th className="px-3 py-2.5 font-bold">Pico 핀</th></tr></thead>
                      <tbody>
                        {lesson.wiring.map((wire) => (
                          <tr key={wire.from + "-" + wire.to} className="border-t border-slate-100 align-top">
                            <td className="px-3 py-3 font-bold text-slate-900">{wire.from}<span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{wire.note}</span></td>
                            <td className="px-3 py-3 font-mono font-bold text-cyan-700">{wire.to}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle icon={FlaskConical} eyebrow="Thonny Practice" title="Thonny로 실제 Pico 실행" description="코드를 Pico의 main.py로 저장한 뒤 한 단계씩 실제 동작을 확인하세요." />
                  <div className="space-y-3">
                    {lesson.steps.map((step, index) => {
                      const checked = lessonSteps.includes(index);
                      return (
                        <label key={step} className={"flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition " + (checked ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50/60 hover:border-cyan-300")}>
                          <Checkbox checked={checked} onCheckedChange={() => toggleStep(index)} className="mt-0.5 size-5" />
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-slate-500 shadow-sm">{index + 1}</span>
                          <span className={"text-sm leading-6 " + (checked ? "font-medium text-emerald-900 line-through decoration-emerald-400" : "text-slate-700")}>{step}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              </div>
              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle icon={AlertTriangle} eyebrow="Debug" title="막혔을 때 확인" description="오류 메시지는 실패 표시가 아니라 원인을 알려 주는 단서입니다." />
                <div className="grid gap-3 lg:grid-cols-2">
                  {lesson.errors.map((error) => (
                    <div key={error.symptom} className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                      <p className="font-black text-rose-900">{error.symptom}</p>
                      <p className="mt-2 text-sm text-slate-600"><strong className="text-slate-900">가능한 원인:</strong> {error.cause}</p>
                      <p className="mt-1 text-sm text-slate-600"><strong className="text-slate-900">해결:</strong> {error.fix}</p>
                    </div>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="code" className="mt-6">
              <section className="overflow-hidden rounded-[26px] border border-slate-800 bg-[#0b1220] shadow-[0_18px_55px_rgba(15,23,42,.18)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-rose-400" /><span className="size-2.5 rounded-full bg-amber-300" /><span className="size-2.5 rounded-full bg-emerald-400" /></div>
                    <span className="font-mono text-xs font-bold text-slate-400">main.py · MicroPython</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setDraft(lesson.code); setPreview(""); }} className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"><RotateCcw className="mr-1.5 size-3.5" />초기화</Button>
                    <Button size="sm" onClick={copyCode} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Clipboard className="mr-1.5 size-3.5" />복사</Button>
                  </div>
                </div>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  spellCheck={false}
                  aria-label={lesson.id + "차시 MicroPython 코드 편집기"}
                  className="min-h-[390px] w-full resize-y bg-transparent px-5 py-5 font-mono text-[13px] leading-7 text-cyan-50 outline-none sm:px-7"
                />
                <div className="border-t border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs leading-5 text-slate-400">웹에서는 예상 결과를 확인하고, 실제 실행은 코드를 복사해 Thonny에서 Pico의 main.py로 저장하세요.</p>
                    <Button onClick={() => setPreview(lesson.expected)} className="rounded-xl bg-white text-slate-950 hover:bg-cyan-100"><Play className="mr-1.5 size-4" />실행 결과 미리 보기</Button>
                  </div>
                  {preview && <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 font-mono text-sm leading-6 text-emerald-200"><span className="mr-2 text-emerald-400">▶</span>{preview}</div>}
                </div>
              </section>
              <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                <p className="flex items-center gap-2 text-sm font-black text-violet-900"><Code2 className="size-4" /> 코드 바꾸기 미션</p>
                <p className="mt-2 text-sm leading-6 text-violet-950/80">{lesson.challenge}</p>
              </div>
            </TabsContent>

            <TabsContent value="check" className="mt-6">
              <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle icon={CheckCircle2} eyebrow="Formative Quiz" title="형성평가" description="정답을 고른 뒤 해설을 확인하세요." />
                  <p className="rounded-2xl bg-slate-950 p-5 text-base font-bold leading-7 text-white">Q. {lesson.quiz.question}</p>
                  <RadioGroup value={quizChoice} onValueChange={(value) => { setQuizChoice(value); setQuizChecked(false); }} className="mt-5 space-y-2">
                    {lesson.quiz.options.map((option, index) => (
                      <label key={option} className={"flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition " + (quizChoice === String(index) ? "border-cyan-400 bg-cyan-50 font-bold text-cyan-950" : "border-slate-200 hover:border-slate-300")}>
                        <RadioGroupItem value={String(index)} id={"q-" + selected + "-" + index} />
                        <span className="grid size-6 place-items-center rounded-full bg-white text-xs font-black text-slate-500 shadow-sm">{index + 1}</span>
                        {option}
                      </label>
                    ))}
                  </RadioGroup>
                  <Button disabled={quizChoice === ""} onClick={() => setQuizChecked(true)} className="mt-5 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800">정답 확인</Button>
                  {quizChecked && (
                    <div className={"mt-4 rounded-2xl p-4 text-sm leading-6 " + (quizIsCorrect ? "bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-950 ring-1 ring-rose-200")}>
                      <p className="font-black">{quizIsCorrect ? "정답입니다!" : "다시 생각해 보세요."}</p>
                      <p className="mt-1">{lesson.quiz.explanation}</p>
                    </div>
                  )}
                </section>
                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle icon={GraduationCap} eyebrow="Exam Link" title="시험형 연습" />
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-700">중간고사 연결</p>
                    <p className="mt-3 text-sm leading-7 text-amber-950">{lesson.exam}</p>
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-100 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">한 문장 정리</p>
                    <textarea className="mt-3 min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-cyan-400" placeholder="오늘 배운 핵심을 입력·처리·출력과 연결하여 한 문장으로 적으세요." />
                  </div>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="teacher" className="mt-6">
              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionTitle icon={GraduationCap} eyebrow="Teacher Guide" title={lesson.id + "차시 수업 운영 포인트"} description="교과서 개념과 실제 장치 경험을 연결하기 위한 진행 안내입니다." />
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl bg-slate-950 p-5 text-white">
                    <p className="text-xs font-black tracking-[0.14em] text-cyan-300">50분 운영</p>
                    <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                      <li><strong className="text-white">도입 5분</strong> · 완성 동작과 목표 확인</li>
                      <li><strong className="text-white">개념 8분</strong> · 입력·처리·출력과 연결</li>
                      <li><strong className="text-white">Wokwi 12분</strong> · 가상 배선 → 실행 → 값 조작</li>
                      <li><strong className="text-white">Thonny 실물 15분</strong> · 전원 분리 → 배선 → main.py 저장 → 실행 확인</li>
                      <li><strong className="text-white">정리 10분</strong> · 코드 수정 → 오류 공유 → 평가</li>
                    </ol>
                  </div>
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                    <p className="text-xs font-black tracking-[0.14em] text-cyan-800">교사 대본 핵심</p>
                    <p className="mt-4 text-sm leading-7 text-cyan-950">{lesson.teacher}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-black text-slate-900">관찰 체크</p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <p className="rounded-xl bg-slate-50 p-3">① 배선을 근거 있게 설명하는가?</p>
                    <p className="rounded-xl bg-slate-50 p-3">② 코드 결과를 예측하고 수정하는가?</p>
                    <p className="rounded-xl bg-slate-50 p-3">③ 오류 원인과 해결을 기록하는가?</p>
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>

          <nav className="mt-8 flex items-center justify-between gap-3" aria-label="차시 이동">
            <Button variant="outline" disabled={selected === 1} onClick={() => selectLesson(selected - 1)} className="rounded-xl bg-white"><ChevronLeft className="mr-1.5 size-4" />이전 차시</Button>
            <div className="hidden items-center gap-1 sm:flex">
              {lessons.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectLesson(item.id)}
                  aria-label={item.id + "차시로 이동"}
                  className={"h-2 rounded-full transition-all " + (selected === item.id ? "w-8 bg-cyan-500" : completed.includes(item.id) ? "w-2 bg-emerald-400" : "w-2 bg-slate-300")}
                />
              ))}
            </div>
            <Button disabled={selected === 10} onClick={() => selectLesson(selected + 1)} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">다음 차시<ChevronRight className="ml-1.5 size-4" /></Button>
          </nav>
        </main>
      </SidebarInset>
      <Toaster richColors position="top-center" />
    </SidebarProvider>
  );
}
