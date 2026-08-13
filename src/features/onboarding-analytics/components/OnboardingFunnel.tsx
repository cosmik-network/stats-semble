"use client";

import styles from "@/features/stats/components/primitives/primitives.module.css";
import { FUNNEL_STEPS } from "../lib/shared";
import type { OnboardingWeeklyStatsDTO } from "../types";

interface Props {
  data: OnboardingWeeklyStatsDTO;
}

/**
 * Quick visual reference for how far the week's signups got. Percentages are of
 * that week's new users; steps are independent, so a value can exceed 100% if
 * users acted outside the cohort week.
 */
export function OnboardingFunnel({ data }: Props) {
  const base = data.weeklyNewUsersCount;

  return (
    <div>
      {FUNNEL_STEPS.map((step) => {
        const value = step.value(data);
        const pct = base > 0 ? (value / base) * 100 : 0;
        const isBase = step.key === "newUsers";

        return (
          <div key={step.key}>
            <div className={styles.metricRow} style={{ borderBottom: "none" }}>
              <div className={styles.metricLeft}>
                <span
                  className={styles.dot}
                  style={{ background: step.color }}
                />
                <span className={styles.metricLabel}>{step.label}</span>
              </div>
              <span
                className={styles.metricValue}
                style={{ color: step.color }}
              >
                {isBase ? value.toLocaleString() : `${pct.toFixed(0)}%`}
              </span>
            </div>
            <div
              className={styles.metricRow}
              style={{
                paddingTop: 0,
                borderBottom: "none",
                fontSize: 11,
                color: "var(--text-mid)",
              }}
            >
              <span>
                {value.toLocaleString()} {isBase ? "signed up" : "users"}
              </span>
            </div>
            <div
              className={styles.metricBar}
              style={{ margin: "0 0 8px", height: 7 }}
            >
              <div
                style={{
                  width: `${Math.min(pct, 100).toFixed(2)}%`,
                  height: "100%",
                  background: step.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
