"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
  Field,
  Input,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useCreateTeam } from "../../hooks/teams/useTeams";
import { ITEM_CATEGORIES } from "../../schemas/items/create-item.schema";
import {
  createTeamSchema,
  type CreateTeamInput,
} from "../../schemas/teams/create-team.schema";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultCategory?: string;
};

export function CreateTeamDialog({ open, onClose, defaultCategory }: Props) {
  const t = useTranslations("teams");
  const tc = useTranslations("categories");
  const mutation = useCreateTeam();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      category: (defaultCategory as CreateTeamInput["category"]) ?? "MATERIALS_STATIONERY",
    },
  });

  function handleClose() {
    reset();
    mutation.reset();
    onClose();
  }

  function onSubmit(data: CreateTeamInput) {
    mutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createTeam")}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={6}>
            {mutation.isError && (
              <Text color="red.500" mb={3} fontSize="sm">
                {mutation.error.message}
              </Text>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
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
                  <Field.Label>{t("teamName")}</Field.Label>
                  <Input
                    {...register("name")}
                    placeholder={t("teamNamePlaceholder")}
                  />
                  {errors.name && (
                    <Field.ErrorText>{t("teamNameMin")}</Field.ErrorText>
                  )}
                </Field.Root>

                <Button
                  type="submit"
                  colorPalette="blue"
                  w="full"
                  loading={mutation.isPending}
                >
                  {t("save")}
                </Button>
              </Stack>
            </form>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
