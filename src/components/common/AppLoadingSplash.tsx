import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import Svg, { Path, Circle, Rect, G, Line, Ellipse } from 'react-native-svg';
import type { AppLoadingSplashProps } from '../../types';

export const AppLoadingSplash: React.FC<AppLoadingSplashProps> = () => {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.88)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const flowDriftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Breathing pulse animation loop for the center emblem
    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.05,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 1.0,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 0.97,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.85,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathingLoop.start();

    // Gentle vertical floating drift for the scenic line-art canvas
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flowDriftAnim, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flowDriftAnim, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    driftLoop.start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      breathingLoop.stop();
      driftLoop.stop();
    };
  }, [pulseScale, pulseOpacity, progressAnim, flowDriftAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const canvasTranslateY = flowDriftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });

  return (
    <View style={styles.container}>
      {/* 
        Full-Screen Flowing Kinetic Line Canvas
        Inspired by the continuous scenic route illustration, wrapping around the OdinEye emblem 
      */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateY: canvasTranslateY }] },
        ]}
        pointerEvents="none"
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 860"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* ========================================================= */}
          {/* 1. PRIMARY & SECONDARY FLOWING SERPENTINE PATHWAYS       */}
          {/* ========================================================= */}

          {/* Secondary parallel dashed trail (Soft Sage Mint) */}
          <Path
            d="
              M 270 -20
              C 270 50, 130 60, 130 140
              C 130 210, 318 200, 318 290
              C 318 350, 268 370, 208 370
              C 138 370, 118 440, 158 480
              C 188 510, 278 500, 288 550
              C 298 610, 118 620, 118 700
              C 118 770, 278 770, 268 890
            "
            stroke="#CCE6DE"
            strokeWidth="1.75"
            strokeDasharray="5,6"
            fill="none"
            opacity={0.85}
          />

          {/* Primary continuous organic pathway (Mindful Deep Forest) */}
          <Path
            d="
              M 260 -20
              C 260 50, 120 60, 120 140
              C 120 210, 310 200, 310 290
              C 310 350, 260 370, 200 370
              C 130 370, 110 440, 150 480
              C 180 510, 270 500, 280 550
              C 290 610, 110 620, 110 700
              C 110 770, 270 770, 260 890
            "
            stroke="rgba(31, 56, 46, 0.22)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* ========================================================= */}
          {/* 2. TOP SECTION: MORNING VITALITY & AWAKENING             */}
          {/* ========================================================= */}

          {/* Radiant Morning Sun */}
          <G transform="translate(305, 75)">
            <Circle cx="0" cy="0" r="16" fill="#FDF5D9" stroke="#E5BA55" strokeWidth="1.75" />
            <Circle cx="0" cy="0" r="10" fill="#FFE899" />
            {/* Sun Rays */}
            <Line x1="0" y1="-22" x2="0" y2="-26" stroke="#E5BA55" strokeWidth="2" strokeLinecap="round" />
            <Line x1="15" y1="-15" x2="18" y2="-18" stroke="#E5BA55" strokeWidth="2" strokeLinecap="round" />
            <Line x1="22" y1="0" x2="26" y2="0" stroke="#E5BA55" strokeWidth="2" strokeLinecap="round" />
            <Line x1="15" y1="15" x2="18" y2="18" stroke="#E5BA55" strokeWidth="2" strokeLinecap="round" />
            <Line x1="0" y1="22" x2="0" y2="26" stroke="#E5BA55" strokeWidth="2" strokeLinecap="round" />
            <Line x1="-15" y1="15" x2="-18" y2="18" stroke="#E5BA55" strokeWidth="2" strokeLinecap="round" />
            <Line x1="-22" y1="0" x2="-26" y2="0" stroke="#E5BA55" strokeWidth="2" strokeLinecap="round" />
            <Line x1="-15" y1="-15" x2="-18" y2="-18" stroke="#E5BA55" strokeWidth="2" strokeLinecap="round" />
          </G>

          {/* Gentle Cumulus Morning Cloud */}
          <G transform="translate(55, 95)">
            <Path
              d="M 10 25 C 6 25, 0 21, 0 15 C 0 10, 5 6, 11 6 C 13 2, 19 0, 25 0 C 33 0, 39 4, 41 10 C 46 10, 50 14, 50 19 C 50 24, 45 25, 41 25 Z"
              fill="#FFFFFF"
              stroke="#CCE6DE"
              strokeWidth="1.75"
            />
          </G>

          {/* Botanical Sprout / Living Fern */}
          <G transform="translate(138, 140)">
            <Path d="M 0 32 Q 5 15 16 8" stroke="#2C4A3E" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Upper Leaf */}
            <Path d="M 16 8 C 24 3, 26 14, 16 8 Z" fill="#CCE6DE" stroke="#2C4A3E" strokeWidth="1.5" />
            {/* Side Leaf */}
            <Path d="M 9 19 C 3 14, 2 24, 9 19 Z" fill="#E3F1EC" stroke="#2C4A3E" strokeWidth="1.5" />
          </G>

          {/* Active Stride Sneaker Running Motif */}
          <G transform="translate(268, 205)">
            <Path
              d="M 0 20 C 10 18, 35 18, 44 20 C 47 16, 44 5, 34 5 L 23 5 L 14 0 L 6 8 Z"
              fill="#FFFFFF"
              stroke="#2C4A3E"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            {/* Sneaker Sole Cushion */}
            <Path d="M 2 22 L 42 22" stroke="#CCE6DE" strokeWidth="3" strokeLinecap="round" />
            {/* Stride Speed Whiffs */}
            <Path d="M -10 14 L -4 14 M -8 18 L -3 18" stroke="#A4D2C1" strokeWidth="1.5" strokeLinecap="round" />
          </G>

          {/* Sinus ECG Vital Heartbeat Rhythm directly along the line */}
          <G transform="translate(145, 275)">
            <Path
              d="M 0 15 L 20 15 L 26 5 L 32 30 L 39 0 L 46 22 L 52 11 L 58 15 L 75 15"
              fill="none"
              stroke="#E06D53"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Heartbeat Pulse Halo */}
            <Circle cx="39" cy="0" r="3.5" fill="#E06D53" />
          </G>

          {/* Smart Titanium Ring */}
          <G transform="translate(90, 310)">
            <Circle cx="16" cy="16" r="15" stroke="#2C4A3E" strokeWidth="2.5" fill="none" />
            <Circle cx="16" cy="16" r="10" stroke="#CCE6DE" strokeWidth="1.5" fill="#FFFFFF" />
            {/* Green Biometric Sensor Dot */}
            <Circle cx="16" cy="6" r="2.5" fill="#10B981" />
          </G>

          {/* ========================================================= */}
          {/* 3. CENTER SECTION: CONCENTRIC ORBITAL ZEN HARMONY         */}
          {/* ========================================================= */}

          {/* Zen Orbital Rings framing the center logo */}
          <Circle
            cx="200"
            cy="420"
            r="82"
            stroke="#DDD9F5"
            strokeWidth="1.5"
            strokeDasharray="4,6"
            fill="none"
            opacity={0.7}
          />
          <Circle
            cx="200"
            cy="420"
            r="104"
            stroke="#CCE6DE"
            strokeWidth="1.5"
            strokeDasharray="6,8"
            fill="none"
            opacity={0.8}
          />
          <Circle
            cx="200"
            cy="420"
            r="126"
            stroke="#FCE7DC"
            strokeWidth="1.2"
            strokeDasharray="3,7"
            fill="none"
            opacity={0.65}
          />

          {/* Hydration Water Drop with Concentric Ripples */}
          <G transform="translate(310, 360)">
            <Path
              d="M 12 0 C 3 14, 0 20, 0 25 C 0 32, 5 37, 12 37 C 19 37, 24 32, 24 25 C 24 20, 21 14, 12 0 Z"
              fill="#EBF3FD"
              stroke="#3B82F6"
              strokeWidth="1.75"
            />
            {/* Water Ripple Base */}
            <Ellipse cx="12" cy="42" rx="14" ry="4" fill="none" stroke="#93C5FD" strokeWidth="1.2" />
          </G>

          {/* Mindful Zen Lotus Flower */}
          <G transform="translate(65, 460)">
            {/* Center Petal */}
            <Path
              d="M 16 0 C 8 13, 8 26, 16 30 C 24 26, 24 13, 16 0 Z"
              fill="#DDD9F5"
              stroke="#2C4A3E"
              strokeWidth="1.5"
            />
            {/* Left Petal */}
            <Path d="M 12 12 C 0 19, 2 30, 12 30 Z" fill="#E8E5F9" stroke="#2C4A3E" strokeWidth="1.5" />
            {/* Right Petal */}
            <Path d="M 20 12 C 32 19, 30 30, 20 30 Z" fill="#E8E5F9" stroke="#2C4A3E" strokeWidth="1.5" />
          </G>

          {/* ========================================================= */}
          {/* 4. LOWER SECTION: METABOLISM, STRENGTH & SLEEP RECOVERY   */}
          {/* ========================================================= */}

          {/* Kinetic Dumbbell / Strength Impulse */}
          <G transform="translate(280, 545)">
            <Rect x="0" y="0" width="6" height="22" rx="2" fill="#CCE6DE" stroke="#2C4A3E" strokeWidth="1.5" />
            <Rect x="26" y="0" width="6" height="22" rx="2" fill="#CCE6DE" stroke="#2C4A3E" strokeWidth="1.5" />
            <Line x1="6" y1="11" x2="26" y2="11" stroke="#2C4A3E" strokeWidth="3" strokeLinecap="round" />
            {/* Kinetic Energy Sparks */}
            <Line x1="16" y1="-3" x2="16" y2="-7" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="10" y1="-1" x2="7" y2="-4" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="22" y1="-1" x2="25" y2="-4" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
          </G>

          {/* Stepping Stones / Trail Waypoints */}
          <G transform="translate(150, 600)">
            <Ellipse cx="10" cy="12" rx="10" ry="5" fill="#E3F1EC" stroke="#2C4A3E" strokeWidth="1.5" />
            <Ellipse cx="38" cy="4" rx="12" ry="6" fill="#FFFFFF" stroke="#2C4A3E" strokeWidth="1.5" />
            <Ellipse cx="66" cy="11" rx="9" ry="5" fill="#FCE7DC" stroke="#2C4A3E" strokeWidth="1.5" />
          </G>

          {/* Restorative Night Crescent Moon & Polaris Star */}
          <G transform="translate(80, 665)">
            {/* Golden Crescent Moon */}
            <Path
              d="M 22 4 C 11 4, 2 13, 2 24 C 2 35, 11 44, 22 44 C 16 40, 13 32, 13 24 C 13 16, 16 8, 22 4 Z"
              fill="#FFF8E7"
              stroke="#F59E0B"
              strokeWidth="1.75"
            />
            {/* Polaris Star */}
            <Path
              d="M 36 12 L 38 4 L 40 12 L 48 14 L 40 16 L 38 24 L 36 16 L 28 14 Z"
              fill="#2C4A3E"
            />
            {/* Small Celestial Starlet */}
            <Circle cx="39" cy="34" r="2" fill="#E5BA55" />
          </G>

          {/* Restorative Circadian Delta Sleep Waves */}
          <G transform="translate(155, 715)">
            <Path
              d="M 0 10 Q 15 0 30 10 T 60 10 T 90 10 T 120 10"
              fill="none"
              stroke="#DDD9F5"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <Path
              d="M 10 18 Q 25 8 40 18 T 70 18 T 100 18"
              fill="none"
              stroke="#CCE6DE"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray="4,4"
            />
          </G>

          {/* Night Cumulus Cloud */}
          <G transform="translate(265, 755)">
            <Path
              d="M 10 24 C 6 24, 0 20, 0 14 C 0 9, 5 5, 11 5 C 13 1, 19 0, 24 0 C 32 0, 38 4, 40 9 C 45 9, 49 13, 49 18 C 49 23, 44 24, 40 24 Z"
              fill="#FFFFFF"
              stroke="#DDD9F5"
              strokeWidth="1.75"
            />
            {/* Sparkle beside cloud */}
            <Circle cx="58" cy="10" r="2" fill="#F59E0B" />
          </G>
        </Svg>
      </Animated.View>

      {/* ========================================================= */}
      {/* 5. CENTER BRAND EMBLEM & TYPOGRAPHY                       */}
      {/* ========================================================= */}
      <View style={styles.centerContentArea}>
        {/* Brand Icon with Breathing Animation */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        >
          <View style={styles.logoCardWrap}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Brand Title */}
        <Text style={styles.brandTitle}>ODIN EYE</Text>
        <Text style={styles.brandTagline}>MINDFUL HEALTH & EQUILIBRIUM</Text>

        {/* Smooth Animated Progress Bar */}
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>

        {/* Dynamic Calibrating Status */}
        <View style={styles.statusRow}>
          <View style={styles.statusPulseDot} />
          <Text style={styles.loadingStatusText}>
            Calibrating biometrics & secure vault...
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContentArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 18,
  },
  logoCardWrap: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(227, 241, 236, 0.95)',
    overflow: 'hidden',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 26,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#141816',
    letterSpacing: 4,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2C4A3E',
    letterSpacing: 2,
    marginBottom: 28,
  },
  progressBarTrack: {
    width: 150,
    height: 4,
    backgroundColor: '#E3F1EC',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1F382E',
    borderRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  loadingStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#63706B',
    letterSpacing: 0.2,
  },
});
