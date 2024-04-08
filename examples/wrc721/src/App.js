import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { Router } from "@reach/router"

import { crowdsaleState } from './redux/crowdsale'
import { wrc721State } from './redux/wrc721'
import { woopInit, woopState } from './redux/woop'
import Header from './components/Header/Header'
import Dialog from './components/Dialog/Dialog'
import Home from './routes/Home/Home'
import Store from './routes/Store/Store'
import Funds from './routes/Funds/Funds'
import Create from './routes/Create/Create'
import Market from './routes/Market/Market'
import LoadingGIF from './img/loading.gif'

import { processingCover, } from './App.module.scss'

export default connect(
	(state) => ({
		woopState: woopState(state),
		wrc721State: wrc721State(state),
		crowdsaleState: crowdsaleState(state),
	})
)(function App(props) {

	const dispatch = useDispatch()

	const {processing} = props.woopState

	useEffect(() => {
		if (window.location.pathname.length > 1) window.location = '/'
		dispatch(woopInit())
	}, [])
	
	return (
		<div>

{processing &&
                <div className={processingCover}>
                    <img src={LoadingGIF} />
                </div>
            }

			<Header {...props} />
			<Dialog {...props} />
			<Router>
				<Home {...props} path="/" />
				<Funds {...props} path="/funds" />
				<Create {...props} path="/create" />
				<Store {...props} path="/store" />
				<Market {...props} path="/market" />
			</Router>
		</div>
	)
})