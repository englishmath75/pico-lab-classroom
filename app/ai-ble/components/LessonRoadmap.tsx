import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { lessons } from "../course-data";
export function LessonRoadmap({
  selected,
  completed,
  onSelect,
  onToggle,
}: {
  selected: number;
  completed: number[];
  onSelect: (n: number) => void;
  onToggle: (n: number) => void;
}) {
  return (
    <section id="ai-roadmap" className="ai-card">
      <h2>8차시 Roadmap</h2>
      <p>
        {completed.length}/8차시 완료 · 선택한 차시는 현재 세션에서만
        기억합니다.
      </p>
      <Progress value={(completed.length / 8) * 100} className="my-4" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {lessons.map((l) => (
          <article
            key={l.id}
            className={
              "rounded-2xl border p-4 " +
              (selected === l.id ? "border-cyan-500 bg-cyan-50" : completed.includes(l.id) ? "border-emerald-500 bg-emerald-50" : "bg-slate-50")
            }
          >
            <button
              className="text-left w-full font-bold"
              aria-pressed={selected === l.id}
              onClick={() => onSelect(l.id)}
            >
              {completed.includes(l.id) && <span className="text-emerald-700" aria-label="완료">✓ </span>}{l.id}차시 · {l.title}
            </button>
            <p className="text-xs mt-2">{l.objectives[0]}</p>
            <label className="flex items-center gap-2 mt-2">
              <Checkbox
                checked={completed.includes(l.id)}
                onCheckedChange={() => onToggle(l.id)}
              />
              <span>완료</span>
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}
