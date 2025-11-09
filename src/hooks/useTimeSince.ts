/**
 * Custom hook to track time since a given date
 */

import { useState } from 'react';
import { useInterval } from './useInterval';

export function useTimeSince(startDate: Date | null): number {
  const [elapsed, setElapsed] = useState(0);

  useInterval(
    () => {
      if (startDate) {
        setElapsed(new Date().getTime() - startDate.getTime());
      }
    },
    startDate ? 1000 : null
  );

  return elapsed;
}
