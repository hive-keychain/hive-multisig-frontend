import * as Hive from '@hiveio/dhive';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  IDHiveAccountUpdateBroadcast,
  IHiveAccountUpdateBroadcast,
} from '../../../interfaces';
import { IDeleteAccount, IDeleteKey } from '../../../interfaces/cardInterfaces';
import { removeAccount, removeKey } from '../../../utils/account-utils';
import {
  default as AccountUtils,
  default as HiveUtils,
} from '../../../utils/hive.utils';

export const hiveKeyChainRequestBroadCast = createAsyncThunk(
  'updateAuthority/hiveBroadcast',
  async (props: IHiveAccountUpdateBroadcast) => {
    const response = await HiveUtils.accountUpdateBroadcast(props);
    return response;
  },
);

export const dhiveBroadcastUpdateAccount = createAsyncThunk(
  'updateAuthority/dhiveBroadcast',
  async ({ newAuthorities, ownerKey }: IDHiveAccountUpdateBroadcast) => {
    const response = await AccountUtils.broadcastUpdateAccount({
      newAuthorities,
      ownerKey,
    });
    return response;
  },
);

export const deleteAccount = createAsyncThunk(
  'updateAuthority/deleteAccount',
  async ({ type, username, authorities }: IDeleteAccount) => {
    const newAuth = await removeAccount(type, username, authorities);

    return newAuth;
  },
);

export const deleteKey = createAsyncThunk(
  'updateAuthority/deleteKey',
  async ({ type, key, authorities }: IDeleteKey) => {
    const newAuth = await removeKey(type, key, authorities);
    return newAuth;
  },
);

export const updateActive = createAsyncThunk(
  'updateAuthority/updateActive',
  async (authority: Hive.AuthorityType) => {
    return authority;
  },
);

export const setThresholdWarning = createAsyncThunk(
  'updateAuthority/setThresholdWarning',
  async (warining: string) => {
    return warining;
  },
);

export const getIndexOfStringFromTupleArray = (
  array: [string | Hive.PublicKey, number][],
  element: string | Hive.PublicKey,
): number => {
  let index = -1;
  for (let i = 0; i < array.length; i++) {
    if (array[i][0] === element) {
      index = i;
      break;
    }
  }
  return index;
};
