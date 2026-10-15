"use client";

import { ArrowLeft, BookOpen, CircuitBoard, PlayCircle, FileCode2, CheckCircle2, ShieldCheck } from "lucide-react";
import { assessmentRubric } from "./arduino-assessment-rubric";

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
    { label: "③ Tinkercad 3단계", href: base + "a29/index.html", external: true },
    { label: "④ 빈칸 코드 받기", href: base + "downloads/arduino-assessment-starter.ino", external: false, download: true },
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
        <p className="text-sm font-black tracking-wider text-cyan-300">ARDUINO UNO R3 · 3-STEP PRACTICE</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">아두이노 수행평가 실습</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-200">초음파센서 → 부저, 조도센서 → 빨간 LED, 가변저항 → 초록 LED. <strong className="text-white">세 출력은 서로 독립적</strong>입니다. 3단계 실습에서 같은 핀 번호를 사용하며 입력·처리·출력의 흐름을 익힙니다.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4"><b className="text-amber-200">거리 경보</b><p className="mt-1">20cm 미만 → 부저 D2 울림</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4"><b className="text-rose-200">조도 경보</b><p className="mt-1">CDS 값 400 미만 → 빨강 D9 켜짐</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4"><b className="text-emerald-200">밝기 조절</b><p className="mt-1">가변저항 → 초록 D10 PWM 0~255</p></div>
        </div>
        <div className="mt-7 border-t border-white/15 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-white">수행평가 반영 점수</h2>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">총 100점</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {assessmentRubric.scoreGroups.map((g) => (
              <div key={g.name} className="rounded-2xl border border-white/25 bg-white/10 p-4">
                <p className="text-sm font-bold text-slate-200">{g.name}</p>
                <p className="mt-2 text-3xl font-black">{g.score}<span className="ml-1 text-base font-bold text-slate-300">점</span></p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm leading-6 text-slate-300">실습활동 20점의 세부 판정기준: 6개 영역 · 32개 항목 · 83개 세부기준</p>
            <a href="#rubric" className="inline-flex min-h-11 items-center rounded-xl border border-cyan-300 px-4 py-2 text-sm font-black text-cyan-200 hover:bg-white/10">0.2점 세부 채점기준 보기 ↓</a>
          </div>
        </div>
      </section>
      <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 sm:p-7">
        <h2 className="text-xl font-black">이 순서로 공부하세요</h2>
        <p className="mt-2 leading-8 text-slate-800">① 연습 문제지 확인 → ② 영상에서 기본 배선 방법 확인 → ③ Tinkercad 실습 회로 열기 → ④ 빈칸 코드 완성 → ⑤ 정답·해설 확인</p>
        <p className="mt-2 text-sm text-amber-950">회로를 열어 부품과 핀 연결을 확인한 뒤, 값을 바꾸며 동작을 직접 비교해 보세요.</p>
      </section>
      <section aria-labelledby="practice-steps" className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-7">
        <h2 id="practice-steps" className="flex items-center gap-2 text-2xl font-black"><CircuitBoard className="size-6 text-cyan-700" /> Tinkercad 실습 회로 3개</h2>
        <p className="mt-2 text-sm text-slate-600">STEP 1부터 차례로 회로를 열고 배선과 코드를 살펴본 뒤 시뮬레이션해 보세요.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {steps.map(s=><article key={s.id} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-black tracking-widest text-cyan-800">STEP {s.id}</p><h3 className="mt-2 text-lg font-black">{s.name}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-700">{s.detail}</p><p className="mt-3 text-xs text-slate-500">{s.components}</p><p className="mt-1 font-mono text-xs font-black text-slate-700">{s.pins}</p><a className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 font-bold text-white" href={s.url} target="_blank" rel="noopener noreferrer">회로 열기 ↗</a></article>)}
        </div>
        <a className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-100 px-4 py-3 font-black text-cyan-950" href={base+"a29/index.html"} target="_blank" rel="noopener noreferrer"><BookOpen className="size-5" />3단계 설명·동작 예측 열기</a>
      </section>
      <section id="videos" aria-labelledby="video-title" className="scroll-mt-44 rounded-[24px] border border-emerald-200 bg-white p-5 sm:scroll-mt-32 sm:p-7">
        <h2 id="video-title" className="flex items-center gap-2 text-2xl font-black"><PlayCircle className="size-6 text-emerald-700" /> 수행평가 실습 영상 3편</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">STEP 1 초음파, STEP 2 CDS·가변저항, STEP 3 통합 회로. 총 37분 54초입니다.</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">영상에서 Tinkercad 기본 조작과 배선 방법을 익혀보세요. 회로 연결과 코드는 STEP 1~3 실습 자료를 확인하세요.</p>
        <iframe title="아두이노 수행평가 실습 영상 3편" src={base+"learning-videos/index.html"} loading="lazy" allow="fullscreen; autoplay" allowFullScreen className="mt-4 h-[680px] w-full rounded-2xl border border-slate-200 bg-slate-950 sm:h-[760px]" />
      </section>
      <section id="code" className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-2xl font-black"><FileCode2 className="size-6 text-violet-700" /> 통합 실습 · 12개 빈칸 코드</h2><p className="mt-2 text-slate-700">코드에는 짧은 변수명 <code>dist</code>, <code>cds</code>, <code>pot</code>, <code>led</code>를 사용합니다. 빈칸을 직접 완성한 뒤 실행 결과를 확인해 보세요.</p><div className="mt-4 flex flex-wrap gap-3"><a className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white" href={base+"downloads/arduino-assessment-starter.ino"} download>학생용 코드 받기 ↓</a><a className="rounded-xl bg-violet-700 px-5 py-3 font-bold text-white" href={base+"a29/materials/starter-answers.html"} target="_blank" rel="noopener noreferrer">12개 정답·해설 보기 ↗</a></div>
      </section>
      <section id="rubric" className="scroll-mt-44 rounded-[24px] border border-slate-200 bg-white p-5 sm:scroll-mt-32 sm:p-7">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 size-7 shrink-0 text-emerald-700" />
          <div>
            <p className="text-sm font-black text-emerald-700">STUDENT RUBRIC · 실습활동 20점</p>
            <h2 className="mt-1 text-2xl font-black">세부 채점기준 83개</h2>
            <p className="mt-2 leading-7 text-slate-700">아래 6개 영역의 항목을 클릭하면 <strong>0.2·0.4·0.6점 단위의 세부 판정기준</strong>이 펼쳐집니다. 빨간 LED·초록 LED·부저의 독립 동작을 기준으로 평가항목을 확인할 수 있습니다.</p>
          </div>
        </div>
        {!assessmentRubric.isSchoolApproved && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">점수 적용 안내: 실제 성적 처리는 학교의 확정된 평가계획과 운영 기준에 따릅니다.</p>}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-white"><tr><th className="p-3 sm:p-4">실습 평가영역</th><th className="p-3 text-right sm:p-4">배점</th></tr></thead>
            <tbody>
              {assessmentRubric.rubric.map(area=>(
                <tr key={area.id} className="border-t border-slate-100">
                  <td className="p-3 font-bold sm:p-4">{area.id}. {area.name}</td>
                  <td className="p-3 text-right font-black sm:p-4">{(area.maxUnits/10).toFixed(1)}점</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 bg-slate-50"><td className="p-3 font-black sm:p-4">실습활동 합계</td><td className="p-3 text-right font-black sm:p-4">20.0점</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 space-y-5">
          {assessmentRubric.rubric.map(area=>(
            <section key={area.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5" aria-label={area.id+"영역 채점기준"}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">{area.id}. {area.name}</h3>
                <strong className="shrink-0 text-lg">{(area.maxUnits/10).toFixed(1)}점</strong>
              </div>
              <div className="mt-3 space-y-2">
                {area.items.map(item=>(
                  <details key={item.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 hover:bg-cyan-50">
                      <span className="min-w-0 text-sm font-bold leading-6"><span className="mr-2 font-mono text-cyan-800">{item.id}</span>{item.title}<span className="ml-2 text-xs font-semibold text-slate-500 group-open:hidden">세부기준 펼치기 +</span><span className="ml-2 hidden text-xs font-semibold text-slate-500 group-open:inline">접기 −</span></span>
                      <strong className="shrink-0 text-sm">{(item.maxUnits/10).toFixed(1)}점</strong>
                    </summary>
                    <div className="border-t border-slate-100 px-3 py-3 sm:px-4">
                      <p className="mb-2 text-xs font-bold text-slate-500">{item.mode} 평가 · 하위 기준별 충족 여부 확인</p>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[490px] text-left text-sm">
                          <thead className="bg-slate-100"><tr><th className="p-2">세부 ID</th><th className="p-2">세부 판정기준</th><th className="p-2 text-right">배점</th></tr></thead>
                          <tbody>{item.subcriteria.map(sub=>(
                            <tr key={sub.id} className="border-t border-slate-100"><td className="p-2 font-mono font-bold text-cyan-800">{sub.id}</td><td className="p-2 leading-6">{sub.criterion}</td><td className="p-2 text-right font-black">{(sub.units/10).toFixed(1)}점</td></tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
      <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 sm:p-7"><h2 className="flex items-center gap-2 text-xl font-black"><CheckCircle2 className="size-6 text-emerald-700" /> 스스로 최종 확인</h2><p className="mt-2 leading-8">초음파 앞의 물체를 가까이/멀리 바꾸어 부저를 확인합니다. CDS를 가려 빨간 LED를 켜거나 끄고, 가변저항을 돌려 초록 LED 밝기를 바꿉니다. 세 실험은 다른 출력에 영향을 주지 않아야 합니다.</p></section>
    </main>
  </div>;
}