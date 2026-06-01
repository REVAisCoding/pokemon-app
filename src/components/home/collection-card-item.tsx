import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { CardEstimatedValue } from '@/components/shared/card-estimated-value';
import { ThemedText } from '@/components/themed-text';
import { CollectionCard } from '@/contexts/card-collection-context';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import {
  CARD_VIEWER_LONG_PRESS_DELAY_MS,
  cardToViewerParams,
  createCardViewerLongPressHandler,
} from '@/utils/cardViewerGestures';

type QuantityBadgeFormat = 'plain' | 'multiplier';

type CollectionCardItemProps = {
  card: CollectionCard;
  onPress?: () => void;
  quantityBadgeFormat?: QuantityBadgeFormat;
};

export function CollectionCardItem({
  card,
  onPress,
  quantityBadgeFormat = 'plain',
}: CollectionCardItemProps) {
  const quantityLabel =
    quantityBadgeFormat === 'multiplier' ? `x${card.quantity}` : String(card.quantity);
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      onLongPress={createCardViewerLongPressHandler(cardToViewerParams(card))}
      delayLongPress={CARD_VIEWER_LONG_PRESS_DELAY_MS}
      accessibilityRole="button"
      accessibilityHint="Pressione e segure para visualizar a carta em tela cheia"
      accessibilityLabel={`${card.name}, ${card.set}`}>
      <View style={styles.imageWrapper}>
        <View style={styles.imagePlaceholder}>
          <Image
            source={{ uri: card.imageUrl }}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View
          style={[
            styles.quantityBadge,
            quantityBadgeFormat === 'multiplier' && styles.quantityBadgeHighlight,
          ]}>
          <ThemedText
            style={[
              styles.quantityText,
              quantityBadgeFormat === 'multiplier' && styles.quantityTextHighlight,
            ]}>
            {quantityLabel}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.name} numberOfLines={1}>
        {card.name}
      </ThemedText>
      <ThemedText style={styles.meta} numberOfLines={1}>
        {card.set}
      </ThemedText>
      <ThemedText style={styles.meta}>{card.number}</ThemedText>
      <CardEstimatedValue card={card} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 108,
    marginRight: Spacing.two,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: Spacing.two,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: PokemonColors.border,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  quantityBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PokemonColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityBadgeHighlight: {
    backgroundColor: PokemonColors.statOrange,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
  },
  quantityTextHighlight: {
    color: PokemonColors.white,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: PokemonColors.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
