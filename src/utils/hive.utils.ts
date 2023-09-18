import * as Hive from '@hiveio/dhive';
import { Client, PrivateKey } from '@hiveio/dhive';
import { IDHiveAccountUpdateBroadcast } from '../interfaces/dhive.interface';
import {
  IHiveSignatureInterface,
  LoginResponseType,
} from '../interfaces/hive-keychain.interface';
const client = new Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);

import { KeychainKeyTypes } from 'hive-keychain-commons';
import * as hiveTx from 'hive-tx';
import * as math from 'mathjs';
import {
  BroadCastResponseType,
  IHiveAccountUpdateBroadcast,
} from '../interfaces';
import { getTimestampInSeconds } from './utils';

const getAccount = async (username: string) => {
  return client.database.getAccounts([username]);
};
const getAuthority = async (username: string, keyType: KeychainKeyTypes) => {
  const account = await HiveUtils.getAccount(username);
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
  const result = await client.broadcast.updateAccount(
    props.newAuthorities,
    Hive.PrivateKey.from(props.ownerKey),
  );
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

const HiveUtils = {
  getAccount,
  getAuthority,
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
};

export default HiveUtils;
