import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getCardGameById } from '@/constants/card-games';
import { useAuth } from '@/contexts/auth-context';
import { useCardCollection } from '@/contexts/card-collection-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { PokemonColors } from '@/constants/pokemon-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { selectedGame } = useGameSelection();
  const { totalCards, uniqueSets, isOnline, isSyncing } = useCardCollection();
  const currentGame = selectedGame ? getCardGameById(selectedGame) : null;

  const handleChangeGamePress = () => {
    router.push('/game-select');
  };

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Deseja encerrar a sessão neste dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => {
            router.replace('/login');
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText style={styles.title}>Perfil</ThemedText>
        <ThemedText style={styles.subtitle}>
          Sua coleção é sincronizada na nuvem com Supabase.
        </ThemedText>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Conta</ThemedText>
          <ThemedText style={styles.value}>{user?.email ?? '—'}</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Jogo</ThemedText>
          <ThemedText style={styles.value}>{currentGame?.name ?? '—'}</ThemedText>
          <Pressable
            style={({ pressed }) => [styles.changeGameButton, pressed && styles.pressed]}
            onPress={handleChangeGamePress}
            accessibilityRole="button"
            accessibilityLabel="Trocar jogo de cartas">
            <ThemedText style={styles.changeGameButtonText}>Trocar jogo</ThemedText>
          </Pressable>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Coleção</ThemedText>
          <ThemedText style={styles.value}>
            {totalCards} cartas · {uniqueSets} sets
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Sincronização</ThemedText>
          <ThemedText style={styles.value}>
            {isOnline ? (isSyncing ? 'Sincronizando…' : 'Online') : 'Offline (usando cache local)'}
          </ThemedText>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta">
          <ThemedText style={styles.signOutButtonText}>Sair da conta</ThemedText>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    color: PokemonColors.textSecondary,
    marginBottom: Spacing.four,
    lineHeight: 20,
  },
  card: {
    backgroundColor: PokemonColors.white,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: PokemonColors.textSecondary,
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: PokemonColors.textPrimary,
  },
  changeGameButton: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  changeGameButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.primary,
  },
  signOutButton: {
    marginTop: Spacing.two,
    backgroundColor: PokemonColors.white,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PokemonColors.border,
  },
  signOutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D92D20',
  },
  pressed: {
    opacity: 0.85,
  },
});
