import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Badge } from '@/components/Badge';
import { theme } from '@/theme';
import { lookupBookByQrCode } from '@/api/books';
import { formatApiError } from '@/api/client';
import { formatDateTime, formatMaybe } from '@/lib/format';
import { useAuth } from '@/auth/useAuth';
import { BookDetailCard } from '@/components/BookDetailCard';
import type { BookDetails } from '@/types/api';

export default function BookDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const { token, roleLabel, mobileFeatures } = useAuth();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const code = Array.isArray(params.code) ? params.code[0] : params.code;
  const staffMode = mobileFeatures.includes('view_borrowing_history');

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!code || !token) {
        if (active) {
          setLoading(false);
          setError('No QR code was provided for lookup.');
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const details = await lookupBookByQrCode(token, code);
        if (active) {
          setBook(details);
        }
      } catch (fetchError) {
        if (active) {
          setError(formatApiError(fetchError, 'We could not load this book.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [code, token]);

  const goBackToScanner = () => {
    router.replace('/(app)/scanner');
  };

  return (
    <Screen>
      <Panel style={styles.hero}>
        <View style={styles.heroTop}>
          <Badge tone={staffMode ? 'warning' : 'accent'}>{roleLabel ?? 'User'}</Badge>
          <Text style={styles.title}>Book details</Text>
          <Text style={styles.subtitle}>
            This screen shows the catalog record returned by the mobile lookup endpoint.
          </Text>
        </View>

        <View style={styles.heroActions}>
          <PrimaryButton label="Scan another book" onPress={goBackToScanner} />
          <PrimaryButton label="Profile" onPress={() => router.push('/(app)/profile')} tone="secondary" />
        </View>
      </Panel>

      {loading ? (
        <Panel>
          <Text style={styles.helperText}>Loading book information...</Text>
        </Panel>
      ) : error ? (
        <Panel style={styles.errorCard}>
          <Text style={styles.errorTitle}>Lookup failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <PrimaryButton label="Try again" onPress={goBackToScanner} />
            <PrimaryButton label="Back" onPress={() => router.back()} tone="secondary" />
          </View>
        </Panel>
      ) : book ? (
        <>
          <BookDetailCard book={book} staffMode={staffMode} />

          {staffMode && book.recent_transactions && book.recent_transactions.length > 0 ? (
            <Panel style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Borrowing summary</Text>
              <Text style={styles.summaryText}>
                Latest borrow by {book.recent_transactions[0]?.borrower_name ?? 'a borrower'} on{' '}
                {formatDateTime(book.recent_transactions[0]?.borrow_date)}
                . Available copies: {book.available_quantity}/{book.quantity}.
              </Text>
            </Panel>
          ) : (
            <Panel style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Quick facts</Text>
              <Text style={styles.summaryText}>
                {formatMaybe(book.category, 'Uncategorized')} · {book.library_reference} · {book.available_quantity}/{book.quantity}
              </Text>
            </Panel>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.md,
  },
  heroTop: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  helperText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  errorCard: {
    gap: theme.spacing.sm,
  },
  errorTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  errorText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  summaryCard: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
