import React from 'react';
import { Metrics } from './Metrics';
import { render, waitFor, screen, mockFetchCPUAverage } from 'test-utils';
import {
  DEFAULT_THRESHOLD,
} from './metricsSlice';

jest.mock('chart.js/auto');

test('Metrics renders and updates state', async () => {
  mockFetchCPUAverage(100000000000000, 0.1);
  const { store } = render(<Metrics />);

  expect(screen.getByText('Alert History')).toBeInTheDocument();
  await waitFor(() => {
    expect(store.getState().metrics.cpuAverage).toEqual([{
      x: 100000000000000,
      y: 0.1,
    }]);
  });
});
