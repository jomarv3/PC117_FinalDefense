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
          <Badge tone={statusTone}>{formatMaybe(book.status, 'unknown')}</Badge>
          <Text selectable style={styles.title}>
            {book.title}
          </Text>
          <Text selectable style={styles.author}>
            {book.author}
          </Text>
          <Text selectable style={styles.category}>
            {formatMaybe(book.category, 'Uncategorized')}
          </Text>
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
                  <Text selectable style={styles.historyName}>
                    {transaction.borrower_name ?? 'Borrower'}
                  </Text>
                  <Badge tone="muted">{transaction.status ?? 'pending'}</Badge>
                </View>
                <InfoRow label="Borrowed" value={formatDateTime(transaction.borrow_date)} compact />
                <InfoRow label="Due" value={formatDateTime(transaction.due_date)} compact />
                <InfoRow label="Returned" value={formatDateTime(transaction.return_date)} compact />
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Panel>
  );
}

function InfoRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text selectable style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  coverWrap: {
    width: 88,
    height: 128,
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
    fontSize: 12,
    fontWeight: '600',
  },
  headerMeta: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  author: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  category: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
  },
  infoRowCompact: {
    paddingVertical: 6,
  },
  infoLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  historySection: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  historyList: {
    gap: theme.spacing.sm,
  },
  historyItem: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.panelMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 2,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingBottom: 6,
  },
  historyName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
});
