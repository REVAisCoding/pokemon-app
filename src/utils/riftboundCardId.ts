/** Riftbound card id: `{setCode}-{collectorNumber}-{setSize}` e.g. `ogn-42-259` */
export const RIFTBOUND_CARD_ID_PATTERN = /^(ogn|ogs|unl|sfd|opp|jdg|pr)-(\d+)-(\d+)$/i;

export function isRiftboundCardId(cardId: string): boolean {
  return RIFTBOUND_CARD_ID_PATTERN.test(cardId.trim());
}

export function extractRiftboundSetCode(cardId: string): string | null {
  const match = cardId.trim().match(RIFTBOUND_CARD_ID_PATTERN);
  return match?.[1]?.toLowerCase() ?? null;
}

export function extractRiftboundSetSize(cardId: string): number | null {
  const match = cardId.trim().match(RIFTBOUND_CARD_ID_PATTERN);
  const size = match?.[3];

  if (!size) {
    return null;
  }

  const parsed = Number(size);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function extractRiftboundSetIdFromRawData(
  rawData?: Record<string, unknown>,
): string | null {
  const set = rawData?.set;

  if (!set || typeof set !== 'object') {
    return null;
  }

  const setId = (set as { set_id?: unknown }).set_id;

  return typeof setId === 'string' && setId.trim().length > 0 ? setId.trim().toLowerCase() : null;
}
