"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../i18n/navigation";
import { isNavItemVisible, navItems } from "./menu";
import LogoutButton from "../ui/logout";

export function Sidebar({ userRole }: { userRole: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => isNavItemVisible(item, userRole));

  return (
    <Box
      as="nav"
      w="240px"
      minH="100dvh"
      bg="white"
      borderEndWidth="1px"
      borderColor="gray.200"
      py={6}
      px={3}
      position="sticky"
      top={0}
      display="flex"
      flexDirection="column"
    >
      <Text fontWeight="bold" fontSize="lg" px={3} mb={6} color="blue.600">
        Inventory System
      </Text>
      <VStack gap={1} align="stretch">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.key} href={item.href}>
              <Box
                px={3}
                py={2}
                borderRadius="md"
                fontWeight={isActive ? "semibold" : "normal"}
                bg={isActive ? "blue.50" : "transparent"}
                color={isActive ? "blue.600" : "gray.700"}
                _hover={{ bg: isActive ? "blue.50" : "gray.100" }}
                transition="background 0.15s"
              >
                {t(item.key)}
              </Box>
            </Link>
          );
        })}
      </VStack>
      <Box display="flex" justifyContent="flex-start" p={4} mt="auto">
        <LogoutButton />
      </Box>
    </Box>
  );
}
