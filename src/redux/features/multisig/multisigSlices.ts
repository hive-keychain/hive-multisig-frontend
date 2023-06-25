import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/multisig.interface';
import { signerConenctPosting, signerConnectActive } from './multisigThunks';

const initialState: State = {
  signerConnect: undefined,
  success: false,
  error: undefined,
};

const multisigSlice = createSlice({
  name: 'multisig',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signerConnectActive.pending, (state) => {
      state.signerConnect = undefined;
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(signerConnectActive.fulfilled, (state, action) => {
      state.signerConnect.active = action.payload.signerConnect.active;
      state.signerConnect.posting = action.payload.signerConnect.posting;
      state.success = true;
    });
    builder.addCase(signerConnectActive.rejected, (state, action) => {
      state.signerConnect.active = undefined;
      state.success = false;
      state.error = 'Error during signer connect active.';
    });

    builder.addCase(signerConenctPosting.pending, (state) => {
      state.signerConnect = undefined;
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(signerConenctPosting.fulfilled, (state, action) => {
      state.signerConnect.active = action.payload.signerConnect.active;
      state.signerConnect.posting = action.payload.signerConnect.posting;
      state.success = true;
    });
    builder.addCase(signerConenctPosting.rejected, (state, action) => {
      state.signerConnect.posting = undefined;
      state.success = false;
      state.error = 'Error during signer connect active.';
    });
  },
});

export const multisigReducer = multisigSlice.reducer;
export const transactionActions = multisigSlice.actions;
