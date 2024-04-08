import { combineReducers } from 'redux';
import { wrc721Reducer } from './wrc721';
import { woopReducer } from './woop';
import { crowdsaleReducer } from './crowdsale';

export default combineReducers({
    wrc721Reducer,
    woopReducer,
    crowdsaleReducer,
});