const NON_RARE_RARITIES = new Set([
  'common',
  'comum',
  'uncommon',
  'incomum',
  'none',
  '',
]);

const RARE_RARITY_MARKERS = [
  'rare',
  'rara',
  'epic',
  'épico',
  'epico',
  'showcase',
  'legend',
  'lendário',
  'lendario',
  'champion',
  'campeão',
  'campeao',
  'ultra',
  'holo',
  'hyper',
  'illustration',
  'special',
  'secret',
  'promo',
  'mythic',
  'fabled',
  'prismatic',
  'prismática',
  'prismatica',
  'ace spec',
  'radiant',
  'shiny',
  'double',
  'dupla',
];

export function extractRarityFromRawData(
  rawData?: Record<string, unknown>,
): string | undefined {
  if (!rawData) {
    return undefined;
  }

  const classification = rawData.classification;

  if (classification && typeof classification === 'object' && classification !== null) {
    const rarity = (classification as { rarity?: unknown }).rarity;

    if (typeof rarity === 'string' && rarity.trim().length > 0) {
      return rarity.trim();
    }
  }

  if (typeof rawData.rarity === 'string' && rawData.rarity.trim().length > 0) {
    return rawData.rarity.trim();
  }

  return undefined;
}

export function getCardRarity(card: {
  rarity?: string;
  rawData?: Record<string, unknown>;
}): string | undefined {
  if (card.rarity?.trim()) {
    return card.rarity.trim();
  }

  return extractRarityFromRawData(card.rawData);
}

export function isRareCard(rarity?: string): boolean {
  if (!rarity) {
    return false;
  }

  const normalized = rarity.trim().toLowerCase();

  if (NON_RARE_RARITIES.has(normalized)) {
    return false;
  }

  return RARE_RARITY_MARKERS.some((marker) => normalized.includes(marker));
}
