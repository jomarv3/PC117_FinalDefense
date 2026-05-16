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

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    let failed = false;

    if (!name.trim()) {
      setNameError('Full name is required.');
      failed = true;
    }

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      failed = true;
    }

    if (failed) return;

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      router.replace({ pathname: '/(auth)/login', params: { email: email.trim() } });
    } catch (error) {
      setFormError(formatApiError(error, 'We could not create this account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Panel style={styles.hero}>
        <Badge tone="accent">Borrower registration</Badge>
        <Text style={styles.title}>Create a User account</Text>
        <Text style={styles.subtitle}>
          Register a borrower account so the mobile app can log in and scan book QR codes.
        </Text>
      </Panel>

      <Panel style={styles.formCard}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Register</Text>
          <Text style={styles.formHint}>This creates a borrower account on the Laravel backend.</Text>
        </View>

        {formError ? <Text style={styles.bannerError}>{formError}</Text> : null}

        <TextField
          label="Full name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setNameError(null);
            setFormError(null);
          }}
          placeholder="Juan Dela Cruz"
          error={nameError}
        />

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
          placeholder="At least 6 characters"
          secureTextEntry
          autoCapitalize="none"
          error={passwordError}
        />

        <PrimaryButton label="Create account" onPress={submit} loading={loading} />

        <Pressable onPress={() => router.push('/(auth)/login')} style={styles.linkWrap}>
          <Text style={styles.linkText}>Already have an account? Sign in instead.</Text>
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
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
