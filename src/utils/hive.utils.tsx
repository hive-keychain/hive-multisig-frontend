import { Client } from "@hiveio/dhive";
import { LocalAccount } from "../interfaces/local-account.interface";


const client = new Client(["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network"]);

const getAccount = async(username: string) => {
    return client.database.getAccounts([username]);
 }

 const AccountUtils = {
    getAccount
 }

 export default AccountUtils;