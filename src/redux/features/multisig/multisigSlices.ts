import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/multisig.interface';
import {
  addSignRequest,
  removeSignRequest,
  setSignRequestCount,
  showSignRequests,
  signerConnectActive,
  signerConnectPosting,
  subscribeToSignRequests,
} from './multisigThunks';

const initialState: State = {
  signerConnectActive: undefined,
  signerConnectPosting: undefined,
  signRequests: [],
  subscribeToSignRequest: false,
  showSignRequests: false,
  signRequestCount: 0,
  newSignRequestCount: 0,
  success: false,
  error: undefined,
};

const multisigSlice = createSlice({
  name: 'multisig',
  initialState,
  reducers: { resetState: () => initialState },
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

    builder.addCase(addSignRequest.fulfilled, (state, action) => {
      state.signRequests = action.payload
        ? [...state.signRequests, ...action.payload]
        : action.payload;
      state.success = true;
    });

    builder.addCase(removeSignRequest.fulfilled, (state, action) => {
      state.signRequests = state.signRequests.filter(
        (item) => item.signatureRequestId !== action.payload,
      );
      state.signRequestCount = state.signRequests.length;
      state.success = true;
    });

    builder.addCase(showSignRequests.fulfilled, (state, action) => {
      state.showSignRequests = action.payload;
      state.success = action.payload;
    });

    builder.addCase(showSignRequests.rejected, (state) => {
      state.showSignRequests = false;
      state.success = false;
    });

    builder.addCase(setSignRequestCount.fulfilled, (state, action) => {
      state.signRequestCount += action.payload;
      state.newSignRequestCount = action.payload;
      state.success = true;
    });
    builder.addCase(setSignRequestCount.rejected, (state) => {
      state.signRequestCount = 0;
      state.success = false;
    });
    builder.addCase(multisigSlice.actions.resetState, () => initialState);
  },
});

export const multisigReducer = multisigSlice.reducer;
export const multisigActions = multisigSlice.actions;
