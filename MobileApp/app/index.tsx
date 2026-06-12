import { Redirect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Panel } from '@/components/Panel';
import { Text } from 'react-native';
import { useAuth } from '@/auth/useAuth';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <Panel>
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600' }}>
            Preparing the scanner...
          </Text>
        </Panel>
      </Screen>
    );
  }

  return <Redirect href={isAuthenticated ? '/(app)/scanner' : '/(auth)/login'} />;
}
