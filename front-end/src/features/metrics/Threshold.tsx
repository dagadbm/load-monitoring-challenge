import React, { useState, useEffect } from 'react';
import {
  DEFAULT_THRESHOLD,
  setThreshold,
} from './metricsSlice';
import { useAppDispatch, useDebounce } from '../../app/hooks';

export function Threshold() {
  const [value, setValue] = useState<number>(DEFAULT_THRESHOLD);
  const dispatch = useAppDispatch();
  const debouncedThreshold: number = useDebounce<number>(value, 1000);

  useEffect(() => {
    dispatch(setThreshold(debouncedThreshold));
  }, [dispatch, debouncedThreshold]);

  return <input step="0.1" min="0.1" max="1" type="range" onChange={(e) => setValue(+e.target.value)} />;
}
