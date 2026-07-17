import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetPlotsQueryKey } from '@workspace/api-client-react';

export function usePlotEvents() {
  const [isLive, setIsLive] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      setIsLive(true);
    };

    eventSource.addEventListener('plot-change', () => {
      // Invalidate plots cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: getGetPlotsQueryKey() });
    });

    eventSource.onerror = () => {
      setIsLive(false);
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  return { isLive };
}
