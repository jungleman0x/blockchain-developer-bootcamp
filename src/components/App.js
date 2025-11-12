import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import config from '../config.json';

import {
loadProvider,
loadNetwork,
loadAccount,
loadTokens,
loadExchange
}
from '../store/interactions.js'

import Navbar from './Navbar'


function App() {
  
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
  
    //Connect ethers to blockchain
    const provider = loadProvider(dispatch)
    
    //Fetch current networks chainId (e.g hardhat 331337)
    const chainId = await loadNetwork(provider, dispatch)

    //Fetch current accoutn & balance from Metamask when changed
    window.ethereum.on('accountsChanged', () => {
      window.location.reload()
    })

    //fetch current account & balance from Network when changed
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })
    

    //token smart contract
    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)

    //load exchange smart contract
    const exchange = config[chainId].exchange
    await loadExchange(provider, exchange.address, dispatch)
  }
  
  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
