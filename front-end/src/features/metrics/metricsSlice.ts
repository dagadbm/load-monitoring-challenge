import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { fetchCPUAverage } from './metricsAPI';
import { ScatterDataPoint } from 'chart.js';

// 10 minutes worth of samples
const MAX_SAMPLES = 60;

// every 10 seconds (approximately)
const POOLING_RATE = 10 * 1000;

// minimum delta to raise alert
const MINIMUM_ALERT_DELTA = 120 * 1000;

export const DEFAULT_THRESHOLD = 0.7;

interface MetricsState {
  cpuAverage: ScatterDataPoint[],
  poolingId: number | null,
  threshold: number,
  alert: Alert | null,
  alertStatus: AlertStatus,
  alertHistory: Alert[],
}

interface Alert {
  timestampStart: number,
  timestampEnd: number | null,
  threshold: number,
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
  alert: null,
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
        if (state.cpuAverage.length > MAX_SAMPLES) {
          state.cpuAverage.shift();
        }

        if (loadAverage >= state.threshold) {
          if (!state.alert) {
            state.alert = {
              timestampStart: timestamp,
              timestampEnd: null,
              threshold: state.threshold,
            };
            state.alertStatus = AlertStatus.none;
          }

          if (timestamp - state.alert.timestampStart >= MINIMUM_ALERT_DELTA) {
            state.alertStatus = AlertStatus.start;
          }
        } else if (loadAverage < state.threshold) {
          if (state.alert) {
            state.alert.timestampEnd = timestamp;

            if(state.alertStatus === AlertStatus.start) {
              state.alertHistory.push(state.alert);
              state.alert = null;
              state.alertStatus = AlertStatus.end;
            } else {
              state.alert = null;
              state.alertStatus = AlertStatus.none;
            }
          }
        }
      })
      .addCase(poolCPUAverageAsync.fulfilled, (state, action) => {
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
        state.alert = null;
        state.alertStatus = AlertStatus.none;
      })
      .addDefaultCase(() => {})
  },
});

export const selectCPUAverage = (state: RootState) => state.metrics.cpuAverage;
export const selectThreshold = (state: RootState) => state.metrics.threshold;
export const selectAlertStatus = (state: RootState) => state.metrics.alertStatus;
export const selectAlertHistory = (state: RootState) => state.metrics.alertHistory;

export default metricsSlice.reducer;
