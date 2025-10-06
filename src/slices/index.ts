// src/store/index.ts
import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // add other reducers here
  },
});

// Type of the entire Redux state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
