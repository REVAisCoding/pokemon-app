import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

const CARD_ASPECT_RATIO = 0.72;
const FRAME_BORDER_RADIUS = 12;
const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;
const BOTTOM_CONTROLS_HEIGHT = 148;
const DIM_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.55)';

type CardScanFrameOverlayProps = {
  bottomInset?: number;
};

export function CardScanFrameOverlay({ bottomInset = 0 }: CardScanFrameOverlayProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const frame = useMemo(() => {
    const horizontalPadding = Spacing.three;
    const topPadding = insets.top + Spacing.three;
    const bottomReserved = bottomInset + BOTTOM_CONTROLS_HEIGHT + insets.bottom;

    const maxWidth = screenWidth - horizontalPadding * 2;
    const maxHeight = screenHeight - topPadding - bottomReserved;

    let width = maxWidth;
    let height = width / CARD_ASPECT_RATIO;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * CARD_ASPECT_RATIO;
    }

    const left = (screenWidth - width) / 2;
    const top = topPadding + (maxHeight - height) / 2;

    return { left, top, width, height };
  }, [bottomInset, insets.bottom, insets.top, screenHeight, screenWidth]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          styles.dim,
          { top: 0, left: 0, right: 0, height: frame.top, backgroundColor: DIM_OVERLAY_COLOR },
        ]}
      />
      <View
        style={[
          styles.dim,
          {
            top: frame.top + frame.height,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: DIM_OVERLAY_COLOR,
          },
        ]}
      />
      <View
        style={[
          styles.dim,
          {
            top: frame.top,
            left: 0,
            width: frame.left,
            height: frame.height,
            backgroundColor: DIM_OVERLAY_COLOR,
          },
        ]}
      />
      <View
        style={[
          styles.dim,
          {
            top: frame.top,
            left: frame.left + frame.width,
            right: 0,
            height: frame.height,
            backgroundColor: DIM_OVERLAY_COLOR,
          },
        ]}
      />

      <View
        style={[
          styles.frame,
          {
            top: frame.top,
            left: frame.left,
            width: frame.width,
            height: frame.height,
          },
        ]}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
  },
  frame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: FRAME_BORDER_RADIUS,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: PokemonColors.white,
  },
  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: FRAME_BORDER_RADIUS,
  },
  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: FRAME_BORDER_RADIUS,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: FRAME_BORDER_RADIUS,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: FRAME_BORDER_RADIUS,
  },
});
