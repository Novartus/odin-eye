import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { credentialsStorage } from './src/services/storage/credentialsStorage';
import { Colors } from './src/theme/colors';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    credentialsStorage.loadCredentials().then((creds) => {
      setHasCompletedOnboarding(Boolean(creds.hasCompletedOnboarding));
      setIsLoading(false);
    });
  }, []);

  const handleFinishOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  const handleResetOnboarding = async () => {
    await credentialsStorage.saveCredentials({ hasCompletedOnboarding: false });
    setHasCompletedOnboarding(false);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#181C1B" />
          </View>
        ) : !hasCompletedOnboarding ? (
          <OnboardingScreen onFinish={handleFinishOnboarding} />
        ) : (
          <DashboardScreen onResetOnboarding={handleResetOnboarding} />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
