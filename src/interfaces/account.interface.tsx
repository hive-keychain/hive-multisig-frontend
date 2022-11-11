import * as Hive from '@hiveio/dhive';

export type KeyAuth = {
  key: string  | Hive.PublicKey;
  weight: number | null;
}

export type Authority ={ KeyAuth: KeyAuth[], WeighThreshold: number }


export type Keys = {
    owner?:  KeyAuth[];
    active?: KeyAuth[];
    posting?: KeyAuth[];
}

export type Account = {
    name: string;
    keys: Keys;
}