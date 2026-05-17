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
  | 'offline';

export type SpeechStatus =
  | 'inactive'
  | 'requesting'
  | 'listening'
  | 'processing'
  | 'error'
  | 'unsupported';
