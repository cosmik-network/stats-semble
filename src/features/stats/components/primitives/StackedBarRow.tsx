import styles from "./primitives.module.css";

export interface StackedSegment {
  label: string;
  value: number;
  color: string;
}

interface StackedBarRowProps {
  segments: StackedSegment[];
  showLegend?: boolean;
  formatValue?: (n: number) => string;
}

export function StackedBarRow({
  segments,
  showLegend = true,
  formatValue = (n) => n.toLocaleString(),
}: StackedBarRowProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className={styles.stackedRow}>
      <div className={styles.stackedBar}>
        {segments.map((s, i) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <div
              key={`${s.label}-${i}`}
              className={styles.stackedSeg}
              style={{ width: `${pct}%`, background: s.color }}
              title={`${s.label}: ${formatValue(s.value)}`}
            />
          );
        })}
      </div>
      {showLegend && (
        <div className={styles.stackedLegend}>
          {segments.map((s, i) => (
            <div key={`${s.label}-${i}`} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: s.color }} />
              <span>{s.label}</span>
              <span className={styles.legendValue}>{formatValue(s.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
