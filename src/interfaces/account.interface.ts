import * as Hive from '@hiveio/dhive';

export type Authorities = {
  owner?:  Hive.Authority;
  active?: Hive.Authority;
  posting?: Hive.Authority;
}
