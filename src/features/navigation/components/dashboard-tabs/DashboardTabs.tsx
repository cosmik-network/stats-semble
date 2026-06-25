"use client";

import { useState, type ReactNode } from "react";
import Header, {
  type HeaderTab,
} from "@/features/navigation/components/header/Header";

interface Props {
  initialTab?: HeaderTab;
  productContent: ReactNode;
  ufoContent: ReactNode;
  dbContent: ReactNode;
  lastUpdated: string;
}

export default function DashboardTabs({
  initialTab = "product",
  productContent,
  ufoContent,
  dbContent,
  lastUpdated,
}: Props) {
  const [tab, setTab] = useState<HeaderTab>(initialTab);

  return (
    <>
      <Header activeTab={tab} onTabChange={setTab} lastUpdated={lastUpdated} />
      {tab === "product"
        ? productContent
        : tab === "ufo"
          ? ufoContent
          : dbContent}
    </>
  );
}
