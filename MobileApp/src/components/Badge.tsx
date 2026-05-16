import { Text, View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export type BadgeTone = 'accent' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps {
  tone?: BadgeTone;
  children: string;
}

const toneStyles: Record<BadgeTone, { backgroundColor: string; color: string }> = {
  accent: { backgroundColor: theme.colors.accentSoft, color: theme.colors.accent },
  success: { backgroundColor: theme.colors.successSoft, color: theme.colors.success },
  warning: { backgroundColor: theme.colors.warningSoft, color: theme.colors.warning },
  danger: { backgroundColor: theme.colors.dangerSoft, color: theme.colors.danger },
  muted: { backgroundColor: 'rgba(148, 163, 184, 0.12)', color: theme.colors.muted },
};

export function Badge({ tone = 'accent', children }: BadgeProps) {
  const selected = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: selected.backgroundColor }]}>
      <Text style={[styles.text, { color: selected.color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
