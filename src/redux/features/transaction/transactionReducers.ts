import { combineReducers } from '@reduxjs/toolkit';
import { transactionReducer } from './transactionSlices';

const transactionReducers = combineReducers({
  transaction: transactionReducer,
});

export default transactionReducers;
