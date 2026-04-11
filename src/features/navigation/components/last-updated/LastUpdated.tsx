"use client";

import { useSyncExternalStore } from "react";
import styles from "@/features/stats/components/primitives/primitives.module.css";

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
  const nowSeconds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const label =
    nowSeconds === null
      ? "updated"
      : `updated ${formatRelative(nowSeconds * 1000 - new Date(timestamp).getTime())}`;
  const absolute = new Date(timestamp).toLocaleString();

  return (
    <div
      className={styles.liveIndicator}
      aria-live="polite"
      title={`last updated ${absolute}`}
    >
      <span className={styles.liveDot} aria-hidden />
      <span>{label}</span>
    </div>
  );
}
