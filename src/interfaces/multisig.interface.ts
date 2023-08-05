import {
  ITransaction,
  SignerConnectResponse,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
export interface IMultisig {
  signerConnectActive: SignerConnectResponse;
  signerConnectPosting: SignerConnectResponse;
  subscribeToSignRequest: boolean;
  signRequests: ITransaction[];
}

export interface State extends IMultisig {
  showSignRequests?: boolean;
  signRequestCount?: number;
  newSignRequestCount?: number;
  success: boolean;
  error: string;
}
