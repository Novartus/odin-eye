import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface BouncingDotsLoaderProps {
  statusText?: string;
}

export const BouncingDotsLoader: React.FC<BouncingDotsLoaderProps> = ({
  statusText = 'Synthesizing response...',
}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounceAnimation = (anim: Animated.Value) => {
      return Animated.sequence([
        Animated.timing(anim, {
          toValue: -6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    };

    const loop = Animated.loop(
      Animated.stagger(140, [
        createBounceAnimation(dot1),
        createBounceAnimation(dot2),
        createBounceAnimation(dot3),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      {/* 3 Bouncing Dots */}
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
      </View>
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EDE8F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    alignSelf: 'flex-start',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(95, 87, 130, 0.1)',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 18,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#524580',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#342F4B',
  },
});
