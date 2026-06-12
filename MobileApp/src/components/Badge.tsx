import { Text, View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export type BadgeTone = 'accent' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps {
  tone?: BadgeTone;
  children: string;
}

const toneStyles: Record<BadgeTone, { backgroundColor: string; color: string }> = {
  accent: { backgroundColor: theme.colors.accent, color: theme.colors.white },
  success: { backgroundColor: theme.colors.success, color: theme.colors.white },
  warning: { backgroundColor: theme.colors.warning, color: theme.colors.white },
  danger: { backgroundColor: theme.colors.danger, color: theme.colors.white },
  muted: { backgroundColor: theme.colors.panelMuted, color: theme.colors.muted },
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
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
