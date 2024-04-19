import * as hiveTx from 'hive-tx';
import { IExpiration } from '../interfaces/transaction.interface';
import { getSeconds } from './utils';

const createTx = (operations: any[], expiration: IExpiration) => {
  const _hiveTx = new hiveTx.Transaction();
  return _hiveTx.create(operations, getSeconds(expiration)).then((res) => {
    return res;
  });
};

const HiveTxUtils = {
  createTx,
};
export default HiveTxUtils;
