import * as Hive from '@hiveio/dhive';

export type Authorities = {
  account:string
  owner:  Hive.AuthorityType;
  active: Hive.AuthorityType;
  posting: Hive.AuthorityType;
  memo_key: string|Hive.PublicKey;
  json_metadata: string;
}

export interface IUpdateAuthorities{
  action?: string
  authorities: Authorities
  newValue?: [string | Hive.PublicKey,number]
  targetAuthority: Hive.Authority
  targetAuthType: string | UPDATE_TARGET_AUTHORITY
  targetAccountType: string | UPDATE_TARGET
  targetAuthAccount: [string | Hive.PublicKey,number]
}

export enum UPDATE_TARGET{
  ACCOUNT = 'account',
  KEY = 'key',
}

export enum UPDATE_TARGET_AUTHORITY{
  OWNER = 'Owner',
  ACTIVE = 'Active',
  POSTING = 'Posting'
}