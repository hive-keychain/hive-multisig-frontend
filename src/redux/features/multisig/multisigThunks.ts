import { Transaction } from '@hiveio/dhive';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src/index';
import {
  IDecodeTransaction,
  IEncodeTransaction,
  ISignTransaction,
  NotifyTxBroadcastedMessage,
  RequestSignatureMessage,
  SignatureRequestCallback,
  SignerConnect,
  SignerConnectResponse,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
const multisig = new HiveMultisigSDK(window);

export const signerConnect = createAsyncThunk<
  SignerConnectResponse,
  SignerConnect,
  { rejectValue: string }
>('multisig/signerConnect', async (signer: SignerConnect) => {
  const signerConnectResponse = await multisig.singleSignerConnect(signer);
  return signerConnectResponse;
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

export const sendSignatureRequest = createAsyncThunk<
  string,
  RequestSignatureMessage,
  { rejectValue: string }
>('multisig/sendSignatureRequest', async (message: RequestSignatureMessage) => {
  const response = await multisig.sendSignatureRequest(message);
  return response;
});

export const signTransaction = createAsyncThunk<
  string[],
  ISignTransaction,
  { rejectValue: string }
>('multisig/signTransaction', async (data: ISignTransaction) => {
  const response = await multisig.signTransaction(data);
  return response;
});

export const notifyTransactionBroadcasted = createAsyncThunk<
  string,
  NotifyTxBroadcastedMessage,
  { rejectValue: string }
>(
  'notifyTransactionBroadcasted',
  async (message: NotifyTxBroadcastedMessage) => {
    const response = await multisig.notifyTransactionBroadcasted(message);
    return response;
  },
);

export const encodeTransaction = createAsyncThunk<
  string,
  IEncodeTransaction,
  { rejectValue: string }
>('encodeTransaction', async (data: IEncodeTransaction) => {
  const response = await multisig.encodeTransaction(data);
  return response;
});

export const decodeTransaction = createAsyncThunk<
  Transaction,
  IDecodeTransaction,
  { rejectValue: string }
>('decodeTransaction', async (data: IDecodeTransaction) => {
  const response = await multisig.decodeTransaction(data);
  return response;
});
