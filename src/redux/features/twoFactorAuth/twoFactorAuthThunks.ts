import { createAsyncThunk } from '@reduxjs/toolkit';
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

export const createQRCode = createAsyncThunk(
  'twoFactorAuth/createQRCode',
  async (qrCodeUrl: string, { getState }) => {
    return qrCodeUrl;
  },
);

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

export const proceedIntro = createAsyncThunk<
  State,
  boolean,
  { rejectValue: string }
>('twoFactorAuth/proceedIntro', async (proceedIntro: boolean, { getState }) => {
  const currentState = getState() as State;
  const newState: State = {
    ...currentState,
    proceedIntro,
  };
  return newState;
});

export const proceedMultisig = createAsyncThunk<
  State,
  boolean,
  { rejectValue: string }
>(
  'twoFactorAuth/proceedMultisig',
  async (proceedMultisig: boolean, { getState }) => {
    const currentState = getState() as State;
    const newState: State = {
      ...currentState,
      proceedMultisig,
    };
    return newState;
  },
);

export const checkDefaultBot = createAsyncThunk<
  boolean,
  boolean,
  { rejectValue: string }
>('twoFactorAuth/checkDefaultBot', async (hasDefaultBot: boolean) => {
  return hasDefaultBot;
});

export const setTwoFABots = createAsyncThunk(
  'twoFactorAuth/setTwoFABots',
  async (bots: string[][]) => {
    return bots;
  },
);

export const isManageTwoFA = createAsyncThunk(
  'twoFactorAuth/isManageTwoFA',
  (manage: boolean) => {
    return manage;
  },
);

export const setAddedBot = createAsyncThunk(
  'twoFactorAuth/setAddedBot',
  (bot: [string, number]) => {
    return bot;
  },
);
export const setRemovedBot = createAsyncThunk(
  'twoFactorAuth/setRemovedBot',
  (bot: [string, number]) => {
    return bot;
  },
);

export const botSetupSuccess = createAsyncThunk(
  'twoFactorAuth/botSetupSuccess',
  (flag: boolean) => {
    return flag;
  },
);

export const removeBotSuccess = createAsyncThunk(
  'twoFactorAuth/removeBotSuccess',
  (flag: boolean) => {
    return flag;
  },
);

export const updateThreshSuccess = createAsyncThunk(
  'twoFactorAuth/updateThreshSuccess',
  (flag: boolean) => {
    return flag;
  },
);

export const transactionSubmitted = createAsyncThunk(
  'twoFactorAuth/transactionSubmitted',
  (flag: boolean) => {
    return flag;
  },
);

export const updateWeightSuccess = createAsyncThunk(
  'twoFactorAuth/updateWeightSuccess',
  (flag: boolean) => {
    return flag;
  },
);

export const setIsMultisigTransaction = createAsyncThunk(
  'twoFactorAuth/isMultisigTransaction',
  (flag: boolean) => {
    return flag;
  },
);
