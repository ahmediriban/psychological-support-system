export type UsageRecord = {
  id: string;
  teamId: string;
  team: { id: string; name: string };
  itemId: string;
  item: { id: string; name: string; unit: string | null };
  quantity: number;
  purpose: string;
  location: string | null;
  user: { id: string; name: string | null; email: string } | null;
  createdAt: string;
};
