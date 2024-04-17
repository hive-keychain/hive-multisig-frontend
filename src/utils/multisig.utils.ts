import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import HiveUtils from './hive.utils';

const getOptions = () => {
  return {
    apiAddress:
      process.env.API_ADDRESS || 'https://api-multisig.hive-keychain.com',
    socketAddress:
      process.env.SOCKET_ADDRESS || 'https://api-multisig.hive-keychain.com',
    clientAddress: 'https://api.deathwing.me',
  };
};

const multisig = HiveMultisig.getInstance(window, getOptions());

const getSigners = async (username: string, keyType: KeychainKeyTypes) => {
  const signers = await HiveMultisig.getSigners(username, keyType);
  return signers;
};
const checkMultisigBot = async (username: string) => {
  const metadata = await HiveUtils.getJSONMetadata(username);
  console.log(`IsValid: ${metadata?.isMultisigBot}`);
  return metadata?.isMultisigBot === true ? true : false;
};

export const MultisigUtils = {
  getSigners,
  getOptions,
  checkMultisigBot,
};
