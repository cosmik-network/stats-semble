"use server";

import { updateTag } from "next/cache";

export async function revalidateDashboard(): Promise<void> {
  updateTag("dashboard");
}
