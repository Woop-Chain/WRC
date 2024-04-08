import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux'
import { setActive } from '../../redux/woop'
import { getInventory    } from '../../redux/crowdsale'
import Inventory from '../../components/Inventory/Inventory'

import { route, gradient, bubble, button } from './Store.module.scss'
import config from '../../../config'
const {ENV} = config

export default function Store(props) {

    const {
        woopState: { active,  },
        wrc721State: { balances  },
    } = props

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getInventory())
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


            <section className={gradient}>
                <h2>Items</h2>
                <Inventory {...props} balance={active && balances && balances[active.name]} />
            </section>
        </div>
    )
}