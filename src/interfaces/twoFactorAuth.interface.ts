export interface ITwoFactorAuth {
  enabled: boolean;
  secret: string;
  token: string;
}

export interface State extends ITwoFactorAuth {
  qrCodeUrl: string;
  isValid: boolean;
  proceedIntro: boolean;
  proceedMultisig: boolean;
  hasDefaultBot: boolean;
  bots: string[][];
  isManageTwoFA: boolean;
  addedBot: [string, number];
  removedBot: [string, number];
  botSetupSuccess: boolean;
  removeBotSuccess: boolean;
  updateThreshSuccess: boolean;
  updateWeightSuccess: boolean;
  transactionSubmitted: boolean;
  isMultisigTransaction: boolean;
}

export interface TwoFACodes {
  [botName: string]: string;
}
