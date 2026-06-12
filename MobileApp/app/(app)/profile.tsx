import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
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
      <Panel style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text selectable style={styles.name}>
              {user?.name ?? 'Unknown user'}
            </Text>
            <Text selectable style={styles.email}>
              {user?.email ?? 'No email available'}
            </Text>
          </View>
          <Badge tone={role === 'admin' || role === 'librarian' ? 'warning' : 'accent'}>
            {roleLabel ?? 'User'}
          </Badge>
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
        <PrimaryButton
          label="Logout"
          icon={<Ionicons name="log-out-outline" size={18} color={theme.colors.text} />}
          onPress={() => void handleLogout()}
          tone="ghost"
        />
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text selectable style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: theme.colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  email: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
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
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
