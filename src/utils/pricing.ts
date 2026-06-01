import {
  type CardPrice,
  type CardPriceSource,
  isCardPriceSource,
} from '@/types/cardGame';

const USD_TO_BRL = 5.75;
const EUR_TO_BRL = 6.35;

export type PriceableCard = {
  price?: CardPrice;
  /** @deprecated use price */
  estimatedValueBrl?: number;
  quantity?: number;
};

export function isPriceAvailable(price?: CardPrice | null): boolean {
  return price != null && price.source !== 'unavailable' && price.amount > 0;
}

export function createUnavailablePrice(currency = 'USD'): CardPrice {
  return {
    amount: 0,
    currency,
    source: 'unavailable',
  };
}

export function createManualPrice(amount: number, currency = 'BRL'): CardPrice {
  return {
    amount,
    currency,
    source: 'manual',
    updatedAt: new Date().toISOString(),
  };
}

export function migrateLegacyEstimatedValueBrl(estimatedValueBrl?: number): CardPrice | undefined {
  if (estimatedValueBrl == null || estimatedValueBrl <= 0) {
    return undefined;
  }

  return {
    amount: estimatedValueBrl,
    currency: 'BRL',
    source: 'pokemon_tcg_api',
  };
}

export function getCardPrice(card: PriceableCard): CardPrice | undefined {
  if (card.price && isPriceAvailable(card.price)) {
    return card.price;
  }

  return migrateLegacyEstimatedValueBrl(card.estimatedValueBrl);
}

export function resolveScannedCardPrice(
  card: Pick<PriceableCard, 'price' | 'estimatedValueBrl'>,
): CardPrice | undefined {
  const price = getCardPrice(card);
  return price && isPriceAvailable(price) ? price : undefined;
}

export function formatCardPrice(price: CardPrice): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: price.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price.amount);
}

export function formatCardPriceLabel(card: PriceableCard): string {
  const price = getCardPrice(card);

  if (!price) {
    return 'Preço indisponível';
  }

  return formatCardPrice(price);
}

export function formatCollectionEstimatedValueBrl(totalBrl: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalBrl);
}

export function priceToBrl(price: CardPrice): number {
  if (price.currency === 'BRL') {
    return price.amount;
  }

  if (price.currency === 'USD') {
    return price.amount * USD_TO_BRL;
  }

  if (price.currency === 'EUR') {
    return price.amount * EUR_TO_BRL;
  }

  return price.amount;
}

export function calculateCollectionEstimatedValue(cards: PriceableCard[]): number {
  return cards.reduce((total, card) => {
    const price = getCardPrice(card);
    const quantity = card.quantity ?? 1;

    if (!price) {
      return total;
    }

    return total + priceToBrl(price) * quantity;
  }, 0);
}

export function isStoredCardPrice(value: unknown): value is CardPrice {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const price = value as Record<string, unknown>;

  return (
    typeof price.amount === 'number' &&
    price.amount >= 0 &&
    typeof price.currency === 'string' &&
    typeof price.source === 'string' &&
    isCardPriceSource(price.source) &&
    (price.updatedAt === undefined || typeof price.updatedAt === 'string')
  );
}

export function parseRoutePriceParams(params: {
  priceAmount?: string | string[];
  priceCurrency?: string | string[];
  priceSource?: string | string[];
}): CardPrice | undefined {
  const amountRaw = Array.isArray(params.priceAmount) ? params.priceAmount[0] : params.priceAmount;
  const currencyRaw = Array.isArray(params.priceCurrency)
    ? params.priceCurrency[0]
    : params.priceCurrency;
  const sourceRaw = Array.isArray(params.priceSource) ? params.priceSource[0] : params.priceSource;

  if (!amountRaw || !currencyRaw || !sourceRaw || !isCardPriceSource(sourceRaw)) {
    return undefined;
  }

  const amount = Number(amountRaw);

  if (Number.isNaN(amount)) {
    return undefined;
  }

  return {
    amount,
    currency: currencyRaw,
    source: sourceRaw,
  };
}

export function cardPriceToRouteParams(price: CardPrice): {
  priceAmount: string;
  priceCurrency: string;
  priceSource: CardPriceSource;
} {
  return {
    priceAmount: String(price.amount),
    priceCurrency: price.currency,
    priceSource: price.source,
  };
}

type PokemonTcgPlayerVariant = {
  market?: number | null;
};

type PokemonTcgPlayerPrices = {
  holofoil?: PokemonTcgPlayerVariant;
  normal?: PokemonTcgPlayerVariant;
  reverseHolofoil?: PokemonTcgPlayerVariant;
};

type PokemonTcgCardmarketPrices = {
  averageSellPrice?: number | null;
};

export type PokemonTcgApiPricing = {
  tcgplayer?: {
    prices?: PokemonTcgPlayerPrices;
  };
  cardmarket?: {
    prices?: PokemonTcgCardmarketPrices;
  };
};

export function extractPokemonTcgApiPrice(
  card: PokemonTcgApiPricing,
  updatedAt = new Date().toISOString(),
): CardPrice {
  const holofoilMarket = card.tcgplayer?.prices?.holofoil?.market;
  const normalMarket = card.tcgplayer?.prices?.normal?.market;
  const reverseHoloMarket = card.tcgplayer?.prices?.reverseHolofoil?.market;
  const cardmarketAverage = card.cardmarket?.prices?.averageSellPrice;

  if (typeof holofoilMarket === 'number' && holofoilMarket > 0) {
    return {
      amount: holofoilMarket,
      currency: 'USD',
      source: 'pokemon_tcg_api',
      updatedAt,
    };
  }

  if (typeof normalMarket === 'number' && normalMarket > 0) {
    return {
      amount: normalMarket,
      currency: 'USD',
      source: 'pokemon_tcg_api',
      updatedAt,
    };
  }

  if (typeof reverseHoloMarket === 'number' && reverseHoloMarket > 0) {
    return {
      amount: reverseHoloMarket,
      currency: 'USD',
      source: 'pokemon_tcg_api',
      updatedAt,
    };
  }

  if (typeof cardmarketAverage === 'number' && cardmarketAverage > 0) {
    return {
      amount: cardmarketAverage,
      currency: 'EUR',
      source: 'pokemon_tcg_api',
      updatedAt,
    };
  }

  return createUnavailablePrice('USD');
}
