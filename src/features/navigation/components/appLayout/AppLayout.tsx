import { AppShell, AppShellMain } from "@mantine/core";

interface Props {
  children: React.ReactNode;
}

export default async function AppLayout(props: Props) {
  return (
    <AppShell>
      <AppShellMain>{props.children}</AppShellMain>
    </AppShell>
  );
}
