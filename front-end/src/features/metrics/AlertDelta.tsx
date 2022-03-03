import React, { useState, useEffect } from 'react';
import {
  DEFAULT_ALERT_DELTA,
  setAlertDelta,
} from './metricsSlice';
import { useAppDispatch } from '../../app/hooks';
import { useDebounce } from './useDebounce';

export function AlertDelta() {
  const [value, setValue] = useState<number>(DEFAULT_ALERT_DELTA / 1000);
  const dispatch = useAppDispatch();
  const debouncedAlertDelta: number = useDebounce<number>(value, 700);

  useEffect(() => {
    dispatch(setAlertDelta(debouncedAlertDelta * 1000));
  }, [dispatch, debouncedAlertDelta]);

  const onChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    const alertDelta = +event.target.value;
      setValue(alertDelta);
  }

  return <input step="30" min="30" max="240" type="range" value={value} onChange={onChange} title={`${value/60} minute(s)`} />;
}
