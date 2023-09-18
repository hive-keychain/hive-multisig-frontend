import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/multisig.interface';
import {
  addBroadcastNotifications,
  addBroadcastedTransaction,
  addPendingSignRequest,
  addSignRequest,
  notifyBroadcastedTransaction,
  notifySignRequest,
  removeSignRequest,
  resetBroadcastNotifications,
  resetPendingSignRequest,
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
  userPendingSignatureRequest: [],
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
      if (action.payload) {
        action.payload.forEach((broadcasted) => {
          const index = state.signRequests.findIndex(
            (sr) => sr.id === broadcasted.id,
          );
          if (index !== -1) {
            state.signRequests = [
              ...state.signRequests.slice(0, index),
              {
                ...broadcasted,
              },
              ...state.signRequests.slice(index + 1),
            ];
          }
        });

        const sortedSignRequests = [...state.signRequests].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        state.signRequests = sortedSignRequests;
      }
    });
    builder.addCase(addSignRequest.fulfilled, (state, action) => {
      if (action.payload) {
        action.payload.forEach((newSignRequest) => {
          const index = state.signRequests.findIndex(
            (sr) => sr.id === newSignRequest.id,
          );

          if (index !== -1) {
            if (state.signRequests[index].status !== newSignRequest.status) {
              state.signRequests = state.signRequests.map((sr, i) => {
                if (i === index) {
                  return {
                    ...sr,
                    status: newSignRequest.status,
                  };
                }
                return sr;
              });
            }
          } else {
            state.signRequests.push(newSignRequest);
          }
          const sortedSignRequests = [...state.signRequests].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          state.signRequests = sortedSignRequests;
        });
      }
    });

    builder.addCase(addPendingSignRequest.fulfilled, (state, action) => {
      if (action.payload) {
        action.payload.forEach((newReq) => {
          const existing = state.userPendingSignatureRequest.find(
            (existingReq) => {
              existingReq.id === newReq.id;
            },
          );

          if (!existing) {
            state.userPendingSignatureRequest = [
              ...state.userPendingSignatureRequest,
              newReq,
            ];
          }
        });
      }
    });
    builder.addCase(resetPendingSignRequest.fulfilled, (state, action) => {
      state.userPendingSignatureRequest = [...action.payload];
    });
    builder.addCase(addBroadcastNotifications.fulfilled, (state, action) => {
      if (action.payload) {
        action.payload.forEach((notif) => {
          const exsisting = state.userNotifications.find(
            (exsistingNotif) =>
              exsistingNotif.signatureRequest.id === notif.signatureRequest.id,
          );
          if (!exsisting) {
            state.userNotifications = [...state.userNotifications, notif];
          }
        });
      }
    });

    builder.addCase(resetBroadcastNotifications.fulfilled, (state, action) => {
      state.userNotifications = [...action.payload];
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
