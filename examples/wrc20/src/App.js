import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { Router } from "@reach/router"

import { crowdsaleInit, crowdsaleState } from './redux/crowdsale'
import { wrc20State } from './redux/wrc20'
import { woopInit, woopState } from './redux/woop'
import Header from './components/Header/Header'
import Home from './routes/Home/Home'
import Sale from './routes/Sale/Sale'

export default connect(
	(state) => ({
		woopState: woopState(state),
		wrc20State: wrc20State(state),
		crowdsaleState: crowdsaleState(state),
	})
)(function App(props) {

	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(woopInit())
		dispatch(crowdsaleInit())
	}, [])

	if (!props.woopState.active) return null


	return (
		<div>
			<Header {...props} />
			<Router>
				<Home {...props} path="/" />
				<Sale {...props} path="/sale" />
			</Router>
		</div>
	)
})