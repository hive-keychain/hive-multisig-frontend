import { createAsyncThunk } from '@reduxjs/toolkit';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { Signer } from 'hive-multisig-sdk/src/interfaces/signer';
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
  console.log('activeConnect------------------------');
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
  console.log('postingConnect------------------------');
  console.log(signerConnectResponse);
  console.log(currentState);
  const newState: State = {
    ...currentState,
    signerConnectPosting: signerConnectResponse,
  };
  return newState;
});

export const subscribeToSignRequests = createAsyncThunk<
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

export const signRequests = createAsyncThunk(
  'multisig/signRequests',
  async (signers: Signer[], { getState }) => {
    const currentState = getState() as State;
    const newState = {
      ...currentState,
      signRequests: signers,
    };
    return newState;
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
