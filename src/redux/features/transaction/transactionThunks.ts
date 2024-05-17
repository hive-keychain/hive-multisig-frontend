import { createAsyncThunk } from '@reduxjs/toolkit';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import {
  IExpiration,
  ITransaction,
  Initiator,
  State,
  TxStatus,
} from '../../../interfaces/transaction.interface';
import HiveUtils from '../../../utils/hive.utils';

export const setAuthority = createAsyncThunk<
  State,
  ITransaction,
  { rejectValue: string }
>('transaction/setAuthority', async (txInfo: ITransaction, { getState }) => {
  try {
    const currentState = getState() as State;
    const authority = await HiveUtils.getAuthority(
      txInfo.username.toString(),
      txInfo.method,
    );
    const newState: State = {
      ...currentState,
      authority,
    };

    return newState;
  } catch (error) {
    throw new Error(error);
  }
});

export const setTransactionName = createAsyncThunk<
  State,
  string,
  { rejectValue: string }
>('transaction/setTransactionName', async (txName: string, { getState }) => {
  const currentState = getState() as State;
  const newState: State = {
    ...currentState,
    txName,
  };
  return newState;
});

export const setOperation = createAsyncThunk<
  State,
  object,
  { rejectValue: string }
>('transaction/setOperation', async (operation: object, { getState }) => {
  const currentState = getState() as State;
  const newState: State = {
    ...currentState,
    operation,
  };
  return newState;
});
export const resetOperation = createAsyncThunk(
  'transaction/resetOperation',
  async () => {
    return {};
  },
);

export const setTransactionMethod = createAsyncThunk<
  State,
  KeychainKeyTypes,
  { rejectValue: string }
>(
  'transaction/setTransactionMethod',
  async (method: KeychainKeyTypes, { getState }) => {
    const currentState = getState() as State;
    const newState: State = {
      ...currentState,
      method,
    };
    return newState;
  },
);

export const setUsername = createAsyncThunk<
  State,
  string,
  { rejectValue: string }
>('transaction/setUsername', async (username: string, { getState }) => {
  const currentState = getState() as State;
  const newState: State = {
    ...currentState,
    username,
  };
  return newState;
});

export const setExpiration = createAsyncThunk<
  State,
  IExpiration,
  { rejectValue: string }
>(
  'transaction/setExpiration',
  async (expiration: IExpiration, { getState }) => {
    const currentState = getState() as State;
    const newState: State = {
      ...currentState,
      expiration: expiration,
    };
    return newState;
  },
);

export const setInitiator = createAsyncThunk<
  State,
  Initiator,
  { rejectValue: string }
>('transaction/setInitiator', async (initiator: Initiator, { getState }) => {
  const currentState = getState() as State;
  const newState: State = {
    ...currentState,
    initiator: {
      ...initiator,
    },
  };
  return newState;
});

export const showOtpInput = createAsyncThunk(
  'transaction/showOtpInput',
  (show: boolean) => {
    return show;
  },
);

export const submitTransaction = createAsyncThunk(
  'transaction/submitTransaction',
  (submit: boolean) => {
    return submit;
  },
);

export const setOtpSecret = createAsyncThunk(
  'transaction/setOtpSecret',
  (secret: string) => {
    return secret;
  },
);

export const setOtpValidation = createAsyncThunk(
  'transaction/setOtpValidation',
  (valid: boolean) => {
    return valid;
  },
);

export const setTxStatus = createAsyncThunk(
  'transaction/txStatus',
  (status: TxStatus) => {
    return status;
  },
);
