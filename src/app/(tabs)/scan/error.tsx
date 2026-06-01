import { useLocalSearchParams } from 'expo-router';

import { ScanErrorScreen } from '@/components/scan/scan-error-screen';

export default function ScanErrorRoute() {
  const { cardName, message } = useLocalSearchParams<{
    cardName?: string;
    message?: string;
  }>();

  return <ScanErrorScreen cardName={cardName} message={message} />;
}
