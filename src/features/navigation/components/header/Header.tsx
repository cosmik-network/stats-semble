"use client";

import Logo from "@/assets/semble-logo.svg";
import Image from "next/image";
import styles from "@/features/stats/components/primitives/primitives.module.css";
import LastUpdated from "@/features/navigation/components/last-updated/LastUpdated";

export type HeaderTab = "product" | "onboarding" | "ufo" | "db";

interface Props {
  activeTab: HeaderTab;
  onTabChange: (tab: HeaderTab) => void;
  lastUpdated: string;
}

export default function Header({ activeTab, onTabChange, lastUpdated }: Props) {
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
        <div className={styles.headerTitleGroup}>
          <span className={styles.headerTitle}>semble analytics</span>
          <LastUpdated timestamp={lastUpdated} />
        </div>
      </div>
      <nav className={styles.tabs} aria-label="data source">
        <button
          type="button"
          onClick={() => onTabChange("product")}
          className={`${styles.tab} ${activeTab === "product" ? styles.tabActive : ""}`}
          aria-current={activeTab === "product" ? "page" : undefined}
        >
          product
        </button>
        <button
          type="button"
          onClick={() => onTabChange("onboarding")}
          className={`${styles.tab} ${activeTab === "onboarding" ? styles.tabActive : ""}`}
          aria-current={activeTab === "onboarding" ? "page" : undefined}
        >
          onboarding
        </button>
        <button
          type="button"
          onClick={() => onTabChange("db")}
          className={`${styles.tab} ${activeTab === "db" ? styles.tabActive : ""}`}
          aria-current={activeTab === "db" ? "page" : undefined}
        >
          db
        </button>
        <button
          type="button"
          onClick={() => onTabChange("ufo")}
          className={`${styles.tab} ${activeTab === "ufo" ? styles.tabActive : ""}`}
          aria-current={activeTab === "ufo" ? "page" : undefined}
        >
          ufo
        </button>
      </nav>
    </header>
  );
}
