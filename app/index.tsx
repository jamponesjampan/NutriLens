import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';

export default function IndexScreen() {
  const { isOnboarded, isLoggedIn } = useApp();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboarded && isLoggedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isOnboarded, isLoggedIn]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}
