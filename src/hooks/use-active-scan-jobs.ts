import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { listActiveScanJobs, type ScanJob } from '@/services/scanJobService';
import { type CardGameType } from '@/types/cardGame';

export function useActiveScanJobs(gameType: CardGameType) {
  const { session } = useAuth();
  const [jobs, setJobs] = useState<ScanJob[]>([]);

  const refresh = useCallback(async () => {
    if (!session?.access_token) {
      setJobs([]);
      return;
    }

    const activeJobs = await listActiveScanJobs(session.access_token);
    setJobs(activeJobs.filter((job) => job.gameType === gameType));
  }, [gameType, session?.access_token]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { jobs, refresh };
}
