import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/twoFactorAuth.interface';
import {
  createQRCode,
  createSecret,
  proceedIntro,
  proceedMultisig,
  setTokenValidation,
} from './twoFactorAuthThunks';

const initialState: State = {
  secret: undefined,
  token: undefined,
  enabled: false,
  qrCodeUrl: undefined,
  isValid: false,
  proceedIntro: false,
  proceedMultisig: false,
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

    builder.addCase(proceedIntro.fulfilled, (state, action) => {
      state.proceedIntro = action.payload.proceedIntro;
    });
    builder.addCase(proceedMultisig.fulfilled, (state, action) => {
      state.proceedMultisig = action.payload.proceedMultisig;
    });
  },
});

export const twoFactorAuthReducer = twoFactorAuthSlice.reducer;
export const twoFactorAuthActions = twoFactorAuthSlice.actions;
