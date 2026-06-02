import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DisplayNameEditor } from '@/components/profile/display-name-editor';
import { ExchangeRateSection } from '@/components/profile/exchange-rate-section';
import { ProfileSection } from '@/components/profile/profile-section';
import { ThemedText } from '@/components/themed-text';
import { getCardGameById } from '@/constants/card-games';
import { useAuth } from '@/contexts/auth-context';
import { useCardCollection } from '@/contexts/card-collection-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { PokemonColors } from '@/constants/pokemon-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { confirmAction } from '@/utils/confirm-action';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { selectedGame } = useGameSelection();
  const { totalCards, uniqueSets, isOnline, isSyncing } = useCardCollection();
  const currentGame = selectedGame ? getCardGameById(selectedGame) : null;

  const handleChangeGamePress = () => {
    router.push('/game-select');
  };

  const handleSignOut = async () => {
    const confirmed = await confirmAction({
      title: 'Sair da conta',
      message: 'Deseja encerrar a sessão neste dispositivo?',
      confirmLabel: 'Sair',
      cancelLabel: 'Cancelar',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.title}>Perfil</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sua coleção é sincronizada na nuvem com Supabase.
          </ThemedText>

          <DisplayNameEditor />

          <ProfileSection label="Conta">
            <ThemedText style={styles.value}>{user?.email ?? '—'}</ThemedText>
          </ProfileSection>

          <ProfileSection label="Jogo">
            <ThemedText style={styles.value}>{currentGame?.name ?? '—'}</ThemedText>
            <Pressable
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              onPress={handleChangeGamePress}
              accessibilityRole="button"
              accessibilityLabel="Trocar jogo de cartas">
              <ThemedText style={styles.linkButtonText}>Trocar jogo</ThemedText>
            </Pressable>
          </ProfileSection>

          <ProfileSection label="Coleção">
            <ThemedText style={styles.value}>
              {totalCards} cartas · {uniqueSets} sets
            </ThemedText>
          </ProfileSection>

          <ProfileSection label="Sincronização">
            <ThemedText style={styles.value}>
              {isOnline ? (isSyncing ? 'Sincronizando…' : 'Online') : 'Offline (usando cache local)'}
            </ThemedText>
          </ProfileSection>

          <ExchangeRateSection />

          <Pressable
            style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
            onPress={() => void handleSignOut()}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta">
            <ThemedText style={styles.signOutButtonText}>Sair da conta</ThemedText>
          </Pressable>
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
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
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
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: PokemonColors.textPrimary,
  },
  linkButton: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  linkButtonText: {
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
