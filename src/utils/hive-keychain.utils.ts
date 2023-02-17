import * as Hive from '@hiveio/dhive';
import * as hiveTx from 'hive-tx';
import * as math from 'mathjs';
import {
  BroadCastResponseType,
  IHiveAccountUpdateBroadcast,
  IHiveSignatureInterface,
  SignResponseType,
} from '../interfaces';
import { getTimestampInSeconds } from './utils';
const client = new Hive.Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
]);

export const AccountUpdateBroadcast = (props: IHiveAccountUpdateBroadcast) => {
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

export const RequestSignature = (username: string) => {
  return new Promise<SignResponseType>((resolve, reject) => {
    const callback = (response: SignResponseType) => {
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

const RequestSignTx = (account: string, operation: Object, key: string) => {
  return new Promise<any>(async (resolve, reject) => {
    const hivetx = new hiveTx.Transaction();
    const transaction = await hivetx.create([operation]);
    const callback = async (response: any) => {
      if (!response.error) {
        await client.database
          .verifyAuthority(response.result)
          .catch((error: any) => {
            reject(
              'Authority Verification Error:\n' + JSON.stringify(error.message),
            );
          });
        await client.broadcast.send(response.result).catch((error: any) => {
          reject('Broadcasting Error:\n' + JSON.stringify(error.message));
        });
      } else {
        reject(JSON.stringify(response));
      }
    };

    window.hive_keychain.requestSignTx(account, transaction, key, callback);
  });
};

export const requestSignTx = async (
  username: string,
  transaction: object,
  setErrorMessage: Function,
  keyType: string = 'Active',
) => {
  await RequestSignTx(username, transaction, keyType).then(
    (result: any) => {
      console.log(result);
      console.log('Handle success here!');
    },
    (error: any) => {
      setErrorMessage('Sign error: ' + JSON.stringify(error));
    },
  );
};

export const GetNextRequestID = async (username: string) => {
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

export const getDynamicGlobalProperties = async (
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

export const fromHP = (
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
  console.log(
    'Parsed: ',
    vesting_fund_hive.toString(),
    vesting_shares.toString(),
  );
  var res = math.multiply(math.divide(hp, vesting_fund_hive), vesting_shares);
  return math.format(res, { notation: 'fixed', precision: 6 });
};
