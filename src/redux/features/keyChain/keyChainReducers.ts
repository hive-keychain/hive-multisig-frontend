import { combineReducers } from '@reduxjs/toolkit';
import { checkKeychainReducer, keychainSignTxReducer } from './keyChainSlice';

const keychainReducers = combineReducers({
  check: checkKeychainReducer,
  signTx: keychainSignTxReducer,
});

export default keychainReducers;
