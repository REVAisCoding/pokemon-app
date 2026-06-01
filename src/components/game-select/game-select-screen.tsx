import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { CARD_GAMES, type CardGame } from '@/constants/card-games';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import { useGameSelection } from '@/contexts/game-selection-context';

type GameCardProps = {
  game: CardGame;
  onPress: () => void;
};

const GAME_ICONS: Record<CardGame['id'], string> = {
  pokemon: '⚡',
  riftbound: '🃏',
  magic: '🔮',
};

function GameCard({ game, onPress }: GameCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.gameCard, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir coleção ${game.name}`}>
      <View style={[styles.gameIcon, { backgroundColor: game.accentColor }]}>
        <ThemedText style={styles.gameIconText}>{GAME_ICONS[game.id]}</ThemedText>
      </View>
      <View style={styles.gameContent}>
        <ThemedText style={styles.gameName}>{game.name}</ThemedText>
        <ThemedText style={styles.gameDescription}>{game.description}</ThemedText>
      </View>
      <ThemedText style={styles.chevron}>›</ThemedText>
    </Pressable>
  );
}

export function GameSelectScreen() {
  const router = useRouter();
  const { selectedGame, selectGame } = useGameSelection();
  const canGoBack = selectedGame !== null;

  const handleGamePress = (gameId: CardGame['id']) => {
    void selectGame(gameId).then(() => {
      router.replace('/');
    });
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {canGoBack ? (
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={handleBackPress}
              accessibilityRole="button"
              accessibilityLabel="Voltar para a coleção">
              <ThemedText style={styles.backButtonText}>← Voltar</ThemedText>
            </Pressable>
          ) : null}

          <View style={styles.header}>
            <ThemedText style={styles.eyebrow}>Card Collection</ThemedText>
            <ThemedText style={styles.title}>Escolha seu jogo</ThemedText>
            <ThemedText style={styles.subtitle}>
              Selecione qual coleção de cartas você quer visualizar e gerenciar.
            </ThemedText>
          </View>

          <View style={styles.gamesList}>
            {CARD_GAMES.map((game) => (
              <GameCard key={game.id} game={game} onPress={() => handleGamePress(game.id)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.three,
    paddingVertical: Spacing.one,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: PokemonColors.primary,
  },
  header: {
    marginBottom: Spacing.four,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
    color: PokemonColors.primary,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 15,
    color: PokemonColors.textSecondary,
    lineHeight: 22,
  },
  gamesList: {
    gap: Spacing.two,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PokemonColors.white,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIconText: {
    fontSize: 28,
  },
  gameContent: {
    flex: 1,
    gap: Spacing.one,
  },
  gameName: {
    fontSize: 17,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
  },
  gameDescription: {
    fontSize: 13,
    color: PokemonColors.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
    color: PokemonColors.textMuted,
  },
  pressed: {
    opacity: 0.85,
  },
});
