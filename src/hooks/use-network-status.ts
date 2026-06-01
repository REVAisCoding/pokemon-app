import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected =
        state.isConnected === true &&
        (state.isInternetReachable === true || state.isInternetReachable === null);

      setIsOnline(connected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
}
