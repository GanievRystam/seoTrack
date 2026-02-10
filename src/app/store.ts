import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../shared/api/baseApi";
import { checkRunReducer } from "../features/checkRun/model/checkRunSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    checkRun: checkRunReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
