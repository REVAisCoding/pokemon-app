import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CardScanFrameOverlay } from '@/components/camera/card-scan-frame-overlay';
import { ThemedText } from '@/components/themed-text';
import { setPendingScanImage } from '@/services/scanResultStore';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

const CAMERA_READY_FALLBACK_MS = 2000;

export function CameraScreen() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setIsCapturing(false);
      setIsCameraReady(false);
      setMountError(null);

      return () => {
        setIsCapturing(false);
      };
    }, []),
  );

  useEffect(() => {
    if (!isFocused || !permission?.granted) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsCameraReady(true);
    }, CAMERA_READY_FALLBACK_MS);

    return () => clearTimeout(timeout);
  }, [isFocused, permission?.granted]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        imageType: 'jpg',
      });

      if (!photo?.uri) {
        setIsCapturing(false);
        return;
      }

      setPendingScanImage(photo.uri);
      router.push('/scan/loading' as Href);
    } catch {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.permissionTitle}>Acesso à câmera</ThemedText>
        <ThemedText style={styles.permissionDescription}>
          Precisamos da sua permissão para escanear cartas Pokémon.
        </ThemedText>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <ThemedText style={styles.permissionButtonText}>Permitir câmera</ThemedText>
        </Pressable>
      </View>
    );
  }

  if (mountError) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.permissionTitle}>Câmera indisponível</ThemedText>
        <ThemedText style={styles.permissionDescription}>{mountError}</ThemedText>
      </View>
    );
  }

  const canCapture = isCameraReady && !isCapturing;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        active={isFocused}
        onCameraReady={() => setIsCameraReady(true)}
        onMountError={({ message }) => setMountError(message)}
      />

      <CardScanFrameOverlay />

      <SafeAreaView style={styles.overlay} edges={['bottom']} pointerEvents="box-none">
        <ThemedText style={styles.hint}>Posicione a carta dentro da moldura</ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.captureButton,
            !canCapture && styles.captureButtonDisabled,
            pressed && canCapture && styles.pressed,
          ]}
          onPress={handleCapture}
          disabled={!canCapture}
          accessibilityRole="button"
          accessibilityLabel="Tirar foto">
          {isCapturing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  hint: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
    textAlign: 'center' as const,
    paddingHorizontal: Spacing.three,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  centered: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: Spacing.four,
    backgroundColor: colors.screenBackground,
    gap: Spacing.two,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    textAlign: 'center' as const,
  },
  permissionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: Spacing.two,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
};
}
