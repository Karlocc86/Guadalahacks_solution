import type { VisionResult } from '../types/domain';

const FLASK_BASE_URL = 'http://localhost:5000';
const VISION_TIMEOUT_MS = 10_000;

export async function analyzeImage(imageFile: File | Blob): Promise<VisionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await fetch(`${FLASK_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { detections: [], severity: 'unknown', injected_text: '' };

    const data = await res.json() as {
      detections?: Array<{ label: string; confidence: number; bbox: [number, number, number, number] }>;
      severity?: string;
      injected_text?: string;
    };

    const severity: VisionResult['severity'] =
      data.severity === 'emergency' ? 'emergency' :
      data.severity === 'standard'  ? 'standard'  : 'unknown';

    return {
      detections: data.detections ?? [],
      severity,
      injected_text: data.injected_text ?? '',
    };
  } catch {
    clearTimeout(timeoutId);
    return { detections: [], severity: 'unknown', injected_text: '' };
  }
}
