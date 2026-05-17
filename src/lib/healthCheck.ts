const HEALTH_TIMEOUT_MS = 3_000;

async function pingService(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return true;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

async function pingFlask(): Promise<boolean> {
  for (const path of ['/health', '/']) {
    if (await pingService(`http://localhost:5000${path}`)) return true;
  }
  return false;
}

export async function checkServices(): Promise<{ ollama: boolean; flask: boolean }> {
  const [ollama, flask] = await Promise.all([
    pingService('http://localhost:11434/api/tags'),
    pingFlask(),
  ]);
  return { ollama, flask };
}
