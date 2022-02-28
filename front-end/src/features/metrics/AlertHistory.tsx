import React from 'react';
import { selectAlertHistory } from './metricsSlice';
import { useAppSelector } from '../../app/hooks';

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
export function AlertHistory() {
  const alertHistory = useAppSelector(selectAlertHistory);

  return <table>
    <thead>
      <tr>
      <th>Start</th>
      <th>End</th>
      <th>Threshold</th>
      </tr>
    </thead>
    <tbody>
    {alertHistory.length
      ? alertHistory.map((alert) =>
      <tr>
        <td>{formatTimestamp(alert.timestampStart)}</td>
        <td>{formatTimestamp(alert.timestampEnd as number)}</td>
        <td>{alert.threshold}</td>
      </tr>
      )
      :
      <tr>
        <td>N/A</td>
        <td>N/A</td>
        <td>N/A</td>
      </tr>
    }
    </tbody>
  </table>
}
