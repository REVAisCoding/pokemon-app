import { useMemo } from 'react';

import { useExchangeRates } from '@/contexts/exchange-rate-context';
import { type CardPrice } from '@/types/cardGame';
import {
  calculateCollectionEstimatedValue,
  formatCardPrice,
  formatCardPriceLabel,
  priceToBrl,
  type PriceableCard,
} from '@/utils/pricing';

export function usePricing() {
  const { rates } = useExchangeRates();

  return useMemo(
    () => ({
      rates,
      priceToBrl: (price: CardPrice) => priceToBrl(price, rates),
      formatCardPrice: (price: CardPrice) => formatCardPrice(price, rates),
      formatCardPriceLabel: (card: PriceableCard) => formatCardPriceLabel(card, rates),
      calculateCollectionEstimatedValue: (cards: PriceableCard[]) =>
        calculateCollectionEstimatedValue(cards, rates),
    }),
    [rates],
  );
}
