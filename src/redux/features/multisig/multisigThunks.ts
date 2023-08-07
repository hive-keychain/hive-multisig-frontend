import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  ITransaction,
  SignerConnectResponse,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

import { State } from '../../../interfaces/multisig.interface';

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
  async (signRequest: ITransaction[]) => {
    return signRequest;
  },
);
export const removeSignRequest = createAsyncThunk(
  'multisig/removeSignRequest',
  async (signatureRequestId: number) => {
    return signatureRequestId;
  },
);

export const showSignRequests = createAsyncThunk(
  'multisig/showSignRequests',
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
// export const subscribeToBroadcastedTransactions = createAsyncThunk<
//   boolean,
//   SignatureRequestCallback,
//   { rejectValue: string }
// >(
//   'multisig/subscribeToBroadcastedTransactions',
//   async (callback: SignatureRequestCallback) => {
//     const response = await multisig.subscribeToBroadcastedTransactions(
//       callback,
//     );
//     return response;
//   },
// );

export const clearMultisigState = createAsyncThunk(
  'multisig/clearMultisigState',
  async () => {
    return {} as State;
  },
);
