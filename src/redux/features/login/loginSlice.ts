import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { KeychainKeyTypes, KeychainSDK, Login } from 'keychain-sdk';
import { LoginResponseType } from '../../../interfaces';
export enum LoginState {
  SIGNATURE_REQUESTED = 'SIGNATURE_REQUESTED',
  SIGNATURE_SUCCEEDED = 'SIGNATURE_SUCCEEDED',
  SIGNATURE_FAILED = 'SIGNATURE_FAILED',
  LOGGED_OUT = 'LOGGED_OUT',
}

export type LoginStateType = {
  loginState: LoginState;
  isSignatureSuccess: boolean;
  accountObject: LoginResponseType;
  error: string;
};
const initialState: LoginStateType = {
  loginState: LoginState.LOGGED_OUT,
  isSignatureSuccess: false,
  accountObject: null,
  error: '',
};

export const hiveKeyChainRequestSign = createAsyncThunk(
  'login/request',
  async (username: string) => {
    const keychain = new KeychainSDK(window);
    const userData: Login = {
      username,
      method: KeychainKeyTypes.posting,
    };
    const response = await keychain.login(userData);
    return response;
  },
);

const loginSclice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout(state) {
      (state.loginState = LoginState.LOGGED_OUT),
        (state.isSignatureSuccess = false),
        (state.accountObject = null),
        (state.error = '');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      hiveKeyChainRequestSign.fulfilled,
      (state, action: PayloadAction<LoginResponseType>) => {
        if (action.payload.success) {
          state.loginState = LoginState.SIGNATURE_SUCCEEDED;
          state.isSignatureSuccess = action.payload.success;
          state.accountObject = action.payload;
          state.error = '';
        }
      },
    );
    builder.addCase(hiveKeyChainRequestSign.rejected, (state, action) => {
      state.loginState = LoginState.SIGNATURE_FAILED;
      state.isSignatureSuccess = false;
      state.accountObject = null;
      state.error = 'Signing Error';
    });
  },
});

export default loginSclice.reducer;
export const { logout } = loginSclice.actions;
