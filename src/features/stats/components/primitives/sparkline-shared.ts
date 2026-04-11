export interface SparkPoint {
  x: number;
  y: number;
  label?: string;
}

export interface SparkSeries {
  color: string;
  points: SparkPoint[];
  filled?: boolean;
  strokeWidth?: number;
}

export interface SparkGeometry {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  chartW: number;
  chartH: number;
}

export function computeGeometry(
  width: number,
  height: number,
  pad = 2,
): SparkGeometry {
  const padding = { top: pad, right: pad, bottom: pad, left: pad };
  return {
    width,
    height,
    padding,
    chartW: width - padding.left - padding.right,
    chartH: height - padding.top - padding.bottom,
  };
}

export function projectPoints(
  points: SparkPoint[],
  geom: SparkGeometry,
  max: number,
  min: number = 0,
): { x: number; y: number; raw: SparkPoint }[] {
  const { chartW, chartH, padding } = geom;
  const range = max - min || 1;
  const n = points.length;
  return points.map((p, i) => ({
    x: padding.left + (n <= 1 ? 0 : (i / (n - 1)) * chartW),
    y: padding.top + chartH - ((p.y - min) / range) * chartH,
    raw: p,
  }));
}

export function seriesMax(series: SparkSeries[]): number {
  let m = 0;
  for (const s of series) {
    for (const p of s.points) {
      if (p.y > m) m = p.y;
    }
  }
  return m;
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  let step: number;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * pow;
}

export function niceTicks(max: number, count = 4): { ticks: number[]; niceMax: number } {
  if (max <= 0) return { ticks: [0], niceMax: 1 };
  const step = niceStep(max / count);
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax + step / 2; v += step) ticks.push(v);
  return { ticks, niceMax };
}

export function polygonPoints(
  projected: { x: number; y: number }[],
  geom: SparkGeometry,
): string {
  if (projected.length === 0) return "";
  const baselineY = geom.padding.top + geom.chartH;
  const first = projected[0];
  const last = projected[projected.length - 1];
  const parts: string[] = [`${first.x},${baselineY}`];
  for (const p of projected) parts.push(`${p.x},${p.y}`);
  parts.push(`${last.x},${baselineY}`);
  return parts.join(" ");
}

export function linePoints(projected: { x: number; y: number }[]): string {
  return projected.map((p) => `${p.x},${p.y}`).join(" ");
}
