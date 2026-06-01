export const TCGAPI_DEV_BASE_URL = 'https://api.tcgapi.dev/v1';

export function getTcgApiDevCardByTcgplayerIdUrl(tcgplayerId: string): string {
  return `${TCGAPI_DEV_BASE_URL}/cards/tcgplayer/${encodeURIComponent(tcgplayerId)}`;
}
