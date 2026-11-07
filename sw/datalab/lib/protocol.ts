export interface TurtleDrawing {
  historyEnd?: number; clearBefore?: Record<string,number>;
  screen?: {tracer?:number;updates?:number;title?:string;displayThrough?:number};
  background?: string; world?: number[];
  arcs?: {cx:number;cy:number;r:number;start:number;sweep:number;color:string;width:number;pen:number;order:number}[];
  pens: {id:number;x:number;y:number;heading:number;down:boolean;color:string;width:number;visible?:boolean}[];
  segments: {x1:number;y1:number;x2:number;y2:number;color:string;width:number;pen:number;order?:number}[];
}
export type EngineState =
  | "idle"
  | "loading"
  | "packages"
  | "ready"
  | "running"
  | "success"
  | "error"
  | "terminated"
  | "reinitializing";
export type TraceValue =
  | null
  | boolean
  | number
  | string
  | { ref: string }
  | { type: string; value: string };
export type TableCell = string | number | boolean | null;
export type TableSnapshot = {unsupported:string} | {shape:[number,number]; index:TableCell[]; columns:TableCell[]; dtypes:string[]; rows:TableCell[][]; truncated:boolean};
export interface TraceObject {
  size?: number;
  table?: TableSnapshot;
  type: string;
  items: TraceValue[] | [TraceValue, TraceValue][];
  truncated?: boolean;
}
export interface TraceFrame {
  id: string;
  name: string;
  line: number;
  locals: Record<string, TraceValue>;
}
export interface TraceEvent {
  statementSpan?: [number,number] | null;
  graphicFrame?: number; executedLine?: number; nextLine?: number; imageIds?: number[];
  event: "initial" | "call" | "line" | "return" | "exception" | "final" | "frame";
  line: number;
  frames: TraceFrame[];
  globals: Record<string, TraceValue>;
  objects: Record<string, TraceObject>;
  stdout: string;
  drawing?: TurtleDrawing;
  detail?: TraceValue;
}
export interface RunResult {
  traceKind?: 'animation-frame'|'statement';
  drawingHistory?: Pick<TurtleDrawing,'segments'|'arcs'>;
  runMetadata?: {exampleId:string;runId:string;codeHash:string;inputHash:string;runtime:string;python:string;packages:Record<string,string>};
  finalState?: TraceEvent;
  graphicFrames?: GraphicFrame[]; animationBounded?: boolean;
  files?: {name:string;base64:string}[];
  stdout: string;
  stderr: string;
  events: TraceEvent[];
  error?: {
    name: string;
    message: string;
    line: number | null;
    traceback: string;
  } | null;
  limited: boolean;
  images: string[];
  traceLimited?: boolean; traceLimitReason?: string; finalImageIds?: number[]; status?: string;
  drawing?: TurtleDrawing;
}
export interface RunRequest {
  id: number;
  code: string;
  stdin: string[];
  trace: boolean;
}
export type PreparationState = "paused" | "preparing" | "prepared" | "unavailable";
export interface ExecutionMetrics {
  clickToResultMs: number;
  engineWaitMs: number;
  bootstrapMs: number;
  pyodideMs: number;
  adapterMs: number;
  preparationPackageMs: number;
  packageMs: number;
  pythonMs: number;
  traceMs: number;
  serializationMs: number;
  transferValidationMs: number;
  renderMs: number;
  wasmBytes: number;
  prewarmed: boolean;
}
export type WorkerReply =
  | { type: "prepared"; initialization: {pyodideMs:number;adapterMs:number;preparationPackageMs:number;wasmBytes:number} }
  | { type: "initialization-failure"; message: string }
  | { id: number; type: "packages" }
  | { id: number; type: "result"; result: RunResult; metrics?: Partial<ExecutionMetrics> }

  | { id: number; type: "ready" | "running" }
  | { id: number; type: "failure"; message: string };

export interface GraphicFrame {clockSeconds?:number;width:number;height:number;background:string;commands:{kind:string;stipple?:string;blend?:'source-over'|'lighter';coords:number[];color:string;width:number}[]}
