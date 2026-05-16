import { useEffect, useState } from 'react';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Badge } from '@/components/Badge';
import { theme } from '@/theme';
import { useAuth } from '@/auth/useAuth';
import { useQrScanner } from '@/scanner/useQrScanner';
import { lookupBookByQrCode } from '@/api/books';
import { formatApiError } from '@/api/client';

export default function ScannerScreen() {
  const router = useRouter();
  const { token, roleLabel, mobileFeatures, logout } = useAuth();
  const [topError, setTopError] = useState<string | null>(null);

  const { permission, requestPermission, isScanning, isProcessing, scanMessage, handleBarcodeScanned, resetScanner } =
    useQrScanner({
      onDetected: async (code) => {
        if (!token) {
          throw new Error('Your session is missing. Please sign in again.');
        }

        const book = await lookupBookByQrCode(token, code);
        router.push({ pathname: '/(app)/book-details', params: { code: book.library_reference } });
      },
    });

  useEffect(() => {
    if (permission === null) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const staffMode = mobileFeatures.includes('view_borrowing_history');
  const message = scanMessage ?? topError;

  const handleLogout = async () => {
    try {
      setTopError(null);
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      setTopError(formatApiError(error, 'We could not sign you out.'));
    }
  };

  const goToProfile = () => {
    router.push('/(app)/profile');
  };

  const renderCameraState = () => {
    if (!permission) {
      return (
        <Panel style={styles.cameraPanel}>
          <Text style={styles.cameraText}>Requesting camera access...</Text>
        </Panel>
      );
    }

    if (!permission.granted) {
      return (
        <Panel style={styles.cameraPanel}>
          <Text style={styles.cameraTitle}>Camera permission required</Text>
          <Text style={styles.cameraText}>
            Expo Go needs camera access before we can scan a QR code.
          </Text>
          <PrimaryButton label="Allow camera access" onPress={() => void requestPermission()} />
        </Panel>
      );
    }

    return (
      <Panel style={styles.cameraPanel}>
        <View style={styles.cameraFrame}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={isScanning && !isProcessing ? handleBarcodeScanned : undefined}
          />
          <View style={styles.frameOverlay}>
            <View style={styles.frameCornerTopLeft} />
            <View style={styles.frameCornerTopRight} />
            <View style={styles.frameCornerBottomLeft} />
            <View style={styles.frameCornerBottomRight} />
          </View>
        </View>

        <View style={styles.scanFooter}>
          <Text style={styles.scanHint}>
            {isScanning
              ? 'Point the camera at the QR on a book. We pause after each scan so the backend does not get spammed.'
              : 'Scanner paused. Tap Scan again when you are ready for the next book.'}
          </Text>
          <View style={styles.footerButtons}>
            {!isScanning ? <PrimaryButton label="Scan again" onPress={resetScanner} tone="secondary" /> : null}
          </View>
        </View>
      </Panel>
    );
  };

  return (
    <Screen>
      <Panel style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Badge tone={staffMode ? 'warning' : 'accent'}>{roleLabel ?? 'User'}</Badge>
            <Text style={styles.title}>Scan a book QR</Text>
            <Text style={styles.subtitle}>
              Scan the library reference code and the app will pull the book record from Laravel.
            </Text>
          </View>

          <View style={styles.heroActions}>
            <PrimaryButton label="Profile" onPress={goToProfile} tone="secondary" />
            <PrimaryButton label="Logout" onPress={() => void handleLogout()} tone="ghost" />
          </View>
        </View>

        <View style={styles.featureRow}>
          {mobileFeatures.map((feature) => (
            <Badge key={feature} tone="muted">
              {feature.replaceAll('_', ' ')}
            </Badge>
          ))}
        </View>
      </Panel>

      {message ? (
        <Panel style={styles.messageCard}>
          <Text style={styles.messageTitle}>Scanner note</Text>
          <Text style={styles.messageText}>{message}</Text>
          <PrimaryButton label="Reset scanner" onPress={resetScanner} tone="secondary" />
        </Panel>
      ) : null}

      {renderCameraState()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.md,
  },
  heroTop: {
    gap: theme.spacing.md,
  },
  heroCopy: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  featureRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  messageCard: {
    gap: theme.spacing.sm,
  },
  messageTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  messageText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  cameraPanel: {
    gap: theme.spacing.md,
  },
  cameraTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cameraText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  cameraFrame: {
    aspectRatio: 3 / 4,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelMuted,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameCornerTopLeft: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 42,
    height: 42,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.colors.accent,
    borderTopLeftRadius: 12,
  },
  frameCornerTopRight: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 42,
    height: 42,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: theme.colors.accentWarm,
    borderTopRightRadius: 12,
  },
  frameCornerBottomLeft: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    width: 42,
    height: 42,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.colors.accentWarm,
    borderBottomLeftRadius: 12,
  },
  frameCornerBottomRight: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 42,
    height: 42,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: theme.colors.accent,
    borderBottomRightRadius: 12,
  },
  scanFooter: {
    gap: theme.spacing.sm,
  },
  scanHint: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
