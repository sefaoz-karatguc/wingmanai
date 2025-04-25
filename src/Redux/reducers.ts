import { createSlice } from "@reduxjs/toolkit";
import { InitialState } from "../Utils/types";
import {
  analyzeImageWithPrompt,
  getUser,
  inactivateProfile,
  login,
  uploadProfileImage,
} from "./actions";

export const initialState: InitialState = {
  isAuthenticated: false,
  user: undefined,
  error: false,
  loading: false,
  message: "",
  success: false,
  aiResponse: undefined,
};

export const reducers = createSlice({
  name: "global",
  initialState,
  reducers: {
    logOut: (state) => {
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.isAuthenticated = true;
          state.user = action.payload.data;
        }
        state.loading = false;
      })
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.isAuthenticated = true;
          state.user = action.payload.data;
        }
        state.loading = false;
      })
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = false;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.isAuthenticated = true;
          state.user = action.payload.data;
        }
        state.loading = false;
      })
      .addCase(inactivateProfile.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = false;
      })
      .addCase(inactivateProfile.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.isAuthenticated = false;
        }
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(analyzeImageWithPrompt.pending, (state) => {
        state.loading = true;
        state.aiResponse = undefined;
        state.success = false;
        state.error = false;
      })
      .addCase(analyzeImageWithPrompt.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.aiResponse = action.payload.data;
          state.success = true;
        }
        state.message = action.payload.message;
        state.loading = false;
      });
  },
});

export const { logOut } = reducers.actions;
export default reducers.reducer;
