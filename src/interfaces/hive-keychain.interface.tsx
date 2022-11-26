 declare global {
    interface Window { 
      hive_keychain: any;
    }
  }
  
export type SignBufferMessageObject = {
    username:string,
    timestamp:number,
    message:string
}

export interface IHiveSignatureInterface{
    username:string,
    message:SignBufferMessageObject,
    key:string,
    responseCallback: Function,
    rpc?:string,
    title?:string
}
