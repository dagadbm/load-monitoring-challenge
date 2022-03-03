import React, { useState, useEffect } from 'react';
import {
  DEFAULT_THRESHOLD,
  setThreshold,
} from './metricsSlice';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from './useDebounce';

export function Threshold() {
  const [value, setValue] = useState<number>(DEFAULT_THRESHOLD);
  const dispatch = useAppDispatch();
  const debouncedThreshold: number = useDebounce<number>(value, 700);

  useEffect(() => {
    dispatch(setThreshold(debouncedThreshold));
  }, [dispatch, debouncedThreshold]);

  const onChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    const threshold = +event.target.value;
    setValue(threshold);
  };

  return <input step="0.1" min="0.1" max="2" type="range" value={value} onChange={onChange} title={`${value} CPU load`} />;
}
