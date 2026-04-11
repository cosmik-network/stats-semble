"use client";

import { useState, type ReactNode } from "react";
import Header, { type HeaderTab } from "@/features/navigation/components/header/Header";

interface Props {
  initialTab?: HeaderTab;
  ufoContent: ReactNode;
  dbContent: ReactNode;
}

export default function DashboardTabs({
  initialTab = "db",
  ufoContent,
  dbContent,
}: Props) {
  const [tab, setTab] = useState<HeaderTab>(initialTab);

  return (
    <>
      <Header activeTab={tab} onTabChange={setTab} />
      {tab === "ufo" ? ufoContent : dbContent}
    </>
  );
}
