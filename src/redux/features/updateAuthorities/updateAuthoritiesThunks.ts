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

export const disableDeleteBtn = createAsyncThunk(
  'updateAuthority/disableDeleteBtn',
  async (disable: boolean) => {
    return disable;
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

export const setOwnerKeyDelete = createAsyncThunk(
  'updateAuthority/setOwnerKeyDelete',
  async (flag: boolean) => {
    return flag;
  },
);

export const setPostingKeyDelete = createAsyncThunk(
  'updateAuthority/setPostingKeyDelete',
  async (flag: boolean) => {
    return flag;
  },
);
export const setActiveKeyDelete = createAsyncThunk(
  'updateAuthority/setActiveKeyDelete',
  async (flag: boolean) => {
    return flag;
  },
);

export const setOwnerAuthUpdate = createAsyncThunk(
  'updateAuthority/setOwnerAuthUpdate',
  async (flag: boolean) => {
    return flag;
  },
);

export const setActiveAuthUpdate = createAsyncThunk(
  'updateAuthority/setActiveAuthUpdate',
  async (flag: boolean) => {
    return flag;
  },
);
export const setPostingAuthUpdate = createAsyncThunk(
  'updateAuthority/setPostingAuthUpdate',
  async (flag: boolean) => {
    return flag;
  },
);

export const addAccountWarning = createAsyncThunk(
  'updateAuthority/addAccountWarning',
  async ([username, warning]: [string, string]) => {
    return { username, warning };
  },
);
export const addKeyWarning = createAsyncThunk(
  'updateAuthority/addKeyWarning',
  async ([key, warning]: [string, string]) => {
    return { key, warning };
  },
);

export const removeAccountWarning = createAsyncThunk(
  'updateAuthority/removeAccountWarning',
  async (username: string) => {
    return username;
  },
);
export const removeKeyWarning = createAsyncThunk(
  'updateAuthority/removeKeyWarning',
  async (username: string) => {
    return username;
  },
);

export const allowAddAccount = createAsyncThunk(
  'updateAuthority/allowAddAccount',
  async (allow: boolean) => {
    return allow;
  },
);

export const allowAddKey = createAsyncThunk(
  'updateAuthority/allowAddKey',
  async (allow: boolean) => {
    return allow;
  },
);
