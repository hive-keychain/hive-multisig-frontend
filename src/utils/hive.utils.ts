import * as Hive from '@hiveio/dhive';
import { Client, PrivateKey } from '@hiveio/dhive';
import { Authorities } from '../interfaces/account.interface';
import { IDHiveAccountUpdateBroadcast } from '../interfaces/dhive.interface';
const client = new Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);

import * as hiveTx from 'hive-tx';
import * as math from 'mathjs';
import {
  BroadCastResponseType,
  IHiveAccountUpdateBroadcast,
} from '../interfaces';

const getAccount = async (username: string) => {
  return client.database.getAccounts([username]);
};

const getAccountAuthorities = async (username: string) => {
  let keys: Authorities = {
    account: '',
    owner: null,
    active: null,
    posting: null,
    memo_key: '',
    json_metadata: '',
  };
  const account = await getAccount(username);

  if (account.length === 0) {
    return keys;
  }
  keys = {
    account: account[0].name,
    owner: account[0].owner,
    active: account[0].active,
    posting: account[0].posting,
    memo_key: account[0].memo_key,
    json_metadata: account[0].json_metadata,
  };
  return keys;
};

const getAuthorities = async (
  setAuthorities: Function,
  setValidUsername: Function,
  searchKey: string,
) => {
  const response = await getAccountAuthorities(searchKey);
  setAuthorities(response);
  if (
    response.active ||
    response.owner ||
    response.posting ||
    searchKey === ''
  ) {
    setValidUsername(true);
  } else {
    setValidUsername(false);
  }
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
  getAccountAuthorities,
  getAuthorities,
  broadcastUpdateAccount,
  getPrivateKeyFromSeed,
  fromHP,
  getDynamicGlobalProperties,
  getNextRequestID,
  accountUpdateBroadcast,
};

export default HiveUtils;
