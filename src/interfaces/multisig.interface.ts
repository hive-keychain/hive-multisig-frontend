import { SignerConnectResponse } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

export interface IMultisig {
  signerConnectActive: SignerConnectResponse;
  signerConnectPosting: SignerConnectResponse;
  subscribeToSignRequest: boolean;
}

export interface State extends IMultisig {
  success: boolean;
  error: string;
}
