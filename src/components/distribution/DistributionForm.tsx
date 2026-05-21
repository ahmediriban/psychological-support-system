"use client";

import {
  Box,
  Button,
  HStack,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCreateDistribution } from "../../hooks/distribution/useDistributions";
import type { Item } from "../../types/item";
import { DistributionSummary } from "./DistributionSummary";
import { ItemSelector } from "./ItemSelector";
import { QuantityAllocator, type TeamAllocation } from "./QuantityAllocator";

type Props = {
  onSuccess: () => void;
};

export function DistributionForm({ onSuccess }: Props) {
  const t = useTranslations("distribution");
  const mutation = useCreateDistribution();

  const [step, setStep] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [allocations, setAllocations] = useState<Map<string, TeamAllocation>>(new Map());
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function reset() {
    setStep(0);
    setSelectedItem(null);
    setAllocations(new Map());
    setNote("");
    setValidationError(null);
    mutation.reset();
  }

  function goToStep1() {
    if (!selectedItem) {
      setValidationError(t("errorSelectItem"));
      return;
    }
    setValidationError(null);
    setStep(1);
  }

  function goToStep2() {
    const entries = Array.from(allocations.values());
    if (entries.length === 0) {
      setValidationError(t("errorSelectTeam"));
      return;
    }
    const hasInvalid = entries.some((a) => !a.quantity || a.quantity < 1);
    if (hasInvalid) {
      setValidationError(t("errorQuantityInvalid"));
      return;
    }
    setValidationError(null);
    setStep(2);
  }

  function handleSubmit() {
    if (!selectedItem) return;
    const entries = Array.from(allocations.values());
    mutation.mutate(
      {
        itemId: selectedItem.id,
        teams: entries.map((a) => ({ teamId: a.teamId, quantity: a.quantity })),
        note: note || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onSuccess();
        },
      }
    );
  }

  const allocList = Array.from(allocations.values());

  return (
    <Stack gap={6}>
      {/* Step indicator */}
      <HStack gap={2} justify="center">
        {[0, 1, 2].map((s) => (
          <Box
            key={s}
            h="2px"
            flex={1}
            borderRadius="full"
            bg={step >= s ? "blue.500" : "gray.200"}
            transition="background 0.2s"
          />
        ))}
      </HStack>

      {/* Step labels */}
      <HStack justify="space-between" px={1}>
        <Text fontSize="xs" color={step === 0 ? "blue.600" : "gray.500"} fontWeight={step === 0 ? "semibold" : "normal"}>
          {t("stepItem")}
        </Text>
        <Text fontSize="xs" color={step === 1 ? "blue.600" : "gray.500"} fontWeight={step === 1 ? "semibold" : "normal"}>
          {t("stepTeams")}
        </Text>
        <Text fontSize="xs" color={step === 2 ? "blue.600" : "gray.500"} fontWeight={step === 2 ? "semibold" : "normal"}>
          {t("stepReview")}
        </Text>
      </HStack>

      <Separator />

      {/* Validation error */}
      {validationError && (
        <Box px={4} py={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
          <Text color="red.600" fontSize="sm">{validationError}</Text>
        </Box>
      )}

      {/* Mutation error */}
      {mutation.isError && (
        <Box px={4} py={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
          <Text color="red.600" fontSize="sm">{mutation.error.message}</Text>
        </Box>
      )}

      {/* Step 0: Item selection */}
      {step === 0 && (
        <Stack gap={4}>
          <ItemSelector
            selectedItemId={selectedItem?.id ?? null}
            onSelect={(item) => {
              setSelectedItem(item);
              setValidationError(null);
            }}
          />
          <Button colorPalette="blue" w="full" onClick={goToStep1}>
            {t("next")}
          </Button>
        </Stack>
      )}

      {/* Step 1: Team + quantity allocation */}
      {step === 1 && (
        <Stack gap={4}>
          <QuantityAllocator allocations={allocations} onChange={setAllocations} />
          <HStack gap={3}>
            <Button variant="outline" flex={1} onClick={() => { setValidationError(null); setStep(0); }}>
              {t("back")}
            </Button>
            <Button colorPalette="blue" flex={1} onClick={goToStep2}>
              {t("next")}
            </Button>
          </HStack>
        </Stack>
      )}

      {/* Step 2: Review + submit */}
      {step === 2 && selectedItem && (
        <Stack gap={4}>
          <DistributionSummary
            item={selectedItem}
            allocations={allocList}
            note={note}
            onNoteChange={setNote}
          />
          <HStack gap={3}>
            <Button variant="outline" flex={1} onClick={() => { setValidationError(null); setStep(1); }} disabled={mutation.isPending}>
              {t("back")}
            </Button>
            <Button colorPalette="green" flex={1} loading={mutation.isPending} onClick={handleSubmit}>
              {t("submit")}
            </Button>
          </HStack>
        </Stack>
      )}
    </Stack>
  );
}
