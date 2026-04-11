"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "emerald",
  primaryShade: {
    light: 7,
    dark: 6,
  },
  colors: {
    emerald: [
      "#e8f6ee",
      "#cfe8d8",
      "#a1d0b0",
      "#70b887",
      "#48a365",
      "#2f9552",
      "#1b7340",
      "#155c33",
      "#104626",
      "#0a2f19",
    ],
  },
  fontFamily:
    'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontFamilyMonospace:
    'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  defaultRadius: "xs",
});
