"use client";

import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
  Field,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useController, useForm } from "react-hook-form";
import { useUpdateTeam } from "../../hooks/teams/useTeams";
import { ITEM_CATEGORIES } from "../../schemas/items/create-item.schema";
import {
  createTeamSchema,
  type CreateTeamInput,
} from "../../schemas/teams/create-team.schema";
import type { TeamSummary } from "../../types/team";

const CATEGORY_COLORS: Record<string, string> = {
  MATERIALS_STATIONERY: "blue",
  FIRST_AID: "red",
  HYGIENE: "green",
  PRINTING: "orange",
  HOSPITALITY: "purple",
};

type Props = {
  team: TeamSummary;
  open: boolean;
  onClose: () => void;
};

export function EditTeamDialog({ team, open, onClose }: Props) {
  const t = useTranslations("teams");
  const tc = useTranslations("categories");
  const mutation = useUpdateTeam();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: team.name,
      categories: team.categories,
    },
  });

  // Sync form when the team prop changes (e.g. opening for a different team)
  useEffect(() => {
    reset({ name: team.name, categories: team.categories });
  }, [team.id, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const { field: categoriesField } = useController({ name: "categories", control });

  function toggleCategory(cat: string) {
    const current = categoriesField.value as string[];
    if (current.includes(cat)) {
      categoriesField.onChange(current.filter((c) => c !== cat));
    } else if (current.length < 5) {
      categoriesField.onChange([...current, cat]);
    }
  }

  function handleClose() {
    reset({ name: team.name, categories: team.categories });
    mutation.reset();
    onClose();
  }

  function onSubmit(data: CreateTeamInput) {
    mutation.mutate(
      { id: team.id, ...data },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }

  const selected = (categoriesField.value as string[]) ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editTeam")}</DialogTitle>
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

                <Field.Root invalid={!!errors.categories}>
                  <Field.Label>
                    {tc("category")}
                    <Text as="span" fontSize="xs" color="gray.500" ms={2}>
                      ({tc("selectUpTo5")})
                    </Text>
                  </Field.Label>
                  <Stack gap={2} w="full">
                    {ITEM_CATEGORIES.map((cat) => {
                      const isChecked = selected.includes(cat);
                      const isDisabled = !isChecked && selected.length >= 5;
                      return (
                        <HStack
                          key={cat}
                          gap={3}
                          p={3}
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor={isChecked ? `${CATEGORY_COLORS[cat]}.300` : "gray.200"}
                          bg={isChecked ? `${CATEGORY_COLORS[cat]}.50` : "transparent"}
                          _dark={{
                            borderColor: isChecked ? `${CATEGORY_COLORS[cat]}.600` : "gray.600",
                            bg: isChecked ? `${CATEGORY_COLORS[cat]}.900` : "transparent",
                          }}
                          cursor={isDisabled ? "not-allowed" : "pointer"}
                          opacity={isDisabled ? 0.5 : 1}
                          onClick={() => !isDisabled && toggleCategory(cat)}
                        >
                          <Checkbox.Root
                            checked={isChecked}
                            disabled={isDisabled}
                            onCheckedChange={() => !isDisabled && toggleCategory(cat)}
                            colorPalette={CATEGORY_COLORS[cat]}
                            pointerEvents="none"
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                          </Checkbox.Root>
                          <Text fontSize="sm" flex={1} fontWeight={isChecked ? "semibold" : "normal"}>
                            {tc(cat)}
                          </Text>
                          {isChecked && (
                            <Badge colorPalette={CATEGORY_COLORS[cat]} fontSize="xs">
                              {selected.indexOf(cat) + 1}
                            </Badge>
                          )}
                        </HStack>
                      );
                    })}
                  </Stack>
                  {errors.categories && (
                    <Field.ErrorText>{tc("categoryRequired")}</Field.ErrorText>
                  )}
                </Field.Root>

                <HStack gap={3}>
                  <Button
                    type="button"
                    variant="outline"
                    flex={1}
                    onClick={handleClose}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    colorPalette="blue"
                    flex={1}
                    loading={mutation.isPending}
                    disabled={selected.length === 0}
                  >
                    {t("save")}
                  </Button>
                </HStack>
              </Stack>
            </form>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
