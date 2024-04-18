import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import * as _ from 'lodash';
import { Authorities, BroadCastResponseType } from '../../../interfaces';
import { IAccountKeyRowProps } from '../../../interfaces/cardInterfaces';
import {
  addAccountWarning,
  addKeyWarning,
  deleteAccount,
  deleteKey,
  dhiveBroadcastUpdateAccount,
  hiveKeyChainRequestBroadCast,
  removeAccountWarning,
  removeKeyWarning,
  setActiveAuthUpdate,
  setActiveKeyDelete,
  setOwnerAuthUpdate,
  setOwnerKeyDelete,
  setPostingAuthUpdate,
  setPostingKeyDelete,
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
  isOwnerKeyDeleted: boolean;
  isActiveKeyDeleted: boolean;
  isPostingKeyDeleted: boolean;
  ownerAuthUpdateCount: number;
  ownerKey?: string;
  error: string;
  thresholdWarning?: string;
  accountRowWarning?: [string, string][];
  keyRowWarning?: [string, string][];
};

const initialState: AuthorityUpdateStateType = {
  Authorities: null,
  NewAuthorities: null,
  isUpdateSucces: undefined,
  updateCount: 0,
  isOwnerAuthUpdated: false,
  isActiveAuthUpdated: false,
  isPostingAuthUpdated: false,
  isOwnerKeyDeleted: false,
  isActiveKeyDeleted: false,
  isPostingKeyDeleted: false,
  ownerKey: '',
  ownerAuthUpdateCount: 0,
  error: '',
  thresholdWarning: '',
  accountRowWarning: [],
  keyRowWarning: [],
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

    builder.addCase(setOwnerKeyDelete.fulfilled, (state, action) => {
      state.isOwnerKeyDeleted = action.payload;
    });
    builder.addCase(setActiveKeyDelete.fulfilled, (state, action) => {
      state.isActiveKeyDeleted = action.payload;
    });
    builder.addCase(setPostingKeyDelete.fulfilled, (state, action) => {
      state.isPostingKeyDeleted = action.payload;
    });

    builder.addCase(setOwnerAuthUpdate.fulfilled, (state, action) => {
      state.isOwnerAuthUpdated = action.payload;
    });
    builder.addCase(setActiveAuthUpdate.fulfilled, (state, action) => {
      state.isActiveAuthUpdated = action.payload;
    });
    builder.addCase(setPostingAuthUpdate.fulfilled, (state, action) => {
      state.isPostingAuthUpdated = action.payload;
    });

    builder.addCase(addAccountWarning.fulfilled, (state, action) => {
      const warnings = state.accountRowWarning.filter(
        (acc) => acc[0] !== action.payload.username,
      );
      state.accountRowWarning = [
        ...warnings.concat([[action.payload.username, action.payload.warning]]),
      ];
    });

    builder.addCase(removeAccountWarning.fulfilled, (state, action) => {
      state.accountRowWarning = state.accountRowWarning.filter(
        (acc) => acc[0] !== action.payload,
      );
    });

    builder.addCase(addKeyWarning.fulfilled, (state, action) => {
      state.keyRowWarning = state.keyRowWarning.concat([
        [action.payload.key, action.payload.warning],
      ]);
    });

    builder.addCase(removeKeyWarning.fulfilled, (state, action) => {
      state.keyRowWarning = state.keyRowWarning.filter(
        (key) => key[0] !== action.payload,
      );
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
