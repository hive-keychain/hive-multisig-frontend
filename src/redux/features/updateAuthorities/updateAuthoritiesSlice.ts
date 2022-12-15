import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as _ from 'lodash';
import { IAccountKeysCardProps } from '../../../components/cards/AuthorityCard';
import {
  Authorities,
  BroadCastResponseType,
  IDHiveAccountUpdateBroadcast,
  IHiveAccountUpdateBroadcast,
} from '../../../interfaces';
import { AccountUpdateBroadcast } from '../../../utils/hive-keychain.utils';
import { BroadcastUpdateAccount } from '../../../utils/hive.utils';
export type AuthorityUpdateStateType = {
  Authorities: Authorities;
  NewAuthorities: Authorities;
  isUpdateSucces: boolean;
  updateCount: number;
  isOwnerAuthUpdated: boolean;
  ownerAuthUpdateCount: number;
  error: string;
};

const initialState: AuthorityUpdateStateType = {
  Authorities: null,
  NewAuthorities: null,
  isUpdateSucces: false,
  updateCount: 0,
  isOwnerAuthUpdated: false,
  ownerAuthUpdateCount: 0,
  error: '',
};

export const hiveKeyChainRequestBroadCast = createAsyncThunk(
  'updateAuthority/hiveBroadcast',
  async (props: IHiveAccountUpdateBroadcast) => {
    const response = await AccountUpdateBroadcast(props);
    return response;
  },
);

export const dhiveBroadcastUpdateAccount = createAsyncThunk(
  'updateAuthority/dhiveBroadcast',
  async (props: IDHiveAccountUpdateBroadcast) => {
    const response = await BroadcastUpdateAccount(props);
    return response;
  },
);

const updateAuthoritySlice = createSlice({
  name: 'updateAuthority',
  initialState,
  reducers: {
    initializeAuthorities(state, action: PayloadAction<Authorities>) {
      state.Authorities = action.payload;
      state.NewAuthorities = action.payload;
    },
    updateAccount(state, action: PayloadAction<IAccountKeysCardProps>) {
      switch (action.payload.authorityName.toLowerCase()) {
        case 'owner':
          action.payload.authAccountType.toLowerCase() === 'accounts'
            ? (state.NewAuthorities.owner.account_auths =
                action.payload.accountKeyAuths)
            : (state.NewAuthorities.owner.key_auths =
                action.payload.accountKeyAuths);
          break;
        case 'active':
          action.payload.authAccountType.toLowerCase() === 'accounts'
            ? (state.NewAuthorities.active.account_auths =
                action.payload.accountKeyAuths)
            : (state.NewAuthorities.active.key_auths =
                action.payload.accountKeyAuths);
          break;
        case 'posting':
          action.payload.authAccountType.toLowerCase() === 'accounts'
            ? (state.NewAuthorities.posting.account_auths =
                action.payload.accountKeyAuths)
            : (state.NewAuthorities.posting.key_auths =
                action.payload.accountKeyAuths);
          break;
      }
      state.isOwnerAuthUpdated = !_.isEqual(
        state.NewAuthorities.owner,
        state.Authorities.owner,
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      hiveKeyChainRequestBroadCast.fulfilled,
      (state, action: PayloadAction<BroadCastResponseType>) => {
        if (action.payload.success) {
          state.Authorities = null;
          state.isUpdateSucces = true;
          state.error = '';
        }
      },
    );
    builder.addCase(hiveKeyChainRequestBroadCast.rejected, (state, action) => {
      state.Authorities = null;
      state.isUpdateSucces = false;
      state.error = 'Hive Keychain Update Error';
    });
    builder.addCase(
      dhiveBroadcastUpdateAccount.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.Authorities = null;
        state.isUpdateSucces = true;
        state.error = '';
      },
    );
    builder.addCase(dhiveBroadcastUpdateAccount.rejected, (state, action) => {
      state.Authorities = null;
      state.isUpdateSucces = false;
      state.error = 'DHive Update Error';
    });
  },
});

export default updateAuthoritySlice.reducer;
export const { initializeAuthorities, updateAccount } =
  updateAuthoritySlice.actions;
