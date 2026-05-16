import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  tone = 'primary',
  style,
}: PrimaryButtonProps) {
  const active = !loading && !disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={!active}
      style={[
        styles.base,
        tone === 'secondary' && styles.secondary,
        tone === 'ghost' && styles.ghost,
        !active && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone === 'ghost' ? theme.colors.text : theme.colors.background} />
      ) : (
        <Text
          style={[
            styles.label,
            tone === 'ghost' && styles.ghostLabel,
            tone === 'secondary' && styles.secondaryLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  secondary: {
    backgroundColor: theme.colors.panelMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    color: theme.colors.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryLabel: {
    color: theme.colors.text,
  },
  ghostLabel: {
    color: theme.colors.text,
  },
  disabled: {
    opacity: 0.55,
  },
});
