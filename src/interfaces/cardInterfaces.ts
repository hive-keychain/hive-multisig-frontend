import * as Hive from '@hiveio/dhive';
import { Authorities } from './account.interface';

export interface IAddAccountKeyProps {
  authAccountType: string;
  setNewAccount: Function;
}

export interface IAccountKeysCardProps {
  authorityName: string;
  authAccountType: string;
  accountKeyAuths: [string, number][];
}

export interface IAccountKeyRowProps {
  authorityName: string;
  type: string;
  accountKeyAuth?: [string, number];
  threshold?: number;
  isLoggedIn?: boolean;
  componentColor?: string;
  disableDelete?: boolean;
  enableEdit?: boolean;
}

export interface IAuthorityCardProps {
  authorityName: string;
  authority: Hive.AuthorityType;
}

export interface IDeleteAccount {
  username: string;
  type: string;
  authorities: Authorities;
}

export interface IDeleteKey {
  key: string;
  type: string;
  authorities: Authorities;
}
