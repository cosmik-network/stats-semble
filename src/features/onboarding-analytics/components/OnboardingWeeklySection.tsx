"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  Card,
  SectionHeading,
  StatCell,
  StatRow,
} from "@/features/stats/components/primitives";
import { formatWeekRange, formatWeekShort } from "@/features/product-analytics/lib/shared";
import { WeekNav } from "@/features/product-analytics/components/WeekNav";
import { fetchOnboardingWeek } from "../actions";
import { FIELD_GROUPS, shiftWeek } from "../lib/shared";
import { FieldRow } from "./FieldRow";
import { OnboardingFunnel } from "./OnboardingFunnel";
import type { OnboardingWeeklyStatsDTO } from "../types";

interface Props {
  initialData: OnboardingWeeklyStatsDTO;
  /** Rendered beside the week navigator (the lock button, when gated). */
  headerAction?: ReactNode;
}

export function OnboardingWeeklySection({ initialData, headerAction }: Props) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // The most recent completed week is what the server returned initially — it
  // bounds forward navigation.
  const [latestWeek] = useState(initialData.cohortWeekStart);
  const atLatest = data.cohortWeekStart >= latestWeek;

  const goToWeek = (deltaWeeks: number) => {
    const target = shiftWeek(data.cohortWeekStart, deltaWeeks);
    startTransition(async () => {
      try {
        const next = await fetchOnboardingWeek(target);
        setData(next);
        setError(null);
      } catch {
        setError("failed to load week");
      }
    });
  };

  return (
    <Card
      title="onboarding · weekly cohort"
      subtitle={`signups week of ${formatWeekRange(data.cohortWeekStart)}`}
      right={
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <WeekNav
            label={formatWeekShort(data.cohortWeekStart)}
            onPrev={() => goToWeek(-1)}
            onNext={() => goToWeek(1)}
            canPrev={!pending}
            canNext={!pending && !atLatest}
          />
          {headerAction}
        </div>
      }
    >
      <StatRow>
        <StatCell
          label="new users this week"
          value={data.weeklyNewUsersCount.toLocaleString()}
        />
        <StatCell
          label="total since launch"
          value={data.totalNewUserCount.toLocaleString()}
        />
      </StatRow>

      {error && (
        <div style={{ fontSize: 11, color: "#ef5b6b" }}>{error}</div>
      )}

      <div style={{ opacity: pending ? 0.5 : 1 }}>
        <SectionHeading
          title="progression"
          right={
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
              % of this week&apos;s new users
            </span>
          }
        />
        <OnboardingFunnel data={data} />

        <SectionHeading title="onboarding state" />
        <div>
          {data.onboardingState.stats.map((s) => (
            <FieldRow
              key={s.state}
              label={s.state}
              field={{ count: s.weeklyUserCount, users: s.weeklyUsers }}
            />
          ))}
        </div>

        {FIELD_GROUPS.map((group) => (
          <div key={group.title}>
            <SectionHeading title={group.title} />
            <div>
              {group.fields.map((f) => (
                <FieldRow key={f.key} label={f.label} field={f.weekly(data)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
