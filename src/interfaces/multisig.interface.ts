import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { SignerConnectResponse } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

export interface IMultisig {
  signerConnectActive: SignerConnectResponse;
  signerConnectPosting: SignerConnectResponse;
  subscribeToSignRequests: boolean;
  signRequests: SignatureRequest[];
}

export interface State extends IMultisig {
  success: boolean;
  error: string;
}
