import { Pressable, ScrollView, View } from 'react-native';

import { CollectionCardItem } from '@/components/home/collection-card-item';
import { SectionHeader } from '@/components/home/section-header';
import { ThemedText } from '@/components/themed-text';
import { CollectionCard } from '@/contexts/card-collection-context';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

type RecentCollectionSectionProps = {
  cards: CollectionCard[];
  onSeeAllPress?: () => void;
  onCardPress?: (id: string) => void;
  onScanFirstPress?: () => void;
};

export function RecentCollectionSection({
  cards,
  onSeeAllPress,
  onCardPress,
  onScanFirstPress,
}: RecentCollectionSectionProps) {
  const styles = usePokemonStyles(createStyles);
  return (
    <View style={styles.container}>
      <SectionHeader title="Coleção recente" onActionPress={onSeeAllPress} />

      {cards.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Você ainda não adicionou cartas</ThemedText>
          <Pressable
            style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            onPress={onScanFirstPress}
            accessibilityRole="button"
            accessibilityLabel="Escanear primeira carta">
            <ThemedText style={styles.emptyButtonText}>Escanear primeira carta</ThemedText>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}>
          {cards.map((card) => (
            <CollectionCardItem
              key={card.id}
              card={card}
              onPress={onCardPress ? () => onCardPress(card.id) : undefined}
            />
          ))}
        </ScrollView>
      )}
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
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center' as const,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: Spacing.three,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
