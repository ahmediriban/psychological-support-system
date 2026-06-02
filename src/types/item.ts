import type { ItemCategoryEnum, UsageTypeEnum } from "../schemas/items/create-item.schema";

export type Item = {
  id: string;
  name: string;
  unit: string | null;
  category: ItemCategoryEnum;
  usageType: UsageTypeEnum;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
};
