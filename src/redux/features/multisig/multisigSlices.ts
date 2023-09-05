import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/multisig.interface';
import {
  addBroadcastedTransaction,
  addSignRequest,
  addUserNotifications,
  notifyBroadcastedTransaction,
  notifySignRequest,
  removeSignRequest,
  setSignRequestCount,
  signerConnectActive,
  signerConnectMessageActive,
  signerConnectMessagePosting,
  signerConnectPosting,
  subscribeToBroadcastedTransactions,
  subscribeToSignRequests,
} from './multisigThunks';

const initialState: State = {
  signerConnectMessageActive: undefined,
  signerConnectMessagePosting: undefined,
  signerConnectActive: undefined,
  signerConnectPosting: undefined,
  signRequests: [],
  userNotifications: [],
  broadcastedTransactions: [],
  subscribeToSignRequest: false,
  subscribeToBroadcast: false,
  signRequestNotification: false,
  broadcastNotification: false,
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

    builder.addCase(signerConnectMessageActive.fulfilled, (state, action) => {
      state.signerConnectMessageActive = {
        ...action.payload.signerConnectMessageActive,
      };
    });
    builder.addCase(signerConnectMessagePosting.fulfilled, (state, action) => {
      state.signerConnectMessagePosting = {
        ...action.payload.signerConnectMessagePosting,
      };
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

    builder.addCase(
      subscribeToBroadcastedTransactions.fulfilled,
      (state, action) => {
        state.subscribeToBroadcast = action.payload;
      },
    );
    builder.addCase(addBroadcastedTransaction.fulfilled, (state, action) => {
      state.broadcastedTransactions = action.payload
        ? [...state.broadcastedTransactions, ...action.payload]
        : action.payload;
    });
    builder.addCase(addSignRequest.fulfilled, (state, action) => {
      state.signRequests = action.payload
        ? [...state.signRequests, ...action.payload]
        : action.payload;
    });

    builder.addCase(addUserNotifications.fulfilled, (state, action) => {
      state.userNotifications = action.payload
        ? [...state.userNotifications, ...action.payload]
        : action.payload;
    });
    builder.addCase(removeSignRequest.fulfilled, (state, action) => {
      state.signRequests = state.signRequests.filter(
        (item) => item.id !== action.payload,
      );
      state.signRequestCount = state.signRequests.length;
      state.success = true;
    });

    builder.addCase(notifySignRequest.fulfilled, (state, action) => {
      state.signRequestNotification = action.payload;
      state.success = action.payload;
    });
    builder.addCase(notifyBroadcastedTransaction.fulfilled, (state, action) => {
      state.broadcastNotification = action.payload;
      state.success = action.payload;
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
