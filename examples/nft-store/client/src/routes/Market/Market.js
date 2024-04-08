import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux'
import { setActive } from '../../redux/woop'
import { getMarket } from '../../redux/wrc721'
import Inventory from '../../components/Inventory/Inventory'

import { route, gradient, bubble, button } from './Market.module.scss'

export default function Market(props) {

    const {
        woopState: { active, allowToggle },
        wrc721State: { balances, market  },
        wrc20State: { wrc20balances },
    } = props

    const dispatch = useDispatch()
    
    
    useEffect(() => {
        dispatch(getMarket())
    }, [active])

    if (!active) return null
    
    const wrc20balance = wrc20balances[active.name] || 0

    return (
        <div className={route}>

            <section>
                <div className={bubble}>
                    <h2>{market.length > 0 ? 'NFTs for Sale by Owner' : 'No NFTs for Sale'}</h2>
                </div>
            </section>

            {<section className={gradient}>
                
                <Inventory {...props} market={market} balance={active && balances && balances[active.name]} />
            </section>}
        </div>
    )
}