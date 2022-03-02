import React from 'react';
import { Notification } from './Notification';
import { render, waitFor, screen, user, mockApi } from 'test-utils';
import {
  MINIMUM_ALERT_DELTA,
  fetchCPUAverageAsync,
  setThreshold,
} from './metricsSlice';


let restoreNotification: any;
beforeAll(() => {
  restoreNotification = window.Notification as any;
});
afterAll(() => {
  window.Notification = restoreNotification;
});

test('prompt Notification', async () => {
  render(<Notification />);

  const requestPermission = jest.fn().mockReturnValue(true);
  // @ts-expect-error
  window.Notification = {
    requestPermission,
  };

  await user.click(screen.getByRole('button'));
  await waitFor(() => {
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });
});

test('notifies if an alert happened', async () => {
  const { store } = render(<Notification />);

  // @ts-expect-error
  window.Notification = jest.fn();
  expect(window.Notification).not.toHaveBeenCalled();

  store.dispatch(setThreshold(0.5));
  mockApi({
    timestamp: 100000000000000,
    loadAverage: 0.5,
  });
  store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })

  mockApi({
    timestamp: 100000000000000 + MINIMUM_ALERT_DELTA,
    loadAverage: 0.5,
  });
  store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).toHaveBeenNthCalledWith(1, 'Your CPU has been over 0.5 load for 2 minutes or more');
  })

  mockApi({
    timestamp: 100000000000000 + MINIMUM_ALERT_DELTA + 1,
    loadAverage: 0.4,
  });
  store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).toHaveBeenNthCalledWith(2, 'Your CPU has recovered from 0.5 load');
  })
});

test('does not notify if cpu load does not last more than 2 minutes', async () => {
  const { store } = render(<Notification />);

  // @ts-expect-error
  window.Notification = jest.fn();
  expect(window.Notification).not.toHaveBeenCalled();

  store.dispatch(setThreshold(0.5));
  mockApi({
    timestamp: 100000000000000,
    loadAverage: 0.5,
  });
  store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })

  mockApi({
    timestamp: 100000000000000 + MINIMUM_ALERT_DELTA - 1,
    loadAverage: 0.5,
  });
  store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })
});
