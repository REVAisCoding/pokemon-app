import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { usePricing } from '@/hooks/use-pricing';
import {
  formatCollectionEstimatedValueBrl,
  getCardPrice,
  type PriceableCard,
} from '@/utils/pricing';

type CardEstimatedValueProps = {
  card?: PriceableCard;
  /** @deprecated pass card instead */
  valueBrl?: number | null;
  variant?: 'default' | 'prominent';
};

export function CardEstimatedValue({ card, valueBrl, variant = 'default' }: CardEstimatedValueProps) {
  const { formatCardPrice } = usePricing();
  const price = card ? getCardPrice(card) : undefined;
  let label: string | null = null;

  if (price) {
    label = formatCardPrice(price);
  } else if (valueBrl != null && valueBrl > 0) {
    label = formatCollectionEstimatedValueBrl(valueBrl);
  }

  if (!label) {
    return null;
  }

  return (
    <ThemedText
      style={[styles.value, variant === 'prominent' && styles.valueProminent]}
      numberOfLines={1}>
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: PokemonColors.statGreen,
    marginTop: 2,
  },
  valueProminent: {
    fontSize: 14,
    marginTop: 0,
  },
});
