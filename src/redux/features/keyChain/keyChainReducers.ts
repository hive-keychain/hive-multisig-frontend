import { combineReducers } from '@reduxjs/toolkit';
import { checkKeychainReducer } from './keyChainSlice';

const keychainReducers = combineReducers({
  check: checkKeychainReducer,
});

export default keychainReducers;
