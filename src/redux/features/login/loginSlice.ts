import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { LoginResponseType } from '../../../interfaces';
import { MultisigUtils } from '../../../utils/multisig.utils';
export enum LoginState {
  SIGNATURE_REQUESTED = 'SIGNATURE_REQUESTED',
  SIGNATURE_SUCCEEDED = 'SIGNATURE_SUCCEEDED',
  SIGNATURE_FAILED = 'SIGNATURE_FAILED',
  LOGGED_OUT = 'LOGGED_OUT',
}
const multisig = new HiveMultisigSDK(window, MultisigUtils.getOptions());

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

export const login = createAsyncThunk(
  'login/request',
  async (data: LoginResponseType) => {
    return data;
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
      login.fulfilled,
      (state, action: PayloadAction<LoginResponseType>) => {
        if (action.payload.success) {
          state.loginState = LoginState.SIGNATURE_SUCCEEDED;
          state.isSignatureSuccess = action.payload.success;
          state.accountObject = action.payload;
          state.error = '';
        }
      },
    );
    builder.addCase(login.rejected, (state, action) => {
      state.loginState = LoginState.SIGNATURE_FAILED;
      state.isSignatureSuccess = false;
      state.accountObject = null;
      state.error = 'Signing Error';
    });
  },
});

export default loginSclice.reducer;
export const { logout } = loginSclice.actions;
