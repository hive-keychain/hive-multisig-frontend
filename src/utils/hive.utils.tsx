import { Client } from "@hiveio/dhive";
import * as Hive from '@hiveio/dhive';
import { KeyAuth, Keys } from "../interfaces/account.interface";
import Toast from "react-bootstrap/esm/Toast";

const client = new Client(["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network"]);

let  keys: Keys = {
   owner: [],
   active: [],
   posting: [], 
}
const getAccount = async(username: string) => {
    return client.database.getAccounts([username]);
}

const getAccountAuthorities = async(username: string) => {
   const account = await getAccount(username);
   if(account.length === 0){
      //TODO: return an error here
      return keys;
   }
   const ownerAuth: KeyAuth[]|KeyAuth = await _getAuthorityInfo(account[0].owner)
   const activeAuth: KeyAuth[]|KeyAuth = await _getAuthorityInfo(account[0].active)
   const postingAuth: KeyAuth[]|KeyAuth = await _getAuthorityInfo(account[0].posting)
  
   keys = {
      owner: ownerAuth,
      active: activeAuth,
      posting: postingAuth,   
      // memo: account[0].memo_key
   }
   return keys;
}

const _getAuthorityInfo = async (auth: Hive.Authority) => {
   
   const authoriyInfos: KeyAuth[] = [] ;
  
   auth.account_auths.forEach((account) => {
      const auth: KeyAuth = {
         key: account[0],
         weight: account[1]
      } 
      authoriyInfos.push(auth)
   })

   auth.key_auths.forEach((key) => {
      const auth: KeyAuth = {
         key: key[0],
         weight: key[1]
      }
      authoriyInfos.push(auth)
   })
   
   return authoriyInfos
}

const AccountUtils = {
    getAccount,
    getAccountAuthorities
}

 export default AccountUtils;