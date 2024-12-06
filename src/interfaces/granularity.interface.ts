export interface State {
  proceedIntro: boolean;
  proceedConfiguration: boolean;
  proceedMultisig: boolean;
  isManageGranularity: boolean;
  bots: { botName: string; type: string; keyType: string }[];
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
  activeHasExistingGBot: boolean;
  postingHasExistingGBot: boolean;
  proceedSetupConfirmation: boolean;
  proceedRemoval: boolean;
  initialSetupFlag: boolean;
}

export interface GBotTabProp {
  isManageGranularity: boolean;
}

export interface Operation {
  operationName: string;
  id?: string[];
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

export enum ActiveOperationName {
  TRANSFER = 'transfer',
  TRANSFER_TO_VESTING = 'transfer_to_vesting',
  WITHDRAW_VESTING = 'withdraw_vesting',
  LIMIT_ORDER_CREATE = 'limit_order_create',
  LIMIT_ORDER_CANCEL = 'limit_order_cancel',
  CONVERT = 'convert',
  ACCOUNT_CREATE = 'account_create',
  ACCOUNT_UPDATE = 'account_update',
  WITNESS_UPDATE = 'witness_update',
  ACCOUNT_WITNESS_VOTE = 'account_witness_vote',
  ACCOUNT_WITNESS_PROXY = 'account_witness_proxy',
  SET_WITHDRAW_VESTING_ROUTE = 'set_withdraw_vesting_route',
  LIMIT_ORDER_CREATE2 = 'limit_order_create2',
  CLAIM_ACCOUNT = 'claim_account',
  CREATE_CLAIMED_ACCOUNT = 'create_claimed_account',
  ESCROW_TRANSFER = 'escrow_transfer',
  ESCROW_DISPUTE = 'escrow_dispute',
  ESCROW_RELEASE = 'escrow_release',
  ESCROW_APPROVE = 'escrow_approve',
  TRANSFER_TO_SAVINGS = 'transfer_to_savings',
  TRANSFER_FROM_SAVINGS = 'transfer_from_savings',
  CANCEL_TRANSFER_FROM_SAVINGS = 'cancel_transfer_from_savings',
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

export enum PostingOperationName {
  VOTE = 'vote',
  COMMENT = 'comment',
  FEED_PUBLISH = 'feed_publish',
  DELETE_COMMENT = 'delete_comment',
  COMMENT_OPTIONS = 'comment_options',
  CLAIM_REWARD_BALANCE = 'claim_reward_balance',
}

export enum CommonOperationName {
  ALL = 'all',
  CHANGE_CONFIG = 'change_config',
  CUSTOM = 'custom',
  CUSTOM_JSON = 'custom_json',
  CUSTOM_BINARY = 'custom_binary',
}

export enum OperationName {
  //common
  ALL = 'all',
  CHANGE_CONFIG = 'change_config',
  CUSTOM = 'custom',
  CUSTOM_JSON = 'custom_json',
  CUSTOM_BINARY = 'custom_binary',

  //active
  TRANSFER = 'transfer',
  TRANSFER_TO_VESTING = 'transfer_to_vesting',
  WITHDRAW_VESTING = 'withdraw_vesting',
  LIMIT_ORDER_CREATE = 'limit_order_create',
  LIMIT_ORDER_CANCEL = 'limit_order_cancel',
  CONVERT = 'convert',
  ACCOUNT_CREATE = 'account_create',
  ACCOUNT_UPDATE = 'account_update',
  WITNESS_UPDATE = 'witness_update',
  ACCOUNT_WITNESS_VOTE = 'account_witness_vote',
  ACCOUNT_WITNESS_PROXY = 'account_witness_proxy',
  SET_WITHDRAW_VESTING_ROUTE = 'set_withdraw_vesting_route',
  LIMIT_ORDER_CREATE2 = 'limit_order_create2',
  CLAIM_ACCOUNT = 'claim_account',
  CREATE_CLAIMED_ACCOUNT = 'create_claimed_account',
  ESCROW_TRANSFER = 'escrow_transfer',
  ESCROW_DISPUTE = 'escrow_dispute',
  ESCROW_RELEASE = 'escrow_release',
  ESCROW_APPROVE = 'escrow_approve',
  TRANSFER_TO_SAVINGS = 'transfer_to_savings',
  TRANSFER_FROM_SAVINGS = 'transfer_from_savings',
  CANCEL_TRANSFER_FROM_SAVINGS = 'cancel_transfer_from_savings',
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

  //posting
  VOTE = 'vote',
  COMMENT = 'comment',
  FEED_PUBLISH = 'feed_publish',
  DELETE_COMMENT = 'delete_comment',
  COMMENT_OPTIONS = 'comment_options',
  CLAIM_REWARD_BALANCE = 'claim_reward_balance',
}
