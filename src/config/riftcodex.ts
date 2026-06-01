export const RIFTCODEX_BASE_URL = 'https://api.riftcodex.com';

export const RIFTCODEX_SEARCH_PAGE_SIZE = 80;
export const RIFTCODEX_MAX_SEARCH_PAGES = 3;

export function getRiftcodexCardsByNameUrl(fuzzyName: string, page = 1, size = RIFTCODEX_SEARCH_PAGE_SIZE): string {
  const params = new URLSearchParams({
    fuzzy: fuzzyName,
    page: String(page),
    size: String(size),
    sort: 'set_id',
    dir: '-1',
  });

  return `${RIFTCODEX_BASE_URL}/cards/name?${params.toString()}`;
}

export function getRiftcodexSetsUrl(): string {
  return `${RIFTCODEX_BASE_URL}/sets`;
}
