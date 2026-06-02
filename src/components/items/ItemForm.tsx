"use client";

import { Button, Field, Input, NativeSelect, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ITEM_CATEGORIES, createItemSchema, type CreateItemInput } from "../../schemas/items/create-item.schema";

// Edit mode allows zeroing out the stock quantity
const editItemSchema = createItemSchema.extend({
  totalQuantity: z.number().int().min(0),
});

type Props = {
  defaultValues?: { name: string; unit?: string | null; category?: string; totalQuantity?: number };
  mode?: "create" | "edit";
  onSubmit: (data: CreateItemInput) => void;
  isLoading: boolean;
};

export function ItemForm({ defaultValues, mode = "create", onSubmit, isLoading }: Props) {
  const t = useTranslations("items");
  const tc = useTranslations("categories");

  const schema = mode === "edit" ? editItemSchema : createItemSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      unit: defaultValues?.unit ?? "",
      category: (defaultValues?.category as CreateItemInput["category"]) ?? "MATERIALS_STATIONERY",
      totalQuantity: defaultValues?.totalQuantity ?? 1,
    },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      unit: defaultValues?.unit ?? "",
      category: (defaultValues?.category as CreateItemInput["category"]) ?? "MATERIALS_STATIONERY",
      totalQuantity: defaultValues?.totalQuantity ?? 1,
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <Stack gap={4}>
        <Field.Root invalid={!!errors.category}>
          <Field.Label>{tc("category")}</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field {...register("category")}>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {tc(cat)}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        <Field.Root invalid={!!errors.name}>
          <Field.Label>{t("name")}</Field.Label>
          <Input
            {...register("name")}
            placeholder={t("namePlaceholder")}
          />
          {errors.name && (
            <Field.ErrorText>{t("nameMin")}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root>
          <Field.Label>{t("unit")}</Field.Label>
          <Input
            {...register("unit")}
            placeholder={t("unitPlaceholder")}
          />
        </Field.Root>

        <Field.Root invalid={!!errors.totalQuantity}>
          <Field.Label>{t("totalQuantity")}</Field.Label>
          <Input
            type="number"
            min={mode === "edit" ? 0 : 1}
            {...register("totalQuantity", { valueAsNumber: true })}
            placeholder={t("totalQuantityPlaceholder")}
          />
          {errors.totalQuantity && (
            <Field.ErrorText>{t("totalQuantityMin")}</Field.ErrorText>
          )}
        </Field.Root>

        <Button
          type="submit"
          colorPalette="blue"
          w="full"
          loading={isLoading}
        >
          {t("save")}
        </Button>
      </Stack>
    </form>
  );
}
