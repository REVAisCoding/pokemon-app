import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getUserDisplayName, useAuth } from '@/contexts/auth-context';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

import { ProfileSection } from './profile-section';

export function DisplayNameEditor() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const { user, updateDisplayName } = useAuth();
  const [displayName, setDisplayName] = useState(() => getUserDisplayName(user));
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(getUserDisplayName(user));
  }, [user]);

  const handleSave = async () => {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setNameError('Informe um nome de usuário.');
      return;
    }

    if (trimmedName === getUserDisplayName(user)) {
      setNameError(null);
      return;
    }

    setNameError(null);
    setIsSaving(true);

    try {
      const { error } = await updateDisplayName(trimmedName);

      if (error) {
        setNameError(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileSection label="Nome de usuário">
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
        autoComplete="username"
        placeholder="Seu nome"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        editable={!isSaving}
      />
      {nameError ? <ThemedText style={styles.errorText}>{nameError}</ThemedText> : null}
      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.pressed,
          isSaving && styles.disabled,
        ]}
        onPress={() => void handleSave()}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel="Salvar nome de usuário">
        {isSaving ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <ThemedText style={styles.saveButtonText}>Salvar nome</ThemedText>
        )}
      </Pressable>
    </ProfileSection>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
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
    marginTop: Spacing.one,
  },
  saveButton: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start' as const,
    paddingVertical: Spacing.one,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
};
}
