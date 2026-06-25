"use client";

import styles from "@/features/stats/components/primitives/primitives.module.css";

interface Props {
  label: string; // current week range, e.g. "Jun 15 – Jun 21, 2026"
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

// Forward / backward week navigator. Reused by WAC and funnel summaries.
export function WeekNav({ label, onPrev, onNext, canPrev, canNext }: Props) {
  return (
    <div className={styles.miniTabs} role="group" aria-label="week navigation">
      <button
        type="button"
        className={styles.miniTab}
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="previous week"
        style={{ opacity: canPrev ? 1 : 0.4 }}
      >
        ←
      </button>
      <span
        className={styles.miniTab}
        style={{ cursor: "default", color: "var(--text-hi)" }}
      >
        {label}
      </span>
      <button
        type="button"
        className={styles.miniTab}
        onClick={onNext}
        disabled={!canNext}
        aria-label="next week"
        style={{ opacity: canNext ? 1 : 0.4 }}
      >
        →
      </button>
    </div>
  );
}
