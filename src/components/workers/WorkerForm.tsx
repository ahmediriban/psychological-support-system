"use client";

import { Button, Field, Input, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Internal flexible schema: password optional so form works for both create and edit
const workerFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional().or(z.literal("")),
});

export type WorkerFormData = z.infer<typeof workerFormSchema>;

type Props = {
  mode?: "create" | "edit";
  defaultValues?: { name?: string | null; email?: string };
  onSubmit: (data: WorkerFormData) => void;
  isLoading: boolean;
};

export function WorkerForm({ mode = "create", defaultValues, onSubmit, isLoading }: Props) {
  const t = useTranslations("workers");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      password: "",
    },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      password: "",
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4}>
        <Field.Root invalid={!!errors.name}>
          <Field.Label>{t("name")}</Field.Label>
          <Input {...register("name")} placeholder={t("namePlaceholder")} />
          {errors.name && <Field.ErrorText>{t("nameMin")}</Field.ErrorText>}
        </Field.Root>

        <Field.Root invalid={!!errors.email}>
          <Field.Label>{t("email")}</Field.Label>
          <Input {...register("email")} type="email" placeholder={t("emailPlaceholder")} />
          {errors.email && <Field.ErrorText>{t("emailInvalid")}</Field.ErrorText>}
        </Field.Root>

        {mode === "create" && (
          <Field.Root invalid={!!errors.password}>
            <Field.Label>{t("password")}</Field.Label>
            <Input {...register("password")} type="password" placeholder={t("passwordPlaceholder")} />
            {errors.password && <Field.ErrorText>{t("passwordMin")}</Field.ErrorText>}
          </Field.Root>
        )}

        <Button type="submit" colorPalette="blue" w="full" loading={isLoading}>
          {t("save")}
        </Button>
      </Stack>
    </form>
  );
}
