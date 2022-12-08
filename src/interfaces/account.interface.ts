import * as Hive from '@hiveio/dhive';

export type Authorities = {
  owner?:  Hive.Authority;
  active?: Hive.Authority;
  posting?: Hive.Authority;
}
export type UpdateAuthorityType = {
  authorityType: string 
  authorities: Hive.Authority
  accountType: string | Hive.PublicKey
  authorityToUpdate: [string,number]
}