import { Button } from "@/components/ui/button";
export function CourseHero({ onBack }: { onBack: () => void }) {
  return (
    <header className="ai-hero">
      <p className="text-cyan-300 text-sm font-bold tracking-widest">
        PICO 2 W · EDGE AI · BLUETOOTH LE
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mt-5">
        AI SMART
        <br />
        CLASSROOM
      </h1>
      <p className="mt-5 text-lg text-slate-200">
        센서가 데이터를 만들고, AI가 판단하고, 스마트폰이 보여준다.
      </p>
      <p className="mt-3 text-cyan-200">
        Pico 2 W with headers · 50분 × 8차시 · 교실 환경 행동 추천 분류 실습
      </p>
      <div className="flex flex-wrap gap-3 mt-6">
        <Button asChild className="bg-cyan-300 text-slate-950">
          <a href="#ai-roadmap">시작하기</a>
        </Button>
        <Button variant="secondary" onClick={onBack}>
          기존 실습실
        </Button>
      </div>
      <p className="mt-6 text-sm text-slate-200">
        AI가 판단하는 규칙은 사람이 정한 것이 아니라, 학습 데이터로부터 모델이
        찾은 것이다.
      </p>
      <p className="mt-2 text-sm text-slate-300">
        다만 무엇을 정답이라고 부를지, 어떤 데이터를 모을지, 어떤 특성을 쓸지는
        사람이 정한다. 모델의 판단은 그 선택과 데이터의 한계를 가진다.
      </p>
      <ol aria-label="학습 흐름" className="flex flex-wrap items-center gap-3 mt-6">
        {["센서", "Pico 2 W", "Bluetooth LE", "스마트폰", "CSV", "AI 학습", "Edge AI"].map((step, i) => <li key={step} className="rounded-xl bg-white/10 px-3 py-2">{i > 0 && <span aria-hidden="true">→ </span>}{step}</li>)}
      </ol>
    </header>
  );
}
