"use client";

import { Button, HStack, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, total, pageSize, onChange }: Props) {
  const t = useTranslations("pagination");

  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  return (
    <HStack justify="space-between" pt={4} flexWrap="wrap" gap={3}>
      <Text fontSize="sm" color="gray.500">
        {t("showing", { from, to, total })}
      </Text>

      <HStack gap={2}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
        >
          {t("previous")}
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === "…" ? (
              <Text key={`ellipsis-${idx}`} fontSize="sm" color="gray.400" px={1}>
                …
              </Text>
            ) : (
              <Button
                key={p}
                size="sm"
                variant={p === page ? "solid" : "outline"}
                colorPalette={p === page ? "blue" : "gray"}
                onClick={() => onChange(p as number)}
                minW="8"
              >
                {p}
              </Button>
            )
          )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          {t("next")}
        </Button>
      </HStack>
    </HStack>
  );
}
