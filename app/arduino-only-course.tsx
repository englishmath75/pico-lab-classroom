"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, CircuitBoard, Clock3, Code2, Cpu, ExternalLink, FlaskConical, FunctionSquare, Lightbulb, RotateCcw, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { lessons, pinMap, type Activity } from "./arduino-only-data";

const errors = {
  "LED가 안 켜짐": ["LED 긴 다리와 짧은 다리 방향", "D3 연결", "저항 직렬 연결", "GND", "코드의 핀 번호", "시뮬레이션 시작"],
  "버튼이 안 됨": ["버튼이 중앙 홈을 가로지르는지", "D2와 GND", "INPUT_PULLUP", "누른 상태를 LOW로 판단했는지"],
  "가변저항이 안 됨": ["5V·GND 방향", "가운데/SIG 핀이 A0인지", "analogRead(A0)", "LED가 PWM D3인지", "출력이 0~255인지"],
};

export function ArduinoOnlyCourse({ onBack, onGoPico }: { onBack: () => void; onGoPico: () => void }) {
  const [lessonId, setLessonId] = useState(1);
  const [activityId, setActivityId] = useState(0);
  const [stage, setStage] = useState("circuit");
  const [completed, setCompleted] = useState<string[]>([]);
  const lesson = lessons[lessonId - 1];
  const activity = lesson.activities[activityId];
  const allCount = lessons.reduce((sum, item) => sum + item.activities.length, 0);
  const progress = Math.round(completed.length / allCount * 100);
  const key = `${lessonId}-${activityId}`;
  const next = useMemo(() => {
    for (const item of lessons) for (let i=0;i<item.activities.length;i++) if (!completed.includes(`${item.id}-${i}`)) return [item.id,i];
    return [3,0];
  }, [completed]);

  useEffect(() => {
    const raw = localStorage.getItem("arduino-3class-progress");
    if (!raw) return;
    try { setCompleted(JSON.parse(raw)); } catch { localStorage.removeItem("arduino-3class-progress"); }
  }, []);
  useEffect(() => { localStorage.setItem("arduino-3class-progress", JSON.stringify(completed)); }, [completed]);

  const choose = (l:number, a=0) => {
    setLessonId(l); setActivityId(a); setStage("circuit");
    requestAnimationFrame(() => document.getElementById("activity")?.scrollIntoView({behavior:"smooth",block:"start"}));
  };
  const finish = () => {
    const done=completed.includes(key);
    setCompleted((items)=>done?items.filter((x)=>x!==key):[...items,key]);
    toast.success(done?"완료 표시를 취소했습니다.":"교사 통과 기준을 완료했습니다.");
  };

  return <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <button onClick={onBack} className="flex items-center gap-3 text-left"><span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-amber-300"><ArrowLeft className="size-5"/></span><span><span className="block text-xs font-black tracking-wider text-amber-700">ARDUINO → PICO</span><span className="font-black">통합실습실로 돌아가기</span></span></button>
        <Button onClick={()=>choose(next[0],next[1])} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">이어서 학습 <ArrowRight className="ml-1 size-4"/></Button>
      </div>
    </header>

    <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-7">
      <section className="overflow-hidden rounded-[30px] bg-slate-950 text-white shadow-xl">
        <div className="grid gap-7 bg-[radial-gradient(circle_at_85%_5%,rgba(34,211,238,.2),transparent_32%)] p-6 sm:p-9 lg:grid-cols-[1.35fr_.65fr]">
          <div><p className="text-sm font-black tracking-[.15em] text-amber-300">3회 완성 · TINKERCAD → 실제 ARDUINO → PICO</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">빈 회로에서 직접 만들고<br/>실물에 그대로 옮깁니다</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">공통 핀을 고정하고 회로를 해체하지 않은 채 입력을 하나씩 추가합니다. 막히면 함수 → 코드 순서 → 교사용 정답의 세 단계 도움말을 사용합니다.</p><div className="mt-6 grid gap-2 sm:grid-cols-3">{["① 회로 지시","② 미션","③ 사용 함수 정리"].map(x=><div key={x} className="rounded-2xl border border-white/10 bg-white/[.06] p-4 text-center font-black text-cyan-100">{x}</div>)}</div></div>
          <div className="rounded-[24px] border border-white/10 bg-white/[.06] p-5"><div className="flex justify-between font-black"><span>전체 실습 진도</span><span className="text-amber-300">{completed.length}/{allCount}</span></div><Progress value={progress} className="mt-3 h-2 bg-white/10 [&>div]:bg-amber-400"/><div className="mt-5 rounded-2xl bg-rose-400/10 p-4 text-sm leading-6 text-rose-100"><ShieldCheck className="mb-2 size-5 text-rose-300"/>배선을 바꿀 때는 시뮬레이션을 멈추고 실제 Arduino의 USB를 분리합니다. 5V와 GND를 직접 연결하지 않습니다.</div></div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">{lessons.map((item)=><button key={item.id} onClick={()=>choose(item.id)} className={`rounded-[24px] border p-5 text-left transition ${lessonId===item.id?"border-amber-400 bg-amber-50 shadow-md":"border-slate-200 bg-white hover:border-amber-300"}`}><div className="flex items-center justify-between"><span className={`grid size-10 place-items-center rounded-xl font-black ${lessonId===item.id?"bg-slate-950 text-amber-300":"bg-slate-100"}`}>0{item.id}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black">{item.activities.length}개 실습</span></div><h2 className="mt-4 text-xl font-black">{item.title}</h2><p className="mt-2 leading-7 text-slate-600">{item.subtitle}</p></button>)}</section>

      <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex items-center gap-3"><Clock3 className="size-6 text-amber-600"/><div><p className="text-sm font-black text-amber-700">{lesson.id}차시 · 50분</p><h2 className="text-2xl font-black">오늘의 시간표</h2></div></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{lesson.timeline.map(([time,task])=><div key={time} className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-cyan-700">{time}</p><p className="mt-1 font-bold">{task}</p></div>)}</div>
        <p className="mt-4 rounded-xl bg-amber-50 p-4 font-bold text-amber-950"><strong>필수 통과:</strong> {lesson.required}</p>
      </section>

      <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-2xl font-black">수업 전체 공통 핀</h2><p className="mt-2 text-slate-600">Tinkercad와 실제 Arduino에서 끝까지 같은 번호를 사용합니다.</p><div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[620px] w-full text-left"><thead className="bg-slate-950 text-white"><tr><th className="p-4">부품</th><th className="p-4">고정 핀</th><th className="p-4">역할</th></tr></thead><tbody>{pinMap.map(row=><tr key={row[0]} className="border-t border-slate-100"><td className="p-4 font-bold">{row[0]}</td><td className="p-4 font-mono font-black text-amber-700">{row[1]}</td><td className="p-4">{row[2]}</td></tr>)}</tbody></table></div></section>

      <section id="activity" className="mt-6 scroll-mt-24 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-6 sm:p-8"><p className="text-sm font-black text-amber-700">{lessonId}차시 · 실습 {activityId+1}/{lesson.activities.length}</p><h2 className="mt-2 text-3xl font-black">{activity.title}</h2><p className="mt-2 text-lg text-slate-700">{activity.goal}</p><div className="mt-5 flex flex-wrap gap-2">{lesson.activities.map((item,i)=><button key={item.title} onClick={()=>choose(lessonId,i)} className={`rounded-xl px-4 py-2 font-black ${activityId===i?"bg-slate-950 text-white":"bg-white ring-1 ring-slate-200"}`}>{i+1}. {item.title.split(". ")[1]}</button>)}</div></div>
        <div className="grid gap-2 border-t border-slate-200 p-4 sm:grid-cols-3 sm:p-6">{[["circuit","회로 지시",CircuitBoard],["mission","미션",FlaskConical],["functions","사용 함수 정리",FunctionSquare]].map(([id,label,Icon])=><button key={String(id)} onClick={()=>setStage(String(id))} className={`flex items-center justify-center gap-2 rounded-2xl p-4 font-black ${stage===id?"bg-slate-950 text-white":"bg-slate-100 hover:bg-amber-50"}`}>{typeof Icon!=="string"&&<Icon className="size-5"/>}{String(label)}</button>)}</div>
      </section>

      <section className="mt-5">{stage==="circuit"&&<Circuit a={activity}/>} {stage==="mission"&&<Mission a={activity}/>} {stage==="functions"&&<Functions a={activity}/>}</section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><Button variant="outline" disabled={activityId===0} onClick={()=>choose(lessonId,activityId-1)}>이전 실습</Button><Button onClick={finish} className={completed.includes(key)?"bg-emerald-500 hover:bg-emerald-400":"bg-slate-950 hover:bg-slate-800"}>{completed.includes(key)&&<Check className="mr-2 size-4"/>}{completed.includes(key)?"통과 완료":"교사 통과 표시"}</Button>{activityId<lesson.activities.length-1?<Button onClick={()=>choose(lessonId,activityId+1)} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">다음 실습 <ArrowRight className="ml-1 size-4"/></Button>:lessonId<3?<Button onClick={()=>choose(lessonId+1)} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">다음 차시 <ArrowRight className="ml-1 size-4"/></Button>:<Button onClick={onGoPico} className="bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300">Pico로 이동 <ArrowRight className="ml-1 size-4"/></Button>}</div>

      <section className="mt-8 grid gap-5 lg:grid-cols-2"><Trouble/><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h2 className="text-2xl font-black">시험 핵심</h2><ul className="mt-4 space-y-3">{lesson.exam.map((x,i)=><li key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><span className="font-black text-amber-600">0{i+1}</span>{x}</li>)}</ul></article></section>

      <section className="mt-8 overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white sm:p-8"><p className="text-sm font-black tracking-[.15em] text-cyan-300">ARDUINO → PICO BRIDGE</p><h2 className="mt-2 text-3xl font-black">같은 원리, 같은 센서, MicroPython으로 다시</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{lesson.pico.map(x=><div key={x.title} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><h3 className="font-black text-amber-300">{x.title}</h3><p className="mt-2 leading-7 text-slate-300">{x.body}</p></div>)}</div>{lessonId===3&&<Button onClick={onGoPico} className="mt-6 bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300"><Cpu className="mr-2 size-5"/>Pico 준비·MicroPython 시작</Button>}</section>
    </main><Toaster richColors position="top-center"/>
  </div>;
}

