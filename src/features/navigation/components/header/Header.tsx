import Logo from "@/assets/semble-logo.svg";
import Image from "next/image";
import Link from "next/link";
import styles from "@/features/stats/components/primitives/primitives.module.css";

export type HeaderTab = "ufo" | "db";

interface Props {
  activeTab: HeaderTab;
}

export default function Header({ activeTab }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Image
          src={Logo.src}
          alt="Semble logo"
          width={28}
          height={28}
          style={{ width: "auto", height: 28 }}
          unoptimized
        />
        <span className={styles.headerTitle}>semble analytics</span>
      </div>
      <nav className={styles.tabs} aria-label="data source">
        <Link
          href="/?tab=db"
          className={`${styles.tab} ${activeTab === "db" ? styles.tabActive : ""}`}
          aria-current={activeTab === "db" ? "page" : undefined}
        >
          db
        </Link>
        <Link
          href="/?tab=ufo"
          className={`${styles.tab} ${activeTab === "ufo" ? styles.tabActive : ""}`}
          aria-current={activeTab === "ufo" ? "page" : undefined}
        >
          ufo
        </Link>
      </nav>
    </header>
  );
}
