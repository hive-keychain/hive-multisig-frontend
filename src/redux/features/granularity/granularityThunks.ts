import { createAsyncThunk } from '@reduxjs/toolkit';

export const proceedIntro = createAsyncThunk(
  'granularity/proceedIntro',
  async (proceedIntro: boolean) => {
    return proceedIntro;
  },
);
export const hasDefaultBot = createAsyncThunk(
  'granularity/hasDefaultBot',
  async (hasDefaultBot: boolean) => {
    return hasDefaultBot;
  },
);

export const proceedMultisig = createAsyncThunk(
  'granularity/proceedMultisig',
  (proceed: boolean) => {
    return proceed;
  },
);

export const setGranularityBots = createAsyncThunk(
  'granularity/setGranularityBots',
  async (bots: string[][]) => {
    return bots;
  },
);

export const isManageGranularity = createAsyncThunk(
  'granularity/isManageGranularity',
  async (manage: boolean) => {
    return manage;
  },
);
export const setAddedBot = createAsyncThunk(
  'granularity/setAddedBot',
  (bot: [string, number]) => {
    return bot;
  },
);
export const setRemovedBot = createAsyncThunk(
  'granularity/setRemovedBot',
  (bot: [string, number]) => {
    return bot;
  },
);

export const botSetupSuccess = createAsyncThunk(
  'granularity/botSetupSuccess',
  (flag: boolean) => {
    return flag;
  },
);

export const removeBotSuccess = createAsyncThunk(
  'granularity/removeBotSuccess',
  (flag: boolean) => {
    return flag;
  },
);

export const updateThreshSuccess = createAsyncThunk(
  'granularity/updateThreshSuccess',
  (flag: boolean) => {
    return flag;
  },
);

export const transactionSubmitted = createAsyncThunk(
  'granularity/transactionSubmitted',
  (flag: boolean) => {
    return flag;
  },
);

export const updateWeightSuccess = createAsyncThunk(
  'granularity/updateWeightSuccess',
  (flag: boolean) => {
    return flag;
  },
);

export const setIsMultisigTransaction = createAsyncThunk(
  'granularity/isMultisigTransaction',
  (flag: boolean) => {
    return flag;
  },
);
