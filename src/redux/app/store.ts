import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import keychainReducers from '../features/keyChain/keyChainReducers';
import loginReducer from '../features/login/loginSlice';
import multisigReducers from '../features/multisig/multisigReducers';
import transactionReducers from '../features/transaction/transactionReducers';
import twoFactorAuthReducers from '../features/twoFactorAuth/twoFactorAuthReducers';
import updateAuthoritiesSlice from '../features/updateAuthorities/updateAuthoritiesSlice';

const multisigPersistConfig = {
  key: 'multisig',
  storage,
  blacklist: [
    // Volatile/live data — must not survive refresh or it can go stale.
    'signRequests',
    'broadcastedTransactions',
    'userPendingSignatureRequest',
    'userNotifications',
    'signRequestCount',
    'newSignRequestCount',
    'signRequestNotification',
    'broadcastNotification',
    'success',
    'error',
  ],
};

const persistedMultisigReducer = persistReducer(
  multisigPersistConfig,
  multisigReducers,
);

const persistConfig = {
  key: 'root',
  storage,
  // Persist everything else at the root; multisig uses its own persist key.
  blacklist: ['multisig'],
};
const rootReducer = combineReducers({
  keychain: keychainReducers,
  login: loginReducer,
  updateAuthorities: updateAuthoritiesSlice,
  transaction: transactionReducers,
  multisig: persistedMultisigReducer,
  twoFactorAuth: twoFactorAuthReducers,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(),
});

const persistor = persistStore(store);
export { persistor, store };
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
