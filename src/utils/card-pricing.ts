import { type CardPrice } from '@/types/cardGame';
import {
  createUnavailablePrice,
  extractPokemonTcgApiPrice,
  priceToBrl,
  type PokemonTcgApiPricing,
} from '@/utils/pricing';

export type TcgDexCardmarketPricing = {
  trend?: number | null;
  avg?: number | null;
  low?: number | null;
  averageSellPrice?: number | null;
  unit?: string;
};

export type TcgDexTcgPlayerVariant = {
  marketPrice?: number | null;
  midPrice?: number | null;
  lowPrice?: number | null;
};

export type TcgDexTcgPlayerPricing = {
  unit?: string;
  normal?: TcgDexTcgPlayerVariant;
  holofoil?: TcgDexTcgPlayerVariant;
  reverseHolofoil?: TcgDexTcgPlayerVariant;
  [key: string]: TcgDexTcgPlayerVariant | string | undefined;
};

export type TcgDexPricing = {
  cardmarket?: TcgDexCardmarketPricing;
  tcgplayer?: TcgDexTcgPlayerPricing;
};

function getTcgPlayerMarketPrice(tcgplayer: TcgDexTcgPlayerPricing): number | null {
  const variants: TcgDexTcgPlayerVariant[] = [];

  for (const value of Object.values(tcgplayer)) {
    if (typeof value === 'object' && value !== null && 'marketPrice' in value) {
      variants.push(value);
    }
  }

  for (const variant of variants) {
    if (typeof variant.marketPrice === 'number' && variant.marketPrice > 0) {
      return variant.marketPrice;
    }
  }

  for (const variant of variants) {
    if (typeof variant.midPrice === 'number' && variant.midPrice > 0) {
      return variant.midPrice;
    }
  }

  return null;
}

export function pricingToCardPrice(pricing?: TcgDexPricing | null): CardPrice {
  if (!pricing) {
    return createUnavailablePrice('USD');
  }

  const tcgplayer = pricing.tcgplayer;
  const holofoilMarket = tcgplayer?.holofoil?.marketPrice;
  const normalMarket = tcgplayer?.normal?.marketPrice;
  const reverseHoloMarket = tcgplayer?.reverseHolofoil?.marketPrice;
  const cardmarketAverage =
    pricing.cardmarket?.averageSellPrice ??
    pricing.cardmarket?.trend ??
    pricing.cardmarket?.avg ??
    pricing.cardmarket?.low;

  const pokemonApiShape: PokemonTcgApiPricing = {
    tcgplayer: {
      prices: {
        ...(typeof holofoilMarket === 'number' ? { holofoil: { market: holofoilMarket } } : {}),
        ...(typeof normalMarket === 'number' ? { normal: { market: normalMarket } } : {}),
        ...(typeof reverseHoloMarket === 'number'
          ? { reverseHolofoil: { market: reverseHoloMarket } }
          : {}),
      },
    },
    cardmarket: {
      prices: {
        ...(typeof cardmarketAverage === 'number'
          ? { averageSellPrice: cardmarketAverage }
          : {}),
      },
    },
  };

  return extractPokemonTcgApiPrice(pokemonApiShape);
}

/** @deprecated use pricingToCardPrice */
export function pricingToEstimatedBrl(pricing?: TcgDexPricing | null): number | null {
  const price = pricingToCardPrice(pricing);

  if (price.source === 'unavailable') {
    return null;
  }

  return priceToBrl(price);
}

/** @deprecated use formatCollectionEstimatedValueBrl from @/utils/pricing */
export function formatEstimatedValueBrl(valueBrl: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueBrl);
}

/** @deprecated use formatCardPriceLabel from @/utils/pricing */
export function formatEstimatedValueLabel(valueBrl?: number | null): string | null {
  if (valueBrl == null || valueBrl <= 0) {
    return null;
  }

  return formatEstimatedValueBrl(valueBrl);
}

/** @deprecated use calculateCollectionEstimatedValue from @/utils/pricing */
export function sumCollectionEstimatedValue(
  cards: { estimatedValueBrl?: number; price?: CardPrice; quantity: number }[],
): number {
  return cards.reduce((total, card) => {
    const legacyValue = card.estimatedValueBrl;
    const priceAmount =
      card.price && card.price.source !== 'unavailable' && card.price.amount > 0
        ? card.price.amount
        : legacyValue;

    if (priceAmount == null || priceAmount <= 0) {
      return total;
    }

    return total + priceAmount * card.quantity;
  }, 0);
}
