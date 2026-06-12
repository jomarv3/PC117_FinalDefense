import { useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/theme';
import { useAuth } from '@/auth/useAuth';
import { useQrScanner } from '@/scanner/useQrScanner';
import { lookupBookByQrCode } from '@/api/books';

export default function ScannerScreen() {
  const router = useRouter();
  const { token } = useAuth();

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

  const message = scanMessage;

  const renderCameraState = () => {
    if (!permission) {
      return (
        <Panel style={styles.cameraPanel}>
          <Text style={styles.helperText}>Requesting camera access...</Text>
        </Panel>
      );
    }

    if (!permission.granted) {
      return (
        <Panel style={styles.cameraPanel}>
          <Text style={styles.sectionTitle}>Camera permission required</Text>
          <Text style={styles.helperText}>Enable camera access to scan catalog QR codes.</Text>
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
          <View style={styles.scanBox} />
        </View>

        <View style={styles.cameraFooter}>
          <Text style={styles.helperText}>{isScanning ? 'Ready to scan.' : 'Scanner paused.'}</Text>
          {!isScanning ? <PrimaryButton label="Scan again" onPress={resetScanner} tone="secondary" /> : null}
        </View>
      </Panel>
    );
  };

  return (
    <Screen>
      {message ? (
        <Panel style={styles.messageCard}>
          <Text style={styles.sectionTitle}>Scanner note</Text>
          <Text style={styles.helperText}>{message}</Text>
          <PrimaryButton label="Reset scanner" onPress={resetScanner} tone="secondary" />
        </Panel>
      ) : null}

      {renderCameraState()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  messageCard: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  helperText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  cameraPanel: {
    gap: theme.spacing.md,
  },
  cameraFrame: {
    aspectRatio: 3 / 4,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelMuted,
  },
  scanBox: {
    position: 'absolute',
    alignSelf: 'center',
    top: '23%',
    width: '68%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    backgroundColor: 'transparent',
  },
  cameraFooter: {
    gap: theme.spacing.sm,
  },
});
