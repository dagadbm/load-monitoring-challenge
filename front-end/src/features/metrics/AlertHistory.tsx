import React from 'react';
import { selectAlertHistory } from './metricsSlice';
import { useAppSelector } from '../../app/hooks';

export function AlertHistory() {
  const alertHistory = useAppSelector(selectAlertHistory);

  return <table>
    <tr>
      <th>Start</th>
      <th>End</th>
      <th>Threshold</th>
    </tr>
    {alertHistory.length
      ? alertHistory.map((alert) =>
      <tr>
        <td>{new Date(alert.timestampStart).toUTCString()}</td>
        <td>{new Date(alert.timestampEnd as number).toUTCString()}</td>
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
  </table>
}
