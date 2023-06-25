import { SignerConnectResponse } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

export interface IMultisig {
  signerConnect: {
    active: SignerConnectResponse;
    posting: SignerConnectResponse;
  };
}

export interface State extends IMultisig {
  success: boolean;
  error: string;
}
