import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import granularityReducers from '../features/granularity/granularityReducers';
import keychainReducers from '../features/keyChain/keyChainReducers';
import loginReducer from '../features/login/loginSlice';
import multisigReducers from '../features/multisig/multisigReducers';
import transactionReducers from '../features/transaction/transactionReducers';
import twoFactorAuthReducers from '../features/twoFactorAuth/twoFactorAuthReducers';
import updateAuthoritiesSlice from '../features/updateAuthorities/updateAuthoritiesSlice';
const persistConfig = {
  key: 'root',
  storage,
};
const rootReducer = combineReducers({
  keychain: keychainReducers,
  login: loginReducer,
  updateAuthorities: updateAuthoritiesSlice,
  transaction: transactionReducers,
  multisig: multisigReducers,
  twoFactorAuth: twoFactorAuthReducers,
  granularity: granularityReducers,
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
