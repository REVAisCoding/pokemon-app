import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getCardGameConfig } from '@/config/cardGames';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import { useGameSelection } from '@/contexts/game-selection-context';
import { identifyCardFromImage } from '@/services/scanService';
import {
  consumePendingScanImage,
  setPendingScanCandidates,
} from '@/services/scanResultStore';

import { type CardGameType } from '@/types/cardGame';

const LOADING_TITLE: Record<CardGameType, string> = {
  pokemon: 'Analisando carta de Pokémon...',
  riftbound: 'Analisando carta de Riftbound...',
  magic: 'Analisando carta de Magic...',
};

export function LoadingScreen() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const { selectedGame } = useGameSelection();
  const gameType = selectedGame ?? 'pokemon';
  const gameConfig = getCardGameConfig(gameType);
  const { imageUri: imageUriParam } = useLocalSearchParams<{ imageUri?: string }>();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const identifyCard = async () => {
      const imageUri = consumePendingScanImage() ?? imageUriParam;

      if (!imageUri) {
        router.replace({
          pathname: '/scan/error',
          params: { message: 'Não foi possível processar a foto capturada.' },
        } as Href);
        return;
      }

      const result = await identifyCardFromImage(imageUri, gameType);

      if (result.status === 'candidates') {
        setPendingScanCandidates(result.cards, result.extractedName);
        router.replace('/scan/confirm' as Href);
        return;
      }

      if (result.status === 'low_confidence') {
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
          params: { initialQuery: result.cardName?.trim() ?? '' },
        } as Href);
        return;
      }

      if (result.status === 'not_found') {
        router.replace({
          pathname: '/scan/error',
          params: { cardName: result.cardName ?? undefined },
        } as Href);
        return;
      }

      router.replace({
        pathname: '/scan/error',
        params: { message: result.message },
      } as Href);
    };

    void identifyCard();
  }, [gameType, imageUriParam, router]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconRing}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <ThemedText style={styles.title}>{LOADING_TITLE[gameType]}</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enviando a foto para reconhecimento com IA e buscando candidatos em{' '}
            {gameConfig.label}. Pode levar até 1 minuto.
          </ThemedText>
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
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: Spacing.one,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
};
}
