import Logo from "@/assets/semble-logo.svg";
import { Group, Image, Stack, Text } from "@mantine/core";

export default function Header() {
  return (
    <Group gap={"xs"}>
      <Image src={Logo.src} alt="Semble logo" w={"auto"} h={40} />
      <Stack gap={0}>
        <Text fw={700} fz={"sm"}>
          Semble Analytics
        </Text>
        <Text fw={600} fz={"sm"} c={"gray"}>
          Latest stats
        </Text>
      </Stack>
    </Group>
  );
}
