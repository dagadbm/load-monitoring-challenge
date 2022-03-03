import React from 'react';
import { Chart } from './Chart';
import { Threshold } from './Threshold';
import { AlertDelta } from './AlertDelta';
import { CurrentAlert } from './CurrentAlert';
import { AlertHistory } from './AlertHistory';
import { Notification } from './Notification';
import styles from './Metrics.module.scss';

import {
  poolCPUAverageAsync,
  fetchCPUAverageAsync,
  selectThreshold,
  selectAlertDeltaMinutes,
} from './metricsSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

export function Metrics() {
  const dispatch = useAppDispatch();
  const threshold = useAppSelector(selectThreshold);
  const alertDeltaMinutes = useAppSelector(selectAlertDeltaMinutes);


  React.useEffect(() => {
    // get the first data point
    dispatch(fetchCPUAverageAsync());
    // pool the others
    dispatch(poolCPUAverageAsync());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.setup}>
        <div className={styles.threshold}>
          <h2>When CPU load {threshold}</h2>
          <Threshold />
        </div>
        <div className={styles.alertDelta}>
          <h2>Alert after {alertDeltaMinutes} minute(s)</h2>
          <AlertDelta />
        </div>
        <div className={styles.currentAlert}>
          <div className={styles.notification}>
            <h2>Current Alert</h2>
            <Notification />
          </div>
          <CurrentAlert />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.alertHistory}>
          <h2>Alert History</h2>
          <AlertHistory />
        </div>
        <div className={styles.chart}>
          <Chart />
        </div>
      </div>
    </div>
  );
}
