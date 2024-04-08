import React, {useEffect} from 'react'
import Chartist from 'chartist'

import { route, gradient, bubble, chart, marginTop, breakAll, processingCover } from './Sale.module.scss'
import LoadingGIF from '../../img/loading.gif'

export default function Sale(props) {

    const {
        woopState: { processing, addresses },
        crowdsaleState: { raised, minted, events }
    } = props


    useEffect(() => {

        const axisXMod = Math.floor(events.length / 5)
        const benes = addresses.map((a) => a.toLowerCase())

        new Chartist.Line('#chart-woc', {
            labels: events.map((e, i) => (i+1)),
            series: [
                events.map((e) => parseFloat(e.woc)),
            ]
        }, {
            fullWidth: true,
            height: 200,
            axisX: {
                labelInterpolationFnc: (value) => value % axisXMod === 0 ? value : null
            }
        });

        new Chartist.Line('#chart-wrc', {
            labels: events.map((e, i) => (i+1)),
            series: [
                events.map((e) => e.beneficiary.toLowerCase() === benes[0] ? parseFloat(e.wrc) : 0),
                events.map((e) => e.beneficiary.toLowerCase() === benes[1] ? parseFloat(e.wrc) : 0),
            ]
        }, {
            fullWidth: true,
            height: 200,
            axisX: {
                labelInterpolationFnc: (value) => value % axisXMod === 0 ? value : null
            }
        });
  
    }, [events])

    return (
        <div className={route}>

            {processing &&
                <div className={processingCover}>
                    <img src={LoadingGIF} />
                </div>
            }


            <section className={gradient}>

                <h2>WOC Raised</h2>
                {raised &&
                    <div className={bubble}>
                        {raised}
                    </div>
                }

                <div className={chart} id="chart-woc"></div>

                <h2 className={marginTop}>WRC Minted</h2>
                {minted &&  
                    <div className={bubble}>
                        {minted}
                    </div>
                }

                <div className={chart} id="chart-wrc"></div>

                <h2 className={marginTop}>Sales</h2>
                {events && events.length > 0 && <div className={bubble}>
                    {events.map((e) =>
                        Object.keys(e).map((k, i) => <p key={i} className={breakAll}>{k} - {e[k]}</p>)
                    )} 
                </div>}

            </section>
        </div>
    )
}