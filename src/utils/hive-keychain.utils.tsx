import { delay, getTimestampInSeconds } from "./utils";
import { IHiveSignatureInterface, SignResponseType } from "../interfaces";

export const CheckKeychain= async(setKeychainState:Function)=>{
    await delay(500);
    if(window.hive_keychain){
        setKeychainState(true);
    }
    else{
        setKeychainState(false);
    }
}

export const RequestSignature = (username:string) => {
    return   new Promise<SignResponseType>((resolve, reject) => {
      const callback = (response:SignResponseType) =>{
             if(response.success){
                  resolve(response);
             }else{
                  reject(response)
             }
         }
         const sigObj = createSignatureObject(username,callback)
         window.hive_keychain.requestSignBuffer(
             sigObj.username,
             JSON.stringify(sigObj.message),
             sigObj.key,
             sigObj.responseCallback)
     })
  }


  const createSignatureObject = (username:string, setValidLogIn: Function):IHiveSignatureInterface => {
    return {
        username: username,
        message: {
            username: username,
            timestamp: getTimestampInSeconds(),
            message: 'sign in from hive multisig'
        },
        key: 'Posting',
        responseCallback: setValidLogIn
    }
}
