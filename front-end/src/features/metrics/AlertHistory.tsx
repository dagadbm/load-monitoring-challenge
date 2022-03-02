import React from 'react';
import { selectAlertHistory } from './metricsSlice';
import { useAppSelector } from '../../app/hooks';
import styles from './AlertHistory.module.scss';

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${
    date.getHours().toString().padStart(2, '0')
  }:${
    date.getMinutes().toString().padStart(2, '0')
  }:${
    date.getSeconds().toString().padStart(2, '0')
  }`;
}

export function AlertHistory() {
  const alertHistory = useAppSelector(selectAlertHistory);

  return <table className={styles.table}>
    <thead>
      <tr>
      <th>Start</th>
      <th>End</th>
      <th>Settings</th>
      </tr>
    </thead>
    <tbody>
    {alertHistory.length
      ? alertHistory.map((alert) =>
      <tr key={alert.timestampStart}>
        <td>{formatTimestamp(alert.timestampStart)}</td>
        <td>{formatTimestamp(alert.timestampEnd as number)}</td>
        <td>{alert.threshold} load, {alert.alertDelta / 1000 / 60} min</td>
      </tr>
      )
        : <>
      <tr>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
      </tr>
      </>
    }
    </tbody>
  </table>
}
