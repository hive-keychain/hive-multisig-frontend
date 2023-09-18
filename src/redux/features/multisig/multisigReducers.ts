import { combineReducers } from '@reduxjs/toolkit';
import { multisigReducer } from './multisigSlices';

const multisigReducers = combineReducers({
  multisig: multisigReducer,
});

export default multisigReducers;
