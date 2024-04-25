import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  SignerConnectMessage,
  SignerConnectResponse,
  UserNotification,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { State } from '../../../interfaces/multisig.interface';
import { TwoFACodes } from '../../../interfaces/twoFactorAuth.interface';

export const signerConnectMessageActive = createAsyncThunk<
  State,
  SignerConnectMessage,
  { rejectValue: string }
>(
  'multisig/signerConnectMessageActive',
  async (message: SignerConnectMessage, { getState }) => {
    const currentState = getState() as State;
    const newState: State = {
      ...currentState,
      signerConnectMessageActive: message,
    };
    return newState;
  },
);

export const signerConnectMessagePosting = createAsyncThunk<
  State,
  SignerConnectMessage,
  { rejectValue: string }
>(
  'multisig/signerConnectMessagePosting',
  async (message: SignerConnectMessage, { getState }) => {
    const currentState = getState() as State;
    const newState: State = {
      ...currentState,
      signerConnectMessagePosting: message,
    };
    return newState;
  },
);
export const signerConnectActive = createAsyncThunk<
  State,
  SignerConnectResponse,
  { rejectValue: string }
>(
  'multisig/signerConnectActive',
  async (connectResponse: SignerConnectResponse, { getState }) => {
    const currentState = getState() as State;
    const newState: State = {
      ...currentState,
      signerConnectActive: connectResponse,
    };
    return newState;
  },
);

export const signerConnectPosting = createAsyncThunk<
  State,
  SignerConnectResponse,
  { rejectValue: string }
>(
  'multisig/signerConnectPosting',
  async (connectResponse: SignerConnectResponse, { getState }) => {
    const currentState = getState() as State;
    const newState: State = {
      ...currentState,
      signerConnectPosting: connectResponse,
    };
    return newState;
  },
);

export const subscribeToSignRequests = createAsyncThunk<
  boolean,
  boolean,
  { rejectValue: string }
>('multisig/subscribeToSignRequests', async (subResponse: boolean) => {
  return subResponse;
});

export const addSignRequest = createAsyncThunk(
  'multisig/addSignRequest',
  async (signRequest: SignatureRequest[]) => {
    return signRequest;
  },
);

export const addBroadcastNotifications = createAsyncThunk(
  'multisig/addBroadcastNotifications',
  async (notification: UserNotification[]) => {
    return notification;
  },
);

export const resetBroadcastNotifications = createAsyncThunk(
  'multisig/resetBroadcastNotifications',
  async () => {
    return [] as UserNotification[];
  },
);

export const addPendingSignRequest = createAsyncThunk(
  'multisig/addPendingSignRequest',
  async (signRequests: SignatureRequest[]) => {
    return signRequests;
  },
);

export const resetPendingSignRequest = createAsyncThunk(
  'multisig/resetPendingSignRequest',
  async () => {
    return [] as SignatureRequest[];
  },
);
export const removeSignRequest = createAsyncThunk(
  'multisig/removeSignRequest',
  async (signatureRequestId: number) => {
    return signatureRequestId;
  },
);

export const subscribeToBroadcastedTransactions = createAsyncThunk<
  boolean,
  boolean,
  { rejectValue: string }
>(
  'multisig/subscribeToBroadcastedTransactions',
  async (subResponse: boolean) => {
    return subResponse;
  },
);

export const addBroadcastedTransaction = createAsyncThunk(
  'multisig/addBroadcastedTransaction',
  async (transaction: SignatureRequest[]) => {
    return transaction;
  },
);
export const notifySignRequest = createAsyncThunk(
  'multisig/notifySignRequest',
  async (show: boolean) => {
    return show;
  },
);
export const notifyBroadcastedTransaction = createAsyncThunk(
  'multisig/notifyBroadcastedTransaction',
  async (show: boolean) => {
    return show;
  },
);

export const setSignRequestCount = createAsyncThunk(
  'multisig/setSignRequestCount',
  async (count: number) => {
    return count;
  },
);

export const setTwoFASigners = createAsyncThunk(
  'multisig/setTwoFASigners',
  async (twoFASigners: TwoFACodes) => {
    return twoFASigners;
  },
);
export const setBotOtp = createAsyncThunk(
  'multisig/setBotOtp',
  async (twoFa: TwoFACodes) => {
    return twoFa;
  },
);

export const clearMultisigState = createAsyncThunk(
  'multisig/clearMultisigState',
  async () => {
    return {} as State;
  },
);
