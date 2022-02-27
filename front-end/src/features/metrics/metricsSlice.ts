import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { fetchCPUAverage } from './metricsAPI';
import { ScatterDataPoint } from 'chart.js';

// 10 minutes worth of samples
const MAX_SAMPLES = 60;

// every 10 seconds (approximately)
const POOLING_RATE = 10 * 1000;

interface MetricsState {
  cpuAverage: ScatterDataPoint[],
  poolingId: number | undefined,
}

const initialState: MetricsState = {
  cpuAverage: [],
  poolingId: undefined,
};

export const poolCPUAverageAsync = createAsyncThunk(
  'metrics/poolCPUAverage',
  async (_, { dispatch }) => {
    return window.setInterval(() => dispatch(fetchCPUAverageAsync()), POOLING_RATE)
  }
);

export const stopPooling = createAction('metrics/stopPolling');

export const fetchCPUAverageAsync = createAsyncThunk(
  'metrics/fetchCPUAverage',
  async () => {
    return await fetchCPUAverage();
  }
);

export const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(poolCPUAverageAsync.fulfilled, (state, action) => {
        state.poolingId = action.payload;
      })
      .addCase(stopPooling, (state) => {
        window.clearInterval(state.poolingId);
        state.poolingId = undefined;
      })
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
      // TODO: handle failure cases
      .addCase(fetchCPUAverageAsync.rejected, () => {

      })
      .addDefaultCase(() => {})
  },
});

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectCPUAverage = (state: RootState) => state.metrics.cpuAverage;

export default metricsSlice.reducer;
