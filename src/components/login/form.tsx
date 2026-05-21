"use client";

import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Box w="full" maxW="md" p={8} bg="white" borderRadius="lg" boxShadow="md">
        <Stack gap={6}>
          <Heading size="xl" textAlign="center">
            {t("title")}
          </Heading>
          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Field.Root>
                <Field.Label>{t("email")}</Field.Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>{t("password")}</Field.Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field.Root>
              {mutation.isError && (
                <Text color="red.500" fontSize="sm">
                  {mutation.error.message}
                </Text>
              )}
              <Button
                type="submit"
                colorPalette="blue"
                w="full"
                loading={mutation.isPending}
              >
                {t("submit")}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Box>
  );
}
