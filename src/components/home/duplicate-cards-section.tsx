import { ScrollView, StyleSheet, View } from 'react-native';

import { CollectionCardItem } from '@/components/home/collection-card-item';
import { SectionHeader } from '@/components/home/section-header';
import { ThemedText } from '@/components/themed-text';
import { CollectionCard } from '@/contexts/card-collection-context';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type DuplicateCardsSectionProps = {
  cards: CollectionCard[];
  onSeeAllPress?: () => void;
  onCardPress?: (id: string) => void;
};

export function DuplicateCardsSection({
  cards,
  onSeeAllPress,
  onCardPress,
}: DuplicateCardsSectionProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SectionHeader title="Cartas Repetidas" onActionPress={onSeeAllPress} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {cards.map((card) => (
          <CollectionCardItem
            key={card.id}
            card={card}
            quantityBadgeFormat="multiplier"
            onPress={onCardPress ? () => onCardPress(card.id) : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}

type DuplicateCardsEmptyHintProps = {
  visible: boolean;
};

export function DuplicateCardsEmptyHint({ visible }: DuplicateCardsEmptyHintProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.emptyHint}>
      <ThemedText style={styles.emptyHintText}>Nenhuma carta repetida ainda</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingRight: Spacing.three,
  },
  emptyHint: {
    marginBottom: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  emptyHintText: {
    fontSize: 13,
    color: PokemonColors.textMuted,
    textAlign: 'center',
  },
});
