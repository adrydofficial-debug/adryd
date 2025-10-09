// src/store/index.ts
import {configureStore} from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // add reducers here when needed
  },
});

// Type of the entire Redux state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
