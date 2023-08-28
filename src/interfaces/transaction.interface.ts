import * as Hive from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { Transaction } from 'hive-tx';

export enum OperationType {
  TRANSFER = 'transfer',
  DELEGATE = 'delegate',
  POWER_UP = 'power_up',
  POWER_DOWN = 'power_down',
  DEPOSIT_TO_SAVINGS = 'deposit_to_savings',
  WITHDRAW_FROM_SAVING = 'withdraw_from_savings',
  VOTE_FOR_WITNESS = 'vote_for_witness',
  ACCOUNT_WITNESS_PROXY = 'account_witness_proxy',
  UPDATE_PROPOSAL_VOTE = 'update_proposal_vote',
  RECURRENT_TRANSFER = 'recurrent_transfer',
  BROADCAST_JSON = 'broadcast_json',
  VOTE = 'vote',
  BLOG = 'blog_post',
  COMMENT = 'comment',
}
export interface Initiator {
  username: string;
  publicKey: string;
  weight: number;
}
export interface ITransaction {
  txName?: String | OperationType;
  operation?: object;
  authority?: Hive.AuthorityType;
  initiator?: Initiator;
  username: string;
  expiration: IExpiration;
  method: KeychainKeyTypes;
}

export interface State extends ITransaction {
  process: string;
  response: object | string | boolean;
  loading: boolean;
  success: boolean;
  error: string;
}
export interface IExpiration {
  days: number;
  hours: number;
  minutes: number;
  date?: string;
}

export interface TransactionMessage extends ITransaction {
  username: string;
  tx: Transaction;
}
