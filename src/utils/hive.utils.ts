import * as Hive from '@hiveio/dhive';
import {
  Client,
  PrivateKey,
  SignedTransaction,
  Transaction,
} from '@hiveio/dhive';

import { IDHiveAccountUpdateBroadcast } from '../interfaces/dhive.interface';
import {
  IHiveSignatureInterface,
  LoginResponseType,
} from '../interfaces/hive-keychain.interface';

import { KeychainKeyTypes } from 'hive-keychain-commons';
import * as hiveTx from 'hive-tx';
import * as math from 'mathjs';
import {
  BroadCastResponseType,
  IHiveAccountUpdateBroadcast,
} from '../interfaces';
import { getTimestampInSeconds } from './utils';

let client: Client;
const getClient = () => {
  if (!client)
    client = new Client([
      'https://api.hive.blog',
      'https://api.hivekings.com',
      'https://api.deathwing.me',
      'https://anyx.io',
      'https://api.openhive.network',
    ]);
  return client;
};

const getAccount = async (username: string) => {
  client = getClient();
  return client.database.getAccounts([username]);
};

const getAccountMemoKey = async (username: string) => {
  const account = await getAccount(username);
  const memo = account[0]['memo_key'];
  return memo;
};

const getJSONMetadata = async (username: string) => {
  try {
    const account = await getAccount(username);
    const jsonMetadata = JSON.parse(account[0]['json_metadata']);
    return jsonMetadata;
  } catch {
    return undefined;
  }
};
const getAuthority = async (username: string, keyType: KeychainKeyTypes) => {
  const account = await getAccount(username);
  if (account.length === 0) {
    return undefined;
  }
  switch (keyType) {
    case KeychainKeyTypes.active:
      return account[0].active;
    case KeychainKeyTypes.posting:
      return account[0].posting;
  }
};
const getPublicKey = async (username: string, keyType: string) => {
  var account = await getAccount(username);
  try {
    switch (keyType.toLowerCase()) {
      case 'posting':
        return account[0].posting.key_auths[0][0].toString();
      case 'active':
        return account[0].active.key_auths[0][0].toString();
    }
  } catch {
    throw Error(`Cannot find public key for ${username}`);
  }
};

const getAccountPublicKeyAuthority = async (
  username: string,
  keyType: string,
): Promise<[string, number]> => {
  try {
    const account = await getAccount(username);
    switch (keyType.toLowerCase()) {
      case 'posting':
        return [
          account[0].posting.key_auths[0][0].toString(),
          account[0].posting.key_auths[0][1],
        ];
      case 'active':
        return [
          account[0].active.key_auths[0][0].toString(),
          account[0].active.key_auths[0][1],
        ];
    }
  } catch (error) {
    throw new Error(`Cannot find public key for ${username}`);
  }
};

const createSignatureObject = (
  username: string,
  setValidLogIn: Function,
): IHiveSignatureInterface => {
  return {
    username: username,
    message: {
      username: username,
      timestamp: getTimestampInSeconds(),
      message: 'sign in from hive multisig',
    },
    key: 'Posting',
    responseCallback: setValidLogIn,
  };
};
const login = (username: string) => {
  return new Promise<LoginResponseType>((resolve, reject) => {
    const callback = (response: LoginResponseType) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    };
    const sigObj = createSignatureObject(username, callback);
    window.hive_keychain.requestSignBuffer(
      sigObj.username,
      JSON.stringify(sigObj.message),
      sigObj.key,
      sigObj.responseCallback,
    );
  });
};

const signBuffer = (username: string, keytype: KeychainKeyTypes) => {
  return new Promise<LoginResponseType>((resolve, reject) => {
    var message = {
      username: username,
      timestamp: getTimestampInSeconds(),
      message: `${username}`,
    };
    const callback = (response: LoginResponseType) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    };
    window.hive_keychain.requestSignBuffer(
      username,
      JSON.stringify(message),
      keytype.toString(),
      callback,
    );
  });
};

const getAccountAuthorities = async (username: string) => {
  const account = await getAccount(username);

  if (account.length === 0) {
    return undefined;
  }
  const auths = {
    account: account[0].name,
    owner: account[0].owner,
    active: account[0].active,
    posting: account[0].posting,
    memo_key: account[0].memo_key,
    json_metadata: account[0].json_metadata,
  };
  return auths;
};

const broadcastUpdateAccount = async (props: IDHiveAccountUpdateBroadcast) => {
  client = getClient();
  const result = await client.broadcast.updateAccount(
    props.newAuthorities,
    Hive.PrivateKey.from(props.ownerKey),
  );
};

