import { Image, StyleSheet, Text, View } from 'react-native';
import type { BookDetails } from '@/types/api';
import { Badge } from '@/components/Badge';
import { Panel } from '@/components/Panel';
import { theme } from '@/theme';
import { formatDateTime, formatMaybe } from '@/lib/format';

interface BookDetailCardProps {
  book: BookDetails;
  staffMode?: boolean;
}

export function BookDetailCard({ book, staffMode = false }: BookDetailCardProps) {
  const statusTone =
    book.status === 'unavailable' ? 'warning' : book.available_quantity > 0 ? 'success' : 'danger';
  const latestBorrow = book.recent_transactions?.[0]?.borrow_date ?? null;

  return (
    <Panel style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.coverWrap}>
          {book.image_url ? (
            <Image source={{ uri: book.image_url }} style={styles.cover} />
          ) : (
            <View style={styles.coverFallback}>
              <Text style={styles.coverFallbackText}>No Cover</Text>
            </View>
          )}
        </View>

        <View style={styles.headerMeta}>
          <Badge tone={statusTone}>{book.status}</Badge>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
          <Text style={styles.subtitle}>{formatMaybe(book.category, 'Uncategorized')}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <InfoRow label="Library Ref." value={book.library_reference} />
        <InfoRow label="ISBN" value={formatMaybe(book.isbn, 'Not provided')} />
        <InfoRow label="Available" value={`${book.available_quantity}/${book.quantity}`} />
        <InfoRow label="Last Borrowed" value={formatDateTime(latestBorrow)} />
      </View>

      {staffMode && book.recent_transactions && book.recent_transactions.length > 0 ? (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Borrowing</Text>
          <View style={styles.historyList}>
            {book.recent_transactions.map((transaction) => (
              <View key={transaction.id} style={styles.historyItem}>
                <View style={styles.historyTopRow}>
                  <Text style={styles.historyName}>{transaction.borrower_name ?? 'Borrower'}</Text>
                  <Badge tone="muted">{transaction.status ?? 'pending'}</Badge>
                </View>
                <Text style={styles.historyLine}>Borrowed: {formatDateTime(transaction.borrow_date)}</Text>
                <Text style={styles.historyLine}>Due: {formatDateTime(transaction.due_date)}</Text>
                <Text style={styles.historyLine}>Returned: {formatDateTime(transaction.return_date)}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Panel>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  coverWrap: {
    width: 108,
    height: 156,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.panelMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.panelMuted,
  },
  coverFallbackText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  headerMeta: {
    flex: 1,
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  author: {
    color: theme.colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  grid: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.10)',
  },
  infoLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  historySection: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  historyList: {
    gap: theme.spacing.sm,
  },
  historyItem: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panelMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  historyName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  historyLine: {
    color: theme.colors.muted,
    fontSize: 13,
  },
});
