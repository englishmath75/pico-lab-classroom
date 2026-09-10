"use client";

import { ArrowLeft, Clipboard, Gauge, Lightbulb, Music2, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type Example = {
  number: string;
  category: string;
  title: string;
  goal: string;
  parts: string[];
  wiring: string[];
  code: string;
  observe: string;
  lessonNote?: string;
  terms?: { name: string; usage: string; meaning: string }[];
};

const examples: Example[] = [
  {
    number: "01",
    category: "센서 없는 PWM",
    title: "LED 밝기를 자동으로 서서히 바꾸기",
    goal: "analogWrite()의 값 0~255를 반복해서 바꾸며 PWM 출력의 의미를 확인합니다.",
    parts: ["Arduino Uno", "LED", "220~330Ω 저항", "점퍼선"],
    wiring: ["D3(PWM) → 저항 → LED 긴 다리(+) ", "LED 짧은 다리(-) → GND"],
    code: `int a = 3;\n\nvoid setup() {\n  pinMode(a, OUTPUT);\n}\n\nvoid loop() {\n  for (int b = 0; b <= 250; b = b + 50) {\n    analogWrite(a, b);\n    delay(1000);\n  }\n\n  for (int b = 250; b >= 0; b = b - 50) {\n    analogWrite(a, b);\n    delay(1000);\n  }\n}`,
    observe: "LED 밝기가 0 → 50 → 100 → 150 → 200 → 250 순서로 1초마다 바뀌는지 눈으로 확인합니다.",
    lessonNote: "눈으로 단계 변화를 확인한 다음 학생이 직접 두 곳을 바꿉니다: ① b = b + 50과 b = b - 50을 b++와 b--로 변경  ② delay(1000)을 delay(10)으로 변경. 단계가 빠르고 촘촘해지면 LED가 부드럽게 밝아지고 어두워지는 것처럼 보입니다.",
  },
  {
    number: "02",
    category: "가변저항 + LED",
    title: "가변저항으로 LED 밝기 직접 조절하기",
    goal: "0~1023의 아날로그 입력값을 0~255의 PWM 출력값으로 변환합니다.",
    parts: ["Arduino Uno", "가변저항", "LED", "220~330Ω 저항", "점퍼선"],
    wiring: ["가변저항 양쪽 핀 → 5V, GND / 가운데 핀 → A4", "D3(PWM) → 저항 → LED 긴 다리(+) / LED 짧은 다리(-) → GND"],
    code: `int a = A4;\nint b = 3;\n\nvoid setup() {\n  pinMode(b, OUTPUT);\n}\n\nvoid loop() {\n  int c = analogRead(a);\n  int d = map(c, 0, 1023, 0, 255);\n  analogWrite(b, d);\n  delay(10);\n}`,
    observe: "가변저항을 돌리는 정도에 따라 LED 밝기가 연속적으로 달라집니다.",
  },
  {
    number: "03",
    category: "가변저항 + LED",
    title: "입력값과 PWM 출력값을 시리얼 모니터로 확인하기",
    goal: "눈으로 본 밝기 변화와 실제 입력·출력 숫자를 함께 비교합니다.",
    parts: ["예제 02와 같은 회로"],
    wiring: ["예제 02의 배선을 그대로 사용합니다."],
    code: `int a = A4;\nint b = 3;\n\nvoid setup() {\n  pinMode(b, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int c = analogRead(a);\n  int d = map(c, 0, 1023, 0, 255);\n  analogWrite(b, d);\n\n  Serial.print("input = ");\n  Serial.print(c);\n  Serial.print("  pwm = ");\n  Serial.println(d);\n  delay(100);\n}`,
    observe: "시리얼 모니터를 9600 baud로 열면 input은 0~1023, pwm은 0~255 범위로 표시됩니다.",
  },
  {
    number: "04",
    category: "CDS + 부저",
    title: "빛의 세기에 따라 부저 음높이 바꾸기",
    goal: "CDS 입력값을 주파수로 변환해 빛에 반응하는 소리를 만듭니다.",
    parts: ["Arduino Uno", "CDS 5528", "10kΩ 저항", "피에조 부저", "점퍼선"],
    wiring: ["5V → CDS → A0 → 10kΩ 저항 → GND (전압 분배)", "부저 +(S) → D9 / 부저 -(GND) → GND"],
    code: `int a = A0;\nint b = 9;\n\nvoid setup() {\n}\n\nvoid loop() {\n  int c = analogRead(a);\n  int d = map(c, 0, 1023, 200, 2000);\n  tone(b, d);\n  delay(20);\n}`,
    observe: "CDS를 가리거나 빛을 비추면 음높이가 달라집니다. 회로 방향에 따라 변화 방향은 반대가 될 수 있습니다.",
    terms: [{ name: "tone()", usage: "tone(핀 번호, 주파수);", meaning: "부저 소리를 시작합니다. 이 수업에서는 200~2000Hz, 학생 실험은 약 100~5000Hz를 권장합니다. 사람의 가청 범위는 대략 20~20000Hz이지만 부저가 모든 주파수를 잘 내는 것은 아닙니다. 매우 큰 수를 넣어도 더 큰 소리가 되는 것이 아니며, 들리지 않거나 불안정할 수 있습니다." }],
  },
  {
    number: "05",
    category: "CDS + 부저",
    title: "어두워지면 경고음 울리기",
    goal: "기준값과 조건문을 사용해 어두울 때만 부저를 작동시킵니다.",
    parts: ["예제 04와 같은 회로"],
    wiring: ["예제 04의 배선을 그대로 사용합니다."],
    code: `int a = A0;\nint b = 9;\nint c = 400;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int d = analogRead(a);\n  Serial.println(d);\n\n  if (d < c) {\n    tone(b, 1000);\n  } else {\n    noTone(b);\n  }\n  delay(100);\n}`,
    observe: "시리얼 모니터에서 교실의 밝기값을 먼저 확인한 뒤 c의 400을 알맞게 바꾸세요. 반대로 작동하면 <를 >로 바꿉니다.",
    terms: [
      { name: "tone()", usage: "tone(9, 1000);", meaning: "9번 핀의 부저에서 1000Hz 소리를 시작합니다. 교실 실험에는 약 100~5000Hz를 권장합니다." },
      { name: "noTone()", usage: "noTone(9);", meaning: "tone()으로 시작한 9번 핀의 부저 소리를 멈춥니다." },
    ],
  },
];

export function PwmCourse({ onBack }: { onBack: () => void }) {
  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success("코드를 복사했습니다. Arduino IDE에 붙여 넣으세요.");
  };

  return <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <button onClick={onBack} className="flex items-center gap-3 text-left">
          <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-amber-300"><ArrowLeft className="size-5" /></span>
          <span><span className="block text-xs font-black tracking-wider text-cyan-700">ARDUINO PWM LAB</span><span className="font-black">아두이노 교실로 돌아가기</span></span>
        </button>
        <div className="flex items-center gap-2"><Button asChild className="hidden bg-violet-100 font-black text-violet-950 hover:bg-violet-200 sm:flex"><a href="?view=c-basic">초간단 C언어</a></Button><span className="hidden rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-900 sm:block">박영수 정보T</span></div>
      </div>
    </header>

    <main className="mx-auto max-w-[1180px] px-4 py-7 sm:px-7">
      <section className="overflow-hidden rounded-[30px] bg-slate-950 text-white shadow-xl">
        <div className="grid gap-7 bg-[radial-gradient(circle_at_85%_5%,rgba(34,211,238,.24),transparent_35%)] p-6 sm:p-9 lg:grid-cols-[1.25fr_.75fr]">
          <div><p className="text-sm font-black tracking-[.15em] text-cyan-300">PWM SPECIAL CLASS</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">PWM 집중 실습실</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">디지털 핀을 매우 빠르게 켰다 껐다 하여 LED 밝기와 부저 소리를 조절합니다. Uno의 PWM 핀 3·5·6·9·10·11 중 이 수업에서는 LED D3, 부저 D9를 사용합니다.</p></div>
          <div className="rounded-[24px] border border-white/10 bg-white/[.06] p-5"><Gauge className="size-8 text-amber-300"/><h2 className="mt-3 text-xl font-black">핵심 숫자</h2><dl className="mt-4 space-y-3 text-sm"><div className="rounded-xl bg-white/[.06] p-3"><dt className="text-slate-400">analogRead()</dt><dd className="mt-1 text-lg font-black text-cyan-200">0 ~ 1023</dd></div><div className="rounded-xl bg-white/[.06] p-3"><dt className="text-slate-400">analogWrite()</dt><dd className="mt-1 text-lg font-black text-amber-200">0 ~ 255</dd></div></dl></div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[[SlidersHorizontal,"입력","가변저항·CDS의 값을 읽기"],[Gauge,"처리","map()·if로 값 바꾸기"],[Lightbulb,"출력","LED 밝기·부저 소리 조절"]].map(([Icon,title,body]) => { const I=Icon as typeof Gauge; return <article key={String(title)} className="rounded-[22px] border border-slate-200 bg-white p-5"><I className="size-6 text-cyan-700"/><h2 className="mt-3 text-lg font-black">{String(title)}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{String(body)}</p></article>; })}
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950"><TriangleAlert className="mt-0.5 size-5 shrink-0 text-rose-600"/><p><strong>안전:</strong> 배선을 바꿀 때는 USB를 먼저 분리하고, LED에는 반드시 220~330Ω 저항을 직렬로 연결하세요. 5V와 GND를 직접 연결하면 안 됩니다.</p></div>

      <section className="mt-7 space-y-6">
        {examples.map((item) => <article key={item.number} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-4 bg-gradient-to-r from-cyan-50 via-white to-amber-50 p-5 sm:grid-cols-[auto_1fr] sm:p-7"><span className="grid size-12 place-items-center rounded-2xl bg-slate-950 font-black text-cyan-300">{item.number}</span><div><p className="text-sm font-black text-cyan-700">{item.category}</p><h2 className="mt-1 text-2xl font-black">{item.title}</h2><p className="mt-2 leading-7 text-slate-600">{item.goal}</p></div></div>
          <div className="grid gap-5 border-t border-slate-200 p-5 sm:p-7 lg:grid-cols-[.8fr_1.2fr]">
            <div className="space-y-4"><div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-black">준비물</h3><div className="mt-3 flex flex-wrap gap-2">{item.parts.map(x=><span key={x} className="rounded-full bg-white px-3 py-1.5 text-sm font-bold ring-1 ring-slate-200">{x}</span>)}</div></div><div className="rounded-2xl bg-amber-50 p-5"><h3 className="font-black text-amber-900">배선</h3><ol className="mt-3 space-y-2">{item.wiring.map((x,i)=><li key={x} className="flex gap-2 text-sm leading-6"><span className="font-black text-amber-700">{i+1}</span>{x}</li>)}</ol></div>{item.lessonNote&&<div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black text-cyan-900">수업 중 꼭 바꾸기</h3><p className="mt-2 text-sm leading-7 text-cyan-950">{item.lessonNote}</p></div>}{item.terms&&<div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black text-violet-950">새로운 코드 용어</h3><div className="mt-3 space-y-4">{item.terms.map(term=><div key={term.name}><p className="font-black text-violet-800">{term.name}</p><code className="mt-1 block rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-900">{term.usage}</code><p className="mt-2 text-sm leading-6 text-violet-950">{term.meaning}</p></div>)}</div></div>}</div>
            <div className="overflow-hidden rounded-2xl bg-[#0b1220] text-white"><div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3"><span className="font-mono text-xs font-bold text-cyan-300">Arduino IDE · sketch.ino</span><Button size="sm" onClick={()=>copy(item.code)} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Clipboard className="mr-1.5 size-3.5"/>코드 복사</Button></div><pre className="max-h-[480px] overflow-auto p-5 font-mono text-[13px] leading-7 text-cyan-50"><code>{item.code}</code></pre></div>
          </div>
          <div className="border-t border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-950 sm:px-7"><strong>관찰·성공 기준:</strong> {item.observe}</div>
        </article>)}
      </section>

      <section className="mt-7 rounded-[26px] border border-violet-200 bg-violet-50 p-6"><div className="flex items-center gap-3"><Music2 className="size-6 text-violet-700"/><h2 className="text-2xl font-black">마무리 설명</h2></div><p className="mt-3 leading-7 text-violet-950">센서는 값을 직접 출력하지 않습니다. <strong>입력(analogRead) → 처리(map 또는 if) → 출력(analogWrite 또는 tone)</strong> 순서로 코드가 동작한다고 말할 수 있으면 성공입니다.</p></section>
    </main>
    <Toaster richColors position="top-center" />
  </div>;
}
