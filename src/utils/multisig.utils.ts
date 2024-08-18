import * as Hive from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { IEncodeTransaction } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import moment from 'moment';
import { Authorities } from '../interfaces';
import { Configuration } from '../interfaces/granularity.interface';
import { IExpiration, Initiator } from '../interfaces/transaction.interface';
import { TwoFACodes } from '../interfaces/twoFactorAuth.interface';
import AccountUtils from '../utils/hive.utils';
import { orderAlphabetically } from './account-utils';
import HiveUtils from './hive.utils';
import HiveTxUtils from './hivetx.utils';
const defaultBot = process.env.BOT;

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

const getMultisigBots = async (username: string) => {
  const activeAuth = await HiveUtils.getAuthority(
    username,
    KeychainKeyTypes.active,
  );
  let bots = [];

  for (let i = 0; i < activeAuth.account_auths.length; i++) {
    const botName = activeAuth.account_auths[i][0];
    const isBot = await checkMultisigBot(botName);
    if (isBot) {
      bots.push([botName, botName === defaultBot ? 'default' : 'custom']);
    }
  }
  return !bots || bots.length === 0 ? undefined : bots;
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
          HiveUtils.broadcastTx(signedTx)
            .then(async (res) => {
              resolve(res);
            })
            .catch((e) => reject(e));
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
  twoFACodes?: TwoFACodes,
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
        .encodeTransaction(txToEncode, twoFACodes)
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
  twoFACodes?: TwoFACodes,
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
    const signer_weight = activeAuthority.key_auths[0][1];
    const opName = 'Account Update';

    //non multisig transaction
    if (signer_weight >= activeAuthority.weight_threshold) {
      nonMultisigTxBroadcast(transaction, username).then(async (res) => {
        if (res) {
          resolve(`${opName} transaction has been broadcasted!`);
        } else {
          reject(`Failed to broadcast non-multisig ${opName}`);
        }
      });
    } //multisig transaction
    else {
      multisigTxBroadcast(transaction, initiator, twoFACodes).then(
        async (res) => {
          if (res) {
            resolve(
              `${opName} transaction has been submitted to multisig signers! You may check the status of the transaction in the Sign Requests page.`,
            );
          } else {
            reject(`Failed to broadcast multisig ${opName}`);
          }
        },
      );
    }
  });
};

const twoFAConfigBroadcast = async (
  username: string,
  bot: [string | Hive.PublicKey, number],
  twoFASecret: string,
  initiator: Initiator,
  newAuthorities: Authorities,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const customJsonOp = await get2FACustomJsonOp(username, bot, twoFASecret);
      const updateAccountOp = await getUpdateAccountOp(newAuthorities);
      const transaction = await HiveTxUtils.createTx(
        [customJsonOp, updateAccountOp],
        {
          date: undefined,
          minutes: 60,
        } as IExpiration,
      );
      broadcastTransaction(transaction, username, initiator)
        .then((res) => resolve(res))
        .catch((reason) => reject(reason));
    } catch (e) {
      reject(e);
    }
  });
};

const granularityConfigBroadcast = async (
  username: string,
  bot: [string | Hive.PublicKey, number],
  gbotConfig: Configuration,
  initiator: Initiator,
  newAuthorities: Authorities,
) => {
  return new Promise(async (resolve, reject) =>{
    try{
      const customJsonOp = await getGBotCustomJsonOp(username, bot, gbotConfig);

    }catch(error){
      reject(error)
    }
  })
};
const broadcastTransaction = async (
  transaction: Hive.Transaction,
  username: string,
  initiator: Initiator,
  twoFACodes?: TwoFACodes,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const auth = await AccountUtils.getActiveAuthorities(username);
      const signer_weight = auth.active.key_auths[0][1];
      if (signer_weight >= auth.active.weight_threshold) {
        //non multisig transaction
        nonMultisigTxBroadcast(transaction, username)
          .then(async (res) => {
            const operationNames = transaction.operations.map((op) => {
              return op[0]
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            });

            resolve(
              `${
                operationNames.length > 1
                  ? operationNames.join(', ')
                  : operationNames[0]
              } transaction has been broadcasted!`,
            );
          })
          .catch((e) => {
            reject(e);
          });
      } else {
        //multisig transaction
        multisigTxBroadcast(transaction, initiator, twoFACodes)
          .then(async (res) => {
            const operationNames = transaction.operations.map((op) => {
              return op[0]
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            });
            resolve(
              `${
                operationNames.length > 1
                  ? operationNames.join(', ')
                  : operationNames[0]
              } transaction has been submitted to multisig signers! You may check the status of the transaction in the Sign Requests page.`,
            );
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


const getGBotCustomJsonOp = async (
  username: string,
  bot: [string | Hive.PublicKey, number],
  gBotConfig: Configuration,
) => {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const isValid = await MultisigUtils.checkMultisigBot(bot[0].toString());
      const auth = await AccountUtils.getActiveAuthorities(username);
      if(isValid){
        const botMemoKey = await AccountUtils.getAccountMemoKey(
          bot[0].toString(),
        );
      }
    
    
    } catch (error) {
      reject(error);
    }
  });
};




const get2FACustomJsonOp = async (
  username: string,
  bot: [string | Hive.PublicKey, number],
  twoFASecret: string,
) => {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const isValid = await MultisigUtils.checkMultisigBot(bot[0].toString());
      const auth = await AccountUtils.getActiveAuthorities(username);
      if (isValid) {
        //get bot's memo key
        const botMemoKey = await AccountUtils.getAccountMemoKey(
          bot[0].toString(),
        );
        const signer_weight = auth.active.key_auths[0][1];
        let encodingResult = undefined;
        const isNonMultisig = signer_weight >= auth.active.weight_threshold;
        if (isNonMultisig) {
          //non multisig
          encodingResult = await HiveUtils.encodeMessage(
            username,
            bot[0].toString(),
            `${twoFASecret}`,
            KeychainKeyTypes.memo,
          );
        } else {
          //multisig
          encodingResult = await HiveUtils.encodeMessageWithKeys(
            username,
            [botMemoKey],
            `${twoFASecret}`,
            KeychainKeyTypes.memo,
          );
        }
        if (encodingResult.success) {
          const encodedMessage = isNonMultisig
            ? encodingResult.result
            : encodingResult.result[botMemoKey.toString()];
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
      reject(`${username} is not configured as a 2FA bot`);
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
  getMultisigBots,
  getUpdateAccountOp,
};
