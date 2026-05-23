import { Box, Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type Props = { children: ReactNode; userRole: string };

export function DashboardShell({ children, userRole }: Props) {
  return (
    <Box minH="100dvh" bg="gray.50">
      {/* Fixed top header */}
      <Header />

      {/* Below header: sidebar + content */}
      <Flex pt="56px" minH="100dvh">
        {/* Desktop sticky sidebar */}
        <Box display={{ base: "none", md: "block" }}>
          <Sidebar userRole={userRole} />
        </Box>

        {/* Main content */}
        <Box flex={1} pb={{ base: "60px", md: 0 }} minW={0}>
          {children}
        </Box>
      </Flex>

      {/* Mobile bottom nav */}
      <BottomNav userRole={userRole} />
    </Box>
  );
}
