import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { CardEstimatedValue } from '@/components/shared/card-estimated-value';
import { ThemedText } from '@/components/themed-text';
import { type ScannedCard } from '@/constants/scan-data';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import {
  CARD_VIEWER_LONG_PRESS_DELAY_MS,
  cardToViewerParams,
  createCardViewerLongPressHandler,
} from '@/utils/cardViewerGestures';

type SearchResultGridItemProps = {
  card: ScannedCard;
  onPress: () => void;
};

export function SearchResultGridItem({ card, onPress }: SearchResultGridItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      onLongPress={createCardViewerLongPressHandler(cardToViewerParams(card))}
      delayLongPress={CARD_VIEWER_LONG_PRESS_DELAY_MS}
      accessibilityRole="button"
      accessibilityHint="Pressione e segure para visualizar a carta em tela cheia"
      accessibilityLabel={`${card.name}, ${card.setName}`}>
      <View style={styles.card}>
        <Image
          source={{ uri: card.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        <ThemedText style={styles.name} numberOfLines={1}>
          {card.name}
        </ThemedText>
        <ThemedText style={styles.meta} numberOfLines={1}>
          {card.setName}
        </ThemedText>
        <ThemedText style={styles.meta}>{card.number}</ThemedText>
        <CardEstimatedValue card={card} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: PokemonColors.white,
    borderRadius: 16,
    padding: Spacing.two,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  image: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 12,
    backgroundColor: PokemonColors.border,
    marginBottom: Spacing.two,
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
