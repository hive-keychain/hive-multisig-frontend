import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/multisig.interface';
import { signerConnectActive, signerConnectPosting } from './multisigThunks';

const initialState: State = {
  signerConnectActive: undefined,
  signerConnectPosting: undefined,
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
      console.log('=================================');
      console.log(action.payload.signerConnectActive);
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
      console.log('=================================');
      console.log(action.payload.signerConnectPosting);
      state.signerConnectPosting = action.payload.signerConnectPosting;
      state.success = true;
    });
    builder.addCase(signerConnectPosting.rejected, (state, action) => {
      state.signerConnectPosting = undefined;
      state.success = false;
      state.error = 'Error during signer connect active.';
    });
  },
});

export const multisigReducer = multisigSlice.reducer;
export const transactionActions = multisigSlice.actions;
