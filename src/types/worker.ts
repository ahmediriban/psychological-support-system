export type Worker = {
  id: string;
  name: string | null;
  email: string;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
  team: { id: string; name: string } | null;
};
