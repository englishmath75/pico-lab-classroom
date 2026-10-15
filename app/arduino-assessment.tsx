"use client";

import { ArrowLeft, BookOpen, CircuitBoard, PlayCircle, FileCode2, CheckCircle2 } from "lucide-react";

const steps = [
  { id: 1, name: "초음파센서와 부저", detail: "20cm 미만이면 부저가 울립니다.", components: "HC-SR04 · 부저", pins: "TRIG D7 · ECHO D8 · 부저 D2", url: "https://www.tinkercad.com/things/h4ANNRDybN4-newstep1/editel" },
  { id: 2, name: "조도·가변저항과 LED 2개", detail: "어두우면 빨강 LED, 가변저항으로 초록 LED 밝기 조절", components: "CDS · 가변저항 · 빨강/초록 LED", pins: "CDS A0 · 가변저항 A1 · 빨강 D9 · 초록 D10", url: "https://www.tinkercad.com/things/icXpmxWfLZp-newstep2led/editel" },
  { id: 3, name: "전체 통합 · 독립 제어", detail: "부저, 빨간 LED, 초록 LED가 서로 독립적으로 작동", components: "초음파 · CDS · 가변저항 · LED 2개 · 부저", pins: "D7/D8 · A0/A1 · D9/D10 · D2", url: "https://www.tinkercad.com/things/7DmFxG3ZbXv-newstep3/editel" },
];
export function ArduinoAssessment({ onBack }: { onBack: () => void }) {
  const base = import.meta.env.BASE_URL;
  const resources = [
    { label: "① 연습 문제지 보기", href: base + "a29/materials/exam-one-page.html", external: true },
    { label: "② 실습 영상 3편", href: "#videos", external: false },
    { label: "③ NEW Tinkercad 3단계", href: base + "a29/index.html", external: true },
    { label: "④ NEW 빈칸 코드", href: base + "downloads/arduino-assessment-starter.ino", external: false, download: true },
    { label: "⑤ 연습 정답·해설", href: base + "a29/materials/starter-answers.html", external: true },
  ];
  return <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <button onClick={onBack} className="flex items-center gap-2 font-black text-slate-800"><ArrowLeft className="size-5" /> 아두이노 교실로 돌아가기</button>
        <nav aria-label="수행평가 필수 자료" className="flex flex-wrap gap-2">
          {resources.map((item,index)=><a key={item.label} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} download={item.download} className={"inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-black transition " + (index===0?"bg-amber-400 text-slate-950":index===1?"bg-emerald-700 text-white":index===2?"bg-cyan-400 text-slate-950":index===3?"border border-slate-300 bg-white text-slate-900":"bg-violet-700 text-white")}>{item.label}</a>)}
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-[1280px] space-y-6 px-4 py-7 sm:px-7">
      <section className="overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-lg sm:p-10">
        <p className="text-sm font-black tracking-wider text-cyan-300">ARDUINO UNO R3 · NEW 3 STEP</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">아두이노 수행평가 · 새 실습</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-200">초음파센서 → 부저, 조도센서 → 빨간 LED, 가변저항 → 초록 LED. <strong className="text-white">세 출력은 서로 독립적</strong>입니다. 선생님 교사 계정의 NEW STEP 1~3 회로와 동일한 핀 번호를 사용합니다.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4"><b className="text-amber-200">거리 경보</b><p className="mt-1">20cm 미만 → 부저 D2 울림</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4"><b className="text-rose-200">조도 경보</b><p className="mt-1">CDS 값 400 미만 → 빨강 D9 켜짐</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4"><b className="text-emerald-200">밝기 조절</b><p className="mt-1">가변저항 → 초록 D10 PWM 0~255</p></div>
        </div>
      </section>
      <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 sm:p-7">
        <h2 className="text-xl font-black">처음부터 이 순서로 공부하세요</h2>
        <p className="mt-2 leading-8 text-slate-800">① 연습 문제지 확인 → ② 영상에서 기본 배선 방법 확인 → ③ 아래 NEW Tinkercad 회로 열기 → ④ 빈칸 코드 완성 → ⑤ 정답·해설 확인</p>
        <p className="mt-2 text-sm text-amber-950">기존 단일 LED 회로 및 예전 빈칸 코드는 사용하지 않습니다. 실제 시험의 평가 조건·배점은 선생님의 최종 안내를 따릅니다.</p>
      </section>
      <section aria-labelledby="new-steps" className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-7">
        <h2 id="new-steps" className="flex items-center gap-2 text-2xl font-black"><CircuitBoard className="size-6 text-cyan-700" /> NEW Tinkercad 회로 3개</h2>
        <p className="mt-2 text-sm text-slate-600">교사 계정에서 새로 제작·검수한 회로입니다. 반드시 아래 NEW 링크를 사용하세요.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {steps.map(s=><article key={s.id} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-black tracking-widest text-cyan-800">STEP {s.id}</p><h3 className="mt-2 text-lg font-black">{s.name}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-700">{s.detail}</p><p className="mt-3 text-xs text-slate-500">{s.components}</p><p className="mt-1 font-mono text-xs font-black text-slate-700">{s.pins}</p><a className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 font-bold text-white" href={s.url} target="_blank" rel="noopener noreferrer">NEW 회로 열기 ↗</a></article>)}
        </div>
        <a className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-100 px-4 py-3 font-black text-cyan-950" href={base+"a29/index.html"} target="_blank" rel="noopener noreferrer"><BookOpen className="size-5" />3단계 설명·동작 예측 열기</a>
      </section>
      <section id="videos" aria-labelledby="video-title" className="scroll-mt-44 rounded-[24px] border border-emerald-200 bg-white p-5 sm:scroll-mt-32 sm:p-7">
        <h2 id="video-title" className="flex items-center gap-2 text-2xl font-black"><PlayCircle className="size-6 text-emerald-700" /> 수행평가 실습 영상 3편</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">STEP 1 초음파, STEP 2 CDS·가변저항, STEP 3 통합 회로. 총 37분 54초입니다.</p>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"><strong>주의:</strong> 기존 영상은 단일 LED로 촬영됐습니다. 부품 배치·조작을 참고하되, NEW 회로의 빨간 LED D9·초록 LED D10 및 독립 동작을 최종 기준으로 하세요.</p>
        <iframe title="Arduino NEW 수행평가 실습 영상 3편" src={base+"learning-videos/index.html"} loading="lazy" allow="fullscreen; autoplay" allowFullScreen className="mt-4 h-[680px] w-full rounded-2xl border border-slate-200 bg-slate-950 sm:h-[760px]" />
      </section>
      <section id="code" className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-2xl font-black"><FileCode2 className="size-6 text-violet-700" /> NEW 통합 12개 빈칸 코드</h2><p className="mt-2 text-slate-700">복잡한 bool 변수와 긴 함수를 사용하지 않습니다. 검수한 코드의 <code>dist</code>, <code>cds</code>, <code>pot</code>, <code>led</code>를 그대로 사용합니다.</p><div className="mt-4 flex flex-wrap gap-3"><a className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white" href={base+"downloads/arduino-assessment-starter.ino"} download>NEW 학생용 코드 받기 ↓</a><a className="rounded-xl bg-violet-700 px-5 py-3 font-bold text-white" href={base+"a29/materials/starter-answers.html"} target="_blank" rel="noopener noreferrer">12개 정답·해설 보기 ↗</a></div>
      </section>
      <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 sm:p-7"><h2 className="flex items-center gap-2 text-xl font-black"><CheckCircle2 className="size-6 text-emerald-700" /> 스스로 최종 확인</h2><p className="mt-2 leading-8">초음파 앞의 물체를 가까이/멀리 바꾸어 부저를 확인합니다. CDS를 가려 빨간 LED를 켜거나 끄고, 가변저항을 돌려 초록 LED 밝기를 바꿉니다. 세 실험은 다른 출력에 영향을 주지 않아야 합니다.</p></section>
    </main>
  </div>;
}