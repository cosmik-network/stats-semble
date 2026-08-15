"use client";

import { useState, type ReactNode } from "react";
import Header, {
  type HeaderTab,
} from "@/features/navigation/components/header/Header";

interface Props {
  initialTab?: HeaderTab;
  productContent: ReactNode;
  onboardingContent: ReactNode;
  apiContent: ReactNode;
  ufoContent: ReactNode;
  dbContent: ReactNode;
  lastUpdated: string;
}

export default function DashboardTabs({
  initialTab = "product",
  productContent,
  onboardingContent,
  apiContent,
  ufoContent,
  dbContent,
  lastUpdated,
}: Props) {
  const [tab, setTab] = useState<HeaderTab>(initialTab);

  const content: Record<HeaderTab, ReactNode> = {
    product: productContent,
    onboarding: onboardingContent,
    api: apiContent,
    ufo: ufoContent,
    db: dbContent,
  };

  return (
    <>
      <Header activeTab={tab} onTabChange={setTab} lastUpdated={lastUpdated} />
      {content[tab]}
    </>
  );
}
