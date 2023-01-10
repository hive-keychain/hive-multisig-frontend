import * as Hive from '@hiveio/dhive';

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
isLoggedIn?:boolean;
componentColor?:string;
}

export interface IAuthorityCardProps {
authorityName: string;
authority: Hive.AuthorityType;
}