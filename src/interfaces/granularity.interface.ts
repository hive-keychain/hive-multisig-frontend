export interface State {
  proceedIntro: boolean;
  proceedConfiguration: boolean;
  hasDefaultBot: boolean;
  proceedMultisig: boolean;
  isManageGranularity: boolean;
  bots: string[][];
  addedBot: [string, number];
  removedBot: [string, number];
  botSetupSuccess: boolean;
  removeBotSuccess: boolean;
  updateThreshSuccess: boolean;
  updateWeightSuccess: boolean;
  transactionSubmitted: boolean;
  isMultisigTransaction: boolean;
  configuration: MultisigGbotConfig;
  newConfiguration: MultisigGbotConfig;
}

export interface GBotTabProp {
  isManageGranularity: boolean;
}

export interface Operation {
  operationName: string;
}

export interface Configuration {
  authority?: string;
  operations: Operation[];
}

export interface MultisigGbotConfig {
  id: string;
  json: {
    configurations: Configuration[];
  };
}

export enum OperationName {
  ALL = 'all',
  CHANGE_CONFIG = 'custom_json',
  VOTE = 'vote',
  COMMENT = 'comment',
  TRANSFER = 'transfer',
  TRANSFER_TO_VESTING = 'transfer_to_vesting',
  WITHDRAW_VESTING = 'withdraw_vesting',
  LIMIT_ORDER_CREATE = 'limit_order_create',
  LIMIT_ORDER_CANCEL = 'limit_order_cancel',
  FEED_PUBLISH = 'feed_publish',
  CONVERT = 'convert',
  ACCOUNT_CREATE = 'account_create',
  ACCOUNT_UPDATE = 'account_update',
  WITNESS_UPDATE = 'witness_update',
  ACCOUNT_WITNESS_VOTE = 'account_witness_vote',
  ACCOUNT_WITNESS_PROXY = 'account_witness_proxy',
  POW = 'pow',
  CUSTOM = 'custom',
  REPORT_OVER_PRODUCTION = 'report_over_production',
  DELETE_COMMENT = 'delete_comment',
  CUSTOM_JSON = 'custom_json',
  COMMENT_OPTIONS = 'comment_options',
  SET_WITHDRAW_VESTING_ROUTE = 'set_withdraw_vesting_route',
  LIMIT_ORDER_CREATE2 = 'limit_order_create2',
  CLAIM_ACCOUNT = 'claim_account',
  CREATE_CLAIMED_ACCOUNT = 'create_claimed_account',
  REQUEST_ACCOUNT_RECOVERY = 'request_account_recovery',
  RECOVER_ACCOUNT = 'recover_account',
  CHANGE_RECOVERY_ACCOUNT = 'change_recovery_account',
  ESCROW_TRANSFER = 'escrow_transfer',
  ESCROW_DISPUTE = 'escrow_dispute',
  ESCROW_RELEASE = 'escrow_release',
  POW2 = 'pow2',
  ESCROW_APPROVE = 'escrow_approve',
  TRANSFER_TO_SAVINGS = 'transfer_to_savings',
  TRANSFER_FROM_SAVINGS = 'transfer_from_savings',
  CANCEL_TRANSFER_FROM_SAVINGS = 'cancel_transfer_from_savings',
  CUSTOM_BINARY = 'custom_binary',
  DECLINE_VOTING_RIGHTS = 'decline_voting_rights',
  RESET_ACCOUNT = 'reset_account',
  SET_RESET_ACCOUNT = 'set_reset_account',
  CLAIM_REWARD_BALANCE = 'claim_reward_balance',
  DELEGATE_VESTING_SHARES = 'delegate_vesting_shares',
  ACCOUNT_CREATE_WITH_DELEGATION = 'account_create_with_delegation',
  WITNESS_SET_PROPERTIES = 'witness_set_properties',
  ACCOUNT_UPDATE2 = 'account_update2',
  CREATE_PROPOSAL = 'create_proposal',
  UPDATE_PROPOSAL_VOTES = 'update_proposal_votes',
  REMOVE_PROPOSAL = 'remove_proposal',
  UPDATE_PROPOSAL = 'update_proposal',
  COLLATERALIZED_CONVERT = 'collateralized_convert',
  RECURRENT_TRANSFER = 'recurrent_transfer',
}
