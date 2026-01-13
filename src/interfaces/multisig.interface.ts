import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import {
  SignerConnectMessage,
  SignerConnectResponse,
  UserNotification,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { TwoFACodes } from './twoFactorAuth.interface';
export interface IMultisig {
  signerConnectMessageActive: SignerConnectMessage;
  signerConnectMessagePosting: SignerConnectMessage;
  signerConnectActive: SignerConnectResponse;
  signerConnectPosting: SignerConnectResponse;
  subscribeToSignRequest: boolean;
  subscribeToBroadcast: boolean;
  signRequests: SignatureRequest[];
  userPendingSignatureRequest: SignatureRequest[];
  userNotifications: UserNotification[];
  broadcastedTransactions: SignatureRequest[];
}

export interface State extends IMultisig {
  receiveBroadcastNotificationsOn: boolean;
  /**
   * Client-side fallback for cases where backend returns a partial signer list
   * (e.g. initiator only). Keyed by signatureRequestId.
   */
  seededSignersByRequestId?: Record<string, Array<{ publicKey: string; weight?: number }>>;
  signRequestNotification?: boolean;
  broadcastNotification?: boolean;
  signRequestCount?: number;
  newSignRequestCount?: number;
  twoFASigners: TwoFACodes;
  success: boolean;
  error: string;
}

export enum MiltisigAuthorityTypes {
  AUTHORITY = 'authority',
  MULTISIG_BOT = 'default bot',
  CUSTOM_BOT = 'custom bot',
}
