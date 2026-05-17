export type RiskLevel = 'low' | 'medium' | 'high';

export type ContextType =
  | 'medical'
  | 'legal'
  | 'security'
  | 'navigation'
  | 'general';

export type UIMode =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'responding'
  | 'error'
  | 'offline'
  | 'emergency';

export type AppView = 'feed' | 'detail' | 'categories' | 'category_detail';

export type CardSeverity = 'critical' | 'normal';

export type CardTint = 'red' | 'amber' | 'zinc';

export interface TriageQuestion {
  q: string;
  opts: string[];
}

export interface CardVerdict {
  level: string;
  title: string;
  body: string;
}

export interface YOLODetection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface VisionResult {
  detections: YOLODetection[];
  severity: 'emergency' | 'standard' | 'unknown';
  injected_text: string;
}

export interface IntentResult {
  severity: 'emergency' | 'standard';
  contextType: ContextType;
  summary: string;
  confidence: number;
  matchedCardId?: string;
}

export interface Card {
  id: string;
  title: string;
  category: string;
  severity: CardSeverity;
  blurb: string;
  icon: string;
  tint: CardTint;
  eta: string;
  steps: string[];
  long: string;
  triage: TriageQuestion[];
  verdict: CardVerdict;
}
