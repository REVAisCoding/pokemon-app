import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getCardGameConfig } from '@/config/cardGames';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import { type ScanJob } from '@/services/scanJobService';

type PendingScansSectionProps = {
  jobs: ScanJob[];
  onJobPress?: (jobId: string) => void;
};

function formatStatusLabel(status: ScanJob['status']): string {
  if (status === 'pending') {
    return 'Na fila';
  }

  if (status === 'processing') {
    return 'Processando';
  }

  if (status === 'completed') {
    return 'Pronto para confirmar';
  }

  return status;
}

function PendingScanItem({
  job,
  onPress,
}: {
  job: ScanJob;
  onPress?: () => void;
}) {
  const styles = usePokemonStyles(createItemStyles);
  const gameConfig = getCardGameConfig(job.gameType);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Scan em andamento de ${gameConfig.label}`}>
      <View style={styles.imageFrame}>
        {job.imageUrl ? (
          <Image source={{ uri: job.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>
      <ThemedText style={styles.gameLabel} numberOfLines={1}>
        {gameConfig.label}
      </ThemedText>
      <ThemedText style={styles.statusLabel}>{formatStatusLabel(job.status)}</ThemedText>
    </Pressable>
  );
}

export function PendingScansSection({ jobs, onJobPress }: PendingScansSectionProps) {
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();

  const handleJobPress = useCallback(
    (job: ScanJob) => {
      if (onJobPress) {
        onJobPress(job.id);
        return;
      }

      if (job.status === 'completed') {
        router.push({
          pathname: '/scan/confirm',
          params: { jobId: job.id },
        } as Href);
        return;
      }

      router.push(`/scan/job/${encodeURIComponent(job.id)}` as Href);
    },
    [onJobPress, router],
  );

  if (jobs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Scans em andamento</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {jobs.map((job) => (
          <PendingScanItem key={job.id} job={job} onPress={() => handleJobPress(job)} />
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
    container: {
      marginBottom: Spacing.three,
    },
    title: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginBottom: Spacing.two,
    },
    listContent: {
      gap: Spacing.two,
      paddingRight: Spacing.one,
    },
  };
}

function createItemStyles(colors: PokemonColorPalette) {
  return {
    card: {
      width: 140,
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: Spacing.two,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    imageFrame: {
      borderRadius: 12,
      overflow: 'hidden' as const,
      aspectRatio: 0.72,
      backgroundColor: colors.border,
      marginBottom: Spacing.one,
    },
    image: {
      width: '100%' as const,
      height: '100%' as const,
    },
    imagePlaceholder: {
      flex: 1,
      backgroundColor: colors.border,
    },
    gameLabel: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    statusLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    pressed: {
      opacity: 0.85,
    },
  };
}
