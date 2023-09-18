import * as Hive from '@hiveio/dhive';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as _ from 'lodash';
import {
  Authorities,
  BroadCastResponseType,
  IDHiveAccountUpdateBroadcast,
  IHiveAccountUpdateBroadcast,
} from '../../../interfaces';
import { IAccountKeyRowProps } from '../../../interfaces/cardInterfaces';
import {
  default as AccountUtils,
  default as HiveUtils,
} from '../../../utils/hive.utils';
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
};

export const hiveKeyChainRequestBroadCast = createAsyncThunk(
  'updateAuthority/hiveBroadcast',
  async (props: IHiveAccountUpdateBroadcast) => {
    const response = await HiveUtils.accountUpdateBroadcast(props);
    return response;
  },
);

export const dhiveBroadcastUpdateAccount = createAsyncThunk(
  'updateAuthority/dhiveBroadcast',
  async ({ newAuthorities, ownerKey }: IDHiveAccountUpdateBroadcast) => {
    const response = await AccountUtils.broadcastUpdateAccount({
      newAuthorities,
      ownerKey,
    });
    return response;
  },
);

export const getIndexOfStringFromTupleArray = (
  array: [string | Hive.PublicKey, number][],
  element: string | Hive.PublicKey,
): number => {
  let index = -1;
  for (let i = 0; i < array.length; i++) {
    if (array[i][0] === element) {
      index = i;
      break;
    }
  }
  return index;
};

export const removeAuthorityKey = (
  array: [string | Hive.PublicKey, number][],
  element: [string | Hive.PublicKey, number],
): [string | Hive.PublicKey, number][] => {
  const index = getIndexOfStringFromTupleArray(array, element[0]);
  if (index !== -1) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }
  return [...array];
};

export const removeAuthorityAccount = (
  array: [string, number][],
  element: [string, number],
): [string, number][] => {
  const index = getIndexOfStringFromTupleArray(array, element[0]);
  if (index !== -1) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }
  return [...array];
};

export const clearAuthorityState = createAsyncThunk(
  'updateAuthority/clearAuthorityState',
  async () => {
    return {} as AuthorityUpdateStateType;
  },
);
const updateAuthoritySlice = createSlice({
  name: 'updateAuthority',
  initialState,
  reducers: {
    initializeAuthorities(state, action: PayloadAction<Authorities>) {
      state.Authorities = { ...action.payload };
      state.NewAuthorities = { ...action.payload };
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
    deleteAccount(state, action: PayloadAction<IAccountKeyRowProps>) {
      switch (action.payload.authorityName.toLowerCase()) {
        case 'owner':
          action.payload.type.toLowerCase() === 'accounts'
            ? {
                ...state,
                ...state.NewAuthorities,
                ...(state.NewAuthorities.owner.account_auths =
                  removeAuthorityAccount(
                    state.NewAuthorities.owner.account_auths,
                    action.payload.accountKeyAuth,
                  )),
              }
            : {
                ...state,
                ...state.NewAuthorities,
                ...(state.NewAuthorities.owner.key_auths = removeAuthorityKey(
                  state.NewAuthorities.owner.key_auths,
                  action.payload.accountKeyAuth,
                )),
              };
        case 'active':
          action.payload.type.toLowerCase() === 'accounts'
            ? {
                ...state,
                ...state.NewAuthorities,
                ...(state.NewAuthorities.active.account_auths =
                  removeAuthorityAccount(
                    state.NewAuthorities.active.account_auths,
                    action.payload.accountKeyAuth,
                  )),
              }
            : {
                ...state,
                ...state.NewAuthorities,
                ...(state.NewAuthorities.active.key_auths = removeAuthorityKey(
                  state.NewAuthorities.active.key_auths,
                  action.payload.accountKeyAuth,
                )),
              };
        case 'posting':
          action.payload.type.toLowerCase() === 'accounts'
            ? {
                ...state,
                ...state.NewAuthorities,
                ...(state.NewAuthorities.posting.account_auths =
                  removeAuthorityAccount(
                    state.NewAuthorities.posting.account_auths,
                    action.payload.accountKeyAuth,
                  )),
              }
            : {
                ...state,
                ...state.NewAuthorities,
                ...(state.NewAuthorities.posting.key_auths = removeAuthorityKey(
                  state.NewAuthorities.posting.key_auths,
                  action.payload.accountKeyAuth,
                )),
              };
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
  },
});

export default updateAuthoritySlice.reducer;
export const {
  initializeAuthorities,
  updateAccount,
  setOwnerKey,
  addAccount,
  deleteAccount,
  resetState,
} = updateAuthoritySlice.actions;
export const updateAuthorityActions = updateAuthoritySlice.actions;
