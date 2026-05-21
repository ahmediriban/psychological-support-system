export type TeamWorker = {
  id: string;
  name: string | null;
  email: string;
  teamId: string | null;
};

/** Returned by GET /api/teams (list with counts) */
export type TeamSummary = {
  id: string;
  name: string;
  createdAt: string;
  users: TeamWorker[];
  _count: {
    stocks: number;
    usages: number;
  };
};

/** Returned by GET /api/teams/[id] */
export type TeamDetail = {
  id: string;
  name: string;
  createdAt: string;
  users: (TeamWorker & { role: string })[];
};

/** Returned by GET /api/teams/[id]/stock */
export type StockEntry = {
  id: string;
  quantity: number;
  item: { id: string; name: string; unit: string | null };
};

/** Returned by GET /api/teams/[id]/usage */
export type UsageEntry = {
  id: string;
  quantity: number;
  purpose: string;
  createdAt: string;
  item: { id: string; name: string; unit: string | null };
  user: { id: string; name: string | null; email: string } | null;
};

/** Returned by GET /api/teams/[id]/distribution */
export type DistributionEntry = {
  id: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  item: { id: string; name: string; unit: string | null };
};
