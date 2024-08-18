import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/granularity.interface';
import {
  botSetupSuccess,
  hasDefaultBot,
  isManageGranularity,
  proceedIntro,
  proceedMultisig,
  removeBotSuccess,
  setAddedBot,
  setGranularityBots,
  setRemovedBot,
  transactionSubmitted,
  updateThreshSuccess,
  updateWeightSuccess,
} from './granularityThunks';

const initialState: State = {
  proceedIntro: false,
  hasDefaultBot: false,
  proceedMultisig: false,
  isManageGranularity: false,
  bots: undefined,
  addedBot: undefined,
  removedBot: undefined,
  botSetupSuccess: false,
  removeBotSuccess: false,
  updateThreshSuccess: false,
  updateWeightSuccess: false,
  transactionSubmitted: false,
  isMultisigTransaction: false,
};

const granularitySlice = createSlice({
  name: 'granularity',
  initialState,
  reducers: { resetState: () => initialState },
  extraReducers: (builder) => {
    builder.addCase(proceedIntro.fulfilled, (state, action) => {
      state.proceedIntro = action.payload;
    });

    builder.addCase(hasDefaultBot.fulfilled, (state, action) => {
      state.hasDefaultBot = action.payload;
    });

    builder.addCase(proceedMultisig.fulfilled, (state, action) => {
      state.proceedMultisig = action.payload;
    });

    builder.addCase(setGranularityBots.fulfilled, (state, action) => {
      state.bots = action.payload;
    });

    builder.addCase(isManageGranularity.fulfilled, (state, action) => {
      state.isManageGranularity = action.payload;
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
  },
});

export const granularityReducer = granularitySlice.reducer;
export const granularityActions = granularitySlice.actions;
