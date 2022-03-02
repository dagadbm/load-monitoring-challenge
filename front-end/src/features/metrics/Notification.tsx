import React, { useState, useEffect } from 'react';
import { ReactComponent as NotificationIcon } from 'notification.svg';
import styles from './Notification.module.scss';

import {
  AlertStatus,
  selectAlertStatus,
  selectThreshold,
  selectAlertDeltaMinutes,
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
  const alertDeltaMinutes = useAppSelector(selectAlertDeltaMinutes);
  const [showIcon, setShowIcon] = useState(window.Notification?.permission !== 'default' ?? true);
  const [canNotify, setCanNotify] = useState(window.Notification?.permission === 'granted' ?? false);

  const handlePermissionState = (state: PermissionState) => {
    switch (state) {
      case 'granted':
        setShowIcon(false);
        setCanNotify(true);
        break;
      case 'denied':
        setShowIcon(false);
        setCanNotify(false);
        break;
      case 'prompt':
        setShowIcon(true);
        setCanNotify(false);
        break;
      default:
        break;
    }
  };
  // setup notifications permissions change logic
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name:'notifications' }).then((status) => {
        handlePermissionState(status.state);
        status.onchange = () => handlePermissionState(status.state);
      });
    }
  }, []);

  const handleClick = () => {
    try {
      window.Notification.requestPermission();
    } catch (e) {
      // support safari
      // reference: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
      window.Notification.requestPermission((permission) => {
        // safari does not support navigator.permissions.query so we need this extra check here
        // it wont auto update the icon as the other solution but it will still work
        setShowIcon(false);
        if (permission === 'granted') {
          setCanNotify(true);
        }
      });
    }
  }

  // send notifications
  useEffect(() => {
    if (canNotify) {
      switch (alertStatus) {
        case AlertStatus.start:
          sendNotification(`Your CPU has been over ${threshold} load for over ${alertDeltaMinutes} minute(s) or more`);
          break;
        case AlertStatus.end:
          sendNotification(`Your CPU has recovered from ${threshold} load`);
          break;
        case AlertStatus.none:
        default:
          break;
      }
    }
  }, [canNotify, alertStatus, alertDeltaMinutes, threshold]);

  return showIcon ? <NotificationIcon className={styles.icon} data-testid="notification" onClick={handleClick}/>
    : null;
}
