import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  formatSetProgress,
  getSetAbbreviation,
  getSetDisplayImage,
} from '@/hooks/use-enriched-set-groups';
import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import { type CollectionSetGroup } from '@/types/collection-set';

type SetGridItemProps = {
  set: CollectionSetGroup;
  onPress: () => void;
};

export function SetGridItem({ set, onPress }: SetGridItemProps) {
  const imageUri = getSetDisplayImage(set);
  const abbreviation = getSetAbbreviation(set.setName);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${set.setName}, ${formatSetProgress(set)}`}>
      <View style={styles.card}>
        <View style={styles.icon}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.logo} contentFit="contain" transition={200} />
          ) : (
            <ThemedText style={styles.abbreviation}>{abbreviation}</ThemedText>
          )}
        </View>

        <ThemedText style={styles.name} numberOfLines={2}>
          {set.setName}
        </ThemedText>
        <ThemedText style={styles.meta}>{set.uniqueCardsOwned} cartas únicas</ThemedText>
        <ThemedText style={styles.meta}>{set.totalCardsOwned} total</ThemedText>
        {set.completionPercentage != null ? (
          <ThemedText style={styles.progress}>{set.completionPercentage}% concluído</ThemedText>
        ) : null}
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
    alignItems: 'center',
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
    backgroundColor: PokemonColors.screenBackground,
    borderWidth: 1,
    borderColor: PokemonColors.border,
    overflow: 'hidden',
  },
  logo: {
    width: '82%',
    height: '82%',
  },
  abbreviation: {
    fontSize: 18,
    fontWeight: '800',
    color: PokemonColors.primary,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.one,
    minHeight: 36,
  },
  meta: {
    fontSize: 12,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
  },
  progress: {
    fontSize: 12,
    fontWeight: '700',
    color: PokemonColors.primary,
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  pressed: {
    opacity: 0.85,
  },
});
