import { createSlice } from '@reduxjs/toolkit';
import { SocketMessageCommand } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { State } from '../../../interfaces/transaction.interface';
import {
  decodeTransaction,
  encodeTransaction,
  notifyTransactionBroadcasted,
  sendSignatureRequest,
  signTransaction,
  signerConnect,
  subscribeToBroadcastedTransactions,
  subscribeToSignRequests,
} from './multisigThunks';

const initialState: State = {
  username: '',
  method: undefined,
  txName: null,
  process: null,
  response: null,
  loading: false,
  success: false,
  error: null,
};

const signerConnectSlice = createSlice({
  name: 'signerConnect',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signerConnect.pending, (state) => {
      state.process = SocketMessageCommand.SIGNER_CONNECT;
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signerConnect.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.response = action.payload;
    });
    builder.addCase(signerConnect.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

const subscribeToSignRequestsSlice = createSlice({
  name: 'subscribeToSignRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(subscribeToSignRequests.pending, (state) => {
      state.process =
        'subscribe_to_' + SocketMessageCommand.REQUEST_SIGN_TRANSACTION;
      state.loading = true;
      state.error = null;
    });

    builder.addCase(subscribeToSignRequests.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload;
    });

    builder.addCase(subscribeToSignRequests.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });
  },
});

const subscribeToBroadcastedTransactionsSlice = createSlice({
  name: 'subscribeToBroadcastedTransactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(subscribeToBroadcastedTransactions.pending, (state) => {
      state.process =
        'subscribe_to_' +
        SocketMessageCommand.TRANSACTION_BROADCASTED_NOTIFICATION;
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      subscribeToBroadcastedTransactions.fulfilled,
      (state, action) => {
        state.loading = false;
        state.response = action.payload;
        state.success = action.payload;
      },
    );

    builder.addCase(
      subscribeToBroadcastedTransactions.rejected,
      (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      },
    );
  },
});

const sendSignatureRequestSlice = createSlice({
  name: 'sendSignatureRequest',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(sendSignatureRequest.pending, (state) => {
      state.process = SocketMessageCommand.REQUEST_SIGNATURE;
      state.loading = true;
      state.error = null;
    });

    builder.addCase(sendSignatureRequest.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.success = true;
    });

    builder.addCase(sendSignatureRequest.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });
  },
});

const signTransactionSlice = createSlice({
  name: 'signTransaction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signTransaction.pending, (state) => {
      state.process = SocketMessageCommand.SIGN_TRANSACTION;
      state.loading = true;
      state.error = null;
    });

    builder.addCase(signTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.response = action.payload;
    });

    builder.addCase(signTransaction.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.response = action.payload;
    });
  },
});

const notifyTransactionBroadcasedSlice = createSlice({
  name: 'notifyTransactionBroadcasted',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(notifyTransactionBroadcasted.pending, (state) => {
      state.process = SocketMessageCommand.NOTIFY_TRANSACTION_BROADCASTED;
      state.loading = true;
      state.error = null;
    });

    builder.addCase(notifyTransactionBroadcasted.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.response = action.payload;
    });

    builder.addCase(notifyTransactionBroadcasted.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });
  },
});

const encodeTransactionSlice = createSlice({
  name: 'encodeTransaction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(encodeTransaction.pending, (state) => {
      state.process = 'encode_transaction';
      state.loading = true;
      state.error = null;
    });

    builder.addCase(encodeTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.response = action.payload;
    });

    builder.addCase(encodeTransaction.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.response = action.payload;
    });
  },
});

const decodeTransactionSlice = createSlice({
  name: 'decodeTransaction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(decodeTransaction.pending, (state) => {
      state.process = 'decode_transaction';
      state.loading = true;
      state.error = null;
    });

    builder.addCase(decodeTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.response = action.payload;
    });

    builder.addCase(decodeTransaction.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });
  },
});

export const signerConnectReducer = signerConnectSlice.reducer;
export const sendSignatureRequestReducer = sendSignatureRequestSlice.reducer;
export const signTransactionReducer = signTransactionSlice.reducer;
export const encodeTransactionReducer = encodeTransactionSlice.reducer;
export const decodeTransactionReducer = decodeTransactionSlice.reducer;
export const subscribeToSignRequestsReducer =
  subscribeToSignRequestsSlice.reducer;
export const notifyTransactionBroadcasedReducer =
  notifyTransactionBroadcasedSlice.reducer;
export const subscribeToBroadcastedTransactionsReducer =
  subscribeToBroadcastedTransactionsSlice.reducer;
export const signerConnectActions = signerConnectSlice.actions;
export const sendSignatureRequestActions = sendSignatureRequestSlice.actions;
export const signTransactionActions = signTransactionSlice.actions;
export const encodeTransactionActions = encodeTransactionSlice.actions;
export const decodeTransactionActions = decodeTransactionSlice.actions;
export const subscribeToSignRequestActions =
  subscribeToSignRequestsSlice.actions;
export const notifyTransactionBroadcasedActions =
  notifyTransactionBroadcasedSlice.actions;
export const subscribeToBroadcastedTransactionsActions =
  subscribeToBroadcastedTransactionsSlice.actions;
