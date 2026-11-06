import { configureStore } from '@reduxjs/toolkit';
import { canvasApi } from './services/canvasApi';

export function createAppStore() {
  return configureStore({
    reducer: { [canvasApi.reducerPath]: canvasApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(canvasApi.middleware),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
