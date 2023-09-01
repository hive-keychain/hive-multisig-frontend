import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import keychainReducers from '../features/keyChain/keyChainReducers';
import loginReducer from '../features/login/loginSlice';
import multisigReducers from '../features/multisig/multisigReducers';
import transactionReducers from '../features/transaction/transactionReducers';
import updateAuthoritiesSlice from '../features/updateAuthorities/updateAuthoritiesSlice';
const persistConfig = {
  key: 'root', // Change this to a unique string for your application
  storage, // Use the storage engine you imported (local storage, AsyncStorage, etc.)
  // Add other options if needed, such as blacklist/whitelist for specific reducers
};
const rootReducer = combineReducers({
  keychain: keychainReducers,
  login: loginReducer,
  updateAuthorities: updateAuthoritiesSlice,
  transaction: transactionReducers,
  multisig: multisigReducers,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
});

const persistor = persistStore(store);
export { persistor, store };
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
