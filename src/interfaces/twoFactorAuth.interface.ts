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
}

export interface TwoFACodes {
  [botName: string]: string;
}
