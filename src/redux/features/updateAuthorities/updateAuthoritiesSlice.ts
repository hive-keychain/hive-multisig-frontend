import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
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
  }
)

const updateAuthoritySlice = createSlice({
    name: 'updateAuthority',
    initialState,
    reducers: {},
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