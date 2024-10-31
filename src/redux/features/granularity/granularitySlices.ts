import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/granularity.interface';
import {
  activeHasExistingGBot,
  botSetupSuccess,
  initializeConfiguration,
  isManageGranularity,
  postingHasExistingGBot,
  proceedConfiguration,
  proceedIntro,
  proceedMultisig,
  proceedRemovalConfirmation,
  removeBotSuccess,
  setAddedBot,
  setGranularityBots,
  setRemovedBot,
  transactionSubmitted,
  updateGranularityConfiguration,
  updateThreshSuccess,
  updateWeightSuccess,
} from './granularityThunks';

const initialState: State = {
  proceedIntro: false,
  proceedConfiguration: false,
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
  configuration: undefined,
  newConfiguration: undefined,
  activeHasExistingGBot: false,
  postingHasExistingGBot: false,
  proceedRemoval: false,
};

const granularitySlice = createSlice({
  name: 'granularity',
  initialState,
  reducers: { resetState: () => initialState },
  extraReducers: (builder) => {
    builder.addCase(proceedIntro.fulfilled, (state, action) => {
      state.proceedIntro = action.payload;
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

    builder.addCase(proceedConfiguration.fulfilled, (state, action) => {
      state.proceedConfiguration = action.payload;
    });

    builder.addCase(
      updateGranularityConfiguration.fulfilled,
      (state, action) => {
        state.newConfiguration = structuredClone(action.payload);
      },
    );

    builder.addCase(initializeConfiguration.fulfilled, (state, action) => {
      state.configuration = structuredClone(action.payload);
      state.newConfiguration = structuredClone(action.payload);
    });

    builder.addCase(activeHasExistingGBot.fulfilled, (state, action) => {
      state.activeHasExistingGBot = action.payload;
    });
    builder.addCase(postingHasExistingGBot.fulfilled, (state, action) => {
      state.postingHasExistingGBot = action.payload;
    });

    builder.addCase(proceedRemovalConfirmation.fulfilled, (state, action) => {
      state.proceedRemoval = action.payload;
    });
  },
});

export const granularityReducer = granularitySlice.reducer;
export const granularityActions = granularitySlice.actions;
