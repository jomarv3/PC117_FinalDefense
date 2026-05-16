import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Panel } from '@/components/Panel';
import { TextField } from '@/components/TextField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Badge } from '@/components/Badge';
import { theme } from '@/theme';
import { useAuth } from '@/auth/useAuth';
import { formatApiError } from '@/api/client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { login } = useAuth();

  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    let failed = false;

    if (!email.trim()) {
      setEmailError('Email is required.');
      failed = true;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      failed = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      failed = true;
    }

    if (failed) return;

    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace('/(app)/scanner');
    } catch (error) {
      setFormError(formatApiError(error, 'We could not sign you in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Panel style={styles.hero}>
        <Badge tone="accent">Library access</Badge>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to scan QR codes, open book details, and keep borrowing work moving.
        </Text>
        <View style={styles.badgeRow}>
          <Badge tone="muted">Admin</Badge>
          <Badge tone="muted">Librarian</Badge>
          <Badge tone="muted">User</Badge>
        </View>
      </Panel>

      <Panel style={styles.formCard}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Sign in</Text>
          <Text style={styles.formHint}>Use the same account as the web system.</Text>
        </View>

        {formError ? <Text style={styles.bannerError}>{formError}</Text> : null}

        <TextField
          label="Email address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setEmailError(null);
            setFormError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          error={emailError}
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setPasswordError(null);
            setFormError(null);
          }}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          error={passwordError}
        />

        <PrimaryButton label="Sign in" onPress={submit} loading={loading} />

        <Pressable onPress={() => router.push('/(auth)/register')} style={styles.linkWrap}>
          <Text style={styles.linkText}>No account yet? Create a borrower account.</Text>
        </Pressable>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  formCard: {
    gap: theme.spacing.lg,
  },
  formHeader: {
    gap: 4,
  },
  formTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  formHint: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  bannerError: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.22)',
  },
  linkWrap: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.xs,
  },
  linkText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});
