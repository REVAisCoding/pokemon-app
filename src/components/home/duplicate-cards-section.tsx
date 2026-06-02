import { ScrollView, View } from 'react-native';

import { CollectionCardItem } from '@/components/home/collection-card-item';
import { SectionHeader } from '@/components/home/section-header';
import { ThemedText } from '@/components/themed-text';
import { CollectionCard } from '@/contexts/card-collection-context';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
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
  const styles = usePokemonStyles(createStyles);
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
  const styles = usePokemonStyles(createStyles);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.emptyHint}>
      <ThemedText style={styles.emptyHintText}>Nenhuma carta repetida ainda</ThemedText>
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
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
    alignItems: 'center' as const,
  },
  emptyHintText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center' as const,
  },
};
}
