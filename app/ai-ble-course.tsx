"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bluetooth,
  BrainCircuit,
  CheckCircle2,
  Clipboard,
  Cpu,
  Database,
  Lightbulb,
  Radio,
  Smartphone,
  Sparkles,
  ThermometerSun,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const NUS_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

type BleDeviceLite = {
  name?: string;
  gatt?: {
    connect(): Promise<{
      getPrimaryService(uuid: string): Promise<{
        getCharacteristic(uuid: string): Promise<{
          startNotifications(): Promise<void>;
          addEventListener(type: string, handler: (event: Event) => void): void;
        }>;
      }>;
      connected: boolean;
    }>;
  };
};

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice(options: {
      filters?: Array<{ services?: string[] }>;
      optionalServices?: string[];
    }): Promise<BleDeviceLite>;
  };
};

type LiveReading = {
  light?: number;
  temperature?: number;
  humidity?: number;
  state?: string;
};

const lessons = [
  {
    id: 1,
    title: "Pico 2 W와 MicroPython",
    goal: "RP2350, 3.3V GPIO, 온보드 LED, Thonny 연결을 확인한다.",
    output: "LED 점멸 + 보드 준비 완료",
    icon: Cpu,
  },
  {
    id: 2,
    title: "센서가 현실을 숫자로 바꾸는 법",
    goal: "CDS·DHT11에서 조도·온도·습도 데이터를 읽는다.",
    output: "실시간 센서값",
    icon: ThermometerSun,
  },
  {
    id: 3,
    title: "BLE 첫 연결",
    goal: "Pico 2 W를 BLE Peripheral로 만들고 Galaxy/Chrome에서 발견한다.",
    output: "브라우저에서 Pico 연결",
    icon: Bluetooth,
  },
  {
    id: 4,
    title: "BLE로 센서 데이터 보내기",
    goal: "조도·온도·습도 값을 JSON으로 전송하고 웹앱에서 실시간 확인한다.",
    output: "스마트폰 실시간 모니터",
    icon: Smartphone,
  },
  {
    id: 5,
    title: "AI 학습 데이터 만들기",
    goal: "feature와 label을 구분하고 CSV 학습 데이터를 만든다.",
    output: "classroom.csv",
    icon: Database,
  },
  {
    id: 6,
    title: "Colab에서 Decision Tree 학습",
    goal: "지도학습·훈련·예측·정확도를 직접 실행한다.",
    output: "학습된 분류 모델",
    icon: BrainCircuit,
  },
  {
    id: 7,
    title: "학습된 AI를 Pico 2 W에 적용",
    goal: "AI가 찾은 규칙을 MicroPython predict() 함수로 옮긴다.",
    output: "센서 → AI 판단 → LED/부저",
    icon: Lightbulb,
  },
  {
    id: 8,
    title: "AI + BLE 스마트 교실 완성",
    goal: "AI 판단 결과를 BLE로 스마트폰 웹앱에 실시간 전송한다.",
    output: "최종 팀 프로젝트",
    icon: Sparkles,
  },
] as const;

const picoBleCode = `# Pico 2 W · MicroPython · BLE(JSON) 예시
# aioble이 설치된 수업 환경을 기준으로 한 구조 예시입니다.
import uasyncio as asyncio
import bluetooth
import aioble
import json
from machine import ADC

SERVICE_UUID = bluetooth.UUID("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
TX_UUID = bluetooth.UUID("6e400003-b5a3-f393-e0a9-e50e24dcca9e")

service = aioble.Service(SERVICE_UUID)
tx = aioble.Characteristic(service, TX_UUID, read=True, notify=True)
aioble.register_services(service)

light_adc = ADC(26)

def predict(light, temperature, humidity):
    # Colab에서 학습한 결정트리 규칙으로 교체
    if humidity > 65:
        return "VENTILATE"
    if light > 45000:
        return "DARK"
    return "GOOD"

async def main():
    while True:
        async with await aioble.advertise(
            250_000,
            name="PICO2W-AI",
            services=[SERVICE_UUID],
        ) as connection:
            while connection.is_connected():
                light = light_adc.read_u16()
                temperature = 25.0
                humidity = 50.0
                state = predict(light, temperature, humidity)
                payload = json.dumps({
                    "light": light,
                    "temperature": temperature,
                    "humidity": humidity,
                    "state": state,
                }) + "\\n"
                tx.write(payload.encode())
                tx.notify(connection)
                await asyncio.sleep(1)

asyncio.run(main())`;

const colabCode = `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score

df = pd.read_csv("classroom.csv")

X = df[["light", "temperature", "humidity"]]
y = df["state"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

model = DecisionTreeClassifier(max_depth=3, random_state=42)
model.fit(X_train, y_train)

pred = model.predict(X_test)
print("accuracy:", accuracy_score(y_test, pred))
print(export_text(model, feature_names=list(X.columns)))`;

