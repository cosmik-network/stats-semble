"use client";

import { useId, useState } from "react";
import styles from "./onboarding.module.css";
import type { SummaryField } from "../lib/shared";

interface Props {
  label: string;
  field: SummaryField;
}

/**
 * One all-time field: label + total, expandable to its ranked per-value list.
 * The summary endpoint returns no user lists, so this stops at counts.
 */
export function SummaryFieldRow({ label, field }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const values = field.values?.length ? field.values : undefined;
  const expandable = values !== undefined;

  return (
    <>
      <button
        type="button"
        className={styles.rowButton}
        onClick={() => setOpen((o) => !o)}
        disabled={!expandable}
        aria-expanded={expandable ? open : undefined}
        aria-controls={expandable && open ? panelId : undefined}
      >
        <span className={styles.rowLeft}>
          <span
            className={`${styles.caret} ${open ? styles.caretOpen : ""}`}
            aria-hidden="true"
          >
            {expandable ? (open ? "▾" : "▸") : ""}
          </span>
          <span className={styles.rowLabel}>{label}</span>
        </span>
        <span className={styles.rowValue}>{field.count.toLocaleString()}</span>
      </button>

      {open && values && (
        <div className={styles.panel} id={panelId}>
          <div className={styles.breakdown}>
            {values.map((v, i) => (
              <div key={`${v.label}-${i}`} className={styles.breakdownRow}>
                <span className={styles.breakdownLabel} title={v.label}>
                  {v.label}
                </span>
                <span className={styles.breakdownCount}>
                  {v.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
