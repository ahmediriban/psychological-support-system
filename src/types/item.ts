import type { ItemCategoryEnum } from "../schemas/items/create-item.schema";

export type Item = {
  id: string;
  name: string;
  unit: string | null;
  category: ItemCategoryEnum;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
};
