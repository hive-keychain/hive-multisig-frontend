import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type KeychainCheckType = {
  loading: boolean;
  isKeyChainFound: boolean;
  message: string;
  error: string;
};

const initialState: KeychainCheckType = {
  loading: false,
  isKeyChainFound: false,
  message: '',
  error: '',
};

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

const keyChainSlice = createSlice({
  name: 'keychain',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(checkKeychain.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      checkKeychain.fulfilled,
      (state, action: PayloadAction<boolean>) => {
        state.loading = false;
        state.isKeyChainFound = action.payload;
        state.message = 'Hive Keychain Found';
        state.error = '';
      },
    );
    builder.addCase(checkKeychain.rejected, (state, action) => {
      state.loading = false;
      state.isKeyChainFound = false;
      state.message = '';
      state.error = 'Please install keychain to login';
    });
  },
});

export default keyChainSlice.reducer;
