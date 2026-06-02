import { useFocusEffect } from '@react-navigation/native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getCardGameConfig } from '@/config/cardGames';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { useAuth } from '@/contexts/auth-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import {
  getScanJob,
  SCAN_JOB_POLL_INTERVAL_MS,
  type ScanJob,
} from '@/services/scanJobService';

import { type CardGameType } from '@/types/cardGame';

const LOADING_TITLE: Record<CardGameType, string> = {
  pokemon: 'Analisando carta de Pokémon...',
  riftbound: 'Analisando carta de Riftbound...',
  magic: 'Analisando carta de Magic...',
  onepiece: 'Analisando carta de One Piece...',
};

function navigateForCompletedJob(router: ReturnType<typeof useRouter>, completedJob: ScanJob) {
  const candidates = completedJob.resultCandidates ?? [];
  const gameType = completedJob.gameType;

  if (candidates.length > 0) {
    router.replace({
      pathname: '/scan/confirm',
      params: { jobId: completedJob.id },
    } as Href);
    return;
  }

  if (gameType === 'magic') {
    router.replace({
      pathname: '/scan/error',
      params: {
        message: 'Não consegui identificar a carta.',
      },
    } as Href);
    return;
  }

  router.replace({
    pathname: '/search',
    params: { initialQuery: completedJob.detectedName?.trim() ?? '' },
  } as Href);
}

export function ScanJobStatusScreen() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const { session } = useAuth();
  const { selectedGame } = useGameSelection();
  const { jobId: rawJobId } = useLocalSearchParams<{ jobId?: string | string[] }>();
  const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
  const [job, setJob] = useState<ScanJob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handledRef = useRef(false);

  const gameType = (job?.gameType ?? selectedGame ?? 'pokemon') as CardGameType;
  const gameConfig = getCardGameConfig(gameType);

  useFocusEffect(
    useCallback(() => {
      if (!jobId || !session?.access_token) {
        return;
      }

      handledRef.current = false;
      setErrorMessage(null);

      let isActive = true;
      let pollTimeout: ReturnType<typeof setTimeout> | null = null;

      const poll = async () => {
        if (!isActive || handledRef.current) {
          return;
        }

        try {
          const nextJob = await getScanJob(jobId, session.access_token);

          if (!isActive || handledRef.current) {
            return;
          }

          setJob(nextJob);

          if (nextJob.status === 'completed') {
            handledRef.current = true;
            navigateForCompletedJob(router, nextJob);
            return;
          }

          if (nextJob.status === 'failed') {
            handledRef.current = true;
            router.replace({
              pathname: '/scan/error',
              params: {
                message: nextJob.errorMessage ?? 'Não foi possível analisar a carta.',
              },
            } as Href);
            return;
          }

          pollTimeout = setTimeout(() => {
            void poll();
          }, SCAN_JOB_POLL_INTERVAL_MS);
        } catch (error) {
          if (!isActive || handledRef.current) {
            return;
          }

          handledRef.current = true;
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível acompanhar o scan.',
          );
        }
      };

      void poll();

      return () => {
        isActive = false;
        handledRef.current = true;

        if (pollTimeout) {
          clearTimeout(pollTimeout);
        }
      };
    }, [jobId, router, session?.access_token]),
  );

  const handleGoHome = () => {
    handledRef.current = true;
    router.replace('/' as Href);
  };

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.content}>
          <View style={styles.card}>
            <ThemedText style={styles.title}>Erro no scan</ThemedText>
            <ThemedText style={styles.subtitle}>{errorMessage}</ThemedText>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={handleGoHome}>
              <ThemedText style={styles.secondaryButtonText}>Voltar ao início</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconRing}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <ThemedText style={styles.title}>{LOADING_TITLE[gameType]}</ThemedText>
          <ThemedText style={styles.subtitle}>
            Seu scan está na fila. Você pode sair desta tela e acompanhar em &quot;Scans em
            andamento&quot; na Home. Buscando candidatos em {gameConfig.label}.
          </ThemedText>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            onPress={handleGoHome}>
            <ThemedText style={styles.secondaryButtonText}>Ir para Home</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    content: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: Spacing.four,
    },
    card: {
      width: '100%' as const,
      maxWidth: 320,
      alignItems: 'center' as const,
      backgroundColor: colors.white,
      borderRadius: 24,
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.five,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
      gap: Spacing.two,
    },
    iconRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: 'rgba(108, 99, 255, 0.1)',
      marginBottom: Spacing.one,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      textAlign: 'center' as const,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: 'center' as const,
    },
    secondaryButton: {
      marginTop: Spacing.two,
      backgroundColor: colors.white,
      borderRadius: 999,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '700' as const,
      color: colors.primary,
    },
    pressed: {
      opacity: 0.85,
    },
  };
}
