import React from 'react';
import { Chart } from './Chart';
import { Threshold } from './Threshold';
import { AlertHistory } from './AlertHistory';
import { Notification } from './Notification';
import styles from './index.module.css';

import { selectThreshold, } from './metricsSlice';
import { useAppSelector } from '../../app/hooks';

export function Metrics() {
  const threshold = useAppSelector(selectThreshold);
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h1 className={styles.title}>Alerting</h1>
        <div className={styles.notification}>
          <h2>Notifications</h2>
          <Notification />
        </div>
        <div className={styles.threshold}>
          <h2>Threshold {threshold}</h2>
          <Threshold />
        </div>
        <div className={styles.alerts}>
          <h2>Alert History</h2>
          <AlertHistory />
        </div>
      </div>
      <div className={styles.chart}>
        <Chart />
      </div>
    </div>
  );
}
