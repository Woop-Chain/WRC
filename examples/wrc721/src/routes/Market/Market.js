import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux'
import { setActive } from '../../redux/woop'
import { getMarket } from '../../redux/wrc721'
import Inventory from '../../components/Inventory/Inventory'

import { route, gradient, bubble, button } from './Market.module.scss'
import config from '../../../config'
const {ENV} = config

export default function Market(props) {

    const {
        woopState: { active,  },
        wrc721State: { balances, market  },
    } = props

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getMarket())
    }, [active])

    return (
        <div className={route}>


            <section>
                {active &&
                    <div className={bubble}>
                        <h3>{active.name}</h3>
                        <p>WOC: {active.balanceWOC}</p>
                        { ENV === 'local' &&
                            <button 
                                onClick={() => dispatch(setActive(active.name === 'Alice' ? 'account' : 'minter'))}
                                className={button}
                            >Toggle User</button>
                        }
                    </div>
                }
            </section>


            {<section className={gradient}>
                <h2>{market.length > 0 ? 'Tokens for Sale' : 'No Tokens for Sale'}</h2>
                <Inventory {...props} market={market} balance={active && balances && balances[active.name]} />
            </section>}
        </div>
    )
}