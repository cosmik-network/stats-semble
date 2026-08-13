"use client";

import { useId, useState } from "react";
import styles from "./onboarding.module.css";
import type { BreakdownEntry, WeeklyField } from "../lib/shared";
import type { OnboardingMinimalProfileDTO } from "../types";

interface Props {
  label: string;
  field: WeeklyField;
}

function UserList({ users }: { users: OnboardingMinimalProfileDTO[] }) {
  return (
    <ul className={styles.userList}>
      {users.map((u) => (
        <li key={u.id} className={styles.user}>
          <span className={styles.userHandle}>
            {u.handle ? `@${u.handle}` : u.name || u.id}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One value within a breakdown (a topic, intent, link…): its count, expandable
 * to the users who chose it.
 */
function BreakdownRow({ entry }: { entry: BreakdownEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const expandable = entry.users.length > 0;

  return (
    <>
      <button
        type="button"
        className={`${styles.rowButton} ${styles.nestedRow}`}
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
          <span className={styles.rowLabel} title={entry.label}>
            {entry.label}
          </span>
        </span>
        <span className={styles.rowValue}>{entry.count.toLocaleString()}</span>
      </button>

      {open && expandable && (
        <div className={`${styles.panel} ${styles.nestedPanel}`} id={panelId}>
          <UserList users={entry.users} />
        </div>
      )}
    </>
  );
}

/**
 * One weekly field: label + user count, expandable to reveal the per-value
 * breakdown (each value itself expandable to its users), or — for dimensions
 * with no breakdown — the users directly.
 */
export function FieldRow({ label, field }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const hasUsers = field.users.length > 0;
  const breakdown = field.breakdown?.length ? field.breakdown : undefined;
  const expandable = hasUsers || breakdown !== undefined;

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

      {open && expandable && (
        <div className={styles.panel} id={panelId}>
          {breakdown ? (
            // Breakdown dimensions drill down per value rather than listing
            // every user of the dimension at once.
            <div className={styles.breakdown}>
              {breakdown.map((e, i) => (
                <BreakdownRow key={`${e.label}-${i}`} entry={e} />
              ))}
            </div>
          ) : hasUsers ? (
            <div>
              <div className={styles.panelHeading}>
                users ({field.users.length})
              </div>
              <UserList users={field.users} />
            </div>
          ) : (
            <div className={styles.panelEmpty}>no users listed</div>
          )}
        </div>
      )}
    </>
  );
}
