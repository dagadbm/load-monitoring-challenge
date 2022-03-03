import React, { useState, useEffect } from 'react';

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
  const [currentAlert, setCurrentAlert] = useState('No alerts in progress');

  useEffect(() => {
    switch (alertStatus) {
      case AlertStatus.start: {
        setCurrentAlert(`CPU above ${threshold} load for more than ${alertDeltaMinutes} minutes.`);
        break;
      }
      case AlertStatus.end: {
        setCurrentAlert('CPU has recovered');
        // after a while we reset the message
        setTimeout(() => setCurrentAlert('No alerts in progress'), 3000);
        break;
      }
      case AlertStatus.none:
      default: {
        setCurrentAlert('No alerts in progress');
        break;
      }
    }
  }, [alertDeltaMinutes, alertStatus, threshold]);
  return <p>{currentAlert}</p>;
}
