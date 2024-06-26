import { getReducer, getState, UPDATE } from '../util/redux-util'
import { signIn, updateProcessing, signOut } from './woop'
import { navigate } from "@reach/router"
import Fortmatic from 'fortmatic';
//default state
const defaultState = {
    isLoggedIn: false,
    account: null,
}
export const fortmaticReducer = getReducer(defaultState)
export const fortmaticState = getState('fortmaticReducer', defaultState)
//functions
/********************************
Formatic Login
********************************/
const accounts = {
    '0xb45B3F9c2d1D3aD20cb63740b6eBfe899Fc59BE1': 'minter', //mattdlockyer
    '0x700025011e56659Acf547473166F5DFDE40eA439': 'account' //matt
}

export const fortmaticSignOut = () => async (dispatch) => {
    const fmPhantom = new Fortmatic.Phantom('pk_test_1C24F45217D39E66'); // ✨
    if (fmPhantom.user && fmPhantom.user.isLoggedIn()) {
        await fmPhantom.user.logout()
        dispatch(signOut())
        return true
    }
    return false
}
export const checkFortmaticLogin = () => async (dispatch) => {
    const fmPhantom = new Fortmatic.Phantom('pk_test_1C24F45217D39E66'); // ✨
    if (fmPhantom.user && (await fmPhantom.user.isLoggedIn())) {
        const account = accounts[(await fmPhantom.user.getMetadata()).publicAddress]
        console.log(account)
        if (account) {
            await dispatch({ type: UPDATE, isLoggedIn: true, account })
            await dispatch(signIn(account))
            dispatch(updateProcessing(false))
            return true
        }
    }
    dispatch(updateProcessing(false))
    return false
}

export const handleLoginWithMagicLink = (email) => async (dispatch) => {
    const fmPhantom = new Fortmatic.Phantom('pk_test_1C24F45217D39E66'); // ✨
    if (fmPhantom.user && fmPhantom.user.isLoggedIn()) {
        await fmPhantom.user.logout()
    }
    console.log('handleLoginWithMagicLink', email)
    const user = await fmPhantom.loginWithMagicLink({ email });
    console.log(await user.isLoggedIn()); // => true
    const account = accounts[(await user.getMetadata()).publicAddress]
    if (account) {
        await dispatch({ type: UPDATE, isLoggedIn: true, account })
        await dispatch(signIn(account))
        setTimeout(() => navigate('/'), 250)
    }
}