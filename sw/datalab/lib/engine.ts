import { validResult } from "./result-validation";
import { IsolatedWorker } from "./isolated-worker";
import type { EngineState, RunResult, WorkerReply, PreparationState, ExecutionMetrics } from "./protocol";
export type {
  EngineState,
  RunResult,
  TraceEvent,
  TraceFrame,
  TraceValue,
  TraceObject,
} from "./protocol";

/** Dedicated Worker controller. No student code is executed in the main thread. */
export class PythonEngine {
  private worker: IsolatedWorker | null = null;
  private id = 0;
  private pending: {
    resolve: (result: RunResult) => void;
    reject: (error: Error) => void;
  } | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private executionStarted = false;
  private preparationAllowed = true;
  private prepared = false;
  private spareTimer: ReturnType<typeof setTimeout> | null = null;
  private initialization = {pyodideMs:0,adapterMs:0,preparationPackageMs:0,wasmBytes:0};
  private clickedAt = 0;
  private packagesAt = 0;
  private runningAt = 0;
  private prewarmed = false;
  private packages: string[] = [];

  constructor(
    private readonly onState: (state: EngineState) => void = () => {},
    private readonly createWorker: () => IsolatedWorker = () => new IsolatedWorker(),
    private readonly onPreparation: (state: PreparationState) => void = () => {},
    private readonly onMetrics: (metrics: ExecutionMetrics) => void = () => {},
  ) {}

  /** Prepare an unused, isolated runtime while the student reads or edits. */
  prepare() {
    if (this.disposed || !this.preparationAllowed || this.worker || this.pending) return;
    try { this.spawn(); } catch { this.onPreparation("unavailable"); }
  }

  /** Only teacher-known packages, never student source, are prepared speculatively. */
  setPackages(packages: string[]) {
    const next = [...new Set(packages.filter(p => ["numpy","pandas","matplotlib"].includes(p)))].sort();
    if (next.join() === this.packages.join()) return;
    this.packages = next;
    if (this.pending) return;
    this.clearSpareTimer();
    this.worker?.terminate(); this.worker = null; this.prepared = false;
    this.prepare();
  }
  /** Cancels only unused preparation; never interrupts a student's active run. */
  setPreparationAllowed(allowed: boolean) {
    this.preparationAllowed = allowed;
    if (!allowed && !this.pending) {
      this.clearSpareTimer();
      this.worker?.terminate();
      this.worker = null;
      this.prepared = false;
      this.onPreparation("paused");
    }
  }
  private clearSpareTimer() {
    if (this.spareTimer !== null) clearTimeout(this.spareTimer);
    this.spareTimer = null;
  }
  private state(state: EngineState) {
    if (!this.disposed) this.onState(state);
  }
  private clearTimer() {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
  private spawn() {
    const worker = this.createWorker();
    this.executionStarted = false;
    this.prepared = false;
    this.initialization = {pyodideMs:0,adapterMs:0,preparationPackageMs:0,wasmBytes:0};
    this.onPreparation("preparing");
    this.clearSpareTimer();
    this.spareTimer = setTimeout(() => {
      if (worker === this.worker && !this.pending) {
        worker.terminate(); this.worker = null; this.prepared = false;
        this.onPreparation("unavailable");
      }
    }, 120000);
    worker.onerror = (event) => {
      if (worker === this.worker) this.fail(new Error(event.message || "Python 실행 엔진을 불러오지 못했습니다."));
    };
    worker.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
      if (worker !== this.worker || !data || typeof data !== "object") return;
      if (data.type === "prepared") {
        // Only the unused bootstrap handshake marks a runtime ready.
        if (this.executionStarted) return;
        this.prepared = true;
        const n = (v:unknown,max:number) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max ? v : 0;
        this.initialization = {pyodideMs:n(data.initialization?.pyodideMs,120000),adapterMs:n(data.initialization?.adapterMs,120000),preparationPackageMs:n(data.initialization?.preparationPackageMs,120000),wasmBytes:n(data.initialization?.wasmBytes,2**32)};
        this.clearSpareTimer();
        if (!this.pending) {
          this.onPreparation("prepared");
          // Bound retained spare memory. Prepare again only on editing/focus/run.
          this.spareTimer = setTimeout(() => {
            if (worker === this.worker && !this.pending) {
              worker.terminate(); this.worker = null; this.prepared = false;
              this.onPreparation("paused");
            }
          }, 60000);
        }
        return;
      }
      if (data.type === "initialization-failure") {
        this.fail(new Error(data.message)); return;
      }
      if (data.id !== this.id || !this.pending) return;
      if (data.type === "packages" && !this.executionStarted) {
        if (!this.packagesAt) this.packagesAt = performance.now();
        this.state("packages");
      }
      if (data.type === "ready") this.state("ready");
      if (data.type === "running" && !this.executionStarted) {
        this.executionStarted = true;
        this.runningAt = performance.now();
        this.clearTimer();
        this.state("running");
        // Code execution timeout begins only after engine/package loading finishes.
        this.timer = setTimeout(
          () =>
            this.cancel(
              "실행 제한 8초에 도달했습니다. 반복 조건을 확인하세요.",
            ),
          8000,
        );
      }
      if (data.type === "result") {
        if (!validResult(data.result)) { this.fail(new Error("실행 결과 형식 또는 크기 제한을 벗어났습니다.")); return; }
        this.clearTimer();
        this.clearSpareTimer();
        const now = performance.now();
        const metric = (name: keyof ExecutionMetrics) => {
          const value = data.metrics?.[name];
          return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 120000 ? value : 0;
        };
        const pythonMs = metric("pythonMs"), serializationMs = metric("serializationMs");
        this.onMetrics({
          clickToResultMs: now - this.clickedAt,
          engineWaitMs: Math.max(0,(this.packagesAt || this.runningAt || now) - this.clickedAt),
          bootstrapMs: worker.bootstrapMs || 0, ...this.initialization,
          packageMs: this.packagesAt && this.runningAt ? this.runningAt-this.packagesAt : metric("packageMs"), pythonMs, traceMs:metric("traceMs"), serializationMs,
          transferValidationMs: Math.max(0,now-(this.runningAt || now)-pythonMs-serializationMs),
          renderMs:0, prewarmed:this.prewarmed,
        });
        const pending = this.pending;
        this.pending = null;
        this.state(data.result.error ? "error" : "success");
        pending.resolve(data.result);
        worker.terminate();
        this.worker = null;
        this.prepared = false;
        this.prepare();
      }
      if (data.type === "failure") this.fail(new Error(data.message));
    };
    this.worker = worker;
    worker.postMessage({type:"prepare",packages:this.packages});
  }

