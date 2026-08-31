"use client";

import {
  Binary,
  BookOpen,
  CheckCircle2,
  Clipboard,
  Download,
  GraduationCap,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { arduinoQuestionBankTopics } from "./arduino-question-bank";

const serialExample = `void setup() {
  Serial.begin(115200);

  Serial.println('B', DEC); // 66
  Serial.println('B', HEX); // 42
  Serial.println('B', BIN); // 1000010
}

void loop() {
}`;

export function ArduinoFoundations() {
  const copyCode = async () => {
    await navigator.clipboard.writeText(serialExample);
    toast.success("기초 예제 코드를 복사했습니다.");
  };

  return (
    <section className="mt-7 overflow-hidden rounded-[30px] border border-cyan-200 bg-white shadow-sm" aria-labelledby="arduino-foundations-title">
      <div className="grid gap-6 bg-gradient-to-br from-cyan-50 via-white to-amber-50 p-6 sm:p-9 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-cyan-500 px-3 py-1.5 text-sm font-black text-slate-950">먼저 배우는 필수 기초</span>
            <span className="rounded-full bg-slate-950 px-3 py-1.5 text-sm font-black text-amber-300">실습·중간고사 공통</span>
          </div>
          <h2 id="arduino-foundations-title" className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Arduino Uno 기초 완성 교재</h2>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">
            Uno 보드 구조와 핀 기능부터 10비트 ADC, 8비트 PWM, 시리얼 통신, 통합 실습과 중간고사 예상문제까지 한 문서로 학습합니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
              <a href="downloads/arduino-foundations.docx" download><Download className="mr-1.5 size-4" />Uno 완성 교재 다운로드</a>
            </Button>
            <Button variant="outline" onClick={() => document.getElementById("arduino-foundation-code")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="rounded-xl bg-white">
              <BookOpen className="mr-1.5 size-4" />핵심 코드 보기
            </Button>
          </div>
        </div>
        <div className="rounded-[24px] bg-slate-950 p-5 text-white">
          <p className="text-sm font-black text-cyan-300">학습 순서</p>
          <div className="mt-4 space-y-3">
            {["Uno 구조 · 전원 · 핀", "A0~A5 · 10비트 ADC", "PWM · 코드 · 예상문제"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-400 font-black text-slate-950">{index + 1}</span>
                <span className="text-base font-black leading-7">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-cyan-300"><Binary className="size-5" /></span><h3 className="text-xl font-black">0과 1, 그리고 ASCII</h3></div>
          <p className="mt-4 text-base leading-7 text-slate-700">비트는 0 또는 1을 저장하는 최소 단위입니다. ASCII는 문자를 숫자 코드에 대응시킵니다. 문자 <code className="rounded bg-white px-1.5 py-1 font-mono font-bold text-cyan-700">'B'</code>는 10진수 66, 16진수 42, 2진수 1000010으로 표현됩니다.</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-amber-300"><Terminal className="size-5" /></span><h3 className="text-xl font-black">Serial.begin(115200)</h3></div>
          <p className="mt-4 text-base leading-7 text-slate-700">115200은 초당 전송하는 비트 수입니다. 일반적인 8N1에서는 한 바이트에 10비트가 필요하므로 이론상 약 11,520바이트/초입니다. 코드와 시리얼 모니터의 속도는 같아야 합니다.</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xl font-black">print와 println</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><p className="font-mono font-black text-cyan-700">Serial.print()</p><p className="mt-2 text-base leading-7 text-slate-700">출력 후 같은 줄에 이어 씁니다.</p></div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><p className="font-mono font-black text-amber-700">Serial.println()</p><p className="mt-2 text-base leading-7 text-slate-700">출력 후 다음 줄로 이동합니다.</p></div>
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xl font-black">두 번째 인수의 역할</h3>
          <p className="mt-4 text-base leading-7 text-slate-700">정수에서는 <strong>DEC·HEX·OCT·BIN</strong>으로 진법을 정하고, 실수에서는 소수점 아래에 표시할 자릿수를 정합니다.</p>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-base font-bold leading-7 text-amber-950 ring-1 ring-amber-200">예: <code className="font-mono">Serial.println(12.235, 2)</code>는 소수점 아래 2자리까지 표시합니다.</div>
        </article>
      </div>

      <div id="arduino-foundation-code" className="grid gap-5 border-t border-slate-200 bg-slate-950 p-5 text-white sm:p-7 lg:grid-cols-[1.05fr_.95fr]">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div><p className="font-mono text-base font-black text-cyan-300">Serial 기초 예제</p><p className="mt-1 text-sm text-slate-400">실행 전에 출력 결과를 먼저 예상하세요.</p></div>
            <Button size="sm" onClick={copyCode} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Clipboard className="mr-1.5 size-4" />코드 복사</Button>
          </div>
          <pre className="overflow-auto p-5 font-mono text-base leading-8 text-cyan-50"><code>{serialExample}</code></pre>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="flex items-center gap-3"><GraduationCap className="size-6 text-amber-300" /><h3 className="text-xl font-black">누적 문제은행 준비</h3></div>
          <p className="mt-3 text-base leading-7 text-slate-300">지금 등록한 핵심 개념을 이후 센서·PWM·모터 실습과 합쳐 최종 예상문제 문서로 만듭니다.</p>
          <div className="mt-4 space-y-2">
            {arduinoQuestionBankTopics.map((topic) => (
              <div key={topic.keyword} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-3.5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                <div><p className="font-mono text-sm font-black text-amber-300">{topic.keyword}</p><p className="mt-1 text-sm leading-6 text-slate-300">{topic.mastery}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
