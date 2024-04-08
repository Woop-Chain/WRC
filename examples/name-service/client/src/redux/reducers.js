
import { combineReducers } from 'redux';
import { appReducer } from './app';
import { woopReducer } from './woop';

export default combineReducers({
	appReducer,
	woopReducer,
});
