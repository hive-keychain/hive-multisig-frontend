import { Authorities } from "./account.interface";

export interface IDHiveAccountUpdateBroadcast {
    newAuthorities: Authorities
    ownerKey: string
}