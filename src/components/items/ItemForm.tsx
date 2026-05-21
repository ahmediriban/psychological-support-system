"use client";

import { Button, Field, Input, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createItemSchema, type CreateItemInput } from "../../schemas/items/create-item.schema";

type Props = {
  defaultValues?: { name: string; unit?: string | null };
  onSubmit: (data: CreateItemInput) => void;
  isLoading: boolean;
};

export function ItemForm({ defaultValues, onSubmit, isLoading }: Props) {
  const t = useTranslations("items");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      unit: defaultValues?.unit ?? "",
    },
  });

  // Sync defaultValues when editing a different item
  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      unit: defaultValues?.unit ?? "",
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4}>
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
