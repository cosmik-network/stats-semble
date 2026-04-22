export const CATEGORY_COLORS = {
  cards: "#3b82f6",
  collections: "#8b5cf6",
  follows: "#10b981",
  connections: "#06b6d4",
  collectionLinks: "#ec4899",
  contributions: "#f59e0b",
  newUsers: "#f97316",
  active: "#10b981",
  inactive: "#555555",
  deleted: "#ef4444",
  accent: "#1b7340",
} as const;

export type CategoryColorKey = keyof typeof CATEGORY_COLORS;
