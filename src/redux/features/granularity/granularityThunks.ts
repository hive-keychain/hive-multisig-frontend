import { createAsyncThunk } from '@reduxjs/toolkit';
import { MultisigGbotConfig } from '../../../interfaces/granularity.interface';

export const proceedIntro = createAsyncThunk(
  'granularity/proceedIntro',
  async (proceedIntro: boolean) => {
    return proceedIntro;
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
  async (bots: { botName: string; type: string; keyType: string }[]) => {
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

export const proceedConfiguration = createAsyncThunk(
  'granularity/proceedConfiguration',
  (flag: boolean) => {
    return flag;
  },
);

export const updateGranularityConfiguration = createAsyncThunk(
  'granularity/updateGranularityConfiguration',
  (configuration: MultisigGbotConfig) => {
    return configuration;
  },
);

export const initializeConfiguration = createAsyncThunk(
  'granularity/InitializeConfiguration',
  (configuration?: MultisigGbotConfig) => {
    if (configuration) return configuration;
    return {
      id: 'multisig-granularity-config-id', // You can replace this with your own logic to generate a unique ID
      json: {
        configurations: [],
      },
    } as MultisigGbotConfig;
  },
);

export const postingHasExistingGBot = createAsyncThunk(
  'granularity/posgintHasExistingGBot',
  (has: boolean) => {
    return has;
  },
);

export const activeHasExistingGBot = createAsyncThunk(
  'granularity/activeHasExistingGBot',
  (has: boolean) => {
    return has;
  },
);

export const proceedRemovalConfirmation = createAsyncThunk(
  'granularity/proceedRemovalConfirmation',
  (proceed: boolean) => {
    return proceed;
  },
);

export const proceedSetupConfirmation = createAsyncThunk(
  'granularity/proceedSetupConfirmation',
  (proceed: boolean) => {
    return proceed;
  },
);
