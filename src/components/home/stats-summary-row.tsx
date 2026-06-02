import { Pressable, View } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import { HomeStat } from '@/constants/home-data';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

const PRESSABLE_STAT_IDS = new Set(['duplicates', 'sets', 'rares']);

type StatsSummaryRowProps = {
  stats: HomeStat[];
  onStatPress?: (statId: HomeStat['id']) => void;
};

const STAT_ICONS: Record<HomeStat['icon'], { name: SFSymbol; fallback: string }> = {
  cards: { name: 'rectangle.on.rectangle', fallback: '🃏' },
  unique: { name: 'square.stack', fallback: '▣' },
  duplicates: { name: 'doc.on.doc', fallback: '⧉' },
  sets: { name: 'star', fallback: '★' },
  rares: { name: 'diamond', fallback: '◆' },
  value: { name: 'chart.line.uptrend.xyaxis', fallback: '↗' },
};

function getStatIconColors(colors: PokemonColorPalette): Record<HomeStat['icon'], string> {
  return {
    cards: colors.statPurple,
    unique: colors.statPurple,
    duplicates: colors.statOrange,
    sets: colors.statOrange,
    rares: colors.statGreen,
    value: colors.statBlue,
  };
}

function StatItem({
  stat,
  showDivider,
  onStatPress,
  statIconColors,
}: {
  stat: HomeStat;
  showDivider: boolean;
  onStatPress?: (statId: HomeStat['id']) => void;
  statIconColors: Record<HomeStat['icon'], string>;
}) {
  const styles = usePokemonStyles(createStyles);
  const iconColor = statIconColors[stat.icon];
  const icon = STAT_ICONS[stat.icon];
  const isPressable = onStatPress !== undefined && PRESSABLE_STAT_IDS.has(stat.id);

  const content = (
    <>
      <HomeIcon name={icon.name} fallback={icon.fallback} color={iconColor} />
      <ThemedText style={styles.value}>{stat.value}</ThemedText>
      <ThemedText style={styles.label}>{stat.label}</ThemedText>
    </>
  );

  return (
    <>
      {isPressable ? (
        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          onPress={() => onStatPress(stat.id)}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${stat.label.toLowerCase()} na coleção`}>
          {content}
        </Pressable>
      ) : (
        <View style={styles.item}>{content}</View>
      )}
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

export function StatsSummaryRow({ stats, onStatPress }: StatsSummaryRowProps) {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const statIconColors = getStatIconColors(colors);

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <StatItem
          key={stat.id}
          stat={stat}
          showDivider={index < stats.length - 1}
          onStatPress={onStatPress}
          statIconColors={statIconColors}
        />
      ))}
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'stretch' as const,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    marginBottom: Spacing.three,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    paddingHorizontal: 4,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: Spacing.one,
  },
  value: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
