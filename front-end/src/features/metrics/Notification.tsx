import React, { useEffect } from 'react';
import {
  AlertStatus,
  selectAlertStatus,
  selectThreshold,
} from './metricsSlice';
import { useAppSelector } from '../../app/hooks';

function sendNotification(message: string) {
  // most browser support service workers (check ServiceWorkerManager)
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistration().then(registration => {
      // however Safari iOS does not support showNotification
      if (registration && registration.showNotification) {
        registration.showNotification(message);
      } else {
        new window.Notification(message);
      }
    });
    // but if they dont we try to use the Notification API
  } else {
    new window.Notification(message);
  }
}

export function Notification() {
  const alertStatus = useAppSelector(selectAlertStatus);
  const threshold = useAppSelector(selectThreshold);

  const handleClick = () => {
    window.Notification.requestPermission();
  }

  useEffect(() => {
    switch (alertStatus) {
      case AlertStatus.start:
        sendNotification(`Your CPU has been over ${threshold} load for 2 minutes or more`);
        break;
      case AlertStatus.end:
        sendNotification(`Your CPU has recovered from ${threshold} load`);
        break;
      case AlertStatus.none:
        default:
        break;
    }
  }, [alertStatus, threshold]);

  return <button type='button' onClick={handleClick}>Notify me</button>
}
