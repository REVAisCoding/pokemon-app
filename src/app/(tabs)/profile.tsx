import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DarkModeSection } from '@/components/profile/dark-mode-section';
import { DisplayNameEditor } from '@/components/profile/display-name-editor';
import { ExchangeRateSection } from '@/components/profile/exchange-rate-section';
import { ProfileSection } from '@/components/profile/profile-section';
import { ThemedText } from '@/components/themed-text';
import { getCardGameById } from '@/constants/card-games';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useCardCollection } from '@/contexts/card-collection-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { confirmAction } from '@/utils/confirm-action';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { selectedGame } = useGameSelection();
  const { totalCards, uniqueSets, isOnline, isSyncing } = useCardCollection();
  const currentGame = selectedGame ? getCardGameById(selectedGame) : null;
  const styles = usePokemonStyles(createStyles);

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

          <DarkModeSection />

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

function createStyles(colors: PokemonColorPalette) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.screenBackground,
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
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginBottom: Spacing.one,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: Spacing.four,
      lineHeight: 20,
    },
    value: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    linkButton: {
      marginTop: Spacing.two,
      alignSelf: 'flex-start' as const,
      paddingVertical: Spacing.one,
    },
    linkButtonText: {
      fontSize: 14,
      fontWeight: '700' as const,
      color: colors.primary,
    },
    signOutButton: {
      marginTop: Spacing.two,
      backgroundColor: colors.white,
      borderRadius: 999,
      paddingVertical: Spacing.three,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.border,
    },
    signOutButtonText: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: '#D92D20',
    },
    pressed: {
      opacity: 0.85,
    },
  };
}
