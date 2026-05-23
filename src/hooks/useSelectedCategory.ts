"use client";

import { useState } from "react";
import type { ItemCategoryEnum } from "../schemas/items/create-item.schema";

const STORAGE_KEY = "selectedCategory";
const DEFAULT_CATEGORY: ItemCategoryEnum = "MATERIALS_STATIONERY";

function readFromStorage(): ItemCategoryEnum {
  if (typeof window === "undefined") return DEFAULT_CATEGORY;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "MATERIALS_STATIONERY" || stored === "FIRST_AID" || stored === "HYGIENE") {
    return stored;
  }
  return DEFAULT_CATEGORY;
}

export function useSelectedCategory() {
  const [category, setRaw] = useState<ItemCategoryEnum>(readFromStorage);

  function setCategory(cat: ItemCategoryEnum) {
    setRaw(cat);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, cat);
    }
  }

  return { category, setCategory };
}
