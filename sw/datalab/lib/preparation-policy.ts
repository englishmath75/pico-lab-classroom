export interface DeviceHints { memory?: number; cores?: number; saveData?: boolean; heapUsed?: number; heapLimit?: number }
export function canPrepare(visible: boolean, enabled: boolean, hints: DeviceHints): boolean {
  return visible && enabled && !hints.saveData &&
    !(hints.memory !== undefined && hints.memory <= 4) &&
    !(hints.cores !== undefined && hints.cores <= 2) &&
    !(hints.heapUsed !== undefined && hints.heapLimit && hints.heapUsed/hints.heapLimit > .7);
}
/** Fixed known imports only. Does not evaluate Python or load arbitrary packages. */
export function preparationPackages(code: string): string[] {
  return ["numpy","pandas","matplotlib"].filter(name =>
    new RegExp("(?:^|\\n)\\s*(?:import\\s+"+name+"(?=[\\s.,]|$)|from\\s+"+name+"(?=[\\s.]|$))").test(code)
  );
}
