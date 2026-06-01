import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SHIMMER_CONFIG } from '@/components/card-viewer/shimmer-config';
import { PokemonColors } from '@/constants/pokemon-theme';

const MAX_ROTATION = 15;
const SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
};
const {
  baseOpacityMin,
  baseOpacityMax,
  highlightOpacityMin,
  highlightOpacityMax,
  translateFactor,
  highlightTranslateFactor,
} = SHIMMER_CONFIG;

type InteractiveCardProps = {
  imageUrl: string;
  width: number;
  height: number;
  isShiny?: boolean;
  style?: ViewStyle;
};

function clamp(value: number, min: number, max: number) {
  'worklet';

  return Math.min(Math.max(value, min), max);
}

export function InteractiveCard({
  imageUrl,
  width,
  height,
  isShiny = false,
  style,
}: InteractiveCardProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          rotateY.value = clamp((event.translationX / width) * MAX_ROTATION * 2, -MAX_ROTATION, MAX_ROTATION);
          rotateX.value = clamp(
            -(event.translationY / height) * MAX_ROTATION * 2,
            -MAX_ROTATION,
            MAX_ROTATION,
          );
        })
        .onEnd(() => {
          rotateX.value = withSpring(0, SPRING_CONFIG);
          rotateY.value = withSpring(0, SPRING_CONFIG);
        }),
    [height, rotateX, rotateY, width],
  );

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    const tiltIntensity = Math.abs(rotateX.value) + Math.abs(rotateY.value);

    return {
      shadowOffset: {
        width: interpolate(rotateY.value, [-MAX_ROTATION, MAX_ROTATION], [14, -14], Extrapolation.CLAMP),
        height: interpolate(rotateX.value, [-MAX_ROTATION, MAX_ROTATION], [-6, 18], Extrapolation.CLAMP),
      },
      shadowOpacity: interpolate(tiltIntensity, [0, MAX_ROTATION * 2], [0.22, 0.5], Extrapolation.CLAMP),
      shadowRadius: interpolate(tiltIntensity, [0, MAX_ROTATION * 2], [16, 28], Extrapolation.CLAMP),
      elevation: interpolate(tiltIntensity, [0, MAX_ROTATION * 2], [8, 16], Extrapolation.CLAMP),
    };
  });

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const tiltIntensity = Math.abs(rotateX.value) + Math.abs(rotateY.value);

    return {
      opacity: interpolate(
        tiltIntensity,
        [0, MAX_ROTATION * 2],
        [baseOpacityMin, baseOpacityMax],
        Extrapolation.CLAMP,
      ),
      transform: [
        { translateX: rotateY.value * translateFactor },
        { translateY: rotateX.value * translateFactor },
      ],
    };
  });

  const highlightAnimatedStyle = useAnimatedStyle(() => {
    const tiltIntensity = Math.abs(rotateX.value) + Math.abs(rotateY.value);

    return {
      opacity: interpolate(
        tiltIntensity,
        [0, MAX_ROTATION * 2],
        [highlightOpacityMin, highlightOpacityMax],
        Extrapolation.CLAMP,
      ),
      transform: [
        { translateX: rotateY.value * highlightTranslateFactor },
        { translateY: rotateX.value * highlightTranslateFactor },
        { rotate: `${45 + rotateY.value}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.cardShell,
          { width, height },
          cardAnimatedStyle,
          shadowAnimatedStyle,
          style,
        ]}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        {isShiny ? (
          <>
            <Animated.View
              pointerEvents="none"
              style={[styles.shimmerOverlay, shimmerAnimatedStyle]}>
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(255,255,255,0.12)',
                  'rgba(186,230,253,0.38)',
                  'rgba(255,255,255,0.22)',
                  'rgba(196,181,253,0.3)',
                  'transparent',
                ]}
                locations={[0, 0.24, 0.42, 0.56, 0.72, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[styles.highlightOverlay, highlightAnimatedStyle]}>
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(255,255,255,0.65)',
                  'rgba(255,255,255,0.25)',
                  'transparent',
                ]}
                locations={[0, 0.46, 0.54, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: PokemonColors.white,
    shadowColor: PokemonColors.shadow,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  highlightOverlay: {
    position: 'absolute',
    top: '-35%',
    left: '-35%',
    width: '70%',
    height: '170%',
  },
});
