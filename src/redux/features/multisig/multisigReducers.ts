import { combineReducers } from '@reduxjs/toolkit';
import {
  decodeTransactionReducer,
  encodeTransactionReducer,
  notifyTransactionBroadcasedReducer,
  sendSignatureRequestReducer,
  signTransactionReducer,
  signerConnectReducer,
  subscribeToBroadcastedTransactionsReducer,
  subscribeToSignRequestsReducer,
} from './multisigSlices';

const multisigReducers = combineReducers({
  signerConnect: signerConnectReducer,
  sendSignatureRequest: sendSignatureRequestReducer,
  signTransaction: signTransactionReducer,
  encodeTransaction: encodeTransactionReducer,
  decodeTransaction: decodeTransactionReducer,
  subscribeToSignRequests: subscribeToSignRequestsReducer,
  notifyTransactionBroadcasted: notifyTransactionBroadcasedReducer,
  subscribeToBroadcastedTransactions: subscribeToBroadcastedTransactionsReducer,
});

export default multisigReducers;
