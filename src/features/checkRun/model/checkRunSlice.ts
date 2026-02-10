import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CheckRunStatus = "idle" | "running" | "success" | "fail";

type CheckRunState = {
  open: boolean;
  status: CheckRunStatus;
  title: string;
  subtitle?: string;
  message?: string;
};

const initialState: CheckRunState = {
  open: false,
  status: "idle",
  title: "Проверка",
  subtitle: undefined,
  message: undefined,
};

type OpenPayload = Partial<Omit<CheckRunState, "open">> & { open?: boolean };

const checkRunSlice = createSlice({
  name: "checkRun",
  initialState,
  reducers: {
    open(state, action: PayloadAction<OpenPayload>) {
      const { open = true, ...rest } = action.payload;
      state.open = open;
      if (rest.status) state.status = rest.status;
      if (rest.title) state.title = rest.title;
      if (rest.subtitle !== undefined) state.subtitle = rest.subtitle;
      if (rest.message !== undefined) state.message = rest.message;
    },
    close(state) {
      state.open = false;
    },
    setStatus(state, action: PayloadAction<{ status: CheckRunStatus; message?: string }>) {
      state.status = action.payload.status;
      state.message = action.payload.message;
    },
  },
});

export const { open, close, setStatus } = checkRunSlice.actions;
export const checkRunReducer = checkRunSlice.reducer;
