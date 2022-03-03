import React, { FC, ReactElement } from 'react'
import { render as rtlRender } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import metricsReducer from 'features/metrics/metricsSlice';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer();
const user = userEvent.setup();

function mockApi(json: object) {
  server.use(rest.get(
    process.env.REACT_APP_API_CPU_LOAD_URL as string,
    (_, res, ctx) => res.once(ctx.json(json))),
  );
}

function mockFetchCPUAverage(timestamp: number, loadAverage: number) {
  mockApi({
    timestamp,
    loadAverage,
  });
}

function render(
  ui: ReactElement,
  {
    store = configureStore({ reducer: { metrics: metricsReducer }}),
    ...renderOptions
  } = {}
) {
  const Wrapper: FC = ({ children }) => {
    return <Provider store={store}>{children}</Provider>
  };

  return {
    renderResult: rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}

export * from '@testing-library/react';
export { rest, server, render, user, mockApi, mockFetchCPUAverage };
