import React, {useState} from 'react'
import { navigate } from "@reach/router"
import { useDispatch } from 'react-redux'
import { setActive } from './../../redux/woop'
import { root, menu, menuOpen } from './Header.module.scss'
import config from '../../../config'
const { ENV, } = config

export default function Header({history, woopState: { network }}) {
	const dispatch = useDispatch()

    const [isMenuOpen, setMenuOpen] = useState(false)

    return (
        <div>
            <div className={[menu, isMenuOpen ? menuOpen : ''].join(' ')}>
                <div onClick={() => setMenuOpen(false)}></div>
                <div>
                    <i className={"fas fa-times"} onClick={() => setMenuOpen(false)}></i>
                    <section>
                        { ENV === 'local' &&

                            <p onClick={() => {
                                navigate('/')
                                dispatch(setActive('minter'))
                                setMenuOpen(false)
                            }}><i className="far fa-user-circle fa-lg"></i><span>Minter</span></p>
                        }
                        <p onClick={() => {
                            navigate('/')
                            dispatch(setActive('account'))
                            setMenuOpen(false)
                        }}><i className="far fa-user-circle fa-lg"></i><span>My Account</span></p>
                        <p onClick={() => {
                            navigate('/funds')
                            dispatch(setActive('account'))
                            setMenuOpen(false)
                        }}><i className="fas fa-coins fa-lg"></i><span>Funds</span></p>
                        <p onClick={() => {
                            navigate('/create')
                            dispatch(setActive('account'))
                            setMenuOpen(false)
                        }}><i className="fab fa-creative-commons fa-lg"></i><span>Create</span></p>
                        <p onClick={() => {
                            navigate('/store')
                            setMenuOpen(false)
                        }}><i className="fas fa-store fa-lg"></i><span>Store</span></p>
                        <p onClick={() => {
                            navigate('/market')
                            setMenuOpen(false)
                        }}><i className="fas fa-users"></i><span>Market</span></p>
                    </section>
                </div>
            </div>
            <div className={root}>
                <p>The Dapp-tastic Woop NFT Demo</p>
                <i className={"fas fa-bars"} onClick={() => setMenuOpen(true)}></i>
            </div>
        </div>
    )
}