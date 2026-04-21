import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';

export default function IndexScreen() {
  const { isOnboarded, isLoggedIn, isLoading, isAdmin } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAdmin) {
        router.replace('/admin' as any);
      } else if (isLoggedIn && isOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoading, isOnboarded, isLoggedIn, isAdmin]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}
