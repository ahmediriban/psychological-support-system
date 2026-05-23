"use client";

import { Box, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { useLocale } from "next-intl";
import { MdLogout, MdLanguage } from "react-icons/md";
import { authClient } from "../../lib/auth/client";
import { useRouter, usePathname } from "../../i18n/navigation";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const nextLocale = locale === "ar" ? "en" : "ar";

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
    // router.push("/login");
  }

  function handleLocaleSwitch() {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      insetStart={0}
      insetEnd={0}
      h="56px"
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
      zIndex="sticky"
      px={{ base: 4, md: 6 }}
    >
      <Flex h="full" align="center" justify="space-between">
        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color="blue.600">
          Inventory System
        </Text>

        <HStack gap={1}>
          <IconButton
            aria-label="Switch language"
            variant="ghost"
            colorPalette="gray"
            size="sm"
            onClick={handleLocaleSwitch}
            title={nextLocale === "ar" ? "العربية" : "English"}
          >
            <MdLanguage size={20} />
          </IconButton>

          <IconButton
            aria-label="Logout"
            variant="ghost"
            colorPalette="red"
            size="sm"
            onClick={handleLogout}
          >
            <MdLogout size={20} />
          </IconButton>
        </HStack>
      </Flex>
    </Box>
  );
}
