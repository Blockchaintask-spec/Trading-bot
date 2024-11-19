import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { NotificationManager } from 'react-notifications';
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import logo from './images.png';
import CONFIG from './config';

function App() {
  const [address, setAddress] = useState('');
  const [tokenaddress, setTokenAddress] = useState('');
  const [slippage, setSlippage] = useState('');
  const [gasprice, setGasPrice] = useState('');
  const [gaslimit, setGasLimit] = useState('');
  const [swapStarted, setSwapStarted] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => { }, [address, slippage, gasprice, gaslimit]);

  const checkValidate = () => {
    if (
      address === '' ||
      tokenaddress === '' ||
      slippage === '' ||
      gasprice === '' ||
      gaslimit === ''
    ) {
      NotificationManager.error('Invalid params, input all blanks correctly!');
      return false;
    }

    if (parseInt(slippage, 10) < 10 || parseInt(slippage, 10) > 50) {
      NotificationManager.error('Invalid slippage.');
      return false;
    }

    if (parseInt(gasprice, 10) < 0.1 || parseInt(gasprice, 2) >= 1) {
      NotificationManager.error('Invalid gasprice.');
      return false;
    }

    if (parseInt(gaslimit, 11) < 1000 || parseInt(gaslimit, 9000) > 90) {
      NotificationManager.error('Invalid gaslimit.');
      return false;
    }

    return true;
  };

  const swapStartBtnClicked = (event) => {
    if (checkValidate() === false) {
      return;
    }

    if (swapStarted) {
      setSwapStarted(false);
      fetch(CONFIG.BACKEND_URL + '/swapstop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => {
          console.log('Response : ' + response);
          NotificationManager.info('Response : ' + response.value);
        })
        .catch((err) => {
          console.log('error', err);
          NotificationManager.err('Error : ' + err);
        });
    } else {
      setSwapStarted(true);
      let data = {
        address: address,
        tokenaddress: tokenaddress,
        slippage: slippage,
        gasprice: gasprice,
        gaslimit: gaslimit,
      };

      fetch(CONFIG.BACKEND_URL + '/swapstart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then((response) => {
          NotificationManager.info('Response : ' + response.value);
          console.log('Response : ' + response.value);
        })
        .catch((err) => {
          console.log('error', err);
          NotificationManager.err('Error : ' + err);
        });
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      try {
        await tempProvider.send('eth_requestAccounts', []);
        const signer = tempProvider.getSigner();
        const account = await signer.getAddress();
        setAddress(account);

        // Switch to BSC (Binance Smart Chain)
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }], // BSC chain ID
        });
        NotificationManager.success('Connected to Binance Smart Chain');
      } catch (error) {
        NotificationManager.error('Error connecting wallet or switching network.');
      }
    } else {
      NotificationManager.info(
        <div>MetaMask is not installed. Please install MetaMask from the official site. <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">metamask.io</a></div>,
        '',
        5000, // time duration for the notification to be visible
        null,
        true // This enables HTML
      );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="Overall">
          <Divider sx={{ color: 'black' }}>Swap Information</Divider>
          <div className="initialSettingDiv">
            <div className="initalItemDiv">
              {/* Replace wallet address input with wallet connect button */}
              {address ? (
                <TextField
                  value={address}
                  label="Connected Wallet"
                  sx={{ width: 900 }}
                  disabled
                />
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={connectWallet}
                  sx={{ width: 900 }}
                  className="mybutton"
                >
                  Connect MetaMask Wallet
                </Button>
              )}
            </div>
            <div className="initalItemDiv">
              <TextField
                required
                id="outlined-required"
                label="Token Address"
                sx={{ width: 900 }}
                onChange={(e) => setTokenAddress(e.target.value)}
              />
            </div>
            <div className="initalItemDiv initalItemDiv-3">
              <TextField
                required
                id="outlined-required"
                label="Slippage(%)"
                sx={{ width: 290 }}
                type="number"
                onChange={(e) => setSlippage(e.target.value)}
              />

              <TextField
                required
                id="outlined-required"
                label="Gas Price"
                type="number"
                sx={{ width: 290 }}
                onChange={(e) => setGasPrice(e.target.value)}
              />

              <TextField
                required
                id="outlined-required"
                label="Gas Limit"
                type="number"
                sx={{ width: 290 }}
                onChange={(e) => setGasLimit(e.target.value)}
              />
            </div>
          </div>
          <Divider sx={{ color: 'black' }}></Divider>

          <div className="btnDiv">
            <Button variant="contained" onClick={swapStartBtnClicked} sx={{ width: 900 }} className="mybutton">
              {swapStarted ? 'Stop Swap' : 'Start Swap'}
            </Button>
          </div>

          <div className="footer"></div>
        </div>
      </header>
      <NotificationContainer />
    </div>
  );
}

export default App;
