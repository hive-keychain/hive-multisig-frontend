import { createAsyncThunk } from '@reduxjs/toolkit';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import {
  SignatureRequestCallback,
  SignerConnect,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { State } from '../../../interfaces/multisig.interface';

export const signerConnectActive = createAsyncThunk<
  State,
  string,
  { rejectValue: string }
>('multisig/signerConnectActive', async (username: string, { getState }) => {
  const currentState = getState() as State;
  const multisig = new HiveMultisigSDK(window);
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
  const multisig = new HiveMultisigSDK(window);
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
    const testCallback = (message: SignatureRequest) => {
      console.log(message);
    };
    const multisig = new HiveMultisigSDK(window);
    const response = await multisig.subscribeToSignRequests(testCallback);
    return response;
  },
);

export const signRequestCallBack = createAsyncThunk(
  'multisig/signRequests',
  async (message: SignatureRequest, { getState }) => {
    console.log('Got signature request');
    console.log(message);
    const currentState = getState() as State;
    const newState = {
      ...currentState,
      signRequests: [...currentState.signRequests, message],
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
    const multisig = new HiveMultisigSDK(window);
    const response = await multisig.subscribeToBroadcastedTransactions(
      callback,
    );
    return response;
  },
);
