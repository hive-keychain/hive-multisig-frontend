import * as Hive from '@hiveio/dhive';

export type KeyAuth = {
  key: string  | Hive.PublicKey;
  weightThreshold: number | null;
}

export type Keys = {
    owner?:  KeyAuth[];
    active?:  KeyAuth[];
    posting?: KeyAuth[];
}

export type Account = {
    name: string;
    keys: Keys;
}