function CodeBlock({ title, code }: { title: string; code: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("코드를 복사했습니다.");
  };
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-800 bg-[#0b1220] text-white">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="font-mono text-xs font-black text-cyan-300">{title}</p>
          <p className="mt-1 text-xs text-slate-500">학생용 코드는 수업 단계에 맞춰 일부 값을 수정하며 사용합니다.</p>
        </div>
        <Button size="sm" onClick={copy} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
          <Clipboard className="mr-1.5 size-3.5" />코드 복사
        </Button>
      </div>
      <pre className="max-h-[520px] overflow-auto p-5 font-mono text-[12px] leading-6 text-cyan-50 sm:p-7">
        <code>{code}</code>
      </pre>
    </section>
  );
}

export function AiBleCourse({ onBack }: { onBack: () => void }) {
  const [completed, setCompleted] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("pico2w-ai-ble-progress") ?? "[]");
    } catch {
      return [];
    }
  });
  const [status, setStatus] = useState("연결 대기");
  const [deviceName, setDeviceName] = useState("");
  const [reading, setReading] = useState<LiveReading>({});
  const [log, setLog] = useState<string[]>([]);

  const percent = useMemo(() => Math.round((completed.length / lessons.length) * 100), [completed]);

  const toggle = (id: number) => {
    setCompleted((current) => {
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id].sort((a, b) => a - b);
      window.localStorage.setItem("pico2w-ai-ble-progress", JSON.stringify(next));
      return next;
    });
  };

  const connectBle = async () => {
    const nav = navigator as BluetoothNavigator;
    if (!nav.bluetooth) {
      setStatus("이 브라우저는 Web Bluetooth를 지원하지 않습니다.");
      toast.error("Chrome Android/호환 Chromium 브라우저에서 다시 시도하세요.");
      return;
    }

    try {
      setStatus("기기 선택 중...");
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [NUS_SERVICE] }],
        optionalServices: [NUS_SERVICE],
      });
      if (!device.gatt) throw new Error("GATT를 사용할 수 없습니다.");
      setDeviceName(device.name ?? "Pico 2 W");
      setStatus("연결 중...");

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(NUS_SERVICE);
      const characteristic = await service.getCharacteristic(NUS_TX);
      await characteristic.startNotifications();

      characteristic.addEventListener("characteristicvaluechanged", (event: Event) => {
        const target = event.target as unknown as { value?: DataView };
        if (!target.value) return;
        const text = new TextDecoder().decode(target.value.buffer).trim();
        if (!text) return;
        setLog((current) => [text, ...current].slice(0, 8));
        try {
          const parsed = JSON.parse(text) as LiveReading;
          setReading(parsed);
        } catch {
          // 원시 텍스트도 로그에서 확인할 수 있게 유지한다.
        }
      });

      setStatus("연결됨");
      toast.success("Pico 2 W BLE 연결 완료");
    } catch (error) {
      const message = error instanceof Error ? error.message : "BLE 연결 실패";
      setStatus("연결 실패");
      toast.error(message);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f8] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-7">
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="mr-1.5 size-4" />통합 실습실
          </Button>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-700">PICO 2 W · AI · BLE</p>
            <p className="text-sm font-black">AI 스마트 교실 8차시</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] space-y-7 px-4 py-7 sm:px-7 sm:py-10">
        <section className="overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-cyan-950 to-indigo-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,.22)] sm:p-9">
          <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">Pico 2 W</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">MicroPython</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">Bluetooth LE</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">Decision Tree</span>
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-5xl">센서가 데이터를 만들고,<br/>AI가 판단하고, 스마트폰이 보여준다.</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                피지컬 컴퓨팅 → BLE → 데이터 → 머신러닝 → 엣지 추론을 하나의 프로젝트로 연결합니다.
                단순 if문을 AI라고 부르지 않고, Colab에서 실제로 학습한 결정트리 규칙을 Pico 2 W에 옮기는 것이 핵심입니다.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-300">나의 진행률</p>
                <span className="text-3xl font-black">{percent}%</span>
              </div>
              <Progress value={percent} className="mt-4 h-2 bg-white/10 [&>div]:bg-cyan-400" />
              <p className="mt-3 text-xs text-slate-400">{completed.length}/8차시 완료 · 이 브라우저에 자동 저장</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {[
            ["1", "SENSE", "CDS·DHT11", "현실 → 숫자", Cpu],
            ["2", "SEND", "Bluetooth LE", "Pico → 스마트폰", Radio],
            ["3", "LEARN", "Google Colab", "데이터 → 모델", BrainCircuit],
            ["4", "ACT", "Edge AI", "판단 → LED·부저", Sparkles],
          ].map(([n, title, tech, desc, Icon]) => (
            <article key={String(title)} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-black text-cyan-700">STEP {String(n)}</span><Icon className="size-5 text-slate-400" /></div>
              <h2 className="mt-3 text-xl font-black">{String(title)}</h2>
              <p className="mt-1 text-sm font-bold text-slate-700">{String(tech)}</p>
              <p className="mt-2 text-xs text-slate-500">{String(desc)}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">8-Class Roadmap</p>
              <h2 className="mt-1 text-2xl font-black">Pico 2 W AI + Bluetooth 수업 로드맵</h2>
            </div>
            <p className="text-sm text-slate-500">권장: 팀당 Pico 2 W 1대 · Galaxy/Chrome 1대</p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {lessons.map((lesson) => {
              const Icon = lesson.icon;
              const done = completed.includes(lesson.id);
              return (
                <article key={lesson.id} className={"rounded-[22px] border p-5 transition " + (done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50/60")}>
                  <div className="flex items-start gap-4">
                    <div className={"grid size-11 shrink-0 place-items-center rounded-2xl " + (done ? "bg-emerald-400 text-slate-950" : "bg-slate-950 text-cyan-300")}>
                      {done ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-cyan-700">{lesson.id}차시</p>
                      <h3 className="mt-1 text-lg font-black">{lesson.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{lesson.goal}</p>
                      <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700">결과물 · {lesson.output}</p>
                      <Button size="sm" variant={done ? "outline" : "default"} onClick={() => toggle(lesson.id)} className="mt-3 rounded-xl">
                        {done ? "완료 취소" : "이 차시 완료"}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-cyan-200 bg-white shadow-sm">
          <div className="grid gap-6 bg-cyan-950 p-6 text-white sm:p-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <div className="flex items-center gap-2"><Bluetooth className="size-5 text-cyan-300" /><p className="text-xs font-black tracking-[0.14em] text-cyan-300">LIVE BLE LAB</p></div>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">웹앱에서 Pico 2 W에 직접 연결</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">Pico가 Nordic UART Service 형식으로 JSON을 notify하면, 이 페이지가 조도·온도·습도·AI 판단을 실시간으로 표시합니다.</p>
              <Button onClick={connectBle} className="mt-5 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"><Bluetooth className="mr-2 size-4" />Pico 2 W 연결</Button>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <p><strong className="text-cyan-300">상태:</strong> {status}</p>
                {deviceName && <p className="mt-1"><strong className="text-cyan-300">기기:</strong> {deviceName}</p>}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["조도", reading.light ?? "—", "ADC"],
                ["온도", reading.temperature ?? "—", "°C"],
                ["습도", reading.humidity ?? "—", "%"],
                ["AI 판단", reading.state ?? "—", "MODEL"],
              ].map(([label, value, unit]) => (
                <div key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.07] p-5">
                  <p className="text-xs font-black text-cyan-300">{String(label)}</p>
                  <p className="mt-3 break-all text-2xl font-black">{String(value)}</p>
                  <p className="mt-1 text-[10px] font-bold text-slate-500">{String(unit)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[.8fr_1.2fr]">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-black text-amber-950">교실 사용 조건</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950/80">
                <li>• GitHub Pages처럼 HTTPS로 열린 페이지에서 사용</li>
                <li>• Android Chrome 등 Web Bluetooth 지원 브라우저 권장</li>
                <li>• 브라우저의 기기 선택 창에서 학생이 직접 연결 승인</li>
                <li>• Pico 코드와 웹앱의 Service/Characteristic UUID가 같아야 함</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black">최근 수신 로그</p>
              <div className="mt-3 space-y-2 font-mono text-xs text-slate-600">
                {log.length ? log.map((line, i) => <p key={i} className="rounded-xl bg-white p-3">{line}</p>) : <p className="rounded-xl bg-white p-3 text-slate-400">아직 수신된 데이터가 없습니다.</p>}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <CodeBlock title="Pico 2 W · BLE + AI 구조 예시" code={picoBleCode} />
          <CodeBlock title="Google Colab · Decision Tree 학습" code={colabCode} />
        </div>

        <section className="rounded-[28px] border border-indigo-200 bg-indigo-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white"><Wifi className="size-6" /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-700">Final Project</p>
              <h2 className="mt-1 text-2xl font-black">AI 스마트 교실 환경 판단기</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-indigo-950/80">
                CDS·DHT11로 데이터를 읽고, Colab에서 학습한 Decision Tree를 Pico 2 W의 predict()에 반영합니다.
                Pico는 GOOD / DARK / VENTILATE 같은 판단을 LED·부저에 적용하고, 같은 결과를 BLE로 스마트폰 웹앱에 보냅니다.
                마지막 평가는 “작동했는가”뿐 아니라 데이터 품질, 모델 정확도, 틀린 예측의 원인 분석까지 포함합니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
