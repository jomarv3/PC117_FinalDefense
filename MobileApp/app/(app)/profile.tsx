import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Badge } from '@/components/Badge';
import { theme } from '@/theme';
import { useAuth } from '@/auth/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, role, roleLabel, mobileFeatures, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <Screen>
      <Panel style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.slice(0, 1).toUpperCase() ?? '?'}</Text>
        </View>

        <View style={styles.heroCopy}>
          <Badge tone={role === 'admin' || role === 'librarian' ? 'warning' : 'accent'}>
            {roleLabel ?? 'User'}
          </Badge>
          <Text style={styles.title}>{user?.name ?? 'Unknown user'}</Text>
          <Text style={styles.subtitle}>{user?.email ?? 'No email available'}</Text>
        </View>
      </Panel>

      <Panel style={styles.card}>
        <Text style={styles.sectionTitle}>Account details</Text>
        <InfoRow label="Role" value={roleLabel ?? 'User'} />
        <InfoRow label="Backend role" value={role ?? 'borrower'} />
        <InfoRow label="Phone" value={user?.phone ?? '-'} />
      </Panel>

      <Panel style={styles.card}>
        <Text style={styles.sectionTitle}>Available features</Text>
        <View style={styles.featureRow}>
          {mobileFeatures.length > 0 ? (
            mobileFeatures.map((feature) => (
              <Badge key={feature} tone="muted">
                {feature.replaceAll('_', ' ')}
              </Badge>
            ))
          ) : (
            <Badge tone="muted">No extra features</Badge>
          )}
        </View>
      </Panel>

      <View style={styles.actions}>
        <PrimaryButton label="Back to scanner" onPress={() => router.replace('/(app)/scanner')} />
        <PrimaryButton label="Logout" onPress={() => void handleLogout()} tone="ghost" />
      </View>
    </Screen>
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
  hero: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 72,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.28)',
  },
  avatarText: {
    color: theme.colors.accent,
    fontSize: 28,
    fontWeight: '900',
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
