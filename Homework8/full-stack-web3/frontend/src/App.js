import React, { useState } from 'react';
// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import VolcanoTokenArtifact from "../contracts/VolcanoNft.json";
import contractAddress from "../contracts/contract-address.json";

import 'bootstrap/dist/css/bootstrap.min.css';
import IPFSInputs from './ipfs/ipfsInputComponents';

import './App.css';
import { ConnectWallet } from './components/ConnectWallet';


// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '31337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

const App = () => {
  // https://github.com/nomiclabs/hardhat-hackathon-boilerplate/tree/master/frontend
  const [networkError, setNetworkError] = useState(undefined);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [token, setToken] = useState(undefined);
  const [tokenData, setTokenData] = useState(undefined);
  const [pollDataInterval, setPollDataInterval] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [txBeingSent, setTxBeingSent] = useState(undefined);
  const [transactionError, setTransactionError] = useState(undefined);

  const _connectWallet = async () => {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!_checkNetwork()) {
      return;
    }

    _initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      _stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return _resetState();
      }
      
      _initialize(newAddress);
    });
    
    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]) => {
      _stopPollingData();
      _resetState();
    });
  }

  const _initialize = (userAddress) => {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    setSelectedAddress(userAddress)

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    _intializeEthers();
    _getTokenData();
    _startPollingData();
  }

  const _intializeEthers = async () => {
    // We first initialize ethers by creating a provider using window.ethereum
    setProvider(new ethers.providers.Web3Provider(window.ethereum));

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    setToken(new ethers.Contract(
      contractAddress.Token,
      VolcanoTokenArtifact.abi,
      provider.getSigner(0)
    ));
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  const _startPollingData = () => {
    setPollDataInterval(setInterval(() => updateBalance(), 1000));

    // We run it once immediately so we don't have to wait for it
    _updateBalance();
  }

  const _stopPollingData = () => {
    clearInterval(pollDataInterval);
    setPollDataInterval(undefined);
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  const _getTokenData = async () => {
    const name = await token.name();
    const symbol = await token.symbol();

    setTokenData({ name, symbol });
  }

  const _updateBalance = async () => {
    setBalance(await token.balanceOf(selectedAddress));
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  const _transferTokens = async (to, amount) => {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      _dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await token.transfer(to, amount);
      setTxBeingSent(tx.hash);

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }

      // If we got here, the transaction was successful, so you may want to
      // update your state. Here, we update the user's balance.
      await _updateBalance();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      setTransactionError(error)
      // this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      setTxBeingSent(undefined);
    }
  }

  // This method just clears part of the state.
  const _dismissTransactionError = () => {
    setTransactionError(undefined);
  }

  // This method just clears part of the state.
  const _dismissNetworkError = () => {
    setNetworkError(undefined);
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  const _getRpcErrorMessage = (error) => {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  const _resetState = () => {
    setTokenData(undefined);
    setSelectedAddress(undefined);
    setBalance(undefined);
    setTxBeingSent(undefined);
    setTransactionError(undefined);
    setNetworkError(undefined);
  }

  // This method checks if Metamask selected network is Localhost:8545 
  const _checkNetwork = () => {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }
    
    setNetworkError('Please connect Metamask to Localhost:8545')
    return false;
  }

  return (
    <div>
      <ConnectWallet
        connectWallet={() => _connectWallet()} 
        networkError={networkError}
        dismiss={() => _dismissNetworkError()}
      />
      <IPFSInputs />
    </div>
  );
};

export default App;
