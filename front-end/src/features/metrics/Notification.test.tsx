import React from 'react';
import { Notification } from './Notification';
import { render, waitFor, screen, user, mockFetchCPUAverage } from 'test-utils';
import {
  DEFAULT_ALERT_DELTA,
  fetchCPUAverageAsync,
  setThreshold,
  setAlertDelta,
  DEFAULT_THRESHOLD,
} from './metricsSlice';

let restoreNotification: any;
beforeAll(() => {
  restoreNotification = window.Notification as any;
});

afterAll(() => {
  window.Notification = restoreNotification;
});

beforeEach(() => {
  // @ts-expect-error
  window.Notification = jest.fn();
  // @ts-expect-error
  window.Notification.permission = 'granted';
});

const TIMESTAMP = 100000000000000;
const THRESHOLD = 0.7;

test('prompt Notification', async () => {
  const requestPermission = jest.fn().mockReturnValue(true);
  // @ts-expect-error
  window.Notification = {
    requestPermission,
  };

  render(<Notification />);

  await user.click(screen.getByTestId('notification'));
  await waitFor(() => {
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });
});

test('full notification cycle', async () => {
  const { store } = render(<Notification />);

  expect(window.Notification).not.toHaveBeenCalled();

  mockFetchCPUAverage(TIMESTAMP, DEFAULT_THRESHOLD + 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })

  mockFetchCPUAverage(TIMESTAMP + DEFAULT_ALERT_DELTA, DEFAULT_THRESHOLD + 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).toHaveBeenNthCalledWith(1, 'Your CPU has been over 1 load for over 2 minute(s) or more');
  })

  mockFetchCPUAverage(TIMESTAMP + DEFAULT_ALERT_DELTA + (DEFAULT_ALERT_DELTA / 2), DEFAULT_THRESHOLD - 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenNthCalledWith(2, 'Your CPU has recovered from 1 load');
  })

  mockFetchCPUAverage(TIMESTAMP + DEFAULT_ALERT_DELTA + (DEFAULT_ALERT_DELTA / 2) + DEFAULT_ALERT_DELTA, DEFAULT_THRESHOLD - 0.2);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).toHaveBeenNthCalledWith(2, 'Your CPU has recovered from 1 load');
  })
});

test('does not notify if cpu load does not last more than 2 minutes', async () => {
  const { store } = render(<Notification />);

  expect(window.Notification).not.toHaveBeenCalled();

  const customThreshold = 0.5;

  store.dispatch(setThreshold(customThreshold));
  mockFetchCPUAverage(TIMESTAMP, customThreshold);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })

  mockFetchCPUAverage(TIMESTAMP + DEFAULT_ALERT_DELTA - 1, customThreshold + 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })
});

test('does not notify if cpu load oscilates between up and down for no more than alertDelta', async () => {
  const { store } = render(<Notification />);

  expect(window.Notification).not.toHaveBeenCalled();

  const customAlertDelta = 30 * 1000;
  const customThreshold = 0.7;
  store.dispatch(setThreshold(customThreshold));
  store.dispatch(setAlertDelta(customAlertDelta));

  mockFetchCPUAverage(TIMESTAMP, customThreshold + 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })

  mockFetchCPUAverage(TIMESTAMP + customAlertDelta - 1, customThreshold + 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })

  // this will just reset the curret peak, no notification should be sent
  mockFetchCPUAverage(TIMESTAMP + customAlertDelta * 2, customThreshold - 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })

  // start a new peak
  mockFetchCPUAverage(TIMESTAMP + customAlertDelta * 2 + 1, customThreshold + 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).not.toHaveBeenCalled();
  })

  // accept it
  mockFetchCPUAverage(TIMESTAMP + customAlertDelta * 2 + 1 + customAlertDelta, customThreshold + 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).toHaveBeenNthCalledWith(1, 'Your CPU has been over 0.7 load for over 0.5 minute(s) or more');
  })

  // try to recover
  mockFetchCPUAverage(TIMESTAMP + customAlertDelta * 2 + 1 + customAlertDelta + 1, customThreshold - 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  expect(window.Notification).not.toHaveBeenNthCalledWith(2, 'Your CPU has recovered from 0.7 load');

  // go up again (reseting previous state)
  mockFetchCPUAverage(TIMESTAMP + customAlertDelta * 2 + 1 + customAlertDelta + 1 + 1, customThreshold + 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  expect(window.Notification).not.toHaveBeenNthCalledWith(2, 'Your CPU has recovered from 0.7 load');

  // go down again starting
  mockFetchCPUAverage(TIMESTAMP + customAlertDelta * 2 + 1 + customAlertDelta + 1 + 1 + 1, customThreshold - 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  expect(window.Notification).not.toHaveBeenNthCalledWith(2, 'Your CPU has recovered from 0.7 load');

  // finally recover
  mockFetchCPUAverage(TIMESTAMP + customAlertDelta * 2 + 1 + customAlertDelta + 1 + 1 + 1 + customAlertDelta, customThreshold - 0.1);
  await store.dispatch(fetchCPUAverageAsync());

  await waitFor(() =>  {
    expect(window.Notification).toHaveBeenNthCalledWith(2, 'Your CPU has recovered from 0.7 load');
  })

});
