import * as Hive from '@hiveio/dhive';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { State } from '../../../interfaces/transaction.interface';
import AccountUtils from '../../../utils/hive.utils';
export const setAuthority = createAsyncThunk<
  State,
  State,
  { rejectValue: string }
>('transaction/setAuthority', async (state: State) => {
  try {
    const authorities = await AccountUtils.getAccountAuthorities(
      state.username,
    );

    let authority: Hive.AuthorityType;
    switch (state.method) {
      case KeychainKeyTypes.active:
        authority = authorities.active;
        break;
      case KeychainKeyTypes.posting:
        authority = authorities.posting;
        break;
      default:
        authority = null;
        break;
    }

    const newState: State = {
      ...state,
      authority,
    };

    return newState;
  } catch (error) {
    throw new Error(error);
  }
});

export const setTransactionName = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('setTransactionName', async (txName: string) => {
  return txName;
});
export const setTransactionMethod = createAsyncThunk<
  KeychainKeyTypes,
  string,
  { rejectValue: string }
>('setTransactionMethod', async (method: KeychainKeyTypes) => {
  return method;
});
