import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/transaction.interface';
import {
  setAuthority,
  setExpiration,
  setOperation,
  setPublicKey,
  setReceiver,
  setSigner,
  setTransactionMethod,
  setTransactionName,
  setUsername,
} from './transactionThunks';

const initialState: State = {
  username: '',
  publicKey: '',
  receiver: '',
  signer: '',
  operation: undefined,
  method: undefined,
  expiration: undefined,
  txName: null,
  process: null,
  response: null,
  loading: false,
  success: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setAuthority.pending, (state, action) => {
      state.authority = null;
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setAuthority.fulfilled, (state, action) => {
      state.authority = action.payload.authority;
      state.loading = false;
      state.loading = true;
    });
    builder.addCase(setAuthority.rejected, (state, action) => {
      state.authority = null;
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(setTransactionName.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setTransactionName.fulfilled, (state, action) => {
      state.txName = action.payload.txName;
      state.loading = false;
      state.success = true;
    });
    builder.addCase(setTransactionName.rejected, (state, action) => {
      state.loading = false;
      state.error = 'Error setting transaction name';
    });

    builder.addCase(setOperation.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setOperation.fulfilled, (state, action) => {
      state.operation = action.payload.operation;
      state.loading = false;
      state.success = true;
    });
    builder.addCase(setOperation.rejected, (state, action) => {
      state.operation = undefined;
      state.loading = false;
      state.success = false;
      state.error = 'Error setting operation object';
    });

    builder.addCase(setTransactionMethod.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setTransactionMethod.fulfilled, (state, action) => {
      state.method = action.payload.method;
      state.loading = false;
      state.success = true;
    });
    builder.addCase(setTransactionMethod.rejected, (state, action) => {
      state.loading = false;
      state.error = 'Error setting transaction name';
    });

    builder.addCase(setUsername.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setUsername.fulfilled, (state, action) => {
      state.username = action.payload.username;
      state.loading = false;
      state.success = true;
    });
    builder.addCase(setUsername.rejected, (state, action) => {
      state.loading = false;
      state.error = 'Error setting username';
    });

    builder.addCase(setReceiver.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setReceiver.fulfilled, (state, action) => {
      state.receiver = action.payload.receiver;
      state.loading = false;
      state.success = true;
    });
    builder.addCase(setReceiver.rejected, (state, action) => {
      state.loading = false;
      state.error = 'Error setting receiver';
    });

    builder.addCase(setSigner.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setSigner.fulfilled, (state, action) => {
      state.signer = action.payload.signer;
      state.loading = false;
      state.success = true;
    });
    builder.addCase(setSigner.rejected, (state, action) => {
      state.loading = false;
      state.error = 'Error setting signer name';
    });

    builder.addCase(setExpiration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setExpiration.fulfilled, (state, action) => {
      state.expiration = action.payload.expiration;
      state.loading = false;
      state.success = true;
    });
    builder.addCase(setExpiration.rejected, (state, action) => {
      state.loading = false;
      state.error = 'Error setting expiration date';
    });

    builder.addCase(setPublicKey.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setPublicKey.fulfilled, (state, action) => {
      state.publicKey = action.payload.publicKey;
      state.loading = false;
      state.success = true;
    });
    builder.addCase(setPublicKey.rejected, (state, action) => {
      state.loading = false;
      state.error = 'Error setting public key';
    });
  },
});

export const transactionReducer = transactionSlice.reducer;
export const transactionActions = transactionSlice.actions;
