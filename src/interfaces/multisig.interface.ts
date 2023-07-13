import { Transaction } from '@hiveio/dhive';

import { SignerConnectResponse } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

export interface IMultisig {
  signerConnectActive: SignerConnectResponse;
  signerConnectPosting: SignerConnectResponse;
  subscribeToSignRequest: boolean;
  signRequests: Transaction[];
}

export interface State extends IMultisig {
  showSignRequests?: boolean;
  signRequestCount?: number;
  success: boolean;
  error: string;
}
