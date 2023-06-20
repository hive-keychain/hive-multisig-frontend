import { combineReducers } from '@reduxjs/toolkit';
import {
  setAuthorityReducer,
  setTransactionMethodReducer,
  setTransactionNameReducer,
} from './transactionSlices';

const transactionReducers = combineReducers({
  setAuthority: setAuthorityReducer,
  setTransactionName: setTransactionNameReducer,
  setTransactionMethod: setTransactionMethodReducer,
});

export default transactionReducers;
