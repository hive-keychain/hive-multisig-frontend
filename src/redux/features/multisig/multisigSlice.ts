import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src/index';
import {
  SignatureRequestCallback,
  SignerConnect,
  SignerConnectResponse,
  SocketMessageCommand,
} from 'hive-multisig-sdk/src/interfaces/socket-message.interface';
import { State } from '../../../interfaces/transaction.interface';
const multisig = new HiveMultisigSDK(window);

const signerConnect = createAsyncThunk<
  SignerConnectResponse,
  SignerConnect,
  { rejectValue: string }
>('multisig/signerConnect', async (signer: SignerConnect) => {
  const signerConnectResponse = await multisig.singleSignerConnect(signer);
  return signerConnectResponse;
});

const subscribeToSignRequests = createAsyncThunk<
  boolean,
  SignatureRequestCallback,
  { rejectValue: string }
>(
  'multisig/subscribeToSignRequests',
  async (callback: SignatureRequestCallback) => {
    const response = await multisig.subscribeToSignRequests(callback);
    return response;
  },
);

const initialState: State = {
  transaction: null,
  response: null,
  loading: false,
  success: false,
  error: null,
};

const multisigSlice = createSlice({
  name: 'multisig',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signerConnect.pending, (state) => {
      state.transaction = SocketMessageCommand.SIGNER_CONNECT;
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

    builder.addCase(subscribeToSignRequests.pending, (state) => {
      state.transaction =
        'SUBSCRIBE_TO' + SocketMessageCommand.REQUEST_SIGN_TRANSACTION;
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
