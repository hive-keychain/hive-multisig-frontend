import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { SignerConnectResponse } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

export interface IMultisig {
  signerConnectActive: SignerConnectResponse;
  signerConnectPosting: SignerConnectResponse;
<<<<<<< HEAD
  subscribeToSignRequests: boolean;
  signRequests: SignatureRequest[];
=======
  subscribeToSignRequest: boolean;
>>>>>>> 06997f0b98ad852e00b8bd5eaf667bec7150c707
}

export interface State extends IMultisig {
  success: boolean;
  error: string;
}
