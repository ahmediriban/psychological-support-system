export type DistributionTeamEntry = {
  teamId: string;
  teamName: string;
  quantity: number;
};

export type DistributionMeta = {
  itemId: string;
  itemName: string;
  itemUnit: string | null;
  itemCategory: string;
  teams: DistributionTeamEntry[];
  totalQuantity: number;
  note?: string;
};

export type DistributionRecord = {
  id: string;
  createdAt: string;
  metadata: DistributionMeta;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};
