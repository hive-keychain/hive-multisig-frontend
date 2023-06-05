import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import keyChainReducer from '../features/keyChain/keyChainSlice';
import loginReducer from '../features/login/loginSlice';
import multisigReducers from '../features/multisig/multisigReducers';
import updateAuthoritiesSlice from '../features/updateAuthorities/updateAuthoritiesSlice';
const store = configureStore({
  reducer: {
    keychain: keyChainReducer,
    login: loginReducer,
    updateAuthorities: updateAuthoritiesSlice,
    multisig: multisigReducers,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
