import React from 'react';

import {
  AlertStatus,
  selectAlertStatus,
  selectThreshold,
  selectAlertDeltaMinutes,
} from './metricsSlice';
import { useAppSelector } from '../../app/hooks';

export function CurrentAlert() {
  const alertStatus = useAppSelector(selectAlertStatus);
  const threshold = useAppSelector(selectThreshold);
  const alertDeltaMinutes = useAppSelector(selectAlertDeltaMinutes);

  // send notifications
  let currentAlert: string;
  switch (alertStatus) {
    case AlertStatus.start:
      currentAlert = `CPU above ${threshold} load for more than ${alertDeltaMinutes} minutes.`;
      break;
    case AlertStatus.end:
      currentAlert = `CPU has recovered`;
      break;
    case AlertStatus.none:
    default:
    currentAlert = 'No alerts in progress';
      break;
  }
  return <p>{currentAlert}</p>;
}
