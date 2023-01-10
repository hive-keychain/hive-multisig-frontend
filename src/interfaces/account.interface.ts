import * as Hive from '@hiveio/dhive';

export type Authorities = {
  account:string
  owner:  Hive.AuthorityType;
  active: Hive.AuthorityType;
  posting: Hive.AuthorityType;
  memo_key: string|Hive.PublicKey;
  json_metadata: string;
}

export interface IUpdateAuthorityWeight{
  action?: string
  authorities: Authorities
  newValue?: [string | Hive.PublicKey,number]
  targetAuthority: Hive.Authority
  targetAuthType: string | UPDATE_TARGET_AUTHORITY_TYPE
  targetAccountType: string | UPDATE_TARGET_ACCOUNT_TYPE
  targetAuthAccount: [string | Hive.PublicKey,number]
}

export interface IUpdateAuthorityThreshold{
  authorities: Authorities
  targetAuthType: string | UPDATE_TARGET_AUTHORITY_TYPE
  targetAuthority: Hive.Authority
  currentThreshold: number
}
export enum UPDATE_TARGET_ACCOUNT_TYPE{
  ACCOUNT = 'account',
  KEY = 'key',
}
export enum UPDATE_TARGET_AUTHORITY_TYPE{
  OWNER = 'Owner',
  ACTIVE = 'Active',
  POSTING = 'Posting'
}