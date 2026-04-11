import styles from "./primitives.module.css";

export interface BarTimelinePoint {
  label: string;
  value: number;
}

interface BarTimelineProps {
  data: BarTimelinePoint[];
  color?: string;
  height?: number;
  formatTooltip?: (p: BarTimelinePoint) => string;
}

export function BarTimeline({
  data,
  color = "var(--accent)",
  height = 60,
  formatTooltip = (p) => `${p.label}: ${p.value.toLocaleString()}`,
}: BarTimelineProps) {
  const max = data.reduce((m, p) => (p.value > m ? p.value : m), 0);
  return (
    <div className={styles.barTimeline} style={{ height }}>
      {data.map((p, i) => {
        const h = max > 0 ? Math.max((p.value / max) * 100, 3) : 3;
        return (
          <div
            key={`${p.label}-${i}`}
            className={styles.barStack}
            style={{ height: `${h}%`, background: color }}
            title={formatTooltip(p)}
          />
        );
      })}
    </div>
  );
}
