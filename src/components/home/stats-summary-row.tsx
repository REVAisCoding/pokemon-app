import { StyleSheet, View } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import { HomeStat } from '@/constants/home-data';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type StatsSummaryRowProps = {
  stats: HomeStat[];
};

const STAT_ICON_COLORS: Record<HomeStat['icon'], string> = {
  cards: PokemonColors.statPurple,
  unique: PokemonColors.statPurple,
  duplicates: PokemonColors.statOrange,
  sets: PokemonColors.statOrange,
  rares: PokemonColors.statGreen,
  value: PokemonColors.statBlue,
};

const STAT_ICONS: Record<HomeStat['icon'], { name: SFSymbol; fallback: string }> = {
  cards: { name: 'rectangle.on.rectangle', fallback: '🃏' },
  unique: { name: 'square.stack', fallback: '▣' },
  duplicates: { name: 'doc.on.doc', fallback: '⧉' },
  sets: { name: 'star', fallback: '★' },
  rares: { name: 'diamond', fallback: '◆' },
  value: { name: 'chart.line.uptrend.xyaxis', fallback: '↗' },
};

function StatItem({ stat, showDivider }: { stat: HomeStat; showDivider: boolean }) {
  const iconColor = STAT_ICON_COLORS[stat.icon];
  const icon = STAT_ICONS[stat.icon];

  return (
    <>
      <View style={styles.item}>
        <HomeIcon name={icon.name} fallback={icon.fallback} color={iconColor} />
        <ThemedText style={styles.value}>{stat.value}</ThemedText>
        <ThemedText style={styles.label}>{stat.label}</ThemedText>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

export function StatsSummaryRow({ stats }: StatsSummaryRowProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <StatItem key={stat.id} stat={stat} showDivider={index < stats.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: PokemonColors.white,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    marginBottom: Spacing.three,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  divider: {
    width: 1,
    backgroundColor: PokemonColors.border,
    marginVertical: Spacing.one,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
  },
  label: {
    fontSize: 10,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
  },
});
