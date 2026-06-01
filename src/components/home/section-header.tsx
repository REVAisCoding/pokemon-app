import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, actionLabel = 'Ver todas', onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <ThemedText style={styles.action}>{actionLabel} ›</ThemedText>
        </Pressable>
      ) : (
        <ThemedText style={styles.action}>{actionLabel} ›</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: PokemonColors.primary,
  },
});
