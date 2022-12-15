import { BroadCastResponseType, IHiveAccountUpdateBroadcast, IHiveSignatureInterface, SignResponseType } from '../interfaces';
import { getTimestampInSeconds } from './utils';

export const AccountUpdateBroadcast = (props: IHiveAccountUpdateBroadcast) =>{
  return new Promise<BroadCastResponseType>((resolve,reject) =>{

    const callback = (response:any) => {
      console.log(response)
      if(response.success){
        resolve(response);
      }else{
        reject(response);
      }
    }
  console.log("AccountUpdateBroadcast",props)
  const keychain = window.hive_keychain; 
  keychain.requestBroadcast(props.newAuthorities.account,
    [[ 'account_update',
        props.newAuthorities
      ]], props.targetAuthorityType, callback
      )
})
}

export const RequestSignature = (username: string) => {
  return new Promise<SignResponseType>((resolve, reject) => {
    const callback = (response: SignResponseType) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(response);
      }
    };
    const sigObj = createSignatureObject(username, callback);
    window.hive_keychain.requestSignBuffer(
      sigObj.username,
      JSON.stringify(sigObj.message),
      sigObj.key,
      sigObj.responseCallback,
    );
  });
};

const createSignatureObject = (
  username: string,
  setValidLogIn: Function,
): IHiveSignatureInterface => {
  return {
    username: username,
    message: {
      username: username,
      timestamp: getTimestampInSeconds(),
      message: 'sign in from hive multisig',
    },
    key: 'Posting',
    responseCallback: setValidLogIn,
  };
};