function Circuit({a}:{a:Activity}) { return <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">Tinkercad 부품 선택</h3><div className="mt-4 flex flex-wrap gap-2">{a.parts.map(x=><span key={x} className="rounded-full bg-slate-100 px-3 py-2 font-bold">{x}</span>)}</div><Button asChild className="mt-5 bg-cyan-500 text-slate-950 hover:bg-cyan-400"><a href="https://www.tinkercad.com/dashboard" target="_blank" rel="noreferrer">빈 회로 만들기 <ExternalLink className="ml-2 size-4"/></a></Button><p className="mt-4 rounded-xl bg-rose-50 p-4 leading-7 text-rose-950"><AlertTriangle className="mb-2 size-5 text-rose-500"/>Tinkercad 성공 후 시뮬레이션을 멈춥니다. 실제 배선은 USB를 분리한 상태에서 같은 핀으로 옮깁니다.</p></article><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">회로 지시</h3><ol className="mt-4 space-y-3">{a.circuit.map((x,i)=><li key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-4 leading-7"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-400 font-black">{i+1}</span>{x}</li>)}</ol>{a.note&&<p className="mt-4 rounded-xl bg-cyan-50 p-4 leading-7 text-cyan-950"><strong>꼭 확인:</strong> {a.note}</p>}</article></div>; }

function Mission({a}:{a:Activity}) { return <article className="rounded-[26px] border border-amber-200 bg-amber-50 p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-amber-400"><Lightbulb className="size-6"/></span><div><p className="text-sm font-black text-amber-700">완성 코드를 열기 전에 두 번 시도</p><h3 className="text-2xl font-black">학생 미션</h3></div></div><ol className="mt-5 grid gap-3 lg:grid-cols-2">{a.mission.map((x,i)=><li key={x} className="flex gap-3 rounded-2xl bg-white p-5 text-lg font-bold leading-8"><span className="text-amber-600">0{i+1}</span>{x}</li>)}</ol><details className="mt-5 rounded-2xl bg-white p-5"><summary className="cursor-pointer font-black">도움말 1 · 사용할 함수</summary><div className="mt-4 flex flex-wrap gap-2">{a.functions.map(f=><code key={f.name} className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-cyan-800">{f.name}</code>)}</div></details><details className="mt-3 rounded-2xl bg-white p-5"><summary className="cursor-pointer font-black">도움말 2 · 코드 작성 순서와 뼈대</summary><ul className="mt-4 list-disc space-y-2 pl-5">{a.hint.map(x=><li key={x}>{x}</li>)}</ul><pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-5 font-mono text-sm leading-7 text-cyan-100"><code>{a.skeleton}</code></pre></details><details className="mt-3 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50 p-5"><summary className="cursor-pointer font-black text-rose-800">도움말 3 · 교사용 정답 코드</summary><p className="mt-3 text-sm font-bold text-rose-700">두 번 시도한 후 교사의 안내에 따라 확인합니다.</p><pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-5 font-mono text-sm leading-7 text-cyan-100"><code>{a.answer}</code></pre></details></article>; }

function Functions({a}:{a:Activity}) { return <article className="rounded-[26px] border border-slate-200 bg-white p-6 sm:p-8"><h3 className="text-2xl font-black">사용 함수 정리</h3><div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[620px] w-full text-left"><thead className="bg-slate-950 text-white"><tr><th className="p-4">함수·문장</th><th className="p-4">역할</th></tr></thead><tbody>{a.functions.map(f=><tr key={f.name} className="border-t border-slate-100"><td className="p-4 font-mono font-bold text-amber-700">{f.name}</td><td className="p-4">{f.meaning}</td></tr>)}</tbody></table></div><h4 className="mt-6 text-xl font-black">자가 점검</h4><div className="mt-3 grid gap-2 sm:grid-cols-2">{a.checks.map(x=><label key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><Checkbox/>{x}</label>)}</div><div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-emerald-950"><CheckCircle2 className="mb-2 size-6 text-emerald-500"/><strong>교사 통과 기준</strong><p className="mt-1 text-lg font-bold">{a.pass}</p></div></article>; }

function Trouble() { return <article className="rounded-[26px] border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><Wrench className="size-6 text-cyan-600"/><h2 className="text-2xl font-black">질문 전 자가 점검</h2></div><p className="mt-2 text-slate-600">위에서 아래 순서로 확인하고 해결되지 않을 때 질문합니다.</p><Tabs defaultValue="LED가 안 켜짐" className="mt-4"><TabsList className="h-auto flex-wrap">{Object.keys(errors).map(x=><TabsTrigger key={x} value={x}>{x}</TabsTrigger>)}</TabsList>{Object.entries(errors).map(([title,items])=><TabsContent key={title} value={title}><ol className="mt-4 space-y-2">{items.map((x,i)=><li key={x} className="flex gap-3 rounded-xl bg-slate-50 p-3"><span className="font-black text-amber-600">{i+1}</span>{x}</li>)}</ol></TabsContent>)}</Tabs></article>; }
