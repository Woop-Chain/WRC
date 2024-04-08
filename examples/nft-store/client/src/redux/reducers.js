import { combineReducers } from 'redux';
import { wrc20Reducer } from './wrc20';
import { wrc721Reducer } from './wrc721';
import { woopReducer } from './woop';
import { crowdsaleReducer } from './crowdsale';
import { fortmaticReducer } from './fortmatic';

export default combineReducers({
    wrc20Reducer,
    wrc721Reducer,
    woopReducer,
    crowdsaleReducer,
    fortmaticReducer,
});