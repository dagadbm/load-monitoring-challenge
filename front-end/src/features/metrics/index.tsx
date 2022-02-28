import React from 'react';
import { Chart } from './Chart';
import { Threshold } from './Threshold';
import { AlertHistory } from './AlertHistory';
import { useNotification } from './useNotification';

export function Metrics() {
  useNotification();
  return <>
    <Threshold />
    <Chart />
    <AlertHistory />
  </>;
}
