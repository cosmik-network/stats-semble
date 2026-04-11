import styles from "./primitives.module.css";
import { Sparkline } from "./Sparkline";
import type { SparkPoint } from "./sparkline-shared";

export interface MiniLineGridCell {
  name: string;
  color: string;
  points: SparkPoint[];
  formatMax?: (n: number) => string;
}

interface MiniLineGridProps {
  cells: MiniLineGridCell[];
  height?: number;
}

export function MiniLineGrid({ cells, height = 44 }: MiniLineGridProps) {
  return (
    <div className={styles.gridWrap}>
      {cells.map((cell) => {
        const max = cell.points.reduce((m, p) => (p.y > m ? p.y : m), 0);
        const fmt = cell.formatMax ?? ((n: number) => n.toLocaleString());
        return (
          <div key={cell.name} className={styles.cell}>
            <div className={styles.cellLabel}>
              <span
                className={styles.dot}
                style={{ background: cell.color }}
              />
              {cell.name}
              <span className={styles.cellMax}>{fmt(max)}</span>
            </div>
            <Sparkline
              series={[{ color: cell.color, points: cell.points }]}
              height={height}
              sharedScale={false}
              ariaLabel={`${cell.name} trend`}
            />
          </div>
        );
      })}
    </div>
  );
}
