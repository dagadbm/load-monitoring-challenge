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

  const onChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    const threshold = +event.target.value;
    if (threshold >= 1) {
      setValue(1);
    } else if (threshold <= 0) {
      setValue(0.1);
    } else {
      setValue(threshold);
    }
  };

  return <input step="0.1" min="0.1" max="1" type="range" onChange={onChange} />;
}