const requestSignTx = async (
  tx: Transaction,
  username: string,
  method: KeychainKeyTypes,
) => {
  return new Promise<Hive.SignedTransaction | undefined>(
    async (resolve, reject) => {
      const keychain = window.hive_keychain;
      let signResult: Hive.SignedTransaction | undefined = undefined;
      try {
        await keychain.requestSignTx(
          username,
          tx,
          method,
          async (response: { error: any; result: Hive.SignedTransaction }) => {
            if (!response.error) {
              signResult = response.result;
              client.database.verifyAuthority(response.result).then((valid) => {
                if (valid) resolve(signResult);
                else reject(response);
              });
            } else {
              reject(response);
            }
          },
        );
      } catch (e) {
        reject(e);
      }
    },
  );
};

const encodeMessage = async (
  from: string,
  to: string,
  message: string,
  method: KeychainKeyTypes,
) => {
  return new Promise<any>((resolve, reject) => {
    const callback = (response: any) => {
      if (response.result) {
        resolve(response);
      } else {
        reject(response);
      }
    };
    const keychain = window.hive_keychain;
    keychain.requestEncodeMessage(from, to, '#' + message, method, callback);
  });
};

const encodeMessageWithKeys = async (
  username: string,
  publicKeys: string[],
  message: string,
  method: KeychainKeyTypes,
) => {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const callback = (response: any) => {
        if (response.result) {
          resolve(response);
        } else {
          reject(response);
        }
      };
      const keychain = window.hive_keychain;
      keychain.requestEncodeWithKeys(
        username,
        publicKeys,
        message,
        method,
        callback,
      );
    } catch (err) {
      reject(err);
    }
  });
};
const broadcastTx = async (transaction: SignedTransaction) => {
  client = getClient();
  var res = await client.broadcast.send(transaction);
  return res;
};
const getPrivateKeyFromSeed = (seed: string): Hive.PrivateKey => {
  return PrivateKey.fromSeed(seed);
};

const accountUpdateBroadcast = (props: IHiveAccountUpdateBroadcast) => {
  return new Promise<BroadCastResponseType>((resolve, reject) => {
    const callback = (response: any) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    };
    const keychain = window.hive_keychain;
    keychain.requestBroadcast(
      props.newAuthorities.account,
      [['account_update', props.newAuthorities]],
      props.targetAuthorityType,
      callback,
    );
  });
};

const getNextRequestID = async (username: string) => {
  client = getClient();
  let conversions = await client.database.call('get_conversion_requests', [
    username,
  ]);
  let collateralized_conversions = await client.database.call(
    'get_collateralized_conversion_requests',
    [username],
  );
  if (!collateralized_conversions) collateralized_conversions = [];
  const conv = [...conversions, ...collateralized_conversions];

  return Math.max(...conv.map((e) => e.requestid), 0) + 1;
};

const getDynamicGlobalProperties = async (
  method: string,
  params: any[] | object,
  key?: string,
) => {
  const response = await hiveTx.call(
    'condenser_api.get_dynamic_global_properties',
  );
  if (response?.result) {
    return key ? response.result[key] : response.result;
  } else
    throw new Error(
      `Error while retrieving data from ${method} : ${JSON.stringify(
        response.error,
      )}`,
    );
};

const fromHP = (
  hp: number,
  {
    total_vesting_fund_hive,
    total_vesting_shares,
  }: Hive.DynamicGlobalProperties,
) => {
  const vesting_fund_hive = math.bignumber(
    total_vesting_fund_hive.toString().split(' ')[0],
  );
  const vesting_shares = math.bignumber(
    total_vesting_shares.toString().split(' ')[0],
  );
  var res = math.multiply(math.divide(hp, vesting_fund_hive), vesting_shares);
  return math.format(res, { notation: 'fixed', precision: 6 });
};

const getActiveSignWeight = async (
  username: string,
  activeAuthorities: Hive.AuthorityType,
) => {
  return new Promise<number>((resolve, reject) => {
    try {
      signBuffer(username, KeychainKeyTypes.active)
        .then((data) => {
          if (data) {
            const signer_key = data.publicKey;
            const signer_auth = activeAuthorities.key_auths.filter(
              (key_auth) => key_auth[0] === signer_key,
            )[0];
            const signer_weight = signer_auth[1];

            resolve(signer_weight);
          } else {
            reject(data);
          }
        })
        .catch((e) => {
          alert(e.message);
        });
    } catch (error) {
      reject(error);
    }
  });
};

const HiveUtils = {
  getAccount,
  getAuthority,
  getAccountMemoKey,
  getAccountAuthorities,
  broadcastUpdateAccount,
  getPrivateKeyFromSeed,
  fromHP,
  getDynamicGlobalProperties,
  getNextRequestID,
  accountUpdateBroadcast,
  login,
  signBuffer,
  getAccountPublicKeyAuthority,
  getPublicKey,
  requestSignTx,
  broadcastTx,
  getActiveSignWeight,
  getJSONMetadata,
  encodeMessage,
  encodeMessageWithKeys,
};

export default HiveUtils;
