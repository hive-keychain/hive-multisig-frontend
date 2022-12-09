   import * as Hive from '@hiveio/dhive';
import { Client } from "@hiveio/dhive";
import { Authorities } from "../interfaces/account.interface";
import { IDHiveAccountUpdateBroadcast } from '../interfaces/dhive.interface';
const client = new Client(["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network"]);

const getAccount = async(username: string) => {
    return client.database.getAccounts([username]);
}

const getAccountAuthorities = async(username: string) => {
   let  keys: Authorities = {
      account:'',
      owner: null,
      active: null,
      posting: null,
      memo_key:'',
      json_metadata:''
   }
   const account = await getAccount(username);
   console.log("from getaccount",account)

   if(account.length === 0){return keys;}
   keys = {
      account: account[0].name,
      owner: account[0].owner,
      active: account[0].active,
      posting: account[0].posting,   
      memo_key: account[0].memo_key,
      json_metadata: account[0].json_metadata
   }
   return keys;
}

const GetAuthorities = async(setAuthorities:Function, setValidUsername:Function, searchKey:string ) => {
   const response = await AccountUtils.getAccountAuthorities(searchKey);
   setAuthorities(response);
   if(response.active || response.owner || response.posting || searchKey === ''){
       setValidUsername(true);
   }else{
       setValidUsername(false);
   }
 }

export const BroadcastUpdateAccount = async(props:IDHiveAccountUpdateBroadcast) => {
   const result = await client.broadcast.updateAccount(
      props.newAuthorities,
      Hive.PrivateKey.from(props.ownerKey),
    );
}

 const AccountUtils = {
    getAccount,
    getAccountAuthorities,
    GetAuthorities,
}

 export default AccountUtils;