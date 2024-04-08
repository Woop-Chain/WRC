import React, { Component } from 'react';
import './App.css';
import { waitForInjected, initExtension, wiki } from './lottery';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  async componentDidMount() {
    await waitForInjected()

    const extLottery = await initExtension()
    const manager = await extLottery.methods.manager().call({
      gasLimit: '1000000',
      gasPrice: new wiki.utils.Unit('10').asGwei().toWei(),
    });
    const players = await extLottery.methods.getPlayers().call({
      gasLimit: '1000000',
      gasPrice: new wiki.utils.Unit('10').asGwei().toWei(),
    });
    const balance = await wiki.blockchain.getBalance({address: extLottery.address});

    this.setState({ manager, players, balance });
  }

  onSubmit = async event => {
    event.preventDefault();
    this.setState({ message: 'Waiting on transaction success...' })

    const extLottery = await initExtension()
    await extLottery.methods.enter().send({
      value: new wiki.utils.Unit(this.state.value).asWoc().toWei(),
      gasLimit: '1000001',
      gasPrice: new wiki.utils.Unit('10').asGwei().toWei(),
    });

    this.setState({ message: 'You have been entered!' })
  };

  onClick = async () => {
    this.setState({ message: 'Waiting on transaction success...' });

    const extLottery = await initExtension()
    await extLottery.methods.pickWinner().send({
      gasLimit: '1000000',
      gasPrice: new wiki.utils.Unit('10').asGwei().toWei(),
    });

    this.setState({ message: 'A winner has been picked!' });
  };

  render() {
    return (
      <div>
        <h2> Lottery Contract </h2>
        <p> 
          This contract is managed by {this.state.manager}. <br />
          There are currently {this.state.players.length} people entered, <br />
        </p>

        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of WOC to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />
        <h4> Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a Winner!</button>

        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  };
}

export default App;
