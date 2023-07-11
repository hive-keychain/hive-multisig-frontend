import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { SignerConnectResponse } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

export interface IMultisig {
  signerConnectActive: SignerConnectResponse;
  signerConnectPosting: SignerConnectResponse;
  subscribeToSignRequest: boolean;
  signRequest: SignatureRequest;
}

export interface State extends IMultisig {
  showSignRequests?: boolean;
  signRequestCount?: number;
  success: boolean;
  error: string;
}
