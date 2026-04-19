import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.surfaceBorder,
          borderTopWidth: 1,
          height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 68 }),
          paddingTop: 6,
          paddingBottom: Platform.select({ ios: insets.bottom + 6, android: insets.bottom + 6, default: 6 }),
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 50, height: 50, borderRadius: 25,
              backgroundColor: Colors.primary,
              alignItems: 'center', justifyContent: 'center',
              marginTop: -16, shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
            }}>
              <MaterialIcons name="camera-alt" size={24} color={Colors.textInverse} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plano',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="event-note" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Nossa Terra',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="history" options={{ href: null }} />
    </Tabs>
  );
}
