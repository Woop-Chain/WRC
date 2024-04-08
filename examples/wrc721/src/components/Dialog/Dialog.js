import React, {useState} from 'react'
import { navigate } from "@reach/router"
import { useDispatch } from 'react-redux'
import { updateDialogState } from '../../redux/woop'
import { dialog, dialogOpen, center } from './Dialog.module.scss'

export default function Dialog({
    history,
    woopState: { dialogState = {}, },
}) {
    const dispatch = useDispatch()

    return (
        <div>
            <div className={[dialog, dialogState.open ? dialogOpen : ''].join(' ')}>
                <div onClick={() => dispatch(updateDialogState({ open: false }))}></div>
                <div>
                    <section>
                        {
                            dialogState.content
                        }
                        <div className={center}>
                            <button onClick={() => dispatch(updateDialogState({ open: false }))}>Close</button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}