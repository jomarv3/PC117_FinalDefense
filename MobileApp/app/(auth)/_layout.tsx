import { Stack } from 'expo-router';
import { theme } from '@/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.white },
        headerShadowVisible: true,
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: '700',
        },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
    </Stack>
  );
}
