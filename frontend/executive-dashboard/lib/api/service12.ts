const API_BASE = process.env.NEXT_PUBLIC_SERVICE12_API_BASE;

export interface TopReturnCause {
  cause: string;
  returns: number;
  percentage: number;
  change: number;
}

type RawTopReturnCause = Record<string, unknown>;

function readNumber(
  source: RawTopReturnCause,
  keys: string[],
  fallback = 0,
): number {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function readString(source: RawTopReturnCause, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "Unknown cause";
}

function unwrapTopReturnCauses(payload: unknown): RawTopReturnCause[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is RawTopReturnCause => {
      return typeof item === "object" && item !== null;
    });
  }

  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const response = payload as Record<string, unknown>;
  const candidates = [
    response.data,
    response.causes,
    response.topReturnCauses,
    response.top_return_causes,
    response.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is RawTopReturnCause => {
        return typeof item === "object" && item !== null;
      });
    }
  }

  return [];
}

export async function getTopReturnCauses(): Promise<TopReturnCause[]> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_SERVICE12_API_BASE is not configured");
  }

  const res = await fetch(
    `${API_BASE}/api/v1/intelligence/analytics/top-return-causes`,
  );

  if (!res.ok) {
    throw new Error("API Error");
  }

  const payload: unknown = await res.json();

  return unwrapTopReturnCauses(payload).map((cause) => ({
    cause: readString(cause, ["cause", "category", "reason", "name", "label"]),
    returns: readNumber(cause, [
      "returns",
      "return_count",
      "returnCount",
      "count",
      "total",
      "value",
    ]),
    percentage: readNumber(cause, ["percentage", "percent", "share", "rate"]),
    change: readNumber(cause, [
      "change",
      "change_percent",
      "changePercent",
      "delta",
      "trend",
    ]),
  }));
}
