export interface State {
  proceedIntro: boolean;
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
