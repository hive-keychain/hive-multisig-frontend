import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/twoFactorAuth.interface';
import {
  createQRCode,
  createSecret,
  setTokenValidation,
} from './twoFactorAuthThunks';

const initialState: State = {
  secret: undefined,
  token: undefined,
  enabled: false,
  qrCodeUrl: undefined,
  isValid: false,
};

const twoFactorAuthSlice = createSlice({
  name: 'twoFactorAuth',
  initialState,
  reducers: {
    resetState: () => {
      initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createSecret.fulfilled, (state, action) => {
      state.secret = action.payload.secret;
    });

    builder.addCase(createQRCode.fulfilled, (state, action) => {
      state.qrCodeUrl = action.payload.qrCodeUrl;
    });

    builder.addCase(setTokenValidation.fulfilled, (state, action) => {
      state.isValid = action.payload.isValid;
    });
  },
});

export const twoFactorAuthReducer = twoFactorAuthSlice.reducer;
export const twoFactorAuthActions = twoFactorAuthSlice.actions;
