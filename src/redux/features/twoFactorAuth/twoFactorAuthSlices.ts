import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/twoFactorAuth.interface';
import {
  botSetupSuccess,
  checkDefaultBot,
  createQRCode,
  createSecret,
  isManageTwoFA,
  proceedIntro,
  proceedMultisig,
  removeBotSuccess,
  setAddedBot,
  setIsMultisigTransaction,
  setRemovedBot,
  setTokenValidation,
  setTwoFABots,
  transactionSubmitted,
  updateThreshSuccess,
  updateWeightSuccess,
} from './twoFactorAuthThunks';

const initialState: State = {
  secret: undefined,
  token: undefined,
  enabled: false,
  qrCodeUrl: undefined,
  isValid: false,
  proceedIntro: false,
  proceedMultisig: false,
  hasDefaultBot: undefined,
  bots: undefined,
  isManageTwoFA: false,
  addedBot: undefined,
  removedBot: undefined,
  botSetupSuccess: false,
  removeBotSuccess: false,
  updateThreshSuccess: false,
  transactionSubmitted: false,
  updateWeightSuccess: false,
  isMultisigTransaction: false,
};

const twoFactorAuthSlice = createSlice({
  name: 'twoFactorAuth',
  initialState,
  reducers: { resetState: () => initialState },
  extraReducers: (builder) => {
    builder.addCase(createSecret.fulfilled, (state, action) => {
      state.secret = action.payload.secret;
    });

    builder.addCase(createQRCode.fulfilled, (state, action) => {
      state.qrCodeUrl = action.payload;
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

    builder.addCase(checkDefaultBot.fulfilled, (state, action) => {
      state.hasDefaultBot = action.payload;
    });
    builder.addCase(setTwoFABots.fulfilled, (state, action) => {
      state.bots = action.payload;
    });

    builder.addCase(isManageTwoFA.fulfilled, (state, action) => {
      state.isManageTwoFA = action.payload;
    });

    builder.addCase(setAddedBot.fulfilled, (state, action) => {
      state.addedBot = action.payload;
    });
    builder.addCase(setRemovedBot.fulfilled, (state, action) => {
      state.removedBot = action.payload;
    });

    builder.addCase(transactionSubmitted.fulfilled, (state, action) => {
      state.transactionSubmitted = action.payload;
    });

    builder.addCase(botSetupSuccess.fulfilled, (state, action) => {
      state.botSetupSuccess = action.payload;
    });
    builder.addCase(removeBotSuccess.fulfilled, (state, action) => {
      state.removeBotSuccess = action.payload;
    });
    builder.addCase(updateThreshSuccess.fulfilled, (state, action) => {
      state.updateThreshSuccess = action.payload;
    });
    builder.addCase(updateWeightSuccess.fulfilled, (state, action) => {
      state.updateWeightSuccess = action.payload;
    });

    builder.addCase(setIsMultisigTransaction.fulfilled, (state, action) => {
      state.isMultisigTransaction = action.payload;
    });
  },
});

export const twoFactorAuthReducer = twoFactorAuthSlice.reducer;
export const twoFactorAuthActions = twoFactorAuthSlice.actions;
