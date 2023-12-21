import { combineReducers } from '@reduxjs/toolkit';
import { twoFactorAuthReducer } from './twoFactorAuthSlices';

const twoFactorAuthReducers = combineReducers({
  twoFactorAuth: twoFactorAuthReducer,
});

export default twoFactorAuthReducers;
