"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, CircuitBoard, Clock3, ExternalLink, FlaskConical, FunctionSquare, GraduationCap, KeyRound, Lightbulb, LockKeyhole, Search, Settings, ShieldCheck, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { lessons, pinMap, type Activity } from "./arduino-only-data";
import { glossary, lessonConcepts, teacherGuides, textbookMeta } from "./arduino-textbook-data";

const errors = {
  "LED가 안 켜짐": ["LED 긴 다리와 짧은 다리 방향", "D3 연결", "저항 직렬 연결", "GND", "코드의 핀 번호", "시뮬레이션 시작"],
  "버튼이 안 됨": ["버튼이 중앙 홈을 가로지르는지", "D2와 GND", "INPUT_PULLUP", "누른 상태를 LOW로 판단했는지"],
  "가변저항이 안 됨": ["5V·GND 방향", "가운데/SIG 핀이 A0인지", "analogRead(A0)", "LED가 PWM D3인지", "출력이 0~255인지"],
};

const defaultPasswordHash = "158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab";

async function hashPassword(value:string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((byte)=>byte.toString(16).padStart(2,"0")).join("");
}

export function ArduinoOnlyCourse({ onBack, onGoPico, onGoPwm }: { onBack: () => void; onGoPico: () => void; onGoPwm: () => void }) {
  const [lessonId, setLessonId] = useState(1);
  const [activityId, setActivityId] = useState(0);
  const [stage, setStage] = useState("circuit");
  const [completed, setCompleted] = useState<string[]>([]);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [answerUnlocked, setAnswerUnlocked] = useState(false);
  const [bookMode, setBookMode] = useState<"student"|"teacher"|"glossary">("student");
  const [glossaryQuery, setGlossaryQuery] = useState("");
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

  const choose = (lessonNumber:number, a=0) => {
    setLessonId(lessonNumber); setActivityId(a); setStage("circuit"); setAnswerUnlocked(false); setPasswordOpen(false);
    requestAnimationFrame(() => document.getElementById("activity")?.scrollIntoView({behavior:"smooth",block:"start"}));
  };
  const unlockAnswer = () => {
    setAnswerUnlocked(true);
    setPasswordOpen(false);
    setCompleted((items)=>items.includes(key)?items:[...items,key]);
    toast.success("비밀번호가 확인되어 정답 코드를 열었습니다.");
  };

  return <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <button onClick={onBack} className="flex items-center gap-3 text-left"><span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-amber-300"><ArrowLeft className="size-5"/></span><span><span className="block text-xs font-black tracking-wider text-amber-700">ARDUINO → PICO</span><span className="font-black">통합실습실로 돌아가기</span></span></button>
        <div className="flex gap-2"><Button onClick={onGoPwm} className="bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300">PWM 집중학습</Button><Button onClick={()=>choose(next[0],next[1])} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">이어서 학습 <ArrowRight className="ml-1 size-4"/></Button></div>
      </div>
    </header>

    <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-7">
      <section className="overflow-hidden rounded-[30px] bg-slate-950 text-white shadow-xl">
        <div className="grid gap-7 bg-[radial-gradient(circle_at_85%_5%,rgba(34,211,238,.2),transparent_32%)] p-6 sm:p-9 lg:grid-cols-[1.35fr_.65fr]">
          <div><p className="text-sm font-black tracking-[.15em] text-amber-300">{textbookMeta.edition} · 3회 완성</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{textbookMeta.title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{textbookMeta.principle}. Tinkercad에서 확인한 뒤 실제 Arduino에 같은 회로를 만듭니다.</p><div className="mt-6 grid gap-2 sm:grid-cols-3">{["① 개념 이해","② 회로·미션","③ 설명·점검"].map(x=><div key={x} className="rounded-2xl border border-white/10 bg-white/[.06] p-4 text-center font-black text-cyan-100">{x}</div>)}</div></div>
          <div className="rounded-[24px] border border-white/10 bg-white/[.06] p-5"><div className="flex justify-between font-black"><span>전체 실습 진도</span><span className="text-amber-300">{completed.length}/{allCount}</span></div><Progress value={progress} className="mt-3 h-2 bg-white/10 [&>div]:bg-amber-400"/><div className="mt-5 rounded-2xl bg-rose-400/10 p-4 text-sm leading-6 text-rose-100"><ShieldCheck className="mb-2 size-5 text-rose-300"/>배선을 바꿀 때는 시뮬레이션을 멈추고 실제 Arduino의 USB를 분리합니다. 5V와 GND를 직접 연결하지 않습니다.</div></div>
        </div>
      </section>

      <nav className="mt-6 grid gap-2 rounded-[22px] border border-slate-200 bg-white p-2 sm:grid-cols-3" aria-label="교재 모드">
        {([["student","학생용 교재",BookOpen],["teacher","교사용 지도서",GraduationCap],["glossary","용어사전",Search]] as const).map(([id,label,Icon])=><button key={id} onClick={()=>setBookMode(id)} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-4 font-black ${bookMode===id?"bg-slate-950 text-white":"hover:bg-slate-100"}`}><Icon className="size-5"/>{label}</button>)}
      </nav>

      {bookMode==="glossary"?<Glossary query={glossaryQuery} setQuery={setGlossaryQuery}/>:bookMode==="teacher"?<TeacherMode lessonId={lessonId} unlocked={answerUnlocked} openPassword={()=>setPasswordOpen(true)}/>:<>

      <Concepts lessonId={lessonId}/>

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

      <section className="mt-5">{stage==="circuit"&&<Circuit a={activity}/>} {stage==="mission"&&<Mission a={activity} answerUnlocked={answerUnlocked}/>} {stage==="functions"&&<Functions a={activity}/>}</section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><Button variant="outline" disabled={activityId===0} onClick={()=>choose(lessonId,activityId-1)}>이전 실습</Button><Button onClick={()=>setPasswordOpen(true)} className={answerUnlocked?"bg-emerald-500 hover:bg-emerald-400":"bg-slate-950 hover:bg-slate-800"}>{answerUnlocked?<Check className="mr-2 size-4"/>:<KeyRound className="mr-2 size-4"/>}{answerUnlocked?"정답 코드 열림":"비밀번호 입력"}</Button>{activityId<lesson.activities.length-1?<Button onClick={()=>choose(lessonId,activityId+1)} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">다음 실습 <ArrowRight className="ml-1 size-4"/></Button>:lessonId<3?<Button onClick={()=>choose(lessonId+1)} className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">다음 차시 <ArrowRight className="ml-1 size-4"/></Button>:<Button onClick={onGoPico} className="bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300">Pico로 이동 <ArrowRight className="ml-1 size-4"/></Button>}</div>

      <section className="mt-8 grid gap-5 lg:grid-cols-2"><Trouble/><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h2 className="text-2xl font-black">시험 핵심</h2><ul className="mt-4 space-y-3">{lesson.exam.map((x,i)=><li key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><span className="font-black text-amber-600">0{i+1}</span>{x}</li>)}</ul></article></section>

      </>}
    </main>{passwordOpen&&<PasswordPanel onClose={()=>setPasswordOpen(false)} onSuccess={unlockAnswer}/>}<Toaster richColors position="top-center"/>
  </div>;
}

function Concepts({lessonId}:{lessonId:number}) { return <section className="mt-6 rounded-[26px] border border-cyan-200 bg-cyan-50/50 p-5 sm:p-7"><div className="flex items-center gap-3"><BookOpen className="size-6 text-cyan-700"/><div><p className="text-sm font-black text-cyan-700">실습 전에 먼저 읽기</p><h2 className="text-2xl font-black">{lessonId}차시 핵심 개념</h2></div></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{lessonConcepts[lessonId].map(c=><article key={c.term} className="rounded-2xl border border-cyan-100 bg-white p-5"><h3 className="text-xl font-black text-slate-950">{c.term}</h3><p className="mt-3 leading-7 text-slate-700">{c.plain}</p><p className="mt-3 rounded-xl bg-amber-50 p-4 leading-7 text-amber-950"><strong>생활 비유:</strong> {c.analogy}</p><p className="mt-3 font-black text-cyan-800">한 줄 기억: {c.remember}</p></article>)}</div></section>; }

function TeacherMode({lessonId,unlocked,openPassword}:{lessonId:number;unlocked:boolean;openPassword:()=>void}) { const g=teacherGuides[lessonId]; if(!unlocked) return <section className="mt-6 rounded-[26px] border-2 border-dashed border-slate-300 bg-white p-8 text-center"><LockKeyhole className="mx-auto size-10 text-slate-500"/><h2 className="mt-4 text-2xl font-black">교사용 지도서 잠김</h2><p className="mt-2 text-slate-600">정답 코드와 수업 운영 정보는 교사 비밀번호 확인 후 표시됩니다.</p><Button onClick={openPassword} className="mt-5 bg-slate-950"><KeyRound className="mr-2 size-4"/>비밀번호 입력</Button></section>; return <section className="mt-6 space-y-5"><article className="rounded-[26px] bg-slate-950 p-6 text-white sm:p-8"><p className="text-sm font-black text-amber-300">TEACHER GUIDE · {lessonId}차시</p><h2 className="mt-2 text-3xl font-black">수업 운영 지도서</h2><h3 className="mt-6 font-black text-cyan-300">학습 목표</h3><ul className="mt-3 grid gap-2 sm:grid-cols-2">{g.objective.map(x=><li key={x} className="rounded-xl bg-white/10 p-4">{x}</li>)}</ul></article><div className="grid gap-5 lg:grid-cols-2"><GuideCard title="도입 발문·설명" items={[g.opening]}/><GuideCard title="칠판 판서" items={g.board}/><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">예상 질문과 답변</h3><div className="mt-4 space-y-3">{g.questions.map(x=><div key={x.q} className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-amber-800">Q. {x.q}</p><p className="mt-2 leading-7">A. {x.a}</p></div>)}</div></article><GuideCard title="교사 관찰 체크" items={g.observe}/><GuideCard title="마무리 출구표" items={g.exitTicket}/><GuideCard title="수업 운영 원칙" items={["30명이 동시에 막히면 전체를 멈추지 않고 전원→배선→핀→코드 점검표를 먼저 사용합니다.","필수 통과 실습을 먼저 끝낸 학생은 시간 변경·기준값 변경 미션으로 확장합니다.","완성 여부보다 학생이 입력→처리→출력을 말로 설명하는지를 확인합니다."]}/></div></section>; }

function GuideCard({title,items}:{title:string;items:string[]}) { return <article className="rounded-[26px] border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">{title}</h3><ul className="mt-4 space-y-3">{items.map((x,i)=><li key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-4 leading-7"><span className="font-black text-cyan-700">{i+1}</span>{x}</li>)}</ul></article>; }

function Glossary({query,setQuery}:{query:string;setQuery:(v:string)=>void}) { const q=query.trim().toLowerCase(); const rows=glossary.filter(x=>!q||`${x.term} ${x.korean} ${x.meaning}`.toLowerCase().includes(q)); return <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black text-cyan-700">ARDUINO DICTIONARY</p><h2 className="text-3xl font-black">그림 없이도 이해하는 용어사전</h2><p className="mt-2 text-slate-600">영어 용어·우리말·생활 비유·코드 예를 함께 찾습니다.</p></div><label className="relative block sm:w-80"><Search className="absolute left-4 top-3.5 size-5 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4" placeholder="예: PWM, 전압, 반복"/></label></div><div className="mt-6 grid gap-4 lg:grid-cols-2">{rows.map(x=><article key={x.term} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-mono text-xl font-black text-cyan-800">{x.term}</h3><p className="font-black">{x.korean}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black">{x.lesson}차시</span></div><p className="mt-3 leading-7">{x.meaning}</p><p className="mt-3 rounded-xl bg-slate-50 p-3"><strong>비유:</strong> {x.analogy}</p><code className="mt-3 block overflow-auto rounded-xl bg-slate-950 p-3 font-sans font-bold text-cyan-100">{x.example}</code></article>)}</div>{rows.length===0&&<p className="mt-8 rounded-2xl bg-slate-50 p-8 text-center font-bold text-slate-500">검색 결과가 없습니다.</p>}</section>; }

function Circuit({a}:{a:Activity}) { return <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">Tinkercad 부품 선택</h3><div className="mt-4 flex flex-wrap gap-2">{a.parts.map(x=><span key={x} className="rounded-full bg-slate-100 px-3 py-2 font-bold">{x}</span>)}</div><Button asChild className="mt-5 bg-cyan-500 text-slate-950 hover:bg-cyan-400"><a href="https://www.tinkercad.com/dashboard" target="_blank" rel="noreferrer">빈 회로 만들기 <ExternalLink className="ml-2 size-4"/></a></Button><p className="mt-4 rounded-xl bg-rose-50 p-4 leading-7 text-rose-950"><AlertTriangle className="mb-2 size-5 text-rose-500"/>Tinkercad 성공 후 시뮬레이션을 멈춥니다. 실제 배선은 USB를 분리한 상태에서 같은 핀으로 옮깁니다.</p></article><article className="rounded-[26px] border border-slate-200 bg-white p-6"><h3 className="text-xl font-black">회로 지시</h3><ol className="mt-4 space-y-3">{a.circuit.map((x,i)=><li key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-4 leading-7"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-400 font-black">{i+1}</span>{x}</li>)}</ol>{a.note&&<p className="mt-4 rounded-xl bg-cyan-50 p-4 leading-7 text-cyan-950"><strong>꼭 확인:</strong> {a.note}</p>}</article></div>; }

function Mission({a,answerUnlocked}:{a:Activity;answerUnlocked:boolean}) { return <article className="rounded-[26px] border border-amber-200 bg-amber-50 p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-amber-400"><Lightbulb className="size-6"/></span><div><p className="text-sm font-black text-amber-700">완성 코드를 열기 전에 두 번 시도</p><h3 className="text-2xl font-black">학생 미션</h3></div></div><ol className="mt-5 grid gap-3 lg:grid-cols-2">{a.mission.map((x,i)=><li key={x} className="flex gap-4 rounded-2xl bg-white p-5 text-lg font-bold leading-8"><span className="shrink-0 rounded-lg bg-amber-100 px-2.5 py-0.5 font-sans font-black text-amber-700">{i+1}</span><span>{x}</span></li>)}</ol><details className="mt-5 rounded-2xl bg-white p-5"><summary className="cursor-pointer font-black">도움말 1 · 사용할 함수</summary><div className="mt-4 flex flex-wrap gap-2">{a.functions.map(f=><code key={f.name} className="rounded-lg bg-slate-100 px-3 py-2 font-sans text-base font-black tracking-wide text-cyan-900">{f.name}</code>)}</div></details><details className="mt-3 rounded-2xl bg-white p-5"><summary className="cursor-pointer font-black">도움말 2 · 코드 작성 순서와 뼈대</summary><ul className="mt-4 list-disc space-y-2 pl-5">{a.hint.map(x=><li key={x}>{x}</li>)}</ul><pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-5 font-sans text-base font-semibold leading-8 tracking-wide text-cyan-50"><code>{a.skeleton}</code></pre></details>{answerUnlocked?<details open className="mt-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5"><summary className="cursor-pointer font-black text-emerald-900">도움말 3 · 정답 코드</summary><pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-5 font-sans text-base font-semibold leading-8 tracking-wide text-cyan-50"><code>{a.answer}</code></pre></details>:<div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 p-5 text-slate-700"><LockKeyhole className="size-6 shrink-0"/><div><p className="font-black">도움말 3 · 정답 코드 잠김</p><p className="mt-1 text-sm">아래 ‘비밀번호 입력’ 버튼에서 교사 비밀번호를 확인해야 표시됩니다.</p></div></div>}</article>; }

function Functions({a}:{a:Activity}) { return <article className="rounded-[26px] border border-slate-200 bg-white p-6 sm:p-8"><h3 className="text-2xl font-black">사용 함수 정리</h3><div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[620px] w-full text-left"><thead className="bg-slate-950 text-white"><tr><th className="p-4">함수·문장</th><th className="p-4">역할</th></tr></thead><tbody>{a.functions.map(f=><tr key={f.name} className="border-t border-slate-100"><td className="p-4 font-sans text-base font-black tracking-wide text-amber-800">{f.name}</td><td className="p-4 text-base font-medium">{f.meaning}</td></tr>)}</tbody></table></div><h4 className="mt-6 text-xl font-black">자가 점검</h4><div className="mt-3 grid gap-2 sm:grid-cols-2">{a.checks.map(x=><label key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><Checkbox/>{x}</label>)}</div><div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-emerald-950"><CheckCircle2 className="mb-2 size-6 text-emerald-500"/><strong>교사 통과 기준</strong><p className="mt-1 text-lg font-bold">{a.pass}</p></div></article>; }

function PasswordPanel({onClose,onSuccess}:{onClose:()=>void;onSuccess:()=>void}) {
  const [password,setPassword]=useState("");
  const [adminOpen,setAdminOpen]=useState(false);
  const [current,setCurrent]=useState("");
  const [next,setNext]=useState("");
  const [confirm,setConfirm]=useState("");
  const [message,setMessage]=useState("");
  const savedHash=()=>localStorage.getItem("arduino-teacher-password")||defaultPasswordHash;

  const unlock=async()=>{
    if(await hashPassword(password)===savedHash()){ onSuccess(); return; }
    setMessage("비밀번호가 맞지 않습니다.");
  };
  const changePassword=async()=>{
    if(await hashPassword(current)!==savedHash()){ setMessage("현재 비밀번호가 맞지 않습니다."); return; }
    if(next.length<4){ setMessage("새 비밀번호는 4자 이상으로 설정하세요."); return; }
    if(next!==confirm){ setMessage("새 비밀번호 확인이 일치하지 않습니다."); return; }
    localStorage.setItem("arduino-teacher-password",await hashPassword(next));
    setCurrent(""); setNext(""); setConfirm(""); setAdminOpen(false); setMessage("이 기기의 교사 비밀번호가 변경되었습니다.");
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4" role="dialog" aria-modal="true" aria-label="교사 비밀번호 입력">
    <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-[26px] bg-white p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-amber-300"><KeyRound className="size-5"/></span><div><p className="text-sm font-black text-amber-700">TEACHER PASSWORD</p><h2 className="text-2xl font-black">비밀번호 입력</h2></div></div><button onClick={onClose} className="grid size-10 place-items-center rounded-xl bg-slate-100" aria-label="닫기"><X className="size-5"/></button></div>
      <p className="mt-5 leading-7 text-slate-600">교사가 알려준 비밀번호를 입력하면 현재 실습의 ‘도움말 3 · 정답 코드’가 표시됩니다.</p>
      <label className="mt-5 block font-black">비밀번호<input type="password" value={password} onChange={(e)=>{setPassword(e.target.value);setMessage("");}} onKeyDown={(e)=>e.key==="Enter"&&unlock()} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-lg outline-none focus:border-amber-500" placeholder="비밀번호 입력" autoFocus/></label>
      <Button onClick={unlock} className="mt-3 w-full bg-slate-950 font-black hover:bg-slate-800"><LockKeyhole className="mr-2 size-4"/>정답 코드 열기</Button>
      {message&&<p className="mt-3 rounded-xl bg-amber-50 p-3 text-center font-bold text-amber-900">{message}</p>}
      <button onClick={()=>{setAdminOpen(!adminOpen);setMessage("");}} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 p-3 font-black text-slate-700"><Settings className="size-4"/>비밀번호 설정 · 관리자 모드</button>
      {adminOpen&&<div className="mt-3 rounded-2xl bg-slate-100 p-5"><p className="font-black">교사 비밀번호 변경</p><div className="mt-3 space-y-3"><input type="password" value={current} onChange={(e)=>setCurrent(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-4" placeholder="현재 비밀번호"/><input type="password" value={next} onChange={(e)=>setNext(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-4" placeholder="새 비밀번호(4자 이상)"/><input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-4" placeholder="새 비밀번호 확인"/><Button onClick={changePassword} className="w-full bg-amber-400 font-black text-slate-950 hover:bg-amber-300">비밀번호 저장</Button></div><p className="mt-3 text-sm leading-6 text-slate-500">GitHub Pages 방식이므로 변경한 비밀번호는 현재 브라우저에 저장됩니다.</p></div>}
    </div>
  </div>;
}

function Trouble() { return <article className="rounded-[26px] border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><Wrench className="size-6 text-cyan-600"/><h2 className="text-2xl font-black">질문 전 자가 점검</h2></div><p className="mt-2 text-slate-600">위에서 아래 순서로 확인하고 해결되지 않을 때 질문합니다.</p><Tabs defaultValue="LED가 안 켜짐" className="mt-4"><TabsList className="h-auto flex-wrap">{Object.keys(errors).map(x=><TabsTrigger key={x} value={x}>{x}</TabsTrigger>)}</TabsList>{Object.entries(errors).map(([title,items])=><TabsContent key={title} value={title}><ol className="mt-4 space-y-2">{items.map((x,i)=><li key={x} className="flex gap-3 rounded-xl bg-slate-50 p-3"><span className="font-black text-amber-600">{i+1}</span>{x}</li>)}</ol></TabsContent>)}</Tabs></article>; }
