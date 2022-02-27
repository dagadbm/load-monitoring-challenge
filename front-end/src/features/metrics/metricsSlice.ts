import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { fetchCPUAverage } from './metricsAPI';
import { ScatterDataPoint } from 'chart.js';

// 10 minutes worth of samples
const MAX_SAMPLES = 60;

// every 10 seconds (approximately)
const POOLING_RATE = 10 * 1000;

export const DEFAULT_THRESHOLD = 0.7;

interface MetricsState {
  cpuAverage: ScatterDataPoint[],
  poolingId: number | undefined,
  threshold: number,
}

const initialState: MetricsState = {
  cpuAverage: [],
  poolingId: undefined,
  threshold: DEFAULT_THRESHOLD,
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
      })
      .addCase(poolCPUAverageAsync.fulfilled, (state, action) => {
        state.poolingId = action.payload;
      })
      .addCase(stopPooling, (state) => {
        window.clearInterval(state.poolingId);
        state.poolingId = undefined;
      })
      .addCase(setThreshold, (state, action) => {
        state.threshold = action.payload;
      })
      .addDefaultCase(() => {})

  },
});

export const selectCPUAverage = (state: RootState) => state.metrics.cpuAverage;
export const selectThreshold = (state: RootState) => state.metrics.threshold;

export default metricsSlice.reducer;
