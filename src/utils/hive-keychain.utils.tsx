import { delay } from "./utils";
import { IHiveSignatureInterface } from "../interfaces/hive-keychain.interface";



export const CheckKeychain= async(setKeychainState:Function)=>{
    await delay(500);
    if(window.hive_keychain){
        setKeychainState(true);
    }
    else{
        setKeychainState(false);
    }
}

export const RequestSign = (props:IHiveSignatureInterface):void =>{
    window.hive_keychain.requestSignBuffer(
        props.username,
        JSON.stringify(props.message),
        props.key,
        props.responseCallback
        )
}