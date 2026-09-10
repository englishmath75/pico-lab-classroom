"use client";

import { ArrowLeft, BookOpen, Braces, Clipboard, Code2, Lightbulb, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const basics = [
  { title: "변수 선언", body: "값을 저장할 상자에 이름과 자료형을 정합니다.", code: `int a = 10;       // 정수\nfloat b = 3.5;    // 소수\nchar c = 'A';     // 문자 1개\nbool d = true;    // 참 또는 거짓` },
  { title: "if 조건문", body: "조건이 참일 때와 거짓일 때 실행할 일을 나눕니다.", code: `int a = 700;\n\nif (a >= 500) {\n  Serial.println("밝음");\n} else {\n  Serial.println("어두움");\n}` },
  { title: "for 반복문", body: "시작값·계속할 조건·증가 방법을 한 줄에 적습니다.", code: `for (int a = 1; a <= 5; a++) {\n  Serial.println(a);\n}` },
  { title: "while 반복문", body: "조건이 참인 동안 계속 반복합니다. 증가문을 빼먹으면 끝나지 않습니다.", code: `int a = 1;\n\nwhile (a <= 5) {\n  Serial.println(a);\n  a++;\n}` },
  { title: "내가 만드는 함수", body: "ABC는 원래 있는 명령어가 아니라 우리가 임의로 정한 함수 이름입니다. 이름은 목적에 맞게 바꿀 수 있습니다.", code: `void ABC() {\n  Serial.println("함수 실행");\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  ABC();\n}\n\nvoid loop() {\n}` },
];

const examples = [
  { title: "1부터 10까지 출력", thinking: "1에서 시작해 10 이하인 동안 1씩 증가한다.", code: `void setup() {\n  Serial.begin(9600);\n  for (int a = 1; a <= 10; a++) {\n    Serial.println(a);\n  }\n}\n\nvoid loop() {\n}` },
  { title: "1부터 10까지 총합", thinking: "합계를 저장할 변수를 0으로 만들고 반복할 때마다 더한다.", code: `void setup() {\n  Serial.begin(9600);\n  int a = 0;\n\n  for (int b = 1; b <= 10; b++) {\n    a = a + b;\n  }\n  Serial.println(a);\n}\n\nvoid loop() {\n}` },
  { title: "세 점수의 평균", thinking: "정수끼리 계산하면 소수 부분이 사라질 수 있으므로 3.0으로 나눈다.", code: `void setup() {\n  Serial.begin(9600);\n  int a = 80;\n  int b = 90;\n  int c = 85;\n  float d = (a + b + c) / 3.0;\n  Serial.println(d);\n}\n\nvoid loop() {\n}` },
  { title: "홀수와 짝수 판별", thinking: "%는 나머지를 구한다. 2로 나눈 나머지가 0이면 짝수이다.", code: `void setup() {\n  Serial.begin(9600);\n  int a = 7;\n\n  if (a % 2 == 0) {\n    Serial.println("짝수");\n  } else {\n    Serial.println("홀수");\n  }\n}\n\nvoid loop() {\n}` },
  { title: "구구단 2단", thinking: "Python의 range(1, 10) 대신 1부터 9 이하까지 반복한다고 적는다.", code: `void setup() {\n  Serial.begin(9600);\n  for (int a = 1; a <= 9; a++) {\n    Serial.print("2 x ");\n    Serial.print(a);\n    Serial.print(" = ");\n    Serial.println(2 * a);\n  }\n}\n\nvoid loop() {\n}` },
  { title: "2단부터 9단까지", thinking: "반복문 안에 반복문을 넣는다. 바깥 반복은 단, 안쪽 반복은 곱하는 수이다.", code: `void setup() {\n  Serial.begin(9600);\n  for (int a = 2; a <= 9; a++) {\n    for (int b = 1; b <= 9; b++) {\n      Serial.print(a);\n      Serial.print(" x ");\n      Serial.print(b);\n      Serial.print(" = ");\n      Serial.println(a * b);\n    }\n    Serial.println();\n  }\n}\n\nvoid loop() {\n}` },
  { title: "센서값 기준 판별", thinking: "A4 값을 읽고 500 이상인지 if문으로 판단한다.", code: `void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int a = analogRead(A4);\n  if (a >= 500) {\n    Serial.println("기준 이상");\n  } else {\n    Serial.println("기준 미만");\n  }\n  delay(100);\n}` },
];

export function CBasicCourse({ onBack }: { onBack: () => void }) {
  const copy = async (code: string) => { await navigator.clipboard.writeText(code); toast.success("코드를 복사했습니다."); };
  return <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex min-h-18 max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-7"><button onClick={onBack} className="flex items-center gap-3 text-left"><span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-violet-300"><ArrowLeft className="size-5"/></span><span><span className="block text-xs font-black tracking-wider text-violet-700">ARDUINO C BASIC</span><span className="font-black">아두이노 교실로 돌아가기</span></span></button><span className="hidden rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-900 sm:block">박영수 정보T</span></div></header>
    <main className="mx-auto max-w-[1180px] px-4 py-7 sm:px-7">
      <section className="overflow-hidden rounded-[30px] bg-slate-950 p-7 text-white shadow-xl sm:p-10"><p className="text-sm font-black tracking-[.15em] text-violet-300">PYTHON → ARDUINO C</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">아두이노를 위한 초간단 C언어 배우기</h1><p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">Python을 배운 학생이 아두이노 코드를 읽고 직접 수정하는 데 꼭 필요한 문법만 빠르게 익힙니다. C언어 전체를 외우는 수업이 아닙니다.</p><div className="mt-6 grid gap-2 sm:grid-cols-3">{["문장 끝에는 ;","범위는 { }","자료형을 먼저 선언"].map(x=><div key={x} className="rounded-2xl bg-white/10 p-4 text-center font-black text-violet-100">{x}</div>)}</div></section>

      <section className="mt-6 rounded-[26px] border border-cyan-200 bg-white p-6"><div className="flex items-center gap-3"><BookOpen className="size-6 text-cyan-700"/><h2 className="text-2xl font-black">Python과 비교하면 쉽습니다</h2></div><div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[650px] w-full text-left"><thead className="bg-slate-950 text-white"><tr><th className="p-4">Python</th><th className="p-4">Arduino C</th><th className="p-4">뜻</th></tr></thead><tbody>{[["들여쓰기","{ }","코드 범위"],["변수명 = 값","int 변수명 = 값;","변수 선언"],["print()","Serial.println()","화면에 출력"],["range()","for (시작; 조건; 증가)","정해진 반복"]].map(row=><tr key={row[0]} className="border-t border-slate-100"><td className="p-4 font-bold">{row[0]}</td><td className="p-4 font-mono font-black text-violet-800">{row[1]}</td><td className="p-4">{row[2]}</td></tr>)}</tbody></table></div></section>

      <section className="mt-6"><div className="flex items-center gap-3"><Braces className="size-7 text-violet-700"/><div><p className="text-sm font-black text-violet-700">PART 1</p><h2 className="text-3xl font-black">꼭 필요한 기본 문법</h2></div></div><div className="mt-5 grid gap-5 lg:grid-cols-2">{basics.map(x=><article key={x.title} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white"><div className="p-5"><h3 className="text-xl font-black">{x.title}</h3><p className="mt-2 leading-7 text-slate-600">{x.body}</p></div><pre className="overflow-auto bg-[#0b1220] p-5 font-mono text-sm leading-7 text-cyan-50"><code>{x.code}</code></pre></article>)}</div></section>

      <section className="mt-7 rounded-[24px] border-2 border-amber-200 bg-amber-50 p-6"><div className="flex gap-3"><Lightbulb className="mt-1 size-6 shrink-0 text-amber-600"/><div><h2 className="text-xl font-black">ABC()는 외우는 명령어가 아닙니다</h2><p className="mt-2 leading-7">위 예제의 <code className="rounded bg-white px-2 py-1 font-black">ABC()</code>는 우리가 직접 만든 사용자 정의 함수입니다. Python에서 <code className="rounded bg-white px-2 py-1 font-black">def ABC():</code>로 함수를 만드는 것처럼 C에서도 원하는 이름으로 만들 수 있습니다. Arduino가 기본 제공하는 <code className="rounded bg-white px-2 py-1 font-black">digitalWrite()</code>와는 다릅니다.</p></div></div></section>

      <section className="mt-8"><div className="flex items-center gap-3"><Repeat2 className="size-7 text-cyan-700"/><div><p className="text-sm font-black text-cyan-700">PART 2</p><h2 className="text-3xl font-black">바로 실행하는 7개 예제</h2></div></div><div className="mt-5 space-y-5">{examples.map((x,i)=><article key={x.title} className="grid overflow-hidden rounded-[26px] border border-slate-200 bg-white lg:grid-cols-[.72fr_1.28fr]"><div className="p-6"><span className="grid size-10 place-items-center rounded-xl bg-violet-100 font-black text-violet-800">{i+1}</span><h3 className="mt-4 text-2xl font-black">{x.title}</h3><p className="mt-3 rounded-2xl bg-cyan-50 p-4 leading-7 text-cyan-950"><strong>생각하는 순서:</strong> {x.thinking}</p><p className="mt-4 text-sm font-bold text-slate-500">Arduino IDE의 시리얼 모니터는 9600 baud로 엽니다.</p></div><div className="overflow-hidden bg-[#0b1220] text-white"><div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><span className="font-mono text-xs font-bold text-cyan-300">sketch.ino</span><Button size="sm" onClick={()=>copy(x.code)} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Clipboard className="mr-1.5 size-3.5"/>복사</Button></div><pre className="overflow-auto p-5 font-mono text-sm leading-7 text-cyan-50"><code>{x.code}</code></pre></div></article>)}</div></section>

      <section className="mt-7 rounded-[26px] bg-violet-100 p-6"><div className="flex items-center gap-3"><Code2 className="size-6 text-violet-700"/><h2 className="text-2xl font-black">마지막 확인</h2></div><p className="mt-3 leading-7">변수에 값을 저장하고, <strong>if</strong>로 판단하고, <strong>for·while</strong>로 반복하며, 반복되는 코드는 직접 만든 함수로 묶을 수 있다고 설명하면 아두이노 C 기초를 통과한 것입니다.</p></section>
    </main><Toaster richColors position="top-center"/>
  </div>;
}
