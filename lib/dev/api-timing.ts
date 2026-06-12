const SLOW_MS = 500;

export async function withApiTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (process.env.NODE_ENV !== "development") {
    return fn();
  }
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const ms = Math.round(performance.now() - start);
    if (ms >= SLOW_MS) {
      console.warn(`[api slow ${ms}ms] ${label}`);
    } else {
      console.log(`[api ${ms}ms] ${label}`);
    }
  }
}
