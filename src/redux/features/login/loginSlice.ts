import {createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { rejects } from 'assert'
import { IHiveSignatureInterface, SignBufferMessageObject } from '../../../interfaces/hive-keychain.interface'
import { getTimestampInSeconds } from '../../../utils/utils'

export enum LoginState {
    SIGNATURE_REQUESTED = "SIGNATURE_REQUESTED",
    SIGNATURE_SUCCEEDED = "SIGNATURE_SUCCEEDED",
    SIGNATURE_FAILED = "SIGNATURE_FAILED"
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

export type LoginStateType = {
    loginState: LoginState
    isSignatureSuccess: boolean
    accountObject: SignResponseType
    error: string
}
const initialState: LoginStateType = {
    loginState: null,
    isSignatureSuccess: false,
    accountObject: null,
    error: ''
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
const requestSignature = (username:string) => {
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

export const hiveKeyChainRequestSign = createAsyncThunk(
    'login/request',
    async(username:string) =>{
        const response = await requestSignature(username)
        return response
    } 
    
)

const loginSclice = createSlice({
    name: 'login',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(
            hiveKeyChainRequestSign.fulfilled,
            (state, action: PayloadAction<SignResponseType>) => {
                if(action.payload.success){
                    state.loginState = LoginState.SIGNATURE_SUCCEEDED
                    state.isSignatureSuccess =action.payload.success
                    state.accountObject = action.payload
                    state.error = ''
                }
            }
        )
        builder.addCase(
            hiveKeyChainRequestSign.rejected, (state,action) =>{
                state.loginState = LoginState.SIGNATURE_FAILED
                state.isSignatureSuccess = false
                state.accountObject =  null
                state.error = "Signing Error"
            }
        )
    }
})

export default loginSclice.reducer