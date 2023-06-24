import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/transaction.interface';
import { checkKeychain, keychainSignTx } from './keyChainThunks';

const initialState: State = {
  username: '',
  publicKey: '',
  expiration: null,
  method: undefined,
  txName: null,
  process: null,
  response: null,
  loading: false,
  success: false,
  error: null,
};

const checkKeychainSlice = createSlice({
  name: 'check',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(checkKeychain.pending, (state) => {
      state.process = 'check_keychain';
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkKeychain.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.success = action.payload;
    });
    builder.addCase(checkKeychain.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = 'keychain extension not found';
    });
  },
});

const keychainSignTxSlice = createSlice({
  name: 'signTx',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(keychainSignTx.pending, (state) => {
      state.process = 'ketchain_sign_tx';
      state.loading = true;
      state.error = null;
    });

    builder.addCase(keychainSignTx.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.success = true;
    });

    builder.addCase(keychainSignTx.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.response = null;
      state.error = 'keychain signTx failed';
    });
  },
});

export const checkKeychainReducer = checkKeychainSlice.reducer;
export const keychainSignTxReducer = keychainSignTxSlice.reducer;

export const checkKeychainActions = checkKeychainSlice.actions;
export const keychainSignTxReducerActions = keychainSignTxSlice.actions;
