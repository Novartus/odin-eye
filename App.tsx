import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AppLoadingSplash } from './src/components/common/AppLoadingSplash';
import { credentialsStorage } from './src/services/storage/credentialsStorage';
import { Colors } from './src/theme/colors';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    credentialsStorage.loadCredentials().then((creds) => {
      setHasCompletedOnboarding(Boolean(creds.hasCompletedOnboarding));
      // Smooth handoff after brief presentation
      setTimeout(() => {
        setIsLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }, 750);
    });
  }, [fadeAnim]);

  const [onboardingInitialStep, setOnboardingInitialStep] = useState<1 | 2>(1);

  const handleFinishOnboarding = () => {
    setHasCompletedOnboarding(true);
    setOnboardingInitialStep(1);
  };

  const handleResetOnboarding = async () => {
    setOnboardingInitialStep(2);
    await credentialsStorage.saveCredentials({ hasCompletedOnboarding: false });
    setHasCompletedOnboarding(false);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        {isLoading ? (
          <AppLoadingSplash />
        ) : (
          <Animated.View style={[styles.mainView, { opacity: fadeAnim }]}>
            {!hasCompletedOnboarding ? (
              <OnboardingScreen
                onFinish={handleFinishOnboarding}
                initialStep={onboardingInitialStep}
              />
            ) : (
              <DashboardScreen onResetOnboarding={handleResetOnboarding} />
            )}
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
