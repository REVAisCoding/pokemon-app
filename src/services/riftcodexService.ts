import {
  getRiftcodexCardsByNameUrl,
  RIFTCODEX_MAX_SEARCH_PAGES,
  RIFTCODEX_SEARCH_PAGE_SIZE,
} from '@/config/riftcodex';
import { type RiftboundCard, type RiftboundCardsResponse } from '@/types/riftbound';

function rankNameMatch(name: string, query: string): number {
  const normalizedName = normalizeSearchText(name);
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedName === normalizedQuery) {
    return 0;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 1;
  }

  return 2;
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Riftcodex request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function searchRiftboundCardsByName(
  query: string,
  options?: { limit?: number },
): Promise<RiftboundCard[]> {
  const trimmedQuery = query.trim();
  const limit = options?.limit ?? RIFTCODEX_SEARCH_PAGE_SIZE;

  if (trimmedQuery.length === 0) {
    return [];
  }

  const allCards: RiftboundCard[] = [];

  for (let page = 1; page <= RIFTCODEX_MAX_SEARCH_PAGES; page += 1) {
    const payload = await fetchJson<RiftboundCardsResponse>(
      getRiftcodexCardsByNameUrl(trimmedQuery, page, RIFTCODEX_SEARCH_PAGE_SIZE),
    );

    allCards.push(...payload.items);

    if (payload.items.length < RIFTCODEX_SEARCH_PAGE_SIZE || page >= payload.pages) {
      break;
    }
  }

  return allCards
    .sort((left, right) => {
      const rankDiff = rankNameMatch(left.name, trimmedQuery) - rankNameMatch(right.name, trimmedQuery);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, limit);
}
