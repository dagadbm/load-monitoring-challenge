import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import metricsReducer from '../features/metrics/metricsSlice';

export const store = configureStore({
  reducer: {
    metrics: metricsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
