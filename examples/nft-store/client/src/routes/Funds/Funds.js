import React, {useState} from 'react'
import { useDispatch } from 'react-redux'
import { setActive } from '../../redux/woop'

import { transferWOC,  } from '../../redux/woop'
import { transferWRC20,  } from '../../redux/wrc20'
import Form from '../../components/Form/Form'

import { route, bubble, button } from './Funds.module.scss'

export default function Home(props) {

    const {
        woopState: { active, bech32Addresses, allowToggle },
        wrc20State: { wrc20balances },
    } = props

    const [link, setLink] = useState(null)

    const dispatch = useDispatch()
    
    if (!active) return null

    const wrc20balance = wrc20balances[active.name] || 0

    return (
        <div className={route}>


            <section>
                {active &&
                    <div className={bubble}>
                        <h3>{active.name}</h3>
                        <p>WOC: {active.balanceWOC}</p>
                        <p>USD: {wrc20balance}</p>
                        { allowToggle &&
                            <button 
                                onClick={() => dispatch(setActive(active.name === 'Alice' ? 'account' : 'minter'))}
                                className={button}
                            >Toggle User</button>
                        }
                    </div>
                }
            </section>


            
            { active && 
            <div>
                <section>
                    <Form
                        {...{
                            active,
                            title: 'Transfer USD',
                            addressType: 'bech32Address',
                            addresses: bech32Addresses,
                            submit: transferWRC20
                        }}
                    />
                </section>
                <section>
                    <Form
                        {...{
                            active,
                            title: 'Transfer WOC',
                            addressType: 'bech32Address',
                            addresses: bech32Addresses,
                            submit: transferWOC
                        }}
                    />
                </section>
            </div>
            }

        </div>
    )
}