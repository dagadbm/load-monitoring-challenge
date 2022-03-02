import React from 'react';
import { Threshold } from './Threshold';
import { render, waitFor, screen, fireEvent, act } from 'test-utils';
import {
  DEFAULT_THRESHOLD,
} from './metricsSlice';

test('Threshold updates default value and store value', async () => {
  jest.useFakeTimers();
  const { store } = render(<Threshold />);


  await waitFor(() => {
    expect(screen.getByRole('slider')).toHaveValue(`${DEFAULT_THRESHOLD}`);
    expect(store.getState().metrics.threshold).toBe(DEFAULT_THRESHOLD);
  });

  // I wish there was a better way to test it but the keyboard method does not work
  await fireEvent.change(screen.getByRole('slider'), { target: { value: '0.5' }})
  act(() => {
    jest.advanceTimersByTime(1000);
  })
  await waitFor(() => {
    expect(screen.getByRole('slider')).toHaveValue('0.5');
    expect(store.getState().metrics.threshold).toBe(0.5);
  });

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
