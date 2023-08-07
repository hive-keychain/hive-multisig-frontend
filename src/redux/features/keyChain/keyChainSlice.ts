import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/transaction.interface';
import { checkKeychain, clearKeychainState } from './keyChainThunks';

const initialState: State = {
  username: '',
  expiration: null,
  method: undefined,
  txName: null,
  operation: undefined,
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
    builder.addCase(clearKeychainState.fulfilled, (state, action) => {
      state = { ...initialState };
    });
  },
});

export const checkKeychainReducer = checkKeychainSlice.reducer;

export const checkKeychainActions = checkKeychainSlice.actions;
