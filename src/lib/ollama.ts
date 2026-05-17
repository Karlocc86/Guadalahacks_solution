import type { IntentResult, ContextType } from '../types/domain';

const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'gemma3:4b';
const OLLAMA_TIMEOUT_MS = 15_000;

const SYSTEM_PROMPT =
  'Eres un clasificador semántico de intenciones e identificador de riesgos exclusivo para la aplicación SOS360. Tu única tarea es analizar el mensaje en español del usuario y categorizarlo.\n' +
  'REGLAS ABSOLUTAS:\n' +
  '1. Tienes PROHIBIDO responder con texto libre, consejos, introducciones o saludos.\n' +
  '2. Tienes PROHIBIDO hablar en portugués o inglés. Toda tu lógica interna procesa en español.\n' +
  '3. Responde EXCLUSIVAMENTE con un objeto JSON plano, sin formato markdown (NO uses bloques de código ```json ni ```).\n' +
  'Formato estricto de salida JSON:\n' +
  '{"intent_detected": "desmayo" | "cambio_llanta" | "fractura_brazo" | "quemadura" | "desconocido", "urgency_level": "CRITICAL" | "STANDARD"}\n' +
  'Mapeo de ejemplos para tu entrenamiento instantáneo:\n' +
  "- 'Me caí, me golpeé la cabeza' o 'Alguien se desmayó' -> {\"intent_detected\": \"desmayo\", \"urgency_level\": \"CRITICAL\"}\n" +
  "- 'Se ponchó mi neumático en la calle' -> {\"intent_detected\": \"cambio_llanta\", \"urgency_level\": \"STANDARD\"}\n" +
  "- 'Me quemé la mano con agua hirviendo' -> {\"intent_detected\": \"quemadura\", \"urgency_level\": \"CRITICAL\"}\n" +
  "- 'Se me rompió el brazo' -> {\"intent_detected\": \"fractura_brazo\", \"urgency_level\": \"CRITICAL\"}\n" +
  'Si no entiendes la situación o no encaja en las categorías, devuelve {"intent_detected": "desconocido", "urgency_level": "STANDARD"}. No inventes nada más.';

type OllamaRaw = { intent_detected: string; urgency_level: string };

const VALID_INTENTS = ['desmayo', 'cambio_llanta', 'fractura_brazo', 'quemadura', 'desconocido'];
const VALID_URGENCY = ['CRITICAL', 'STANDARD'];

export async function detectIntent(
  text: string,
  _source?: 'text' | 'camera'
): Promise<IntentResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        stream: false,
        options: { temperature: 0 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return fallbackIntent(text);

    const data = await res.json() as { message?: { content?: string } };
    const raw = data.message?.content ?? '';
    const result = parseIntentResponse(raw);

    if (import.meta.env.DEV) {
      console.log('[Ollama raw response]:', raw);
      console.log('[Ollama parsed]:', result);
    }

    return result;
  } catch {
    clearTimeout(timeoutId);
    return fallbackIntent(text);
  }
}

function parseIntentResponse(raw: string): IntentResult {
  const FALLBACK: IntentResult = {
    severity: 'standard',
    contextType: 'general',
    summary: '',
    confidence: 0.5,
  };

  const cleaned = raw
    .trim()
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (isValidOllamaRaw(parsed)) return mapToIntentResult(parsed);
  } catch { /* continue */ }

  const match = cleaned.match(/\{[\s\S]*?\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]) as unknown;
      if (isValidOllamaRaw(parsed)) return mapToIntentResult(parsed);
    } catch { /* continue */ }
  }

  return FALLBACK;
}

function isValidOllamaRaw(obj: unknown): obj is OllamaRaw {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o['intent_detected'] === 'string' &&
    typeof o['urgency_level'] === 'string' &&
    VALID_INTENTS.includes(o['intent_detected']) &&
    VALID_URGENCY.includes(o['urgency_level'])
  );
}

const CARD_MAP: Record<string, string> = {
  desmayo: 'desmayo',
  fractura_brazo: 'fractura',
  quemadura: 'quemadura',
  cambio_llanta: 'llanta',
};

function mapToIntentResult(raw: OllamaRaw): IntentResult {
  const contextMap: Record<string, ContextType> = {
    desmayo: 'medical',
    fractura_brazo: 'medical',
    quemadura: 'medical',
    cambio_llanta: 'navigation',
    desconocido: 'general',
  };
  return {
    severity: raw.urgency_level === 'CRITICAL' ? 'emergency' : 'standard',
    contextType: contextMap[raw.intent_detected] ?? 'general',
    summary: '',
    confidence: 0.85,
    matchedCardId: CARD_MAP[raw.intent_detected],
  };
}

function fallbackIntent(text: string): IntentResult {
  const lower = text.toLowerCase();
  const isEmergency =
    /desmay|paro|ahog|incons|accidente|herido|sangr|emergen|crítico/.test(lower);
  return {
    severity: isEmergency ? 'emergency' : 'standard',
    contextType: 'general',
    summary: '',
    confidence: 0.5,
  };
}

export async function checkOllamaHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3_000);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}
