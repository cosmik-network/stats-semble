"use client";

import styles from "@/features/stats/components/primitives/primitives.module.css";
import { RANGE_OPTIONS } from "../lib/shared";

interface Props {
  value: string;
  onChange: (key: string) => void;
}

export function RangeTabs({ value, onChange }: Props) {
  return (
    <div className={styles.miniTabs} role="tablist" aria-label="time range">
      {RANGE_OPTIONS.map((r) => (
        <button
          key={r.key}
          type="button"
          role="tab"
          aria-selected={value === r.key}
          onClick={() => onChange(r.key)}
          className={`${styles.miniTab} ${value === r.key ? styles.miniTabActive : ""}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
