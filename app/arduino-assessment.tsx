"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircuitBoard,
  Clipboard,
  Clock3,
  Code2,
  Download,
  Printer,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { assessmentData, studentStarterCode } from "./arduino-assessment-data";

type AreaId = "ALL" | "A" | "B" | "C" | "D" | "E" | "F";

const areaColors: Record<string, string> = {
  A: "border-amber-200 bg-amber-50",
  B: "border-cyan-200 bg-cyan-50",
  C: "border-rose-200 bg-rose-50",
  D: "border-violet-200 bg-violet-50",
  E: "border-emerald-200 bg-emerald-50",
  F: "border-sky-200 bg-sky-50",
};

export function ArduinoAssessment({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<AreaId>("ALL");
  const [checked, setChecked] = useState<number[]>([]);
  const base = import.meta.env.BASE_URL;

  const totalCriteria = assessmentData.rubric.reduce(
    (sum, section) =>
      sum +
      section.items.reduce(
        (inner, item) => inner + item.subcriteria.length,
        0,
      ),
    0,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assessmentData.rubric
      .filter((section) => area === "ALL" || section.id === area)
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!q) return true;
          const text = [
            item.id,
            item.title,
            item.mode,
            ...item.subcriteria.map((sub) => `${sub.id} ${sub.criterion}`),
          ]
            .join(" ")
            .toLowerCase();
          return text.includes(q);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [area, query]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(studentStarterCode);
      toast.success("학생용 빈칸 코드를 복사했습니다.");
    } catch {
      toast.error("자동 복사가 차단되었습니다. INO 파일을 다운로드하세요.");
    }
  };

  const toggleChecklist = (index: number) => {
    setChecked((current) =>
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index],
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7">
          <button onClick={onBack} className="flex items-center gap-3 text-left">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-amber-300">
              <ArrowLeft className="size-5" />
            </span>
            <span>
              <span className="block text-xs font-black tracking-wider text-amber-700">
                ARDUINO ASSESSMENT
              </span>
              <span className="font-black">아두이노 교실로 돌아가기</span>
            </span>
          </button>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-cyan-500 font-black text-slate-950 hover:bg-cyan-400">
              <a href={base + "a29/index.html"}>
                <Code2 className="mr-2 size-4" />
                Tinkercad 3단계
              </a>
            </Button>
            <Button asChild variant="outline" className="font-black">
              <a href={base + "downloads/arduino-assessment-guide.md"} download>
                <Download className="mr-2 size-4" />
                평가 안내
              </a>
            </Button>
            <Button asChild className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
              <a href={base + "downloads/arduino-assessment-starter.ino"} download>
                <Download className="mr-2 size-4" />
                기본 코드
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-7">
        <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-xl">
          <div className="grid gap-8 bg-[radial-gradient(circle_at_85%_10%,rgba(34,211,238,.23),transparent_34%)] p-6 sm:p-9 lg:grid-cols-[1.35fr_.65fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                  소프트웨어와 생활
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-black text-cyan-200">
                  아두이노 실물 수행평가
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                스마트 야간 접근
                <br />
                경보 장치 만들기
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                초음파센서·조도센서·가변저항을 하나의 시스템으로 연결하고,
                조건에 따라 LED와 부저를 제어합니다. 회로 구성부터 코드 완성,
                업로드와 실물 동작까지 50분 안에 완성합니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#problem" className="rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950">
                  문제 보기
                </a>
                <a href="#rubric" className="rounded-xl border border-white/20 px-5 py-3 font-black text-white">
                  평가기준 보기
                </a>
                <a href={base + "a29/index.html"} className="rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950">
                  Tinkercad 3단계 연습 ↗
                </a>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-black text-white"
                >
                  <Printer className="size-4" />
                  인쇄
                </button>
              </div>
            </div>
            <aside className="rounded-[26px] border border-white/10 bg-white/[.07] p-5 sm:p-6">
              <p className="text-xs font-black tracking-[.16em] text-cyan-300">INDIVIDUAL / 50 MIN</p>
              <div className="mt-3 text-6xl font-black text-white">
                80<span className="text-2xl text-slate-400"> + </span>20
              </div>
              <p className="mt-1 font-bold text-slate-300">기본점수 + 실습 성취점수</p>
              <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-white/10 p-4">
                  <dt className="text-slate-400">학생</dt>
                  <dd className="mt-1 text-xl font-black">29명</dd>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <dt className="text-slate-400">세부기준</dt>
                  <dd className="mt-1 text-xl font-black">{totalCriteria}개</dd>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <dt className="text-slate-400">코드 빈칸</dt>
                  <dd className="mt-1 text-xl font-black">12개</dd>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <dt className="text-slate-400">최소 간격</dt>
                  <dd className="mt-1 text-xl font-black">0.2점</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <nav className="mt-5 grid gap-2 rounded-[22px] border border-slate-200 bg-white p-2 text-sm font-black sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["overview", "평가 안내"],
            ["problem", "문제"],
            ["wiring", "회로"],
            ["code", "기본 코드"],
            ["rubric", "평가기준"],
            ["check", "자기점검"],
          ].map(([id, label]) => (
            <a key={id} href={"#" + id} className="rounded-xl px-4 py-3 text-center hover:bg-slate-100">
              {label}
            </a>
          ))}
        </nav>

        <section id="overview" className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <Clock3 className="size-7 text-amber-600" />
            <div>
              <p className="text-sm font-black text-amber-700">01 · OVERVIEW</p>
              <h2 className="text-3xl font-black">평가 안내</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl bg-slate-50 p-5">
              <b className="text-cyan-800">시작 전</b>
              <p className="mt-2 leading-7">부품·USB·Arduino IDE를 확인합니다.</p>
            </article>
            <article className="rounded-2xl bg-amber-50 p-5">
              <b className="text-amber-800">0~50분</b>
              <p className="mt-2 leading-7">배선 → 코드 완성 → 업로드 → 최종 파일 제출</p>
            </article>
            <article className="rounded-2xl bg-emerald-50 p-5">
              <b className="text-emerald-800">50분 종료 후</b>
              <p className="mt-2 leading-7">코드·배선 수정 없이 교사가 순차 실물 검사합니다.</p>
            </article>
          </div>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 leading-7 text-amber-950">
            <strong>공통 원칙:</strong> 50분 안에 완성하면 제출 시각에 따른 가산점·감점은 없습니다.
            교사의 검사 대기 시간도 감점하지 않습니다.
          </div>
        </section>

        <section id="problem" className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8">
          <p className="text-sm font-black text-rose-700">02 · MISSION</p>
          <h2 className="mt-1 text-3xl font-black">수행평가 문제</h2>
          <p className="mt-3 text-xl font-black leading-8 text-slate-800">
            가까이 오면 소리가 나고, 가까우면서 어두우면 불도 켜지게 만드시오.
          </p>
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {assessmentData.requirements.map(([id, title, text]) => (
              <article key={id} className="flex gap-4 rounded-2xl border border-slate-200 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 font-black text-amber-300">
                  {id}
                </span>
                <div>
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="p-4">주변 밝기</th>
                  <th className="p-4">거리</th>
                  <th className="p-4">LED</th>
                  <th className="p-4">부저</th>
                </tr>
              </thead>
              <tbody>
                {assessmentData.truthTable.map((row, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-4 font-bold">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="wiring" className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <CircuitBoard className="size-7 text-cyan-600" />
            <div>
              <p className="text-sm font-black text-cyan-700">03 · WIRING</p>
              <h2 className="text-3xl font-black">평가 전용 핀 연결</h2>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="p-4">부품</th>
                  <th className="p-4">핀</th>
                  <th className="p-4">연결</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["HC-SR04", "D7 / D8", "TRIG → D7, ECHO → D8, VCC → 5V, GND → GND"],
                  ["CDS + 10kΩ", "A0", "5V → CDS → 접점(A0) → 10kΩ → GND"],
                  ["가변저항", "A1", "양 끝 → 5V/GND, 중앙 와이퍼 → A1"],
                  ["LED + 220Ω", "D9 PWM", "D9 → 직렬 저항 → LED → GND"],
                  ["수동 피에조", "D2", "신호 → D2, 반대 단자 → GND"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-slate-100">
                    <td className="p-4 font-black">{row[0]}</td>
                    <td className="p-4 font-mono font-black text-amber-700">{row[1]}</td>
                    <td className="p-4">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
            <AlertTriangle className="mt-0.5 size-6 shrink-0 text-rose-500" />
            <p className="leading-7">
              배선을 바꿀 때는 USB 전원을 분리합니다. 5V와 GND를 직접 연결하지 않습니다.
              이번 수행평가에서 LED는 D9를 사용하며 기존 기초 실습의 D3 설정을 바꾸는 것이 아닙니다.
            </p>
          </div>
        </section>

        <section id="code" className="mt-6 overflow-hidden rounded-[28px] border border-slate-800 bg-[#07101f] text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
            <div>
              <p className="text-sm font-black text-cyan-300">04 · STARTER CODE</p>
              <h2 className="mt-1 text-3xl font-black">학생용 12개 빈칸 코드</h2>
              <p className="mt-2 text-sm text-slate-400">__01__부터 __12__까지 완성합니다.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyCode} className="bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300">
                <Clipboard className="mr-2 size-4" />
                코드 복사
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <a href={base + "downloads/arduino-assessment-starter.ino"} download>
                  <Download className="mr-2 size-4" />
                  INO 다운로드
                </a>
              </Button>
            </div>
          </div>
          <pre className="max-h-[760px] overflow-auto p-5 font-mono text-[13px] leading-7 text-cyan-50 sm:p-7">
            <code>{studentStarterCode}</code>
          </pre>
        </section>

        <section id="rubric" className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-7 text-emerald-600" />
            <div>
              <p className="text-sm font-black text-emerald-700">05 · RUBRIC</p>
              <h2 className="text-3xl font-black">학생 공개용 평가기준</h2>
              <p className="mt-2 leading-7 text-slate-600">
                기본점수 80.0점에 아래 실습 성취점수 20.0점을 더합니다.
                공개된 기준 외의 추가 감점은 하지 않습니다.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-slate-950 text-white">
                <tr><th className="p-4">영역</th><th className="p-4">배점</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100"><td className="p-4 font-black">기본점수</td><td className="p-4 font-black">80.0</td></tr>
                {assessmentData.rubric.map((section) => (
                  <tr key={section.id} className="border-t border-slate-100">
                    <td className="p-4 font-black">{section.id}. {section.name}</td>
                    <td className="p-4 font-black">{(section.maxUnits / 10).toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-950 bg-slate-50">
                  <td className="p-4 font-black">총점</td><td className="p-4 text-lg font-black">100.0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "A", "B", "C", "D", "E", "F"] as AreaId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setArea(id)}
                  className={`rounded-xl px-4 py-2 text-sm font-black ${area === id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  {id === "ALL" ? "전체" : id}
                </button>
              ))}
            </div>
            <label className="relative block lg:w-96">
              <Search className="absolute left-4 top-3.5 size-5 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4"
                placeholder="예: 초음파, PWM, 시리얼, D5.1"
              />
            </label>
          </div>

          <div className="mt-5 space-y-4">
            {filtered.map((section) => (
              <article key={section.id} className={`rounded-[24px] border p-4 sm:p-5 ${areaColors[section.id]}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-black opacity-60">AREA {section.id}</p>
                    <h3 className="text-2xl font-black">{section.name}</h3>
                  </div>
                  <p className="text-xl font-black">{(section.maxUnits / 10).toFixed(1)}점</p>
                </div>
                <div className="mt-4 space-y-2">
                  {section.items.map((item) => (
                    <details key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                      <summary className="cursor-pointer list-none font-black">
                        <span className="mr-2 font-mono text-cyan-800">{item.id}</span>
                        {item.title}
                        <span className="ml-2 text-sm text-slate-500">
                          {item.mode} · {(item.maxUnits / 10).toFixed(1)}점
                        </span>
                      </summary>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-sm">
                          <thead className="bg-slate-100">
                            <tr><th className="p-3">ID</th><th className="p-3">평가 기준</th><th className="p-3">배점</th></tr>
                          </thead>
                          <tbody>
                            {item.subcriteria.map((sub) => (
                              <tr key={sub.id} className="border-t border-slate-100">
                                <td className="p-3 font-mono font-black">{sub.id}</td>
                                <td className="p-3 leading-6">{sub.criterion}</td>
                                <td className="p-3 font-black">{(sub.units / 10).toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="check" className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-7 text-emerald-600" />
            <div>
              <p className="text-sm font-black text-emerald-700">06 · FINAL CHECK</p>
              <h2 className="text-3xl font-black">제출 전 자기점검</h2>
            </div>
          </div>
          <p className="mt-3 text-slate-600">
            자기점검은 공식 성적이 아닙니다. 최종 점수는 선생님이 제출 코드와 실물 장치를 확인해 결정합니다.
          </p>
          <div className="mt-5 grid gap-2 lg:grid-cols-2">
            {assessmentData.checklist.map((item, index) => (
              <label
                key={item}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${checked.includes(index) ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
              >
                <Checkbox
                  checked={checked.includes(index)}
                  onCheckedChange={() => toggleChecklist(index)}
                  className="mt-0.5"
                />
                <span className="leading-7">{item}</span>
              </label>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black text-cyan-300">SELF CHECK</p>
                <p className="mt-1 text-2xl font-black">확인 완료</p>
              </div>
              <p className="text-4xl font-black">
                {checked.length}<span className="text-lg text-slate-500">/{assessmentData.checklist.length}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-cyan-200 bg-cyan-50 p-5 sm:p-8">
          <h2 className="text-2xl font-black text-cyan-950">기억할 한 문장</h2>
          <p className="mt-3 text-xl font-black leading-8 text-cyan-950">
            가까이 오면 부저가 울리고, 가까우면서 어두우면 LED가 켜지며,
            그 LED 밝기는 가변저항으로 조절합니다.
          </p>
        </section>
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
