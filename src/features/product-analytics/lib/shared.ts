// Shared formatting + week-navigation helpers for product analytics.

// Rung / metric colors (top -> bottom of the funnel).
export const PA_COLORS = {
  wac: "#5b8def",
  signup: "#5b8def",
  save: "#a07bf0",
  enrich: "#3ec97a",
  inbound: "#f0b65b",
  // WAC metric cuts
  collectionOrConnection: "#5b8def",
  collectionAdd: "#a07bf0",
  connection: "#3ec97a",
  othersCollectionAdd: "#f0b65b",
} as const;

export interface Delta {
  abs: number; // now - prev
  pct: number | null; // percentage change vs prev; null when prev is 0
  dir: "up" | "down" | "flat";
}

export function computeDelta(now: number, prev: number | undefined): Delta {
  if (prev === undefined) return { abs: 0, pct: null, dir: "flat" };
  const abs = now - prev;
  const pct = prev === 0 ? null : (abs / prev) * 100;
  const dir = abs > 0 ? "up" : abs < 0 ? "down" : "flat";
  return { abs, pct, dir };
}

// "▲ 4.2%" / "▼ 3" style label. unit "pct" => percentage of prev, "pts" =>
// absolute point difference (for percentage-of-signups comparisons).
export function formatDelta(d: Delta, unit: "pct" | "pts" = "pct"): string {
  const arrow = d.dir === "up" ? "▲" : d.dir === "down" ? "▼" : "–";
  if (unit === "pts") {
    return `${arrow} ${Math.abs(d.abs).toFixed(1)} pts`;
  }
  if (d.pct === null) return `${arrow} —`;
  return `${arrow} ${Math.abs(d.pct).toFixed(1)}%`;
}

// ISO week-start (e.g. "2026-06-15") -> "Jun 15" (UTC, avoids tz drift).
export function formatWeekShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ISO week-start -> "Jun 15 – Jun 21, 2026" (the Mon–Sun window).
export function formatWeekRange(iso: string): string {
  const start = new Date(iso);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  const startStr = start.toLocaleDateString("en-US", opts);
  const endStr = end.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

// Range options for the historical charts.
export interface RangeOption {
  key: string;
  label: string;
  weeks: number; // 0 => all-time
}

export const RANGE_OPTIONS: RangeOption[] = [
  { key: "12w", label: "12w", weeks: 12 },
  { key: "26w", label: "26w", weeks: 26 },
  { key: "52w", label: "52w", weeks: 52 },
  { key: "all", label: "all", weeks: 0 },
];
