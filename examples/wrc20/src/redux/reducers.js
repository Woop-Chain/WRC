import { combineReducers } from 'redux';
import { wrc20Reducer } from './wrc20';
import { woopReducer } from './woop';
import { crowdsaleReducer } from './crowdsale';

export default combineReducers({
    wrc20Reducer,
    woopReducer,
    crowdsaleReducer,
});