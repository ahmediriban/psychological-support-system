"use client";

import { Box, Grid, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../i18n/navigation";
import { isNavItemVisible, navItems } from "./menu";

export function BottomNav({ userRole }: { userRole: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => isNavItemVisible(item, userRole));

  return (
    <Box
      as="nav"
      position="fixed"
      bottom={0}
      insetStart={0}
      insetEnd={0}
      h="60px"
      bg="white"
      borderTopWidth="1px"
      borderColor="gray.200"
      zIndex="sticky"
      display={{ base: "flex", md: "none" }}
      alignItems="stretch"
    >
      <Grid templateColumns={`repeat(${visibleItems.length}, 1fr)`} w="full">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.key} href={item.href} style={{ display: "flex" }}>
              <Box
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color={isActive ? "blue.600" : "gray.500"}
                fontWeight={isActive ? "semibold" : "normal"}
                fontSize="xs"
                borderTopWidth="2px"
                borderTopColor={isActive ? "blue.500" : "transparent"}
              >
                <Text>{t(item.key)}</Text>
              </Box>
            </Link>
          );
        })}
      </Grid>
    </Box>
  );
}
