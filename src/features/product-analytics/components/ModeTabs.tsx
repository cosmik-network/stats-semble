"use client";

import styles from "@/features/stats/components/primitives/primitives.module.css";

export interface ModeOption {
  key: string;
  label: string;
}

interface Props {
  options: ModeOption[];
  value: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
}

// Generic mini-tab toggle (same look as RangeTabs, arbitrary options).
export function ModeTabs({ options, value, onChange, ariaLabel }: Props) {
  return (
    <div className={styles.miniTabs} role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          onClick={() => onChange(o.key)}
          className={`${styles.miniTab} ${value === o.key ? styles.miniTabActive : ""}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
