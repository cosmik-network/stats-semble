import type { ReactNode } from "react";
import styles from "./primitives.module.css";

interface MetricRowProps {
  label: ReactNode;
  value: ReactNode;
  secondary?: ReactNode;
  color?: string;
  barFraction?: number;
}

export function MetricRow({
  label,
  value,
  secondary,
  color,
  barFraction,
}: MetricRowProps) {
  return (
    <div className={styles.metricRow}>
      <div className={styles.metricLeft}>
        {color && <span className={styles.dot} style={{ background: color }} />}
        <span className={styles.metricLabel}>{label}</span>
      </div>
      {barFraction !== undefined && (
        <div className={styles.metricBar}>
          <div
            className={styles.metricBarFill}
            style={{
              width: `${Math.max(0, Math.min(100, barFraction * 100))}%`,
              background: color ?? "var(--accent)",
            }}
          />
        </div>
      )}
      <span className={styles.metricValue}>
        {value}
        {secondary !== undefined && (
          <span className={styles.metricSecondary}>{secondary}</span>
        )}
      </span>
    </div>
  );
}
