import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getUserDisplayName, useAuth } from '@/contexts/auth-context';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

import { ProfileSection } from './profile-section';

export function DisplayNameEditor() {
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
        placeholderTextColor={PokemonColors.textMuted}
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
          <ActivityIndicator color={PokemonColors.primary} size="small" />
        ) : (
          <ThemedText style={styles.saveButtonText}>Salvar nome</ThemedText>
        )}
      </Pressable>
    </ProfileSection>
  );
}

const styles = StyleSheet.create({
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
    marginTop: Spacing.one,
  },
  saveButton: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
});
