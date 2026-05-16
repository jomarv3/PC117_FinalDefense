import { useState } from 'react';
import { BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { formatApiError } from '@/api/client';

interface UseQrScannerOptions {
  onDetected: (code: string) => Promise<void> | void;
}

export function useQrScanner({ onDetected }: UseQrScannerOptions) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (isProcessing || !isScanning) return;

    const code = String(result.data ?? '').trim();

    if (!code) return;

    setIsProcessing(true);
    setIsScanning(false);
    setScanMessage(null);

    try {
      await onDetected(code);
    } catch (error) {
      setScanMessage(formatApiError(error, 'We could not read that QR code.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanMessage(null);
    setIsScanning(true);
    setIsProcessing(false);
  };

  return {
    permission,
    requestPermission,
    isScanning,
    isProcessing,
    scanMessage,
    handleBarcodeScanned,
    resetScanner,
  };
}
