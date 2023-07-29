import { createAsyncThunk } from '@reduxjs/toolkit';

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
