import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getCardGameConfig } from '@/config/cardGames';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import { useGameSelection } from '@/contexts/game-selection-context';
import { identifyCardFromImage } from '@/services/scanService';
import { setPendingScanCandidates } from '@/services/scanResultStore';

import { type CardGameType } from '@/types/cardGame';

const LOADING_TITLE: Record<CardGameType, string> = {
  pokemon: 'Analisando carta de Pokémon...',
  riftbound: 'Analisando carta de Riftbound...',
};

export function LoadingScreen() {
  const router = useRouter();
  const { selectedGame } = useGameSelection();
  const gameType = selectedGame ?? 'pokemon';
  const gameConfig = getCardGameConfig(gameType);
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const identifyCard = async () => {
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
  }, [gameType, imageUri, router]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconRing}>
            <ActivityIndicator size="large" color={PokemonColors.primary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    backgroundColor: PokemonColors.white,
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
  },
});
