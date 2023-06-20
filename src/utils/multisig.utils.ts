import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
const multisig = new HiveMultisigSDK(window);

const getSigners = async (username: string, keyType: KeychainKeyTypes) => {
  const signers = await multisig.getSigners(username, keyType);
  return signers;
};

export const MultisigUtils = {
  getSigners,
};
