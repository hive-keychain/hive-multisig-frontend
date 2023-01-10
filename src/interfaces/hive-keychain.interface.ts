import { Authorities } from "./account.interface";

 declare global {
    interface Window { 
      hive_keychain: any;
    }
  }

export type SignResponseDataType ={
    key: string
    message: string
    method: string
    rpc: string
    title: string
    type: string
    username: string
}
export type SignResponseType = {
    error: string
    message: string
    publiKey: string
    request_id: number
    result: string
    success:boolean
    data:  SignResponseDataType
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


export interface IHiveAccountUpdateBroadcast{
  newAuthorities: Authorities
  targetAuthorityType: string
}


export type BroadCastResponseType = {
  error: string
  message: string
  publiKey: string
  request_id: number
  result: string
  success:boolean
  data:  SignResponseDataType
}
