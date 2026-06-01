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
import { PokemonColors } from '@/constants/pokemon-theme';
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
  onSubmit: (email: string, password: string) => Promise<{ error: string | null }>;
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Preencha e-mail e senha.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await onSubmit(trimmedEmail, password);

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
              <ThemedText style={styles.label}>E-mail</ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="seu@email.com"
                placeholderTextColor={PokemonColors.textMuted}
                style={styles.input}
              />

              <ThemedText style={styles.label}>Senha</ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === 'login' ? 'password' : 'new-password'}
                placeholder="••••••••"
                placeholderTextColor={PokemonColors.textMuted}
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
                  <ActivityIndicator color={PokemonColors.white} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
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
    fontWeight: '700',
    color: PokemonColors.primary,
    marginBottom: Spacing.one,
  },
  setupBannerText: {
    fontSize: 13,
    color: PokemonColors.textSecondary,
    lineHeight: 19,
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
  formCard: {
    backgroundColor: PokemonColors.white,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: PokemonColors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: PokemonColors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 15,
    color: PokemonColors.textPrimary,
    backgroundColor: PokemonColors.white,
  },
  errorText: {
    fontSize: 13,
    color: '#D92D20',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: PokemonColors.primary,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: PokemonColors.white,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
  footer: {
    marginTop: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  footerText: {
    fontSize: 14,
    color: PokemonColors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.primary,
  },
});
