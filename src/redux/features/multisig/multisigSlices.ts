import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/multisig.interface';
import {
<<<<<<< HEAD
  signRequestCallBack,
=======
>>>>>>> 06997f0b98ad852e00b8bd5eaf667bec7150c707
  signerConnectActive,
  signerConnectPosting,
  subscribeToSignRequests,
} from './multisigThunks';

const initialState: State = {
  signerConnectActive: undefined,
  signerConnectPosting: undefined,
<<<<<<< HEAD
  subscribeToSignRequests: false,
  signRequests: undefined,
=======
  subscribeToSignRequest: false,
>>>>>>> 06997f0b98ad852e00b8bd5eaf667bec7150c707
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
<<<<<<< HEAD
      state.subscribeToSignRequests = false;
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(subscribeToSignRequests.fulfilled, (state, action) => {
      state.subscribeToSignRequests = action.payload;
      state.success = action.payload;
    });
    builder.addCase(subscribeToSignRequests.rejected, (state, action) => {
      state.subscribeToSignRequests = false;
      state.success = false;
      state.error = JSON.stringify(action.error);
    });

    builder.addCase(signRequestCallBack.pending, (state) => {
      state.success = false;
      state.error = undefined;
    });
    builder.addCase(signRequestCallBack.fulfilled, (state, action) => {
      state.signRequests = action.payload.signRequests;
      state.success = true;
    });
    builder.addCase(signRequestCallBack.rejected, (state, action) => {
=======
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
>>>>>>> 06997f0b98ad852e00b8bd5eaf667bec7150c707
      state.success = false;
      state.error = JSON.stringify(action.error);
    });
  },
});

export const multisigReducer = multisigSlice.reducer;
export const transactionActions = multisigSlice.actions;
