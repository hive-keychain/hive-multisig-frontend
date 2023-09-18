import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/transaction.interface';

export const checkKeychain = createAsyncThunk(
  'keychain/check',
  () =>
    new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        if (window.hive_keychain) {
          resolve(true);
        } else {
          reject(false);
        }
      }, 500);
    }),
);

export const clearKeychainState = createAsyncThunk(
  'keychain/clearKeychainState',
  () => {
    return {} as State;
  },
);
