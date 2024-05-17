import * as Hive from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { IEncodeTransaction } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import moment from 'moment';
import { Authorities } from '../interfaces';
import { IExpiration, Initiator } from '../interfaces/transaction.interface';
import { orderAlphabetically } from './account-utils';
import HiveUtils from './hive.utils';
import HiveTxUtils from './hivetx.utils';

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
  return metadata?.isMultisigBot === true ? true : false;
};

const parseNewAuthorities = (newAuthorities: Authorities) => {
  const activeAccounts = orderAlphabetically(
    newAuthorities.active.account_auths,
  );
  const activeKeys = orderAlphabetically(newAuthorities.active.key_auths);
  const postingAccounts = orderAlphabetically(
    newAuthorities.posting.account_auths,
  );
  const postingKeys = orderAlphabetically(newAuthorities.posting.key_auths);

  const parsedAuthorities: Authorities = {
    ...newAuthorities,
    owner: undefined,
    active: {
      account_auths: activeAccounts,
      key_auths: activeKeys,
      weight_threshold: newAuthorities.active.weight_threshold,
    },
    posting: {
      account_auths: postingAccounts,
      key_auths: postingKeys,
      weight_threshold: newAuthorities.posting.weight_threshold,
    },
  };

  return parsedAuthorities;
};

const nonMultisigTxBroadcast = async (
  transaction: Hive.Transaction,
  username: string,
) => {
  return new Promise((resolve, reject) => {
    const keyType = KeychainKeyTypes.active;
    HiveUtils.requestSignTx(transaction, username, keyType)
      .then((signedTx) => {
        if (signedTx) {
          HiveUtils.broadcastTx(signedTx).then(async (res) => {
            resolve(res);
          });
        } else {
          alert('[UpdateAuthConf] Signed Tx Error');
          reject(undefined);
        }
      })
      .catch((e) => {
        alert(JSON.stringify(e));
        reject(e);
      });
  });
};

const multisigTxBroadcast = async (
  transaction: Hive.Transaction,
  initiator: Initiator,
) => {
  return new Promise((resolve, reject) => {
    const keyType = KeychainKeyTypes.active;
    const multisig = HiveMultisig.getInstance(
      window,
      MultisigUtils.getOptions(),
    );
    const txToEncode: IEncodeTransaction = {
      transaction: { ...transaction },
      method: keyType,
      expirationDate: moment().add(60, 'm').toDate(),
      initiator,
    };

    try {
      multisig.utils
        .encodeTransaction(txToEncode)
        .then((encodedTxObj) => {
          multisig.wss.requestSignatures(encodedTxObj).then(async (res) => {
            resolve(res);
          });
        })
        .catch((e) => {
          alert(e.message);
          reject(e);
        });
    } catch (error) {
      alert(`${error}`);
      reject(error);
    }
  });
};

const accountUpdateWithActiveAuthority = async (
  username: string,
  initiator: Initiator,
  activeAuthority: Hive.AuthorityType,
  newAuthorities: Authorities,
) => {
  return new Promise(async (resolve, reject) => {
    //construct transaction for account_update
    const updatedAuthorities: Authorities = parseNewAuthorities(newAuthorities);
    const op = ['account_update', updatedAuthorities];
    const transaction = await HiveTxUtils.createTx([op], {
      date: undefined,
      minutes: 60,
    } as IExpiration);
    // determine if the transaction could be done with or without multisig
    const signer_weight = await HiveUtils.getActiveSignWeight(
      username,
      activeAuthority,
    );
    //non multisig transaction
    if (signer_weight >= activeAuthority.weight_threshold) {
      nonMultisigTxBroadcast(transaction, username).then(async (res) => {
        if (res) {
          resolve(res);
        } else {
          reject('Failed to broadcast non-multisig account_update');
        }
      });
    } //multisig transaction
    else {
      multisigTxBroadcast(transaction, initiator).then(async (res) => {
        if (res) {
          resolve(res);
        } else {
          reject('Failed to broadcast multisig account_update');
        }
      });
    }
  });
};

const twoFAConfigBroadcast = async (
  username: string,
  bot: [string | Hive.PublicKey, number],
  twoFASecret: string,
  initiator: Initiator,
  activeAuthority: Hive.AuthorityType,
  newAuthorities: Authorities,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const customJsonOp = await getCustomJsonOp(username, bot, twoFASecret);
      const updateAccountOp = await getUpdateAccountOp(newAuthorities);
      const transaction = await HiveTxUtils.createTx(
        [customJsonOp, updateAccountOp],
        {
          date: undefined,
          minutes: 60,
        } as IExpiration,
      );
      broadcastTransaction(transaction, username, initiator, activeAuthority)
        .then((res) => resolve(res))
        .catch((reason) => reject(reason));
    } catch (e) {
      reject(e);
    }
  });
};
const broadcastTransaction = async (
  transaction: Hive.Transaction,
  username: string,
  initiator: Initiator,
  activeAuthority: Hive.AuthorityType,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const signer_weight = await HiveUtils.getActiveSignWeight(
        username,
        activeAuthority,
      );
      if (signer_weight >= activeAuthority.weight_threshold) {
        //non multisig transaction
        nonMultisigTxBroadcast(transaction, username).then(async (res) => {
          resolve(res);
        });
      } else {
        //multisig transaction
        multisigTxBroadcast(transaction, initiator)
          .then(async (res) => {
            resolve(res);
          })
          .catch((e) => {
            reject(e);
          });
      }
    } catch (e) {
      reject(e);
    }
  });
};
const getCustomJsonOp = async (
  username: string,
  bot: [string | Hive.PublicKey, number],
  twoFASecret: string,
  isMultisig: boolean = false,
) => {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const isValid = await MultisigUtils.checkMultisigBot(bot[0].toString());
      if (isValid) {
        const memoKey = await HiveUtils.getAccountMemoKey(bot[0].toString());
        let encodingResult = undefined;
        encodingResult = await HiveUtils.encodeMessageWithKeys(
          username,
          [memoKey],
          `${twoFASecret}`,
          KeychainKeyTypes.active,
        );

        if (encodingResult.success) {
          const encodedMessage = encodingResult.result[memoKey];
          const customJsonOp = {
            required_auths: [username],
            required_posting_auths: [] as string[],
            id: 'setTwoFaId',
            json: JSON.stringify({
              botName: bot[0],
              twoFaId: encodedMessage,
            }),
          };
          const op = ['custom_json', customJsonOp];

          resolve(op);
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

const getUpdateAccountOp = async (newAuthorities: Authorities) => {
  const updatedAuthorities: Authorities = parseNewAuthorities(newAuthorities);
  const op = ['account_update', updatedAuthorities];
  return op;
};
export const MultisigUtils = {
  getSigners,
  getOptions,
  checkMultisigBot,
  parseNewAuthorities,
  nonMultisigTxBroadcast,
  multisigTxBroadcast,
  accountUpdateWithActiveAuthority,
  broadcastTransaction,
  twoFAConfigBroadcast,
};
