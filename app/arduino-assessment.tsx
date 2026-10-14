"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircuitBoard,
  Clock3,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

  const totalItems = assessmentData.rubric.reduce(
    (sum, section) => sum + section.items.length,
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
          const text = [item.id, item.title, item.mode]
            .join(" ")
            .toLowerCase();
          return text.includes(q);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [area, query]);

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
          <nav aria-label="수행평가 학습 메뉴" className="flex flex-wrap gap-2">
            {[
              { label: "수행평가 안내", href: "#overview", style: "bg-emerald-700 text-white hover:bg-emerald-600" },
              { label: "Tinkercad 3단계 연습", href: "a29/index.html", style: "bg-cyan-500 text-slate-950 hover:bg-cyan-400" },
              { label: "수행평가 대비 학습지", href: "a29/materials/worksheet.html", style: "bg-white text-slate-950 border border-slate-200 hover:bg-slate-100" },
              { label: "빈칸 코드 다운로드", href: "downloads/arduino-assessment-starter.ino", style: "bg-amber-400 text-slate-950 hover:bg-amber-300" },
            ].map(({ label, href, style }) => (
              <a key={label} href={href.startsWith("#") ? href : base + href}
                className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-black transition-colors ${style}`}
                download={href.endsWith(".ino") ? true : undefined}
                target={href.endsWith(".html") ? "_blank" : undefined}
                rel={href.endsWith(".html") ? "noreferrer" : undefined}
              >{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-7">
        <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-xl">
          <div className="grid gap-8 bg-[radial-gradient(circle_at_85%_10%,rgba(34,211,238,.23),transparent_34%)] p-6 sm:p-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)]">
            <div className="flex h-full min-w-0 flex-col">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                  소프트웨어와 생활
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-black text-cyan-200">
                  아두이노 수행평가 연습
                </span>
              </div>
              <h1 className="mt-5 text-[2rem] font-black leading-tight tracking-[-0.045em] text-white sm:text-[2.35rem] lg:whitespace-nowrap lg:text-[2.55rem] xl:text-[2.7rem]">
                스마트 야간 접근 경보 장치 만들기
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                초음파센서·조도센서·가변저항을 하나의 시스템으로 연결하고,
                조건에 따라 LED와 부저를 제어합니다. 회로 구성부터 코드 완성,
                업로드와 실물 동작까지 50분 안에 완성합니다.
              </p>
              <div className="mt-auto pt-8">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                  <span className="text-[10px] font-black tracking-[.18em] text-slate-500">REMEMBER 3 THINGS</span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-amber-400 text-xs font-black text-slate-950">01</span>
                      <span className="text-sm font-black text-amber-200">거리 경보</span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-200">
                      <span className="text-white">20cm 미만</span>이면 부저가 울립니다.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-cyan-400 text-xs font-black text-slate-950">02</span>
                      <span className="text-sm font-black text-cyan-200">복합 조건</span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-200">
                      <span className="text-white">가까움 + 어두움</span>일 때만 LED가 켜집니다.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-emerald-400 text-xs font-black text-slate-950">03</span>
                      <span className="text-sm font-black text-emerald-200">밝기 제어</span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-200">
                      가변저항을 <span className="text-white">PWM 50~255</span> 밝기로 바꿉니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <aside className="rounded-[28px] border border-cyan-200/30 bg-gradient-to-br from-white/[.10] via-white/[.06] to-cyan-400/[.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black tracking-[.18em] text-cyan-300">ASSESSMENT / 100 POINTS</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white">평가 반영 기준</h2>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-black text-slate-950 shadow-sm">총 100점</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[.08] p-4">
                  <dt className="text-sm font-bold text-amber-200">기본점수</dt>
                  <dd className="mt-1 text-3xl font-black text-white">40<span className="ml-1 text-base text-amber-200">점</span></dd>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[.08] p-4">
                  <dt className="text-sm font-bold text-cyan-200">수업참여</dt>
                  <dd className="mt-1 text-3xl font-black text-white">20<span className="ml-1 text-base text-cyan-200">점</span></dd>
                </div>
                <div className="rounded-2xl border border-violet-300/20 bg-violet-300/[.08] p-4">
                  <dt className="text-sm font-bold text-violet-200">태도</dt>
                  <dd className="mt-1 text-3xl font-black text-white">20<span className="ml-1 text-base text-violet-200">점</span></dd>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[.08] p-4">
                  <dt className="text-sm font-bold text-emerald-200">실습활동</dt>
                  <dd className="mt-1 text-3xl font-black text-white">20<span className="ml-1 text-base text-emerald-200">점</span></dd>
                </div>
              </dl>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                <p className="text-xs font-bold leading-5 text-slate-300">
                  기본 화면은 <span className="font-black text-white">6개 평가영역</span>과
                  <span className="font-black text-cyan-300"> {totalItems}개 평가항목</span>으로 간단히 보여줍니다.
                  각 항목을 누르면 세부 판정기준과 배점까지 모두 확인할 수 있습니다.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section id="overview" className="mt-6 scroll-mt-56 rounded-[28px] border border-slate-200 bg-white p-5 sm:scroll-mt-40 sm:p-8">
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
          <h2 className="mt-1 text-3xl font-black">수행평가 연습 문제</h2>
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
              이번 수행평가 연습에서 LED는 D9를 사용하며 기존 기초 실습의 D3 설정을 바꾸는 것이 아닙니다.
            </p>
          </div>
        </section>

        <section id="code" className="mt-6 overflow-hidden rounded-[28px] border border-slate-800 bg-[#07101f] text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
            <div>
              <p className="text-sm font-black text-cyan-300">04 · STARTER CODE</p>
              <h2 className="mt-1 text-3xl font-black">학생용 12개 빈칸 코드</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">__01__부터 __12__까지 완성합니다. <span className="text-cyan-300">LIGHT_LIMIT=400</span>은 밝음과 어두움을 나누는 고정 정수 기준값입니다.</p>
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
              <h2 className="text-3xl font-black">실습활동 20점 학생용 평가표</h2>
              <p className="mt-2 leading-7 text-slate-600">
                전체 평가는 기본점수 40점 + 수업참여 20점 + 태도 20점 + 실습활동 20점으로 구성됩니다.
                먼저 <strong>6개 평가영역 · {totalItems}개 평가항목</strong>을 확인하고,
                각 항목을 클릭하면 세부 판정기준과 배점을 모두 볼 수 있습니다.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-slate-950 text-white">
                <tr><th className="p-4">영역</th><th className="p-4">배점</th></tr>
              </thead>
              <tbody>
                {assessmentData.rubric.map((section) => (
                  <tr key={section.id} className="border-t border-slate-100">
                    <td className="p-4 font-black">{section.id}. {section.name}</td>
                    <td className="p-4 font-black">{(section.maxUnits / 10).toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-950 bg-slate-50">
                  <td className="p-4 font-black">실습활동 연습 소계</td><td className="p-4 text-lg font-black">20.0</td>
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
                placeholder="예: 초음파, PWM, 시리얼, D5"
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
                    <details key={item.id} className="group overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm">
                      <summary className="grid cursor-pointer list-none grid-cols-[72px_minmax(0,1fr)_110px_82px] items-center px-4 py-3 text-sm transition hover:bg-slate-50 max-sm:grid-cols-[58px_minmax(0,1fr)_72px]">
                        <span className="font-mono font-black text-cyan-800">{item.id}</span>
                        <span className="font-bold leading-6 text-slate-800">
                          {item.title}
                          <span className="ml-2 text-xs font-bold text-cyan-700 group-open:hidden">세부기준 보기 +</span>
                          <span className="ml-2 hidden text-xs font-bold text-cyan-700 group-open:inline">세부기준 닫기 −</span>
                        </span>
                        <span className="text-slate-500 max-sm:hidden">{item.mode}</span>
                        <span className="text-right font-black text-slate-950">{(item.maxUnits / 10).toFixed(1)}점</span>
                      </summary>
                      <div className="border-t border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-slate-100 text-slate-700">
                              <tr>
                                <th className="p-3">세부 ID</th>
                                <th className="p-3">세부 판정기준</th>
                                <th className="p-3 text-right">배점</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.subcriteria.map((sub) => (
                                <tr key={sub.id} className="border-t border-slate-100">
                                  <td className="p-3 font-mono font-black text-slate-600">{sub.id}</td>
                                  <td className="p-3 leading-6 text-slate-700">{sub.criterion}</td>
                                  <td className="p-3 text-right font-black text-slate-950">{(sub.units / 10).toFixed(1)}점</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
    </div>
  );
}
