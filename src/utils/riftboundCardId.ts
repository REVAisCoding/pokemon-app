/** Riftbound card id: `{setCode}-{collectorNumber}-{setSize}` e.g. `ogn-42-259`, `ogn-166a-298` */
export const RIFTBOUND_CARD_ID_PATTERN =
  /^(ogn|ogs|unl|sfd|opp|jdg|pr)-([\da-z]+)-(\d+)$/i;

export function isRiftboundCardId(cardId: string): boolean {
  return RIFTBOUND_CARD_ID_PATTERN.test(cardId.trim());
}

export function extractRiftboundIdFromRawData(
  rawData?: Record<string, unknown>,
): string | null {
  const riftboundId = rawData?.riftbound_id;

  if (typeof riftboundId !== 'string' || !riftboundId.trim()) {
    return null;
  }

  const normalizedId = riftboundId.trim().toLowerCase();

  return isRiftboundCardId(normalizedId) ? normalizedId : null;
}

export function canonicalizeRiftboundCardId(card: {
  id: string;
  rawData?: Record<string, unknown>;
}): string {
  const fromRawData = extractRiftboundIdFromRawData(card.rawData);

  if (fromRawData) {
    return fromRawData;
  }

  const normalizedId = card.id.trim().toLowerCase();

  return isRiftboundCardId(normalizedId) ? normalizedId : card.id;
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
