// Client-safe address utilities (no server-only imports)

// Matches US street addresses: starts with a house number followed by a street name
export function isAddressQuery(q: string): boolean {
  return /^\d+\s+[a-zA-Z]/.test(q.trim());
}
