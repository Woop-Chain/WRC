import React, {useState} from 'react'
import { useDispatch } from 'react-redux'
import { setActive } from '../../redux/woop'

import { transferWOC,  } from '../../redux/woop'
import Form from '../../components/Form/Form'

import { route, bubble, button } from './Funds.module.scss'
import config from '../../../config'
const {ENV} = config

export default function Home(props) {

    const {
        woopState: { active, bech32Addresses },
        wrc721State: { balances },
    } = props

    const [link, setLink] = useState(null)

    const dispatch = useDispatch()

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


            
            { active && 
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
            }

        </div>
    )
}