"use client";

import {
  Badge,
  Box,
  Button,
  Field,
  HStack,
  Input,
  NativeSelect,
  Separator,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTeams } from "../../hooks/teams/useTeams";
import { useCreateUsage } from "../../hooks/usage/useUsage";
import type { ItemCategoryEnum } from "../../schemas/items/create-item.schema";
import { UsageItemSelector, type StockItem } from "./UsageItemSelector";

const CATEGORY_COLORS: Record<string, string> = {
  MATERIALS_STATIONERY: "blue",
  FIRST_AID: "red",
  HYGIENE: "green",
  PRINTING: "orange",
  HOSPITALITY: "purple",
};

const formSchema = z.object({
  quantity: z.number({ error: "required" }).int().positive().optional(),
  purpose: z.string().min(3),
  location: z.string().min(2).optional().or(z.literal("")),
});
type FormData = z.infer<typeof formSchema>;

type MultiUseMode = "destroy" | "log_only" | null;

type Props = {
  role: "ADMIN" | "USER";
  lockedTeamId?: string;
  lockedTeamName?: string;
  onSuccess?: () => void;
};

export function UsageForm({ role, lockedTeamId, lockedTeamName, onSuccess }: Props) {
  const t = useTranslations("usage");
  const tc = useTranslations("categories");
  const mutation = useCreateUsage();

  const [activeTeamId, setActiveTeamId] = useState(lockedTeamId ?? "");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategoryEnum | null>(null);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [multiUseMode, setMultiUseMode] = useState<MultiUseMode>(null);

  const { data: teams = [] } = useTeams();

  const activeTeam = teams.find((t) => t.id === activeTeamId) ?? null;
  const teamCategories: ItemCategoryEnum[] = activeTeam?.categories ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 1, purpose: "", location: "" },
  });

  const quantity = watch("quantity");

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedItem(null);
    setMultiUseMode(null);
  }, [activeTeamId]);

  useEffect(() => {
    setSelectedItem(null);
    setMultiUseMode(null);
    reset({ quantity: 1, purpose: "", location: "" });
  }, [selectedCategory, reset]);

  useEffect(() => {
    if (teamCategories.length === 1) {
      setSelectedCategory(teamCategories[0]);
    }
  }, [activeTeamId, teamCategories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearAfterSuccess() {
    reset({ quantity: 1, purpose: "", location: "" });
    setSelectedItem(null);
    setMultiUseMode(null);
    setSelectedCategory(teamCategories.length === 1 ? teamCategories[0] : null);
    onSuccess?.();
  }

  const showQuantity = multiUseMode === "destroy";
  const showFields = !!selectedItem && multiUseMode !== null;
  const canSubmit = !!selectedItem && !!activeTeamId && multiUseMode !== null;

  const overStock =
    showQuantity &&
    selectedItem &&
    typeof quantity === "number" &&
    quantity > selectedItem.available;

  function onSubmit(data: FormData) {
    if (!selectedItem || !activeTeamId) return;
    const destroyStock = multiUseMode === "destroy";
    mutation.mutate(
      {
        itemId: selectedItem.itemId,
        teamId: activeTeamId,
        quantity: multiUseMode === "log_only" ? 0 : (data.quantity ?? 1),
        purpose: data.purpose,
        location: data.location || undefined,
        destroyStock,
      },
      { onSuccess: clearAfterSuccess }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={5}>
        {/* Team display / selector */}
        {role === "USER" ? (
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase">
              {t("team")}
            </Text>
            <Badge colorPalette="blue" fontSize="sm" px={3} py={1}>
              {lockedTeamName ?? lockedTeamId}
            </Badge>
          </Box>
        ) : (
          <Field.Root>
            <Field.Label>{t("team")}</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={activeTeamId}
                onChange={(e) => setActiveTeamId(e.target.value)}
              >
                <option value="">{t("selectTeam")}</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        )}

        {/* Category selector — only when team has multiple categories */}
        {activeTeamId && teamCategories.length > 1 && (
          <>
            <Separator />
            <Box>
              <Text fontSize="xs" color="gray.500" mb={2} textTransform="uppercase">
                {tc("category")}
              </Text>
              <HStack gap={2} flexWrap="wrap">
                {teamCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const color = CATEGORY_COLORS[cat] ?? "gray";
                  return (
                    <Button
                      key={cat}
                      size="sm"
                      variant={isActive ? "solid" : "outline"}
                      colorPalette={isActive ? color : "gray"}
                      borderRadius="full"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {tc(cat)}
                    </Button>
                  );
                })}
              </HStack>
            </Box>
          </>
        )}

        {/* Item selector — only shows when team + category are selected */}
        {activeTeamId && selectedCategory && (
          <>
            <Separator />
            <Box>
              <Text fontSize="xs" color="gray.500" mb={2} textTransform="uppercase">
                {t("item")}
              </Text>
              <UsageItemSelector
                teamId={activeTeamId}
                category={selectedCategory}
                selectedItemId={selectedItem?.itemId ?? null}
                onSelect={(item) => {
                  setSelectedItem(item);
                  setMultiUseMode(null);
                  reset((v) => ({ ...v, quantity: 1 }));
                }}
                onClear={() => {
                  setSelectedItem(null);
                  setMultiUseMode(null);
                  reset((v) => ({ ...v, quantity: 1 }));
                }}
              />
            </Box>
          </>
        )}

        {/* Usage action toggle — shown for all items after selection */}
        {!!selectedItem && (
          <>
            <Separator />
            <Box>
              <Text fontSize="xs" color="gray.500" mb={2} textTransform="uppercase">
                {t("multiUseAction")}
              </Text>
              <HStack gap={2}>
                <Button
                  flex={1}
                  size="sm"
                  variant={multiUseMode === "destroy" ? "solid" : "outline"}
                  colorPalette={multiUseMode === "destroy" ? "red" : "gray"}
                  onClick={() => {
                    setMultiUseMode("destroy");
                    reset((v) => ({ ...v, quantity: 1 }));
                  }}
                >
                  {t("multiUseDestroy")}
                </Button>
                <Button
                  flex={1}
                  size="sm"
                  variant={multiUseMode === "log_only" ? "solid" : "outline"}
                  colorPalette={multiUseMode === "log_only" ? "blue" : "gray"}
                  onClick={() => setMultiUseMode("log_only")}
                >
                  {t("multiUseLogOnly")}
                </Button>
              </HStack>
            </Box>
          </>
        )}

        {/* Quantity (destroy only) + purpose + location */}
        {showFields && (
          <>
            <Separator />

            {showQuantity && (
              <Field.Root invalid={!!errors.quantity || !!overStock}>
                <Field.Label>
                  {t("quantity")}
                  <Badge colorPalette="gray" ms={2} fontSize="xs">
                    {t("available")}: {selectedItem!.available}
                  </Badge>
                </Field.Label>
                <Input
                  type="number"
                  min={1}
                  max={selectedItem!.available}
                  {...register("quantity", { valueAsNumber: true })}
                />
                {overStock && (
                  <Field.ErrorText>{t("errorOverStock", { max: selectedItem!.available })}</Field.ErrorText>
                )}
                {errors.quantity && !overStock && (
                  <Field.ErrorText>{t("errorQuantityInvalid")}</Field.ErrorText>
                )}
              </Field.Root>
            )}

            <Field.Root invalid={!!errors.purpose}>
              <Field.Label>{t("purpose")}</Field.Label>
              <Textarea
                {...register("purpose")}
                placeholder={t("purposePlaceholder")}
                rows={2}
              />
              {errors.purpose && (
                <Field.ErrorText>{t("errorPurposeMin")}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.location}>
              <Field.Label>
                {t("location")}
                <Text as="span" fontSize="xs" color="gray.400" ms={2}>({t("optional")})</Text>
              </Field.Label>
              <Input
                {...register("location")}
                placeholder={t("locationPlaceholder")}
              />
              {errors.location && (
                <Field.ErrorText>{t("errorLocationMin")}</Field.ErrorText>
              )}
            </Field.Root>
          </>
        )}

        {/* Mutation error */}
        {mutation.isError && (
          <Box px={4} py={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
            <Text color="red.600" fontSize="sm">{mutation.error.message}</Text>
          </Box>
        )}

        <Button
          type="submit"
          colorPalette="green"
          w="full"
          size="lg"
          loading={mutation.isPending}
          disabled={!canSubmit}
        >
          {t("submit")}
        </Button>
      </Stack>
    </form>
  );
}
