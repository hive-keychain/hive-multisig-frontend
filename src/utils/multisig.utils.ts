import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';

const getOptions = () => {
  return {
    apiAddress: 'http://localhost:5000',
    socketAddress: 'http://localhost:5001',
    clientAddress: 'https://api.deathwing.me',
  };
};

const multisig = HiveMultisigSDK.getInstance(window, getOptions());

const getSigners = async (username: string, keyType: KeychainKeyTypes) => {
  const signers = await multisig.getSigners(username, keyType);
  return signers;
};

export const MultisigUtils = {
  getSigners,
  getOptions,
};
