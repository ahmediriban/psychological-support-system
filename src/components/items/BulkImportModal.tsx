"use client";

import {
  Badge,
  Box,
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
  HStack,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { ITEM_CATEGORIES, type ItemCategoryEnum } from "../../schemas/items/create-item.schema";
import type { BulkImportRow } from "../../schemas/items/bulk-import.schema";
import { useBulkImportItems } from "../../hooks/items/useItems";

const CATEGORY_COLORS: Record<string, string> = {
  MATERIALS_STATIONERY: "blue",
  FIRST_AID: "red",
  HYGIENE: "green",
  PRINTING: "orange",
  HOSPITALITY: "purple",
};

type ParsedRow = BulkImportRow & { _error?: string };

function normalizeCategory(raw: unknown): ItemCategoryEnum | null {
  if (typeof raw !== "string") return null;
  const upper = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const map: Record<string, ItemCategoryEnum> = {
    MATERIALS_STATIONERY: "MATERIALS_STATIONERY",
    MATERIALS: "MATERIALS_STATIONERY",
    STATIONERY: "MATERIALS_STATIONERY",
    FIRST_AID: "FIRST_AID",
    FIRSTAID: "FIRST_AID",
    HYGIENE: "HYGIENE",
    PRINTING: "PRINTING",
    HOSPITALITY: "HOSPITALITY",
  };
  return map[upper] ?? (ITEM_CATEGORIES.includes(upper as ItemCategoryEnum) ? (upper as ItemCategoryEnum) : null);
}

function parseSheet(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const parsed: ParsedRow[] = rows.map((row) => {
          const name = String(row["item"] ?? row["name"] ?? "").trim();
          const unit = String(row["unit"] ?? "").trim() || undefined;
          const rawQty = row["quantity"] ?? row["qty"];
          const quantity = typeof rawQty === "number" ? rawQty : parseInt(String(rawQty), 10);
          const category = normalizeCategory(row["category"]);

          const errors: string[] = [];
          if (name.length < 2) errors.push("invalid name");
          if (!Number.isInteger(quantity) || quantity < 1) errors.push("invalid quantity");
          if (!category) errors.push("invalid category");

          return {
            name,
            unit,
            quantity: Number.isFinite(quantity) ? quantity : 0,
            category: category ?? "MATERIALS_STATIONERY",
            ...(errors.length ? { _error: errors.join(", ") } : {}),
          };
        });
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function BulkImportModal({ open, onClose }: Props) {
  const t = useTranslations("items");
  const tc = useTranslations("categories");
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const importMutation = useBulkImportItems();

  const validRows = rows.filter((r) => !r._error);
  const hasErrors = rows.some((r) => r._error);

  function reset() {
    setRows([]);
    setParseError(null);
    importMutation.reset();
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParseError(null);
    setRows([]);
    importMutation.reset();
    try {
      const parsed = await parseSheet(file);
      if (parsed.length === 0) {
        setParseError(t("bulkNoRows"));
      } else {
        setRows(parsed);
      }
    } catch {
      setParseError(t("bulkParseError"));
    } finally {
      setParsing(false);
    }
  }

  function handleImport() {
    if (validRows.length === 0) return;
    importMutation.mutate(
      { items: validRows },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()} size="xl">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW={{ base: "95vw", md: "750px" }}>
          <DialogHeader>
            <DialogTitle>{t("bulkImport")}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>

          <DialogBody pb={2}>
            <VStack align="stretch" gap={4}>
              {/* File input */}
              <Box
                border="2px dashed"
                borderColor="gray.200"
                borderRadius="md"
                p={6}
                textAlign="center"
                cursor="pointer"
                onClick={() => fileRef.current?.click()}
                _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                transition="all 0.15s"
              >
                <Text fontSize="sm" color="gray.500" mb={2}>
                  {t("bulkDropHint")}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {t("bulkColumns")}
                </Text>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: "none" }}
                  onChange={handleFile}
                />
              </Box>

              {parsing && (
                <HStack justify="center">
                  <Spinner size="sm" />
                  <Text fontSize="sm">{t("bulkParsing")}</Text>
                </HStack>
              )}

              {parseError && (
                <Text color="red.500" fontSize="sm">
                  {parseError}
                </Text>
              )}

              {importMutation.isError && (
                <Text color="red.500" fontSize="sm">
                  {importMutation.error.message}
                </Text>
              )}

              {/* Preview table */}
              {rows.length > 0 && (
                <Box overflowX="auto" maxH="320px" overflowY="auto">
                  <Table.Root size="sm" variant="outline">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>{t("name")}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t("unit")}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t("totalQuantity")}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t("category")}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t("bulkStatus")}</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {rows.map((row, i) => (
                        <Table.Row key={i} bg={row._error ? "red.50" : undefined}>
                          <Table.Cell>{row.name}</Table.Cell>
                          <Table.Cell>{row.unit ?? "—"}</Table.Cell>
                          <Table.Cell>{row.quantity}</Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={CATEGORY_COLORS[row.category] ?? "gray"} fontSize="xs">
                              {tc(row.category)}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            {row._error ? (
                              <Text color="red.500" fontSize="xs">
                                {row._error}
                              </Text>
                            ) : (
                              <Text color="green.600" fontSize="xs">
                                ✓
                              </Text>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}

              {rows.length > 0 && (
                <HStack fontSize="xs" color="gray.500" gap={3} flexWrap="wrap">
                  <Text>{t("bulkValid", { count: validRows.length })}</Text>
                  {hasErrors && <Text color="red.500">{t("bulkInvalid", { count: rows.length - validRows.length })}</Text>}
                </HStack>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter gap={2} pt={4}>
            <Button variant="ghost" onClick={handleClose} size="sm">
              {t("cancel")}
            </Button>
            <Button
              colorPalette="blue"
              size="sm"
              onClick={handleImport}
              disabled={validRows.length === 0 || importMutation.isPending}
              loading={importMutation.isPending}
            >
              {t("bulkConfirm", { count: validRows.length })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
