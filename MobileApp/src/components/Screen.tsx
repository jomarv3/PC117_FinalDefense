import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = true, contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.background}>
        <View style={styles.orbOne} />
        <View style={styles.orbTwo} />
        <View style={styles.orbThree} />
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, contentStyle]}>{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  background: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  orbOne: {
    position: 'absolute',
    top: -90,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(20, 184, 166, 0.16)',
  },
  orbTwo: {
    position: 'absolute',
    top: 180,
    left: -90,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
  },
  orbThree: {
    position: 'absolute',
    bottom: 120,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
});
