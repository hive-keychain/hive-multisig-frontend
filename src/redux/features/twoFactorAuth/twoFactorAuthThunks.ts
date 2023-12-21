import { createAsyncThunk } from '@reduxjs/toolkit';
import qrcode from 'qrcode';
import { State } from '../../../interfaces/twoFactorAuth.interface';
export const createSecret = createAsyncThunk<
  State,
  string,
  { rejectValue: string }
>('twoFactorAuth/createSecret', async (secret: string, { getState }) => {
  const currentState = getState() as State;
  let newState: State = undefined;
  try {
    newState = {
      ...currentState,
      secret,
    };
  } catch (e) {
    console.error(e);
    newState = { ...currentState };
  }

  return newState;
});

export const createQRCode = createAsyncThunk<
  State,
  string,
  { rejectValue: string }
>('twoFactorAuth/createQRCode', async (otpauth: string, { getState }) => {
  const currentState = getState() as State;
  console.log(`Current state secret: ${currentState.secret}`);

  const qrCodeUrl = await qrcode.toDataURL(otpauth);
  const newState: State = {
    ...currentState,
    qrCodeUrl,
  };
  return newState;
});

export const setTokenValidation = createAsyncThunk<
  State,
  boolean,
  { rejectValue: string }
>(
  'twoFactorAuth/setTokenValidation',
  async (isValid: boolean, { getState }) => {
    const currentState = getState() as State;
    const newState: State = {
      ...currentState,
      isValid,
    };
    return newState;
  },
);