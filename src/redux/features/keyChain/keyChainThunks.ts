import { createAsyncThunk } from '@reduxjs/toolkit';
import { KeychainSDK, SignTx } from 'keychain-sdk';

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

export const keychainSignTx = createAsyncThunk(
  'keychain/signTx',
  async (data: SignTx) => {
    const keychain = new KeychainSDK(window);
    const signResponse = await keychain.signTx(data);
    return signResponse;
  },
);
