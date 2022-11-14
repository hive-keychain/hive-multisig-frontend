import { Client } from "@hiveio/dhive";
import * as Hive from '@hiveio/dhive';
import Toast from "react-bootstrap/esm/Toast";
import { Authorities } from "../interfaces/account.interface";
const client = new Client(["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network"]);


const getAccount = async(username: string) => {
    return client.database.getAccounts([username]);
}

const getAccountAuthorities = async(username: string) => {
   let  keys: Authorities = {
      owner: null,
      active: null,
      posting: null,
   }
   const account = await getAccount(username);
   if(account.length === 0){return keys;}
   keys = {
      owner: account[0].owner,
      active: account[0].active,
      posting: account[0].posting,   
   }
   return keys;
}

const AccountUtils = {
    getAccount,
    getAccountAuthorities
}

 export default AccountUtils;