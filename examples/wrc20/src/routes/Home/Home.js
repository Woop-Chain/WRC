import React from 'react'

import { transferWOC } from './../../redux/woop'
import { transferWRC } from './../../redux/wrc20'
import { purchaseWRC } from './../../redux/crowdsale'
import Form from './../../components/Form/Form'
import { route, gradient, bubble, marginTop, processingCover } from './Home.module.scss'
import LoadingGIF from '../../img/loading.gif'

export default function Home(props) {

    const {
        woopState: { processing, active, addresses, bech32Addresses },
        crowdsaleState: { raised }
    } = props

    return (
        <div className={route}>

            {processing &&
                <div className={processingCover}>
                    <img src={LoadingGIF} />
                </div>
            }


            <section className={gradient}>
                <h2>Balances</h2>
                {active &&
                    <div className={bubble}>
                        <h3>{active.name}</h3>
                        <p>WOC: {active.balanceWOC}</p>
                        <p>WRC: {active.balanceWRC}</p>
                    </div>
                }


                <Form
                    {...{
                        active,
                        title: 'Contribute WOC',
                        subtitle: <span>Purchase WRC20 tokens by contributing to our crowdsale<br/>Rate:<br/>1 WOC = 1000 WRC</span>,
                        amountLabel: 'Amount in WOC',
                        submit: purchaseWRC
                    }}
                />


                <Form
                    {...{
                        active,
                        addressType: 'bech32Address',
                        title: 'Transfer WRC',
                        addresses: bech32Addresses,
                        submit: transferWRC
                    }}
                />

                <Form
                    {...{
                        active,
                        addressType: 'bech32Address',
                        title: 'Transfer WOC',
                        addresses: bech32Addresses,
                        submit: transferWOC
                    }}
                />

            </section>
        </div>
    )
}