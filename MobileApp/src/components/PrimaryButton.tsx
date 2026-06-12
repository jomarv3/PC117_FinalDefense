import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  tone?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
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
        <ActivityIndicator color={tone === 'primary' ? theme.colors.white : theme.colors.accent} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              tone === 'ghost' && styles.ghostLabel,
              tone === 'secondary' && styles.secondaryLabel,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  secondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
  secondaryLabel: {
    color: theme.colors.accent,
  },
  ghostLabel: {
    color: theme.colors.text,
  },
  disabled: {
    opacity: 0.55,
  },
});
