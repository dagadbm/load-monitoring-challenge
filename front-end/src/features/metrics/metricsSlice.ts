import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { fetchCPUAverage } from './metricsAPI';

export interface MetricsState {
  cpuAverage: CpuAverage[],
}

type CpuAverage = {
  avg: number,
  timestamp: number,
};

const initialState: MetricsState = {
  cpuAverage: [],
};

export const fetchCPUAverageAsync = createAsyncThunk(
  'metrics/fetchCPUAverage',
  async () => {
    const response = await fetchCPUAverage();
    return response;
  }
);

export const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(fetchCPUAverageAsync.fulfilled, (state, action) => {
      const { timestamp, loadAverage: avg } = action.payload;
      state.cpuAverage.push({
        timestamp,
        avg,
      });
    })
  },
});

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectCPUAverage = (state: RootState) => state.metrics.cpuAverage;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectLatestCPUAverage = (state: RootState) => state.metrics.cpuAverage[state.metrics.cpuAverage.length - 1];

export default metricsSlice.reducer;
