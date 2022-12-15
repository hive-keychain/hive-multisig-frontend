import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IAccountKeysCardProps } from "../../../components/cards/AuthorityCard"
import { Authorities, BroadCastResponseType, IDHiveAccountUpdateBroadcast, IHiveAccountUpdateBroadcast } from "../../../interfaces"
import { AccountUpdateBroadcast } from "../../../utils/hive-keychain.utils"
import { BroadcastUpdateAccount } from "../../../utils/hive.utils"

export type AuthorityStateType = {
    Authorities: Authorities
    isUpdateSucces: boolean,
    error: string
}

const initialState: AuthorityStateType = {
    Authorities: null,
    isUpdateSucces: false,
    error: ''
}


export const hiveKeyChainRequestBroadCast = createAsyncThunk(
    'updateAuthority/hiveBroadcast',
    async(props:IHiveAccountUpdateBroadcast) => {
        const response = await AccountUpdateBroadcast(props)
        return response;
    }
)

export const dhiveBroadcastUpdateAccount = createAsyncThunk(
  'updateAuthority/dhiveBroadcast',
  async(props:IDHiveAccountUpdateBroadcast) => {
    const response = await BroadcastUpdateAccount(props)
    return response;
  }
)

const updateAuthoritySlice = createSlice({
    name: 'updateAuthority',
    initialState,
    reducers: {
      initializeAuthorities(state, action: PayloadAction<Authorities>){
        state.Authorities = action.payload
      },
      updateAccount(state, action: PayloadAction<IAccountKeysCardProps> ){
        switch(action.payload.authorityName.toLowerCase()){
          case "owner":
            action.payload.authAccountType.toLowerCase() === 'account'?
            state.Authorities.owner.account_auths = action.payload.accountKeyAuths
            :state.Authorities.owner.key_auths = action.payload.accountKeyAuths
            break;
          case "active":
            action.payload.authAccountType.toLowerCase() === 'active'?
            state.Authorities.active.account_auths = action.payload.accountKeyAuths
            :state.Authorities.owner.key_auths = action.payload.accountKeyAuths
            break;
          case "posting":
            action.payload.authAccountType.toLocaleLowerCase() ==='posting'?
            state.Authorities.posting.account_auths = action.payload.accountKeyAuths
            :state.Authorities.posting.account_auths = action.payload.accountKeyAuths
            break;
        }
      }

    },
    extraReducers: (builder) => {
        builder.addCase(
            hiveKeyChainRequestBroadCast.fulfilled,
            (state, action: PayloadAction<BroadCastResponseType>) => {
              if (action.payload.success) {
                state.Authorities =  null;
                state.isUpdateSucces = true;
                state.error = '';
              }
            },
          );
          builder.addCase(
            hiveKeyChainRequestBroadCast.rejected,
            (state, action) => {
                state.Authorities = null;
                state.isUpdateSucces = false;
                state.error = 'Hive Keychain Update Error';
            },
          );
          builder.addCase(
            dhiveBroadcastUpdateAccount.fulfilled,
            (state, action: PayloadAction<any>) => {
              state.Authorities = null;
              state.isUpdateSucces = true;
              state.error = '';
            }
          );
          builder.addCase(
            dhiveBroadcastUpdateAccount.rejected,
            (state, action) => {
              state.Authorities = null;
                state.isUpdateSucces = false;
                state.error = 'DHive Update Error';
            }
          )
    }
})

export default updateAuthoritySlice.reducer;
export const {initializeAuthorities, updateAccount} = updateAuthoritySlice.actions