/** Centralized TanStack Query keys so invalidation stays consistent. */
export const queryKeys = {
  testimonies: ["testimonies"] as const,
  testimony: (id: string) => ["testimony", id] as const,
  archive: (query: string) => ["archive", query] as const,
  admins: ["admins"] as const,
  profile: ["profile"] as const,
};
