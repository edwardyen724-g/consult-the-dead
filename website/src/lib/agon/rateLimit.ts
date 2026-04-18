const FREE_LIMIT_PER_DAY = 3;

interface UsageEntry {
  count: number;
  date: string;
}

const usageMap = new Map<string, UsageEntry>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function checkFreeRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const d = today();
  const entry = usageMap.get(ip);
  if (!entry || entry.date !== d) {
    return { allowed: true, remaining: FREE_LIMIT_PER_DAY };
  }
  const remaining = FREE_LIMIT_PER_DAY - entry.count;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

export function incrementFreeUsage(ip: string): void {
  const d = today();
  const entry = usageMap.get(ip);
  if (!entry || entry.date !== d) {
    usageMap.set(ip, { count: 1, date: d });
  } else {
    entry.count++;
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}
