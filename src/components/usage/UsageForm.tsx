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
import { UsageItemSelector, type StockItem } from "./UsageItemSelector";

const formSchema = z.object({
  quantity: z.number({ error: "required" }).int().positive(),
  purpose: z.string().min(3),
});
type FormData = z.infer<typeof formSchema>;

type Props = {
  role: "ADMIN" | "USER";
  lockedTeamId?: string;
  lockedTeamName?: string;
  onSuccess?: () => void;
};

export function UsageForm({ role, lockedTeamId, lockedTeamName, onSuccess }: Props) {
  const t = useTranslations("usage");
  const mutation = useCreateUsage();

  const [activeTeamId, setActiveTeamId] = useState(lockedTeamId ?? "");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // ADMIN needs team selector
  const { data: teams = [] } = useTeams();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 1, purpose: "" },
  });

  const quantity = watch("quantity");

  // Reset item when team changes
  useEffect(() => {
    setSelectedItem(null);
  }, [activeTeamId]);

  function onSubmit(data: FormData) {
    if (!selectedItem || !activeTeamId) return;
    mutation.mutate(
      {
        itemId: selectedItem.itemId,
        teamId: activeTeamId,
        quantity: data.quantity,
        purpose: data.purpose,
      },
      {
        onSuccess: () => {
          reset({ quantity: 1, purpose: "" });
          setSelectedItem(null);
          onSuccess?.();
        },
      }
    );
  }

  const overStock =
    selectedItem && typeof quantity === "number" && quantity > selectedItem.available;

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

        {/* Item selector — only shows when a team is selected */}
        {activeTeamId && (
          <>
            <Separator />
            <Box>
              <Text fontSize="xs" color="gray.500" mb={2} textTransform="uppercase">
                {t("item")}
              </Text>
              <UsageItemSelector
                teamId={activeTeamId}
                selectedItemId={selectedItem?.itemId ?? null}
                onSelect={(item) => {
                  setSelectedItem(item);
                  reset((v) => ({ ...v, quantity: 1 }));
                }}
                onClear={() => {
                  setSelectedItem(null);
                  reset((v) => ({ ...v, quantity: 1 }));
                }}
              />
            </Box>
          </>
        )}

        {/* Quantity + purpose — only when item selected */}
        {selectedItem && (
          <>
            <Separator />

            <Field.Root invalid={!!errors.quantity || !!overStock}>
              <Field.Label>
                {t("quantity")}
                <Badge colorPalette="gray" ms={2} fontSize="xs">
                  {t("available")}: {selectedItem.available}
                </Badge>
              </Field.Label>
              <Input
                type="number"
                min={1}
                max={selectedItem.available}
                {...register("quantity", { valueAsNumber: true })}
              />
              {overStock && (
                <Field.ErrorText>{t("errorOverStock", { max: selectedItem.available })}</Field.ErrorText>
              )}
              {errors.quantity && !overStock && (
                <Field.ErrorText>{t("errorQuantityInvalid")}</Field.ErrorText>
              )}
            </Field.Root>

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
          disabled={!selectedItem || !activeTeamId}
        >
          {t("submit")}
        </Button>
      </Stack>
    </form>
  );
}
