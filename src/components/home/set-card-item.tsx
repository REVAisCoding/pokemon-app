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

type SetCardItemProps = {
  set: CollectionSetGroup;
  onPress?: () => void;
};

export function SetCardItem({ set, onPress }: SetCardItemProps) {
  const imageUri = getSetDisplayImage(set);
  const abbreviation = getSetAbbreviation(set.setName);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${set.setName}, ${formatSetProgress(set)}`}>
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
      <ThemedText style={styles.stats} numberOfLines={2}>
        {set.uniqueCardsOwned} únicas
      </ThemedText>
      <ThemedText style={styles.stats}>{set.totalCardsOwned} total</ThemedText>
      {set.completionPercentage != null ? (
        <ThemedText style={styles.progress}>{set.completionPercentage}%</ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 108,
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
    backgroundColor: PokemonColors.white,
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
    fontSize: 13,
    fontWeight: '600',
    color: PokemonColors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
    minHeight: 34,
  },
  stats: {
    fontSize: 11,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
  },
  progress: {
    fontSize: 12,
    fontWeight: '700',
    color: PokemonColors.primary,
    textAlign: 'center',
    marginTop: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
