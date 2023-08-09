import {
  ITransaction,
  SignerConnectResponse,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
export interface IMultisig {
  signerConnectActive: SignerConnectResponse;
  signerConnectPosting: SignerConnectResponse;
  subscribeToSignRequest: boolean;
  subscribeToBroadcast: boolean;
  signRequests: ITransaction[];
  broadcastedTransactions: ITransaction[];
}

export interface State extends IMultisig {
  showSignRequests?: boolean;
  signRequestCount?: number;
  newSignRequestCount?: number;
  success: boolean;
  error: string;
}
