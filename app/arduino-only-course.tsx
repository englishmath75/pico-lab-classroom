"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CircuitBoard, Cpu, FlaskConical, FunctionSquare, Lightbulb, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { arduinoBridgeLessons } from "./arduino-only-data";

type Stage = "circuit" | "mission" | "functions";

export function ArduinoOnlyCourse({ onBack, onGoPico }: { onBack: () => void; onGoPico: () => void }) {
  const [selected, setSelected] = useState(1);
  const [stage, setStage] = useState<Stage>("circuit");
  const [completed, setCompleted] = useState<number[]>([]);
  const lesson = arduinoBridgeLessons[selected - 1];
  const progress = Math.round((completed.length / arduinoBridgeLessons.length) * 100);
  const next = useMemo(() => arduinoBridgeLessons.find((item) => !completed.includes(item.id))?.id ?? 6, [completed]);

  useEffect(() => {
    const raw = window.localStorage.getItem("arduino-bridge-progress");
    if (!raw) return;
    try { setCompleted(JSON.parse(raw)); } catch { window.localStorage.removeItem("arduino-bridge-progress"); }
  }, []);
  useEffect(() => { window.localStorage.setItem("arduino-bridge-progress", JSON.stringify(completed)); }, [completed]);

  const choose = (id: number) => {
    setSelected(id); setStage("circuit");
    window.requestAnimationFrame(() => document.getElementById("arduino-step")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const finish = () => {
    const done = completed.includes(selected);
    setCompleted((items) => done ? items.filter((id) => id !== selected) : [...items, selected].sort((a, b) => a - b));
    toast.success(done ? "완료 표시를 취소했습니다." : `${selected}단계를 완료했습니다.`);
  };

  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <button onClick={onBack} className="flex items-center gap-3 text-left"><span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-amber-300"><ArrowLeft className="size-5" /></span><span><span className="block text-xs font-black tracking-wider text-amber-700">ARDUINO → PICO</span><span className="font-black">통합실습실로 돌아가기</span></span></button>
        <Button onClick={() => choose(next)} className="rounded-xl bg-amber-400 font-black text-slate-950 hover:bg-amber-300">이어서 학습 <ArrowRight className="ml-1 size-4" /></Button>
      </div>
    </header>

    <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-7">
      <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-xl">
        <div className="grid gap-8 bg-[radial-gradient(circle_at_85%_10%,rgba(34,211,238,.22),transparent_30%)] p-6 sm:p-10 lg:grid-cols-[1.35fr_.65fr]">
          <div><p className="text-sm font-black tracking-[.16em] text-amber-300">PART A · ARDUINO 입문 6단계</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">회로를 읽고, 미션을 해결하고,<br className="hidden sm:block" /> 함수로 원리를 정리합니다</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">완성 코드를 복사하지 않습니다. Tinkercad와 실제 Arduino에서 먼저 성공한 뒤 같은 센서를 Pico와 MicroPython으로 다시 구현합니다.</p><div className="mt-6 grid gap-2 sm:grid-cols-3">{["① 회로 지시", "② 미션", "③ 사용 함수 정리"].map((label) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.06] p-4 text-center font-black text-cyan-100">{label}</div>)}</div></div>
          <div className="rounded-[26px] border border-white/10 bg-white/[.06] p-5"><div className="flex items-center justify-between"><span className="font-black">진도</span><span className="text-xl font-black text-amber-300">{completed.length}/6</span></div><Progress value={progress} className="mt-3 h-2 bg-white/10 [&>div]:bg-amber-400" /><p className="mt-5 text-sm leading-6 text-slate-300">9월 말 시험 전까지 필요한 핵심만 압축했습니다. 한 단계의 성공이 다음 단계의 입력·처리·출력으로 이어집니다.</p></div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Arduino 6단계">
        {arduinoBridgeLessons.map((item) => <button key={item.id} onClick={() => choose(item.id)} className={`rounded-[24px] border p-5 text-left transition ${selected === item.id ? "border-amber-400 bg-amber-50 shadow-md" : "border-slate-200 bg-white hover:border-amber-300"}`}><div className="flex items-center justify-between"><span className={`grid size-10 place-items-center rounded-xl font-black ${selected === item.id ? "bg-slate-950 text-amber-300" : "bg-slate-100"}`}>0{item.id}</span>{completed.includes(item.id) && <CheckCircle2 className="size-5 text-emerald-500" />}</div><h2 className="mt-4 text-xl font-black">{item.title}</h2><p className="mt-2 text-base text-slate-600">{item.input} → {item.output}</p></button>)}
      </section>

      <section id="arduino-step" className="mt-7 scroll-mt-24 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-6 sm:p-8 lg:grid-cols-[1fr_330px]">
          <div><p className="text-sm font-black tracking-wider text-amber-700">ARDUINO STEP 0{lesson.id}</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">{lesson.title}</h2><p className="mt-3 text-lg leading-8 text-slate-700">{lesson.concept}</p></div>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1"><Info label="INPUT" value={lesson.input}/><Info label="PROCESS" value="판단·반복" tone="amber"/><Info label="OUTPUT" value={lesson.output} tone="dark"/></div>
        </div>
        <div className="grid gap-2 border-t border-slate-200 p-4 sm:grid-cols-3 sm:p-6">
          {([{id:"circuit",label:"1. 회로 지시",icon:CircuitBoard},{id:"mission",label:"2. 미션",icon:FlaskConical},{id:"functions",label:"3. 사용 함수 정리",icon:FunctionSquare}] as const).map(({id,label,icon:Icon}) => <button key={id} onClick={() => setStage(id)} className={`flex items-center justify-center gap-2 rounded-2xl p-4 font-black ${stage===id?"bg-slate-950 text-white":"bg-slate-100 text-slate-700 hover:bg-amber-50"}`}><Icon className="size-5" />{label}</button>)}
        </div>
      </section>

      <section className="mt-5">
        {stage === "circuit" && <CircuitStage lesson={lesson}/>}
        {stage === "mission" && <MissionStage lesson={lesson}/>}
        {stage === "functions" && <FunctionStage lesson={lesson}/>}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><Button variant="outline" disabled={selected===1} onClick={()=>choose(selected-1)}>이전 단계</Button><Button onClick={finish} className={completed.includes(selected)?"bg-emerald-500 hover:bg-emerald-400":"bg-slate-950 hover:bg-slate-800"}>{completed.includes(selected)&&<Check className="mr-2 size-4"/>}{completed.includes(selected)?"완료됨":"이 단계 완료"}</Button>{selected<6?<Button onClick={()=>choose(selected+1)} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">다음 단계 <ArrowRight className="ml-1 size-4"/></Button>:<Button onClick={onGoPico} className="bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300">Pico 확장 시작 <ArrowRight className="ml-1 size-4"/></Button>}</div>

      <section className="mt-9 overflow-hidden rounded-[30px] bg-slate-950 text-white"><div className="p-6 sm:p-9"><p className="text-sm font-black tracking-[.16em] text-cyan-300">PART B · SAME SENSOR, NEW LANGUAGE</p><h2 className="mt-3 text-3xl font-black">아두이노 6단계를 Pico에서 그대로 확장</h2><p className="mt-3 max-w-3xl text-lg leading-8 text-slate-300">동작 목표는 그대로 두고 보드 전압, 핀 번호, 언어 표현만 바꿉니다. 학생은 이미 아는 원리를 새 문법에 연결합니다.</p><div className="mt-6 grid gap-3 md:grid-cols-2">{arduinoBridgeLessons.map((item)=><div key={item.id} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-amber-400 font-black text-slate-950">{item.id}</span><div><p className="text-sm font-bold text-amber-300">{item.title}</p><h3 className="text-lg font-black">→ {item.picoTitle}</h3></div></div><p className="mt-3 text-base leading-7 text-slate-300">{item.picoMission}</p></div>)}</div><Button onClick={onGoPico} className="mt-7 bg-cyan-400 px-6 font-black text-slate-950 hover:bg-cyan-300"><Cpu className="mr-2 size-5"/>Pico 준비·MicroPython으로 이동</Button></div></section>
    </main><Toaster richColors position="top-center" />
  </div>;
}

function Info({label,value,tone="plain"}:{label:string;value:string;tone?:"plain"|"amber"|"dark"}) { return <div className={`rounded-2xl p-4 ${tone==="dark"?"bg-slate-950 text-white":tone==="amber"?"bg-amber-100":"bg-white ring-1 ring-slate-200"}`}><p className={`text-xs font-black ${tone==="dark"?"text-cyan-300":"text-slate-500"}`}>{label}</p><p className="mt-1 font-black">{value}</p></div>; }

function CircuitStage({lesson}:{lesson:(typeof arduinoBridgeLessons)[number]}) { return <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">준비 부품</h3><div className="mt-4 flex flex-wrap gap-2">{lesson.parts.map((part)=><span key={part} className="rounded-full bg-slate-100 px-3 py-2 font-bold text-slate-700">{part}</span>)}</div><div className="mt-5 rounded-2xl bg-rose-50 p-4 text-rose-950"><ShieldCheck className="mb-2 size-5 text-rose-500"/><strong>안전 확인</strong><p className="mt-1 leading-7">배선을 바꿀 때 USB를 분리하고, LED에는 반드시 전류 제한 저항을 연결합니다.</p></div></article><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">회로 지시</h3><ol className="mt-4 space-y-3">{lesson.circuit.map((text,i)=><li key={text} className="flex gap-3 rounded-2xl bg-slate-50 p-4 leading-7"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-400 font-black">{i+1}</span>{text}</li>)}</ol></article></div>; }

function MissionStage({lesson}:{lesson:(typeof arduinoBridgeLessons)[number]}) { return <article className="rounded-[26px] border border-amber-200 bg-amber-50 p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-amber-400"><Lightbulb className="size-6"/></span><div><p className="text-sm font-black text-amber-700">코드를 보지 않고 해결</p><h3 className="text-2xl font-black">학생 미션</h3></div></div><ol className="mt-6 grid gap-3 lg:grid-cols-2">{lesson.mission.map((text,i)=><li key={text} className="flex gap-3 rounded-2xl bg-white p-5 text-lg font-bold leading-8 ring-1 ring-amber-100"><span className="text-amber-600">0{i+1}</span>{text}</li>)}</ol><div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white"><p className="font-black text-cyan-300">교사 설명 핵심</p><p className="mt-2 leading-7 text-slate-200">{lesson.teacherPoint}</p></div></article>; }

function FunctionStage({lesson}:{lesson:(typeof arduinoBridgeLessons)[number]}) { return <article className="rounded-[26px] border border-slate-200 bg-white p-6 sm:p-8"><h3 className="text-2xl font-black">사용 함수 정리</h3><p className="mt-2 text-slate-600">Arduino에서 쓴 기능이 Pico에서는 어떤 표현으로 바뀌는지 함께 봅니다.</p><div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[720px] w-full text-left"><thead className="bg-slate-950 text-white"><tr><th className="p-4">Arduino C/C++</th><th className="p-4">역할</th><th className="p-4">Pico MicroPython</th></tr></thead><tbody>{lesson.functions.map((fn)=><tr key={fn.arduino} className="border-t border-slate-100"><td className="p-4 font-mono font-bold text-amber-700">{fn.arduino}</td><td className="p-4">{fn.meaning}</td><td className="p-4 font-mono font-bold text-cyan-700">{fn.pico}</td></tr>)}</tbody></table></div><div className="mt-5 grid gap-2 sm:grid-cols-3">{lesson.checks.map((text)=><label key={text} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 leading-7"><Checkbox className="mt-1"/>{text}</label>)}</div></article>; }
