import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import * as _ from 'lodash';
import { Authorities, BroadCastResponseType } from '../../../interfaces';
import { IAccountKeyRowProps } from '../../../interfaces/cardInterfaces';
import {
  deleteAccount,
  deleteKey,
  dhiveBroadcastUpdateAccount,
  hiveKeyChainRequestBroadCast,
  setThresholdWarning,
  updateActive,
} from './updateAuthoritiesThunks';
export type AuthorityUpdateStateType = {
  Authorities: Authorities;
  NewAuthorities: Authorities;
  isUpdateSucces: boolean;
  updateCount: number;
  isOwnerAuthUpdated: boolean;
  isActiveAuthUpdated: boolean;
  isPostingAuthUpdated: boolean;
  ownerAuthUpdateCount: number;
  ownerKey?: string;
  error: string;
  thresholdWarning?: string;
};

const initialState: AuthorityUpdateStateType = {
  Authorities: null,
  NewAuthorities: null,
  isUpdateSucces: undefined,
  updateCount: 0,
  isOwnerAuthUpdated: false,
  isActiveAuthUpdated: false,
  isPostingAuthUpdated: false,
  ownerKey: '',
  ownerAuthUpdateCount: 0,
  error: '',
  thresholdWarning: '',
};

const updateAuthoritySlice = createSlice({
  name: 'updateAuthority',
  initialState,
  reducers: {
    initializeAuthorities(state, action: PayloadAction<Authorities>) {
      state.Authorities = structuredClone(action.payload);
      state.NewAuthorities = structuredClone(action.payload);
    },
    updateAccount(state, action: PayloadAction<IAccountKeyRowProps>) {
      switch (action.payload.authorityName.toLowerCase()) {
        case 'owner':
          action.payload.type.toLowerCase() === 'accounts'
            ? state.NewAuthorities.owner.account_auths.find((pair) => {
                if (pair[0] === action.payload.accountKeyAuth[0]) {
                  pair[1] = action.payload.accountKeyAuth[1];
                }
              })
            : action.payload.type.toLowerCase() === 'keys'
            ? state.NewAuthorities.owner.key_auths.find((pair) => {
                if (pair[0] === action.payload.accountKeyAuth[0]) {
                  pair[1] = action.payload.accountKeyAuth[1];
                }
              })
            : action.payload.type.toLowerCase() === 'threshold'
            ? (state.NewAuthorities.owner.weight_threshold =
                action.payload.threshold)
            : state;
          break;
        case 'active':
          action.payload.type.toLowerCase() === 'accounts'
            ? state.NewAuthorities.active.account_auths.find((pair) => {
                if (pair[0] === action.payload.accountKeyAuth[0]) {
                  pair[1] = action.payload.accountKeyAuth[1];
                }
              })
            : action.payload.type.toLowerCase() === 'keys'
            ? state.NewAuthorities.active.key_auths.find((pair) => {
                if (pair[0] === action.payload.accountKeyAuth[0]) {
                  pair[1] = action.payload.accountKeyAuth[1];
                }
              })
            : action.payload.type.toLowerCase() === 'threshold'
            ? (state.NewAuthorities.active.weight_threshold =
                action.payload.threshold)
            : state;
          break;
        case 'posting':
          action.payload.type.toLowerCase() === 'accounts'
            ? state.NewAuthorities.posting.account_auths.find((pair) => {
                if (pair[0] === action.payload.accountKeyAuth[0]) {
                  pair[1] = action.payload.accountKeyAuth[1];
                }
              })
            : action.payload.type.toLowerCase() === 'keys'
            ? state.NewAuthorities.posting.key_auths.find((pair) => {
                if (pair[0] === action.payload.accountKeyAuth[0]) {
                  pair[1] = action.payload.accountKeyAuth[1];
                }
              })
            : action.payload.type.toLowerCase() === 'threshold'
            ? (state.NewAuthorities.posting.weight_threshold =
                action.payload.threshold)
            : state;
          break;
      }
      state.isOwnerAuthUpdated = !_.isEqual(
        state.NewAuthorities.owner,
        state.Authorities.owner,
      );
      state.isActiveAuthUpdated = !_.isEqual(
        state.NewAuthorities.active,
        state.Authorities.active,
      );
      state.isPostingAuthUpdated = !_.isEqual(
        state.NewAuthorities.posting,
        state.Authorities.posting,
      );
    },
    addAccount(state, action: PayloadAction<IAccountKeyRowProps>) {
      switch (action.payload.authorityName.toLowerCase()) {
        case 'owner':
          action.payload.type.toLowerCase() === 'accounts'
            ? (state.NewAuthorities.owner.account_auths = [
                ...state.NewAuthorities.owner.account_auths,
                action.payload.accountKeyAuth,
              ])
            : action.payload.type.toLowerCase() === 'keys'
            ? (state.NewAuthorities.owner.key_auths = [
                ...state.NewAuthorities.owner.key_auths,
                action.payload.accountKeyAuth,
              ])
            : state;
          break;
        case 'active':
          action.payload.type.toLowerCase() === 'accounts'
            ? (state.NewAuthorities.active.account_auths = [
                ...state.NewAuthorities.active.account_auths,
                action.payload.accountKeyAuth,
              ])
            : action.payload.type.toLowerCase() === 'keys'
            ? (state.NewAuthorities.active.key_auths = [
                ...state.NewAuthorities.active.key_auths,
                action.payload.accountKeyAuth,
              ])
            : state;
          break;
        case 'posting':
          action.payload.type.toLowerCase() === 'accounts'
            ? (state.NewAuthorities.posting.account_auths = [
                ...state.NewAuthorities.posting.account_auths,
                action.payload.accountKeyAuth,
              ])
            : action.payload.type.toLowerCase() === 'keys'
            ? (state.NewAuthorities.posting.key_auths = [
                ...state.NewAuthorities.posting.key_auths,
                action.payload.accountKeyAuth,
              ])
            : state;
          break;
      }
      state.isOwnerAuthUpdated = !_.isEqual(
        state.NewAuthorities.owner,
        state.Authorities.owner,
      );
      state.isActiveAuthUpdated = !_.isEqual(
        state.NewAuthorities.active,
        state.Authorities.active,
      );
      state.isPostingAuthUpdated = !_.isEqual(
        state.NewAuthorities.posting,
        state.Authorities.posting,
      );
    },

    setOwnerKey(state, action: PayloadAction<string>) {
      state.ownerKey = action.payload;
    },
    resetState: () => initialState,
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
    builder.addCase(dhiveBroadcastUpdateAccount.fulfilled, (state, action) => {
      state.Authorities = null;
      state.isUpdateSucces = true;
      state.updateCount++;
      state.error = '';
    });
    builder.addCase(dhiveBroadcastUpdateAccount.rejected, (state, action) => {
      state.Authorities = null;
      state.isUpdateSucces = false;
      state.error = 'DHive Update Error';
    });
    builder.addCase(
      updateAuthoritySlice.actions.resetState,
      () => initialState,
    );

    builder.addCase(deleteAccount.fulfilled, (state, action) => {
      state.NewAuthorities = action.payload;
      state.isOwnerAuthUpdated = !_.isEqual(
        state.NewAuthorities.owner,
        state.Authorities.owner,
      );
      state.isActiveAuthUpdated = !_.isEqual(
        state.NewAuthorities.active,
        state.Authorities.active,
      );
      state.isPostingAuthUpdated = !_.isEqual(
        state.NewAuthorities.posting,
        state.Authorities.posting,
      );
    });

    builder.addCase(deleteKey.fulfilled, (state, action) => {
      state.NewAuthorities = action.payload;
      state.isOwnerAuthUpdated = !_.isEqual(
        state.NewAuthorities.owner,
        state.Authorities.owner,
      );
      state.isActiveAuthUpdated = !_.isEqual(
        state.NewAuthorities.active,
        state.Authorities.active,
      );
      state.isPostingAuthUpdated = !_.isEqual(
        state.NewAuthorities.posting,
        state.Authorities.posting,
      );
    });
    builder.addCase(updateActive.fulfilled, (state, action) => {
      state.NewAuthorities.active = { ...action.payload };
    });

    builder.addCase(setThresholdWarning.fulfilled, (state, action) => {
      state.thresholdWarning = action.payload;
    });
  },
});

export default updateAuthoritySlice.reducer;
export const {
  initializeAuthorities,
  updateAccount,
  setOwnerKey,
  addAccount,
  resetState,
} = updateAuthoritySlice.actions;
export const updateAuthorityActions = updateAuthoritySlice.actions;
