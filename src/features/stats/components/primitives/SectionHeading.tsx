import type { ReactNode } from "react";
import styles from "./primitives.module.css";

interface SectionHeadingProps {
  title: string;
  right?: ReactNode;
}

export function SectionHeading({ title, right }: SectionHeadingProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      {right}
    </div>
  );
}
