/** Strip model thinking tokens from streaming output */
export function stripThinkingTokens(text: string): string {
  return text
    .replace(/<\|channel\|?>[\s\S]*?(?=\n|$|<)/g, "")
    .replace(/<channel\|?>[\s\S]*?(?=\n|$|<)/g, "")
    .replace(/\|channel\|?>[\s\S]*?(?=\n|$|<)/g, "")
    .replace(/<\|channel[^\n<]*/g, "")
    .replace(/<channel[^\n<]*/g, "")
    .replace(/\|channel[^\n<]*/g, "");
}

/** Simple in-memory rate limiter */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

/** Cleanup stale rate limit entries periodically */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 60_000);
}
