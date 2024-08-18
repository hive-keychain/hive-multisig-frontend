import { combineReducers } from '@reduxjs/toolkit';
import { granularityReducer } from './granularitySlices';

const granularityReducers = combineReducers({
  granularity: granularityReducer,
});

export default granularityReducers;
