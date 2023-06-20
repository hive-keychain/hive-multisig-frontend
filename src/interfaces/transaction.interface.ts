import * as Hive from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { SocketMessageCommand } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
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
export interface ITransaction {
  txName?: String | OperationType;
  authority?: Hive.AuthorityType;
  username: string;
  method: KeychainKeyTypes;
}

export interface State extends ITransaction {
  process: string | SocketMessageCommand;
  response: object | string | boolean;
  loading: boolean;
  success: boolean;
  error: string;
}
export interface IExpiration {
  days: number;
  hours: number;
  minutes: number;
}

export interface TransactionMessage extends ITransaction {
  username: string;
  tx: Transaction;
}
