'use client';

import { useEffect, useCallback } from 'react';
import { useBackendStore } from '@/stores/backend-store';
import { checkHealth, listModels } from '@/lib/api-client';

export function useBackendHealth(intervalMs = 30000) {
  const backends = useBackendStore((s) => s.backends);
  const setHealthStatus = useBackendStore((s) => s.setHealthStatus);
  const setModels = useBackendStore((s) => s.setModels);

  const checkAll = useCallback(async () => {
    for (const backend of backends) {
      try {
        const healthy = await checkHealth(backend);
        setHealthStatus(backend.id, healthy ? 'healthy' : 'unhealthy');

        if (healthy) {
          try {
            const models = await listModels(backend);
            if (models.length > 0) {
              setModels(backend.id, models);
            }
          } catch {
            // Model listing failed -- keep whatever models were already stored
          }
        }
      } catch {
        setHealthStatus(backend.id, 'unhealthy');
      }
    }
  }, [backends, setHealthStatus, setModels]);

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, intervalMs);
    return () => clearInterval(interval);
  }, [checkAll, intervalMs]);

  return { checkAll };
}
