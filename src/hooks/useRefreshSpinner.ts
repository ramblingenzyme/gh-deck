import { useCallback, useEffect, useRef, useState } from 'react';

export function useRefreshSpinner(isFetching: boolean, refetch: () => void) {
  const [spinning, setSpinning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const prevFetching = useRef(false);

  useEffect(() => {
    if (prevFetching.current && !isFetching) {
      setLastUpdated(new Date());
    }
    prevFetching.current = isFetching;
  }, [isFetching]);

  const handleRefresh = useCallback(() => {
    refetch();
    setSpinning(true);
    setTimeout(() => setSpinning(false), 800);
  }, [refetch]);

  return { spinning, lastUpdated, handleRefresh };
}
