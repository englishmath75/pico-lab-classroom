export const LABELS = ["GOOD", "DARK", "VENTILATE", "HOT_HUMID"] as const;
export type StateLabel = (typeof LABELS)[number];
export type RowBudget = { training: number; validation: number };
export type SensorPacket = {
  v: 1;
  seq: number;
  uptime_ms: number;
  light: number | null;
  temperature: number | null;
  humidity: number | null;
  state: StateLabel | null;
  model_id: string | null;
  error: null | "DHT_READ" | "MODEL_MISSING" | "MODEL_ERROR" | "OUT_OF_DOMAIN";
};
export type LiveSample = SensorPacket & { receivedAt: number; source: "real" };
export type TrainingRow = {
  schema_version: 1;
  source: "real";
  session_id: string;
  sample_index: number;
  light: number;
  temperature: number;
  humidity: number;
  label: StateLabel;
};
export type ConnectionStatus =
  | "unsupported"
  | "idle"
  | "requesting"
  | "connecting"
  | "subscribing"
  | "waiting"
  | "streaming"
  | "stale"
  | "error"
  | "disconnected";
export type LessonPlan = {
  id: number;
  title: string;
  objectives: string[];
  timeline: { start: number; end: number; title: string; actions: string[] }[];
  opening: string;
  concepts: { term: string; body: string }[];
  practice: string[];
  wiringIds: string[];
  codeFiles: string[];
  failures: { symptom: string; cause: string; fix: string }[];
  teacherPrompts: { question: string; expected: string }[];
  assessments: {
    id: string;
    question: string;
    answer: string;
    criteria: string[];
  }[];
  successCriteria: string[];
  deliverables: string[];
};
