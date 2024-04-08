import { combineReducers } from 'redux';
// import { wrc20Reducer } from './wrc20';
import { wrc721Reducer } from './wrc721';
import { woopReducer } from './woop';
import { auctionReducer } from './auction';
import { fortmaticReducer } from './fortmatic';

export default combineReducers({
    // wrc20Reducer,
    wrc721Reducer,
    woopReducer,
    auctionReducer,
    fortmaticReducer,
});