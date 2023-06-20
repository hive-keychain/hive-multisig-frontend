import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../../interfaces/transaction.interface';
import {
  setAuthority,
  setTransactionMethod,
  setTransactionName,
} from './transactionThunks';

const initialState: State = {
  username: '',
  method: undefined,
  txName: null,
  process: null,
  response: null,
  loading: false,
  success: false,
  error: null,
};

const setAuthoritySlice = createSlice({
  name: 'authority',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setAuthority.pending, (state) => {
      state.process = 'setAuthority';
      state.authority = null;
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setAuthority.fulfilled, (state, action) => {
      state = { ...action.payload };
    });
    builder.addCase(setAuthority.rejected, (state, action) => {
      state.authority = null;
      state.loading = false;
      state.error = action.payload;
    });
  },
});

const setTransactionNameSlice = createSlice({
  name: 'setTransactionName',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setTransactionName.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setTransactionName.fulfilled, (state, action) => {
      state.loading = false;
      state.txName = action.payload;
      state.success = true;
    });
    builder.addCase(setTransactionName.rejected, (state, action) => {
      state.error = JSON.stringify(action.error);
    });
  },
});
const setTransactionMethodSlice = createSlice({
  name: 'setTransactionMethod',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setTransactionMethod.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setTransactionMethod.fulfilled, (state, action) => {
      state.loading = false;
      state.method = action.payload;
      state.success = true;
    });
    builder.addCase(setTransactionMethod.rejected, (state, action) => {
      state.error = JSON.stringify(action.error);
    });
  },
});

export const setAuthorityReducer = setAuthoritySlice.reducer;
export const setAuthorityActions = setAuthoritySlice.actions;
export const setTransactionNameReducer = setTransactionNameSlice.reducer;
export const setTransactionNameActions = setTransactionNameSlice.actions;
export const setTransactionMethodReducer = setTransactionMethodSlice.reducer;
export const setTransactionMethodActions = setTransactionMethodSlice.actions;
