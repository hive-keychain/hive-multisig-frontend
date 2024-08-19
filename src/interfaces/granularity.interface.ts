export interface State {
  proceedIntro: boolean;
  proceedConfiguration: boolean;
  hasDefaultBot: boolean;
  proceedMultisig: boolean;
  isManageGranularity: boolean;
  bots: string[][];
  addedBot: [string, number];
  removedBot: [string, number];
  botSetupSuccess: boolean;
  removeBotSuccess: boolean;
  updateThreshSuccess: boolean;
  updateWeightSuccess: boolean;
  transactionSubmitted: boolean;
  isMultisigTransaction: boolean;
}

export interface GBotTabProp {
  isManageGranularity: boolean;
}

export interface Operation {
  operationName: string;
}

export interface Configuration {
  authority?: string;
  operations: Operation[];
}

export interface MultisigGbotConfig {
  id: string;
  json: {
    configurations: Configuration[];
  };
}
