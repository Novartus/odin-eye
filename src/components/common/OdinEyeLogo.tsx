import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export interface OdinEyeLogoProps {
  size?: number;
  rounded?: boolean;
  variant?: 'plain' | 'card';
  style?: StyleProp<ViewStyle>;
}

/**
 * OdinEye Brand Logo Component
 * Renders the high-definition OdinEye emblem asset with configurable sizing and presentation style.
 */
export const OdinEyeLogo: React.FC<OdinEyeLogoProps> = ({
  size = 48,
  rounded = true,
  variant = 'plain',
  style,
}) => {
  const borderRadius = rounded ? Math.round(size * 0.26) : 0;

  if (variant === 'card') {
    return (
      <View
        style={[
          styles.cardWrap,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: borderRadius + 4,
          },
          style,
        ]}
      >
        <Image
          source={require('../../../assets/icon.png')}
          style={{
            width: size,
            height: size,
            borderRadius,
          }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image
        source={require('../../../assets/icon.png')}
        style={{
          width: size,
          height: size,
          borderRadius,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrap: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(227, 241, 236, 0.95)',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
});
