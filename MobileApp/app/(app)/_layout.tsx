import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { theme } from '@/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        animation: 'fade',
        headerStyle: { backgroundColor: theme.colors.white },
        headerShadowVisible: true,
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: '700',
        },
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          minHeight: 62,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          title: 'Library Scanner',
        }}
      />
      <Tabs.Screen
        name="book-details"
        options={{
          href: null,
          title: 'Book Details',
        }}
      />
    </Tabs>
  );
}
