import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { fetchCPUAverage } from './metricsAPI';
import { ScatterDataPoint } from 'chart.js';

const MAX_TIME_DELTA = 60 * 10 * 1000;

// every 10 seconds (approximately)
export const POOLING_RATE = 10 * 1000;

// minimum delta to raise alert
export const DEFAULT_ALERT_DELTA = 120 * 1000;

export const DEFAULT_THRESHOLD = 1;

interface MetricsState {
  // data set
  cpuAverage: ScatterDataPoint[],

  // setInterval id
  poolingId: number | null,

  // user configuration
  threshold: number,
  alertDelta: number,

  // to mark the first/last occurences of alerts
  // before/after taking into account the alertDelta
  alertStartBeforeDelta: number | null,
  alertStartAfterDelta: number | null,
  alertEndBeforeDelta: number | null,
  alertEndAfterDelta: number | null,

  // for notifications
  alertStatus: AlertStatus,

  // to store history of alerts
  alertHistory: Alert[],
}

interface Alert {
  timestampStart: number,
  timestampEnd: number,
  threshold: number,
  alertDelta: number,
}

export enum AlertStatus {
  none = 'NONE',
  start = 'START',
  end = 'END',
}

const initialState: MetricsState = {
  cpuAverage: [],
  poolingId: null,
  threshold: DEFAULT_THRESHOLD,
  alertStartBeforeDelta: null,
  alertStartAfterDelta: null,
  alertEndBeforeDelta: null,
  alertEndAfterDelta: null,
  alertDelta: DEFAULT_ALERT_DELTA,
  alertStatus: AlertStatus.none,
  alertHistory: [],
};

export const fetchCPUAverageAsync = createAsyncThunk(
  'metrics/fetchCPUAverage',
  async () => {
    return await fetchCPUAverage();
  }
);

export const poolCPUAverageAsync = createAsyncThunk(
  'metrics/poolCPUAverage',
  async (_, { dispatch }) => {
    return window.setInterval(() => dispatch(fetchCPUAverageAsync()), POOLING_RATE)
  }
);

export const stopPooling = createAction('metrics/stopPolling');

export const setThreshold = createAction<number>('metrics/setThreshold');

export const setAlertDelta = createAction<number>('metrics/setAlertDelta');

export const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCPUAverageAsync.fulfilled, (state, action) => {
        const { timestamp, loadAverage } = action.payload;
        state.cpuAverage.push({
          x: timestamp,
          y: loadAverage,
        });

        // Never store more than 10 minutes worth of data
        while(Date.now() - state.cpuAverage[0].x >= MAX_TIME_DELTA) {
          state.cpuAverage.shift();
        }

        // logic to handle over threshold
        if (loadAverage > state.threshold) {
          // if we were starting to finish an alert, we cancel it
          if (state.alertEndBeforeDelta && !state.alertEndAfterDelta) {
            state.alertEndBeforeDelta = null;
          }

          // if we already had a threshold start lets see if we can trigger it
          if (state.alertStartBeforeDelta) {
            if (timestamp - state.alertStartBeforeDelta >= state.alertDelta) {
              state.alertStartAfterDelta = timestamp;
              state.alertStatus = AlertStatus.start;
            }
          // else we start one
          } else {
              state.alertStartBeforeDelta = timestamp;
          }
        }

        // logic to handle under threshold
        if (loadAverage < state.threshold) {
          // if we were starting an alert, we cancel it
          if (state.alertStartBeforeDelta && !state.alertStartAfterDelta) {
            state.alertStartBeforeDelta = null;
          }

          // if we already had a threshold start lets see if we can recover from it
          if (state.alertEndBeforeDelta) {
            if (timestamp - state.alertEndBeforeDelta >= state.alertDelta) {

              state.alertEndAfterDelta = timestamp;
              state.alertStatus = AlertStatus.end;

              // store the alertHistory since it has finished
              state.alertHistory.push({
                timestampStart: state.alertStartBeforeDelta as number,
                timestampEnd: state.alertEndAfterDelta as number,
                threshold: state.threshold,
                alertDelta: state.alertDelta,
              })

              // reset alert state
              state.alertStartBeforeDelta = null;
              state.alertStartAfterDelta = null;
              state.alertEndBeforeDelta = null;
              state.alertEndAfterDelta = null;
            }
          // else we start one if we are on an alert
          } else if (state.alertStartAfterDelta) {
              state.alertEndBeforeDelta = timestamp;
          }
        }
      })
      .addCase(poolCPUAverageAsync.fulfilled, (state, action) => {
        // avoid pending intervals
        if (state.poolingId !== null) {
          window.clearInterval(state.poolingId);
        }

        state.poolingId = action.payload;
      })
      .addCase(stopPooling, (state) => {
        if (state.poolingId !== null) {
          window.clearInterval(state.poolingId);
        }

        state.poolingId = null;
      })
      .addCase(setThreshold, (state, action) => {
        state.threshold = action.payload;
        // reset alert state
        state.alertStartBeforeDelta = null;
        state.alertStartAfterDelta = null;
        state.alertEndBeforeDelta = null;
        state.alertEndAfterDelta = null;
        state.alertStatus = AlertStatus.none;
      })
      .addCase(setAlertDelta, (state, action) => {
        state.alertDelta = action.payload;
        // reset alert state
        state.alertStartBeforeDelta = null;
        state.alertStartAfterDelta = null;
        state.alertEndBeforeDelta = null;
        state.alertEndAfterDelta = null;
        state.alertStatus = AlertStatus.none;
      })
      .addDefaultCase(() => {})
  },
});

export const selectCPUAverage = (state: RootState) => state.metrics.cpuAverage;
export const selectThreshold = (state: RootState) => state.metrics.threshold;
export const selectAlertDeltaMinutes = (state: RootState) => state.metrics.alertDelta / 60 / 1000;
export const selectAlertStatus = (state: RootState) => state.metrics.alertStatus;
export const selectAlertHistory = (state: RootState) => state.metrics.alertHistory;

export default metricsSlice.reducer;
