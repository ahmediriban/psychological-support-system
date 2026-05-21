import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

type Props = { children: ReactNode; userRole: string };

export function DashboardShell({ children, userRole }: Props) {
  return (
    <Box display="flex" minH="100dvh" bg="gray.50">
      {/* Desktop sidebar */}
      <Box display={{ base: "none", md: "flex" }}>
        <Sidebar userRole={userRole} />
      </Box>

      {/* Main content */}
      <Box flex={1} pb={{ base: "60px", md: 0 }} minW={0}>
        {children}
      </Box>

      {/* Mobile bottom nav */}
      <BottomNav userRole={userRole} />
    </Box>
  );
}
