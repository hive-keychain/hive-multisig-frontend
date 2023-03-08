import * as Hive from '@hiveio/dhive';
import * as hiveTx from 'hive-tx';
import * as math from 'mathjs';
import { Dispatch, SetStateAction } from 'react';
import {
  BroadCastResponseType,
  IHiveAccountUpdateBroadcast,
  IHiveSignatureInterface,
  SignResponseType,
} from '../interfaces';
import { ErrorMessage } from '../interfaces/errors.interface';
import { IExpiration } from '../interfaces/transaction.interface';
import { getSeconds, getTimestampInSeconds } from './utils';
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

export const RequestSignTx = async (
  username: string,
  operation: object,
  expiration: IExpiration,
  setErrorMessage: Dispatch<SetStateAction<ErrorMessage>>,
  key: string = 'Active',
) => {
  return new Promise<boolean>(async (resolve, reject) => {
    let signTxResult = false;
    let verifyAuthResult = false;
    let broadcastResult = false;
    let transaction: object;
    const _hiveTx = new hiveTx.Transaction();
    try {
      transaction = await _hiveTx.create([operation], getSeconds(expiration));
    } catch (error) {
      setErrorMessage({
        Title: 'HiveTx Error: ',
        Code: '',
        ErrorName: 'Transaction Creation:',
        ErrorMessage: error,
      });
      reject(false);
    }
    window.hive_keychain.requestSignTx(
      username,
      transaction,
      key,
      async (response: any) => {
        if (response.error) {
          setErrorMessage({
            Title: 'Keychain Signing Error',
            Code: '',
            ErrorName: response.error.jse_info.message,
            ErrorMessage: response.error.jse_shortmsg,
          });
          reject(false);
        } else {
          signTxResult = response.success;
          try {
            const resp = await client.database.verifyAuthority(response.result);
            verifyAuthResult = resp;
          } catch (error) {
            setErrorMessage({
              Title: 'Authority Verification Error',
              Code: '',
              ErrorName: error.jse_info.message,
              ErrorMessage: error.jse_shortmsg,
            });
            reject(false);
          }
          try {
            const resp: Hive.TransactionConfirmation =
              await client.broadcast.send(response.result);
            broadcastResult = resp ? true : false;
          } catch (error) {
            setErrorMessage({
              Title: 'Broadcasting Error',
              Code: '',
              ErrorName: error.jse_info.message,
              ErrorMessage: error.jse_shortmsg,
            });
            reject(false);
          }

          if (signTxResult && verifyAuthResult && broadcastResult) {
            resolve(true);
          }
        }
      },
    );
  });
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
  var res = math.multiply(math.divide(hp, vesting_fund_hive), vesting_shares);
  return math.format(res, { notation: 'fixed', precision: 6 });
};
