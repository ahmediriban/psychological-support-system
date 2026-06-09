"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
  Field,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import * as XLSX from "xlsx";
import { useTeam } from "../../hooks/teams/useTeams";
import type { DistributionEntry, StockEntry, UsageEntry } from "../../types/team";

function toDateInputStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr() {
  return toDateInputStr(new Date());
}

function firstOfMonthStr() {
  const d = new Date();
  return toDateInputStr(new Date(d.getFullYear(), d.getMonth(), 1));
}

type Props = { teamId: string };

export function TeamExportDialog({ teamId }: Props) {
  const t = useTranslations("teams");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const { data: team } = useTeam(teamId);

  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(firstOfMonthStr);
  const [to, setTo] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setFrom(firstOfMonthStr());
    setTo(todayStr());
    setError(null);
    setOpen(true);
  }

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const [exportRes, stockRes] = await Promise.all([
        fetch(`/api/teams/${teamId}/export?from=${from}&to=${to}`),
        fetch(`/api/teams/${teamId}/stock`),
      ]);
      if (!exportRes.ok || !stockRes.ok) throw new Error(t("error"));
      const { usage, distribution } = (await exportRes.json()) as {
        usage: UsageEntry[];
        distribution: DistributionEntry[];
      };
      const stock = (await stockRes.json()) as StockEntry[];

      const wb = XLSX.utils.book_new();

      // Sheet 1 — Stock Summary
      const stockHeaders = [t("item"), t("unit"), tc("category"), t("quantity")];
      const stockRows = stock.map((e) => [
        e.item.name,
        e.item.unit ?? "",
        tc(e.item.category),
        e.quantity,
      ]);
      const stockWs = XLSX.utils.aoa_to_sheet([stockHeaders, ...stockRows]);
      XLSX.utils.book_append_sheet(wb, stockWs, t("stockSheetName"));

      const tu = (key: string) => {
        const map: Record<string, string> = {
          usageType: locale === "ar" ? "نوع الاستخدام" : "Usage type",
          logOnly: locale === "ar" ? "تسجيل فقط" : "Log only",
          consume: locale === "ar" ? "استهلاك" : "Consume",
          createdBy: locale === "ar" ? "أنشأ بواسطة" : "Created by",
        };
        return map[key] ?? key;
      };

      const usageHeaders = [
        t("item"),
        t("quantity"),
        t("unit"),
        tu("usageType"),
        t("worker"),
        tu("createdBy"),
        t("purpose"),
        t("location"),
        t("date"),
      ];
      const usageRows = usage.map((e) => {
        const isLogOnly = e.quantity === 0;
        const leader = (e as any).teamLeader;
        return [
          e.item.name,
          e.quantity,
          e.item.unit ?? "",
          isLogOnly ? tu("logOnly") : tu("consume"),
          leader?.name ?? leader?.email ?? "",
          e.user?.name ?? e.user?.email ?? "",
          e.purpose,
          e.location ?? "",
          new Date(e.createdAt).toLocaleDateString(locale),
        ];
      });
      const usageWs = XLSX.utils.aoa_to_sheet([usageHeaders, ...usageRows]);
      XLSX.utils.book_append_sheet(wb, usageWs, t("usageSheetName"));

      const distHeaders = [
        t("item"),
        t("unit"),
        t("quantity"),
        t("note"),
        t("date"),
      ];
      const distRows = distribution.map((e) => [
        e.item.name,
        e.item.unit ?? "",
        e.quantity,
        e.note ?? "",
        new Date(e.createdAt).toLocaleDateString(locale),
      ]);
      const distWs = XLSX.utils.aoa_to_sheet([distHeaders, ...distRows]);
      XLSX.utils.book_append_sheet(wb, distWs, t("distributionSheetName"));

      const teamName = (team?.name ?? teamId).replace(/[/\\?*[\]]/g, "_");
      XLSX.writeFile(wb, `${teamName}_${from}_${to}.xlsx`);
      setOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <LuDownload />
        {t("export")}
      </Button>

      <Dialog.Root open={open} onOpenChange={(e) => !e.open && setOpen(false)}>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxW={{ base: "90vw", md: "420px" }}>
            <DialogHeader>
              <DialogTitle>{t("exportData")}</DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>
            <DialogBody>
              <Stack gap={4}>
                <Text fontSize="sm" color="gray.500">
                  {t("exportPeriod")}
                </Text>
                <Field.Root>
                  <Field.Label>{t("exportDateFrom")}</Field.Label>
                  <Input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    max={to}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>{t("exportDateTo")}</Field.Label>
                  <Input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    min={from}
                    max={todayStr()}
                  />
                </Field.Root>
                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Stack>
            </DialogBody>
            <DialogFooter>
              <HStack gap={3} w="full" justify="flex-end">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  {t("cancel")}
                </Button>
                <Button colorPalette="blue" loading={loading} onClick={handleExport}>
                  <LuDownload />
                  {t("exportConfirm")}
                </Button>
              </HStack>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </Dialog.Root>
    </>
  );
}
