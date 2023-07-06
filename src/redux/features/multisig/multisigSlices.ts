import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/multisig.interface';
import {
  signerConnectActive,
  signerConnectPosting,
  subscribeToSignRequests,
} from './multisigThunks';

const initialState: State = {
  signerConnectActive: undefined,
  signerConnectPosting: undefined,
  subscribeToSignRequest: false,
  success: false,
  error: undefined,
};

const multisigSlice = createSlice({
  name: 'multisig',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signerConnectActive.pending, (state) => {
      state.signerConnectActive = undefined;
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(signerConnectActive.fulfilled, (state, action) => {
      state.signerConnectActive = action.payload.signerConnectActive;
      state.success = true;
    });
    builder.addCase(signerConnectActive.rejected, (state, action) => {
      state.success = false;
      state.error =
        'Error during signer connect active. ' + JSON.stringify(action.error);
    });

    builder.addCase(signerConnectPosting.pending, (state) => {
      state.signerConnectPosting = undefined;
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(signerConnectPosting.fulfilled, (state, action) => {
      state.signerConnectPosting = action.payload.signerConnectPosting;
      state.success = true;
    });
    builder.addCase(signerConnectPosting.rejected, (state, action) => {
      state.signerConnectPosting = undefined;
      state.success = false;
      state.error = 'Error during signer connect active.';
    });

    builder.addCase(subscribeToSignRequests.pending, (state) => {
      state.subscribeToSignRequest = undefined;
      state.success = false;
      state.error = undefined;
    });

    builder.addCase(subscribeToSignRequests.fulfilled, (state, action) => {
      state.subscribeToSignRequest = action.payload;
      state.success = true;
    });
    builder.addCase(subscribeToSignRequests.rejected, (state, action) => {
      state.subscribeToSignRequest = false;
      state.success = false;
      state.error = JSON.stringify(action.error);
    });
  },
});

export const multisigReducer = multisigSlice.reducer;
export const transactionActions = multisigSlice.actions;
