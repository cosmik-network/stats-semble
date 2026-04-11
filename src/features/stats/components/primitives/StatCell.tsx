import type { ReactNode } from "react";
import styles from "./primitives.module.css";

interface StatCellProps {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  dimDelta?: boolean;
}

export function StatCell({ label, value, delta, dimDelta }: StatCellProps) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      {delta !== undefined && (
        <div className={dimDelta ? styles.statDeltaDim : styles.statDelta}>
          {delta}
        </div>
      )}
    </div>
  );
}

interface StatRowProps {
  children: ReactNode;
}

export function StatRow({ children }: StatRowProps) {
  return <div className={styles.statRow}>{children}</div>;
}
