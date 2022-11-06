import { LocalAccount } from "./local-account.interface";

export interface Accounts {
  list: LocalAccount[];
  hash?: string;
}
