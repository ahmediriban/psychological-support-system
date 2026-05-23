"use client";

import {
  Box,
  Button,
  Field,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  MdEmail,
  MdInventory2,
  MdLanguage,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { usePathname, useRouter } from "../../i18n/navigation";

async function loginRequest(email: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  return data;
}

export function LoginForm() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: () => loginRequest(email, password),
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate();
  }

  function handleLocaleSwitch() {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Box minH="100dvh" bg="gray.50" position="relative">
      {/* Language switcher — top corner */}
      <Flex position="absolute" top={4} insetEnd={4}>
        <Button
          variant="ghost"
          size="sm"
          colorPalette="gray"
          onClick={handleLocaleSwitch}
          gap={1.5}
        >
          <MdLanguage size={16} />
          {t("switchLang")}
        </Button>
      </Flex>

      {/* Centered card */}
      <Flex minH="100dvh" align="center" justify="center" px={4}>
        <Box w="full" maxW="400px">
          {/* Logo / brand */}
          <Flex direction="column" align="center" mb={8} gap={3}>
            <Flex
              w="56px"
              h="56px"
              borderRadius="xl"
              bg="blue.600"
              align="center"
              justify="center"
              boxShadow="lg"
            >
              <MdInventory2 size={28} color="white" />
            </Flex>
            <Stack gap={1} align="center">
              <Text fontWeight="bold" fontSize="xl" color="gray.800">
                {t("title")}
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                {t("subtitle")}
              </Text>
            </Stack>
          </Flex>

          {/* Card */}
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="lg"
            p={{ base: 6, md: 8 }}
            borderWidth="1px"
            borderColor="gray.100"
          >
            <form onSubmit={handleSubmit}>
              <Stack gap={5}>
                {/* Email */}
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight="medium" color="gray.700">
                    {t("email")}
                  </Field.Label>
                  <InputGroup startElement={<MdEmail size={16} color="var(--chakra-colors-gray-400)" />}>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      borderRadius="lg"
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                    />
                  </InputGroup>
                </Field.Root>

                {/* Password */}
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight="medium" color="gray.700">
                    {t("password")}
                  </Field.Label>
                  <InputGroup
                    startElement={<MdLock size={16} color="var(--chakra-colors-gray-400)" />}
                    endElement={
                      <IconButton
                        aria-label="Toggle password"
                        variant="ghost"
                        size="xs"
                        colorPalette="gray"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showPassword
                          ? <MdVisibilityOff size={16} />
                          : <MdVisibility size={16} />
                        }
                      </IconButton>
                    }
                  >
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      borderRadius="lg"
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                    />
                  </InputGroup>
                </Field.Root>

                {/* Error */}
                {mutation.isError && (
                  <HStack
                    bg="red.50"
                    border="1px solid"
                    borderColor="red.200"
                    borderRadius="md"
                    px={3}
                    py={2}
                    gap={2}
                  >
                    <Text color="red.600" fontSize="sm">
                      {mutation.error.message}
                    </Text>
                  </HStack>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  colorPalette="blue"
                  w="full"
                  size="lg"
                  borderRadius="lg"
                  loading={mutation.isPending}
                  fontWeight="semibold"
                  mt={1}
                >
                  {t("submit")}
                </Button>
              </Stack>
            </form>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
