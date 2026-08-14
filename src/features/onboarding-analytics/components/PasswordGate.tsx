"use client";

import { useActionState } from "react";
import { Card } from "@/features/stats/components/primitives";
import styles from "./onboarding.module.css";
import { unlockOnboarding, type UnlockResult } from "../actions";

/**
 * Password prompt shown in place of the onboarding content. The submitted value
 * is checked in a Server Action — the real password never reaches the browser,
 * and no onboarding data is fetched until the cookie is set.
 */
export function PasswordGate() {
  const [state, formAction, pending] = useActionState<
    UnlockResult | undefined,
    FormData
  >(unlockOnboarding, undefined);

  return (
    <Card title="onboarding" subtitle="password required">
      <form action={formAction} className={styles.gateForm}>
        <label className={styles.gateLabel} htmlFor="onboarding-password">
          password
        </label>
        <div className={styles.gateRow}>
          <input
            id="onboarding-password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            className={styles.gateInput}
            aria-describedby={state?.error ? "onboarding-password-error" : undefined}
            aria-invalid={state?.error ? true : undefined}
          />
          <button
            type="submit"
            className={styles.gateButton}
            disabled={pending}
          >
            {pending ? "checking…" : "unlock"}
          </button>
        </div>
        {state?.error && (
          <div id="onboarding-password-error" role="alert" className={styles.gateError}>
            {state.error}
          </div>
        )}
      </form>
    </Card>
  );
}
