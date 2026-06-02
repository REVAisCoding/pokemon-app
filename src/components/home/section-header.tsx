import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, actionLabel = 'Ver todas', onActionPress }: SectionHeaderProps) {
  const styles = usePokemonStyles(createStyles);
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

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  action: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
};
}