  private fail(error: Error) {
    this.clearTimer();
    this.clearSpareTimer();
    this.prepared = false;
    this.onPreparation("unavailable");
    const pending = this.pending;
    this.pending = null;
    this.worker?.terminate();
    this.worker = null;
    if (pending) this.state("error");
    pending?.reject(error);
  }

  run(code: string, stdin: string[] = [], trace = true): Promise<RunResult> {
    if (this.disposed) return Promise.reject(new Error("종료된 실행기입니다."));
    if (this.pending)
      return Promise.reject(new Error("실행을 중지한 뒤 다시 실행하세요."));
    if (code.length > 100000)
      return Promise.reject(new Error("코드는 100,000자 이내로 작성하세요."));
    if (stdin.length > 100 || stdin.some((item) => item.length > 10000))
      return Promise.reject(
        new Error("입력 큐는 100줄, 한 줄 10,000자 이내로 작성하세요."),
      );
    this.executionStarted = false;
    this.clickedAt = performance.now();
    this.packagesAt = 0; this.runningAt = 0;
    this.prewarmed = this.prepared;
    this.state("loading");
    try {
      if (!this.worker) this.spawn();
    } catch (error) {
      this.state("error");
      return Promise.reject(error);
    }
    this.clearSpareTimer();
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
      this.timer = setTimeout(
        () =>
          this.fail(
            new Error(
              "엔진 준비 시간 120초를 초과했습니다. 네트워크와 설치 파일을 확인하세요.",
            ),
          ),
        120000,
      );
      this.worker!.postMessage({ id, code, stdin, trace });
    });
  }

  private cancel(message: string) {
    this.clearTimer();
    this.clearSpareTimer();
    this.prepared = false;
    if (!this.disposed) this.onPreparation("paused");
    this.worker?.terminate();
    this.worker = null;
    this.id++;
    const pending = this.pending;
    this.pending = null;
    this.state("terminated");
    pending?.resolve({
      stdout: "",
      stderr: message,
      events: [],
      limited: true,
      images: [],
    });
    if (!this.disposed) {
      this.state("reinitializing");
      // Recreate lazily on the next run, preserving the editor and avoiding
      // uncaught eager initialization failures while offline.
      this.state("idle");
    }
  }

  stop() {
    this.cancel(
      "실행을 중지했습니다. 코드는 보존되며 다음 실행에 새 엔진을 사용합니다.",
    );
  }
  dispose() {
    this.disposed = true;
    this.cancel("실행기를 종료했습니다.");
  }
}
