import { createAsyncThunk } from '@reduxjs/toolkit';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import {
  SignatureRequestCallback,
  SignerConnect,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { State } from '../../../interfaces/multisig.interface';
const multisig = new HiveMultisigSDK(window);

export const signerConnectActive = createAsyncThunk<
  State,
  string,
  { rejectValue: string }
>('multisig/signerConnectActive', async (username: string, { getState }) => {
  const currentState = getState() as State;
  const connObj: SignerConnect = {
    username,
    keyType: KeychainKeyTypes.active,
  };
  const signerConnectResponse = await multisig.singleSignerConnect(connObj);
  console.log('------------------------');
  console.log(signerConnectResponse);
  console.log(currentState);
  const newState: State = {
    ...currentState,
    signerConnectActive: signerConnectResponse,
  };
  return newState;
});

export const signerConnectPosting = createAsyncThunk<
  State,
  string,
  { rejectValue: string }
>('multisig/signerConnectPosting', async (username: string, { getState }) => {
  const currentState = getState() as State;
  const connObj: SignerConnect = {
    username,
    keyType: KeychainKeyTypes.posting,
  };
  const signerConnectResponse = await multisig.singleSignerConnect(connObj);
  const newState: State = {
    ...currentState,
    signerConnectPosting: signerConnectResponse,
  };
  return newState;
});

export const subscribeToSignRequests = createAsyncThunk(
  'multisig/subscribeToSignRequests',
  async () => {
    const response = await multisig.subscribeToSignRequests();
    return response;
  },
);

export const subscribeToBroadcastedTransactions = createAsyncThunk<
  boolean,
  SignatureRequestCallback,
  { rejectValue: string }
>(
  'multisig/subscribeToBroadcastedTransactions',
  async (callback: SignatureRequestCallback) => {
    const response = await multisig.subscribeToBroadcastedTransactions(
      callback,
    );
    return response;
  },
);
