import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { SignResponseType } from '../../../interfaces';
import { RequestSignature } from '../../../utils/hive-keychain.utils';

export enum LoginState {
  SIGNATURE_REQUESTED = 'SIGNATURE_REQUESTED',
  SIGNATURE_SUCCEEDED = 'SIGNATURE_SUCCEEDED',
  SIGNATURE_FAILED = 'SIGNATURE_FAILED',
  LOGGED_OUT = 'LOGGED_OUT'
}

export type LoginStateType = {
  loginState: LoginState;
  isSignatureSuccess: boolean;
  accountObject: SignResponseType;
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
    const response = await RequestSignature(username);
    return response;
  },
);

const loginSclice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout(state, action){
      state={
        loginState:LoginState.LOGGED_OUT,
        isSignatureSuccess: false,
        accountObject: null,
        error: '',
      }
    }

  },
  extraReducers: (builder) => {
    builder.addCase(
      hiveKeyChainRequestSign.fulfilled,
      (state, action: PayloadAction<SignResponseType>) => {
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
export const { logout } =
  loginSclice.actions;
