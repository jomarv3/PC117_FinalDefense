import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Panel } from '@/components/Panel';
import { TextField } from '@/components/TextField';
import { PrimaryButton } from '@/components/PrimaryButton';
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
      const response = await register(name.trim(), email.trim(), password);
      Alert.alert('Check your email', response.message, [
        {
          text: 'OK',
          onPress: () => router.replace({ pathname: '/(auth)/login', params: { email: email.trim() } }),
        },
      ]);
    } catch (error) {
      setFormError(formatApiError(error, 'We could not create this account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Panel style={styles.formCard}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Borrower account</Text>
          <Text style={styles.formHint}>New accounts are created with borrower access.</Text>
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
          <Text style={styles.linkText}>Back to sign in</Text>
        </Pressable>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: theme.spacing.md,
  },
  formHeader: {
    gap: 4,
  },
  formTitle: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  formHint: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  bannerError: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    fontSize: 13,
    lineHeight: 18,
  },
  linkWrap: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.xs,
  },
  linkText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
