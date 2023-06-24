import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import keychainReducers from '../features/keyChain/keyChainReducers';
import loginReducer from '../features/login/loginSlice';
import transactionReducers from '../features/transaction/transactionReducers';
import updateAuthoritiesSlice from '../features/updateAuthorities/updateAuthoritiesSlice';
const store = configureStore({
  reducer: {
    keychain: keychainReducers,
    login: loginReducer,
    updateAuthorities: updateAuthoritiesSlice,
    transaction: transactionReducers,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
