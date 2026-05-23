"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../i18n/navigation";
import { isNavItemVisible, navItems } from "./menu";

export function Sidebar({ userRole }: { userRole: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => isNavItemVisible(item, userRole));

  return (
    <Box
      as="nav"
      w="220px"
      position="sticky"
      top="56px"
      h="calc(100dvh - 56px)"
      overflowY="auto"
      bg="white"
      borderEndWidth="1px"
      borderColor="gray.200"
      py={4}
      px={3}
      display="flex"
      flexDirection="column"
      flexShrink={0}
    >
      <VStack gap={1} align="stretch">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.key} href={item.href}>
              <HStack
                px={3}
                py={2}
                borderRadius="md"
                gap={3}
                fontWeight={isActive ? "semibold" : "normal"}
                bg={isActive ? "blue.50" : "transparent"}
                color={isActive ? "blue.600" : "gray.700"}
                _hover={{ bg: isActive ? "blue.50" : "gray.100" }}
                transition="background 0.15s"
              >
                <Box flexShrink={0} color={isActive ? "blue.500" : "gray.400"}>
                  <Icon size={18} />
                </Box>
                <Text fontSize="sm">{t(item.key)}</Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
}
