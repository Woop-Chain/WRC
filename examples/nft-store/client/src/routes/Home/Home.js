import React from 'react'
import { useDispatch } from 'react-redux'
import { navigate } from "@reach/router"

import Inventory from './../../components/Inventory/Inventory'

import { route, bubble, button } from './Home.module.scss'

export default function Home(props) {

    const {
        woopState: { active, allowToggle },
        wrc721State: { balances },
        wrc20State: { wrc20balances },
    } = props

    const dispatch = useDispatch()

    if (!active) return null
    const wrc20balance = wrc20balances[active.name] || 0

    return (
        <div className={route}>

            {active && balances[active.name] && Object.keys(balances[active.name]).length === 0 &&
                <section>
                    <div className={bubble}>
                        <h2>No Items!</h2>
                        <p>Buy a new NFT from the Store or...</p>
                        <p>an existing NFT from the Market</p>
                        <button 
                            className={button}
                            onClick={() => navigate('/store')}
                        >Store</button>
                        <br />
                        <br />
                        <button 
                            className={button}
                            onClick={() => navigate('/market')}
                        >Market</button>
                    </div>
                </section>
            }

            {active && balances[active.name] && Object.keys(balances[active.name]).length > 0 &&
                <section>
                    <Inventory {...props}
                        balance={active && balances && balances[active.name]}
                        wallet={true}
                    />
                </section>
            }
        </div>
    )
}