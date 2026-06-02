import { type Href, Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import { isSupabaseConfigured } from '@/lib/supabase';

type AuthFormScreenProps = {
  mode: 'login' | 'register';
  title: string;
  subtitle: string;
  submitLabel: string;
  alternatePrompt: string;
  alternateHref: Href;
  alternateLabel: string;
  onSubmit: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{ error: string | null }>;
};

export function AuthFormScreen({
  mode,
  title,
  subtitle,
  submitLabel,
  alternatePrompt,
  alternateHref,
  alternateLabel,
  onSubmit,
}: AuthFormScreenProps) {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Preencha e-mail e senha.');
      return;
    }

    if (mode === 'register' && !trimmedDisplayName) {
      setErrorMessage('Informe um nome de usuário.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await onSubmit(
        trimmedEmail,
        password,
        mode === 'register' ? trimmedDisplayName : undefined,
      );

      if (error) {
        setErrorMessage(error);
      } else if (mode === 'register') {
        setErrorMessage('Conta criada! Verifique seu e-mail se a confirmação estiver ativa.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <ThemedText style={styles.eyebrow}>Pokémon Collection</ThemedText>
              <ThemedText style={styles.title}>{title}</ThemedText>
              <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            </View>

            {!isSupabaseConfigured ? (
              <View style={styles.setupBanner}>
                <ThemedText style={styles.setupBannerTitle}>Configure o Supabase</ThemedText>
                <ThemedText style={styles.setupBannerText}>
                  Edite o arquivo pokemon-app/.env com a URL e a chave anon do seu projeto
                  (Settings → API no dashboard do Supabase). Depois reinicie com npx expo start
                  -c.
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.formCard}>
              {mode === 'register' ? (
                <>
                  <ThemedText style={styles.label}>Nome de usuário</ThemedText>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    autoComplete="username"
                    placeholder="Como quer ser chamado?"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />
                </>
              ) : null}

              <ThemedText style={styles.label}>E-mail</ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="seu@email.com"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <ThemedText style={styles.label}>Senha</ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === 'login' ? 'password' : 'new-password'}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              {errorMessage ? (
                <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  isSubmitting && styles.disabled,
                ]}
                onPress={() => void handleSubmit()}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel={submitLabel}>
                {isSubmitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>{submitLabel}</ThemedText>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>{alternatePrompt}</ThemedText>
              <Link href={alternateHref} asChild>
                <Pressable accessibilityRole="link">
                  <ThemedText style={styles.footerLink}>{alternateLabel}</ThemedText>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  header: {
    marginBottom: Spacing.four,
  },
  setupBanner: {
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.25)',
  },
  setupBannerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: Spacing.one,
  },
  setupBannerText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
    color: colors.primary,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    color: colors.textPrimary,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  errorText: {
    fontSize: 13,
    color: '#D92D20',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center' as const,
    marginTop: Spacing.one,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
  footer: {
    marginTop: Spacing.four,
    alignItems: 'center' as const,
    gap: Spacing.one,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
  },
};
}
