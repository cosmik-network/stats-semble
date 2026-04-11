import type { CSSProperties, ReactNode } from "react";
import styles from "./primitives.module.css";

interface SectionHeadingProps {
  title: string;
  right?: ReactNode;
  color?: string;
}

export function SectionHeading({ title, right, color }: SectionHeadingProps) {
  const titleStyle: CSSProperties | undefined = color ? { color } : undefined;
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle} style={titleStyle}>
        {title}
      </div>
      {right}
    </div>
  );
}
