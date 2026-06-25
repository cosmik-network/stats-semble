"use client";

import { useSyncExternalStore, useTransition } from "react";
import styles from "@/features/stats/components/primitives/primitives.module.css";
import { revalidateDashboard } from "@/features/navigation/actions";

interface Props {
  timestamp: string;
}

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

function getSnapshot(): number {
  return Math.floor(Date.now() / 1000);
}

function getServerSnapshot(): null {
  return null;
}

function formatRelative(diffMs: number): string {
  const s = Math.max(0, Math.floor(diffMs / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function LastUpdated({ timestamp }: Props) {
  const [pending, startTransition] = useTransition();
  const nowSeconds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const relative =
    nowSeconds === null
      ? null
      : formatRelative(nowSeconds * 1000 - new Date(timestamp).getTime());
  const label = pending
    ? "refreshing…"
    : relative === null
      ? "updated"
      : `updated ${relative}`;
  // Fixed locale + UTC so SSR and client render identical text (avoids
  // hydration mismatch from differing server/browser locales).
  const absolute = new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  });

  return (
    <button
      type="button"
      className={styles.liveIndicator}
      aria-live="polite"
      aria-label={`refresh data, last updated ${absolute}`}
      title={`click to refresh · last updated ${absolute}`}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await revalidateDashboard();
        })
      }
    >
      <span
        className={`${styles.liveDot} ${pending ? styles.liveDotBusy : ""}`}
        aria-hidden
      />
      <span>{label}</span>
    </button>
  );
}
