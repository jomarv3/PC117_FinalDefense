import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
      <Panel style={styles.actionPanel}>
        <Badge tone={staffMode ? 'warning' : 'accent'}>{roleLabel ?? 'User'}</Badge>
        <View style={styles.actions}>
          <PrimaryButton label="Scan another" onPress={goBackToScanner} />
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
          <View style={styles.actions}>
            <PrimaryButton label="Try again" onPress={goBackToScanner} />
            <PrimaryButton label="Back" onPress={() => router.back()} tone="secondary" />
          </View>
        </Panel>
      ) : book ? (
        <>
          <BookDetailCard book={book} staffMode={staffMode} />

          <Panel style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>{staffMode ? 'Borrowing summary' : 'Quick facts'}</Text>
            {staffMode && book.recent_transactions && book.recent_transactions.length > 0 ? (
              <Text style={styles.summaryText}>
                Latest borrow by {book.recent_transactions[0]?.borrower_name ?? 'a borrower'} on{' '}
                {formatDateTime(book.recent_transactions[0]?.borrow_date)}. Available copies:{' '}
                {book.available_quantity}/{book.quantity}.
              </Text>
            ) : (
              <Text style={styles.summaryText}>
                {formatMaybe(book.category, 'Uncategorized')} | {book.library_reference} |{' '}
                {book.available_quantity}/{book.quantity}
              </Text>
            )}
          </Panel>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    gap: theme.spacing.md,
  },
  actions: {
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
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
