import { type CardGameType, isCardGameType, type CardPrice } from '@/types/cardGame';
import {
  cardPriceToRouteParams,
  parseRoutePriceParams,
} from '@/utils/pricing';

export type ScannedCard = {
  id: string;
  name: string;
  setName: string;
  number: string;
  type: string;
  imageUrl: string;
  accentColor: string;
  gameType?: CardGameType;
  price?: CardPrice;
  /** @deprecated use price */
  estimatedValueBrl?: number;
  setId?: string;
  setPrintedTotal?: number;
  setLogo?: string;
  setSymbol?: string;
  rarity?: string;
  tcgplayerId?: string;
};

export type ScannedCardRouteParams = {
  id: string;
  name: string;
  setName: string;
  number: string;
  type: string;
  imageUrl: string;
  accentColor: string;
  gameType?: CardGameType;
  priceAmount?: string;
  priceCurrency?: string;
  priceSource?: string;
  /** @deprecated use price route params */
  estimatedValueBrl?: string;
  rarity?: string;
  tcgplayerId?: string;
};

export function scannedCardToRouteParams(card: ScannedCard): ScannedCardRouteParams {
  const price = card.price ?? undefined;

  return {
    id: card.id,
    name: card.name,
    setName: card.setName,
    number: card.number,
    type: card.type,
    imageUrl: card.imageUrl,
    accentColor: card.accentColor,
    ...(card.gameType ? { gameType: card.gameType } : {}),
    ...(price ? cardPriceToRouteParams(price) : {}),
    ...(card.rarity ? { rarity: card.rarity } : {}),
    ...(card.tcgplayerId ? { tcgplayerId: card.tcgplayerId } : {}),
    ...(card.estimatedValueBrl != null
      ? { estimatedValueBrl: String(card.estimatedValueBrl) }
      : {}),
  };
}

export function routeParamsToScannedCard(
  params: Partial<Record<keyof ScannedCardRouteParams, string | string[] | undefined>>,
): ScannedCard | undefined {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const name = Array.isArray(params.name) ? params.name[0] : params.name;
  const setName = Array.isArray(params.setName) ? params.setName[0] : params.setName;
  const number = Array.isArray(params.number) ? params.number[0] : params.number;
  const type = Array.isArray(params.type) ? params.type[0] : params.type;
  const imageUrl = Array.isArray(params.imageUrl) ? params.imageUrl[0] : params.imageUrl;
  const accentColor = Array.isArray(params.accentColor) ? params.accentColor[0] : params.accentColor;
  const rawGameType = Array.isArray(params.gameType) ? params.gameType[0] : params.gameType;
  const rarity = Array.isArray(params.rarity) ? params.rarity[0] : params.rarity;
  const tcgplayerId = Array.isArray(params.tcgplayerId) ? params.tcgplayerId[0] : params.tcgplayerId;
  const estimatedValueBrl = Array.isArray(params.estimatedValueBrl)
    ? params.estimatedValueBrl[0]
    : params.estimatedValueBrl;

  if (!id || !name || !setName || !number || !type || !imageUrl || !accentColor) {
    return undefined;
  }

  const parsedValue = estimatedValueBrl ? Number(estimatedValueBrl) : undefined;
  const gameType = rawGameType && isCardGameType(rawGameType) ? rawGameType : undefined;
  const price = parseRoutePriceParams(params);

  return {
    id,
    name,
    setName,
    number,
    type,
    imageUrl,
    accentColor,
    ...(gameType ? { gameType } : {}),
    ...(price ? { price } : {}),
    ...(rarity ? { rarity } : {}),
    ...(tcgplayerId ? { tcgplayerId } : {}),
    ...(parsedValue != null && !Number.isNaN(parsedValue)
      ? { estimatedValueBrl: parsedValue }
      : {}),
  };
}

export const MOCK_SCANNED_CARD: ScannedCard = {
  id: 'pikachu-base-set',
  name: 'Pikachu',
  setName: 'Base Set',
  number: '#58/102',
  type: 'Electric',
  imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
  accentColor: '#F7D046',
};
