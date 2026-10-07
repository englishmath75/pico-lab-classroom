import { useEffect, useState } from "react";
export const PROGRESS_KEY = "pico-ai-ble-progress-v1";
type Progress = {
  version: 1;
  completedLessons: number[];
  checks: Record<string, boolean>;
};
const empty = (): Progress => ({
  version: 1,
  completedLessons: [],
  checks: {},
});
export function parseProgress(raw: string | null): Progress {
  if (!raw) return empty();
  try {
    const p = JSON.parse(raw);
    if (
      p.version !== 1 ||
      !Array.isArray(p.completedLessons) ||
      !p.completedLessons.every(
        (n: unknown) => Number.isInteger(n) && Number(n) >= 1 && Number(n) <= 8,
      ) ||
      !p.checks ||
      typeof p.checks !== "object" ||
      Array.isArray(p.checks)
    )
      return empty();
    if (
      !Object.entries(p.checks).every(
        ([k, v]) =>
          /^(L[1-8]-[a-z0-9-]+|final-[0-9]+|hardware-[0-9]+)$/.test(k) &&
          typeof v === "boolean",
      )
    )
      return empty();
    return {
      version: 1,
      completedLessons: [...new Set<number>(p.completedLessons)],
      checks: p.checks,
    };
  } catch {
    return empty();
  }
}
export function useAiBleProgress() {
  const [progress, setProgress] = useState<Progress>(empty);
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    try {
      setProgress(parseProgress(localStorage.getItem(PROGRESS_KEY)));
    } catch {
      setBlocked(true);
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (loaded && !blocked)
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      } catch {
        setBlocked(true);
      }
  }, [progress, loaded, blocked]);
  return {
    progress,
    blocked,
    toggle: (id: number) =>
      setProgress((p) => ({
        ...p,
        completedLessons: p.completedLessons.includes(id)
          ? p.completedLessons.filter((n) => n !== id)
          : [...p.completedLessons, id],
      })),
    check: (id: string, value: boolean) =>
      setProgress((p) => ({ ...p, checks: { ...p.checks, [id]: value } })),
    reset: () => {
      setProgress(empty());
      try {
        localStorage.removeItem(PROGRESS_KEY);
      } catch {
        setBlocked(true);
      }
    },
  };
}
