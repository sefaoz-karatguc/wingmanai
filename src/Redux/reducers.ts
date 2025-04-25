import { createSlice } from "@reduxjs/toolkit";
import { InitialState } from "../Utils/types";
import {
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
      })
      .addCase(inactivateProfile.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.isAuthenticated = false;
        }
        state.message = action.payload.message;
        state.loading = false;
      });
  },
});

export const { logOut } = reducers.actions;
export default reducers.reducer;
