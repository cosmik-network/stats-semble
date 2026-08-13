import {
  Card,
  MetricRow,
  SectionHeading,
  StatCell,
  StatRow,
} from "@/features/stats/components/primitives";
import { FIELD_GROUPS } from "../lib/shared";
import { SummaryFieldRow } from "./SummaryFieldRow";
import type { OnboardingSummaryStatsDTO } from "../types";

interface Props {
  data: OnboardingSummaryStatsDTO;
}

// All-time view: numbers only, no per-user drill-down (the summary endpoint
// returns aggregate counts without user lists).
export function OnboardingSummarySection({ data }: Props) {
  return (
    <Card title="onboarding · all time" subtitle="since launch">
      <StatRow>
        <StatCell
          label="total new users"
          value={data.totalNewUserCount.toLocaleString()}
        />
      </StatRow>

      <SectionHeading title="onboarding state" />
      <div>
        {data.onboardingState.stats.map((s) => (
          <MetricRow
            key={s.state}
            label={s.state}
            value={s.totalUserCount.toLocaleString()}
          />
        ))}
      </div>

      {FIELD_GROUPS.map((group) => (
        <div key={group.title}>
          <SectionHeading title={group.title} />
          <div>
            {group.fields.map((f) => (
              <SummaryFieldRow
                key={f.key}
                label={f.label}
                field={f.summary(data)}
              />
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
