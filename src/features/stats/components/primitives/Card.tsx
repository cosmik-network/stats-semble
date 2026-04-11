import type { ReactNode } from "react";
import styles from "./primitives.module.css";

interface CardProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}

export function Card({ title, subtitle, right, children }: CardProps) {
  const hasHeader = Boolean(title || subtitle || right);
  return (
    <section className={styles.card}>
      {hasHeader && (
        <header className={styles.cardHeader}>
          <div>
            {title && <div className={styles.cardTitle}>{title}</div>}
            {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
