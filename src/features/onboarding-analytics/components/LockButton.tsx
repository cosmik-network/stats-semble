"use client";

import { useTransition } from "react";
import styles from "./onboarding.module.css";
import { lockOnboarding } from "../actions";

/** Clears the access cookie, returning the tab to the password prompt. */
export function LockButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={styles.lockButton}
      disabled={pending}
      onClick={() => startTransition(() => lockOnboarding())}
    >
      {pending ? "locking…" : "lock"}
    </button>
  );
}
